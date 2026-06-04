const db = require('./db');
const CONFIG = require('./config');

// ─────────────────────────────────────────────
// Combat resolution — two-phase: orbital then surface
// ─────────────────────────────────────────────
async function resolveAllCombat(sessionId, round) {
  const units = await db.getUnits(sessionId);
  const combatLog = [];

  // Find contested planets (opposing units in same planet+layer)
  const byLocation = {};
  for (const u of units) {
    const key = `${u.planet_id}:${u.layer}`;
    if (!byLocation[key]) byLocation[key] = [];
    byLocation[key].push(u);
  }

  for (const [key, locationUnits] of Object.entries(byLocation)) {
    const [planetId, layer] = key.split(':');
    const owners = [...new Set(locationUnits.map(u => ownerFaction(u.owner)))];
    if (owners.length < 2) continue; // no conflict

    const sides = {};
    for (const u of locationUnits) {
      const faction = ownerFaction(u.owner);
      if (!sides[faction]) sides[faction] = [];
      sides[faction].push(u);
    }

    const factions = Object.keys(sides);
    if (factions.length < 2) continue;

    // Resolve pairwise (architect vs rebels, or rebels vs traitor faction units etc.)
    const [sideA, sideB] = factions;
    const result = await resolveCombat(
      sessionId, round, planetId, layer,
      sides[sideA], sides[sideB], sideA, sideB
    );

    // Extract involved player IDs from both sides
    const involvedPlayerIds = [];
    for (const u of locationUnits) {
      if (u.owner.startsWith('rebel:')) {
        const playerId = u.owner.slice(6);
        if (!involvedPlayerIds.includes(playerId)) involvedPlayerIds.push(playerId);
      }
    }

    result.involvedPlayerIds = involvedPlayerIds;
    combatLog.push(result);
  }

  return combatLog;
}

function ownerFaction(owner) {
  if (owner.startsWith('empire')) return 'empire';
  if (owner.startsWith('rebel'))     return 'rebel';
  if (owner.startsWith('faction'))   return owner; // faction:id
  return 'rebel';
}

async function resolveCombat(sessionId, round, planetId, layer, attackers, defenders, attackerKey, defenderKey) {
  const session = await db.getSessionById(sessionId);
  const planet = session.planet_state.find(p => p.id === planetId);
  const planetType = planet?.type || 'Outer Rim Territories';

  let defenderBonus = CONFIG.COMBAT.DEFENDER_BONUS +
    (CONFIG.COMBAT.PLANET_DEFENCE_BONUS[planetType] || 0);

  let attackerStrength = attackers.reduce((s,u)=>s+u.strength,0);
  let defenderStrength = defenders.reduce((s,u)=>s+u.strength,0);

  // Wire up Force combat bonuses
  const rebelAttackers = attackerKey === 'rebel' ? attackers : [];
  const rebelDefenders = defenderKey === 'rebel' ? defenders : [];
  const rebelUnits = [...rebelAttackers, ...rebelDefenders];

  const jedi = rebelUnits.find(u => u.unit_type === 'jedi_avatar');
  if (jedi) {
    const playerId = jedi.owner.split(':')[1];
    const rs = await db.getRebelState(sessionId, playerId);
    const alignment = rs?.force_alignment || 0;

    if (alignment > CONFIG.FORCE.ALIGNMENT_THRESHOLD) {
      // Light side: defender bonus
      defenderBonus += CONFIG.FORCE.LIGHTSIDE_DEFENCE_BONUS;
    } else if (alignment < -CONFIG.FORCE.ALIGNMENT_THRESHOLD) {
      // Dark side: attacker gets extra dice
      attackerStrength += CONFIG.FORCE.FORCE_COMBAT_DICE;
    }
  }

  // Roll combat — simplified but meaningful
  let attackerHits = rollHits(attackerStrength, CONFIG.COMBAT.HIT_CHANCE);
  let defenderHits = rollHits(defenderStrength, CONFIG.COMBAT.HIT_CHANCE + defenderBonus);

  // Apply hits as HP loss to individual units
  const attackerLosses = await applyDamage(defenders, defenderHits);
  const defenderLosses = await applyDamage(attackers, attackerHits);

  const remainingAttackers = attackers.filter(u => u.hp > 0);
  const remainingDefenders = defenders.filter(u => u.hp > 0);

  // Detect destroyed special units (governors, emperor, and jedi)
  const destroyedGovernor = attackers
    .filter(u => u.hp <= 0 && u.unit_type === 'governor_avatar')
    .map(u => u.owner.split(':')[1])[0] || null;
  const destroyedEmperor = attackers.concat(defenders).some(u => u.hp <= 0 && u.unit_type === 'emperor');

  const destroyedJediList = attackers.concat(defenders)
    .filter(u => u.hp <= 0 && u.unit_type === 'jedi_avatar');

  // Handle jedi deaths (player eliminations)
  const result = { destroyedGovernor, destroyedEmperor };
  for (const jedi of destroyedJediList) {
    const playerId = jedi.owner.split(':')[1];
    await db.eliminatePlayer(playerId);
    await db.pool.query(
      'DELETE FROM units WHERE owner=$1 AND session_id=$2',
      [jedi.owner, sessionId]
    );
    result.eliminatedPlayers = result.eliminatedPlayers || [];
    result.eliminatedPlayers.push(playerId);
  }

  let outcome;
  if (remainingAttackers.length === 0 && remainingDefenders.length === 0) {
    outcome = 'draw';
  } else if (remainingDefenders.length === 0) {
    outcome = 'attacker_wins';
    // Update planet control if surface victory
    if (layer === 'surface') {
      const newController = attackerKey === 'empire' ? 'empire' : 'rebel';
      const updatedPlanets = session.planet_state.map(p =>
        p.id === planetId ? {...p, controlled_by: newController} : p
      );
      await db.updateSession(sessionId, { planet_state: updatedPlanets });
    }
  } else {
    outcome = 'defender_wins';
  }

  const summary = `${layer} combat at ${planetId}: ${attackerKey} ${outcome === 'attacker_wins' ? 'captures' : outcome === 'defender_wins' ? 'repelled by' : 'draws with'} ${defenderKey}. A:${attackerLosses} D:${defenderLosses} units lost.`;

  await db.insertCombatLog(sessionId, round, planetId, layer,
    attackerKey, defenderKey, attackerLosses, defenderLosses, outcome, summary);

  return { ...result, planetId, layer, outcome, summary, attackerLosses, defenderLosses, attackerKey, defenderKey };
}

async function resolveRebelVsRebelCombat(sessionId, round, attackerPlayerId, defenderPlayerId, planetId, layer) {
  const session = await db.getSessionById(sessionId);
  const units = await db.getUnits(sessionId);

  const attackerUnits = units.filter(u =>
    u.owner === `rebel:${attackerPlayerId}` && u.planet_id === planetId && u.layer === layer
  );
  const defenderUnits = units.filter(u =>
    u.owner === `rebel:${defenderPlayerId}` && u.planet_id === planetId && u.layer === layer
  );

  if (attackerUnits.length === 0 || defenderUnits.length === 0) {
    return { ok: false, error: 'One side has no units' };
  }

  let attackerStrength = attackerUnits.reduce((s,u)=>s+u.strength,0);
  let defenderStrength = defenderUnits.reduce((s,u)=>s+u.strength,0);

  // No defender bonus for PvP — fair fight at base hit chance
  let attackerHits = rollHits(attackerStrength, CONFIG.COMBAT.HIT_CHANCE);
  let defenderHits = rollHits(defenderStrength, CONFIG.COMBAT.HIT_CHANCE);

  // Apply hits
  const attackerLosses = await applyDamage(defenderUnits, attackerHits);
  const defenderLosses = await applyDamage(attackerUnits, defenderHits);

  const remainingAttackers = attackerUnits.filter(u => u.hp > 0);
  const remainingDefenders = defenderUnits.filter(u => u.hp > 0);

  let outcome;
  if (remainingAttackers.length === 0 && remainingDefenders.length === 0) {
    outcome = 'draw';
  } else if (remainingDefenders.length === 0) {
    outcome = 'attacker_wins';
  } else {
    outcome = 'defender_wins';
  }

  // Leader-kill check: if attacker wins and defender is at this planet
  let leaderKilled = false;
  if (outcome === 'attacker_wins') {
    const defenderRebelState = await db.getRebelState(sessionId, defenderPlayerId);
    if (defenderRebelState && defenderRebelState.current_planet === planetId) {
      leaderKilled = true;
      // Eliminate the defender
      await db.eliminatePlayer(defenderPlayerId);
      // Delete all their remaining units
      await db.pool.query(
        "DELETE FROM units WHERE owner=$1 AND session_id=$2",
        [`rebel:${defenderPlayerId}`, sessionId]
      );
    }
  }

  // Jedi death check (in addition to leader-kill)
  const defenderJediKilled = defenderUnits.some(u => u.hp <= 0 && u.unit_type === 'jedi_avatar');
  if (defenderJediKilled && outcome === 'attacker_wins' && !leaderKilled) {
    // Defender's jedi is dead but they're not at this planet — still eliminate them
    await db.eliminatePlayer(defenderPlayerId);
    await db.pool.query(
      "DELETE FROM units WHERE owner=$1 AND session_id=$2",
      [`rebel:${defenderPlayerId}`, sessionId]
    );
  }

  const attackerJediKilled = attackerUnits.some(u => u.hp <= 0 && u.unit_type === 'jedi_avatar');
  if (attackerJediKilled && outcome === 'defender_wins') {
    // Attacker's jedi is dead — eliminate them
    await db.eliminatePlayer(attackerPlayerId);
    await db.pool.query(
      "DELETE FROM units WHERE owner=$1 AND session_id=$2",
      [`rebel:${attackerPlayerId}`, sessionId]
    );
  }

  const summary = `${layer} combat at ${planetId}: rebel:${attackerPlayerId} ${outcome === 'attacker_wins' ? 'defeats' : outcome === 'defender_wins' ? 'repelled by' : 'draws with'} rebel:${defenderPlayerId}. A:${attackerLosses} D:${defenderLosses} units lost.`;

  await db.insertCombatLog(sessionId, round, planetId, layer,
    `rebel:${attackerPlayerId}`, `rebel:${defenderPlayerId}`, attackerLosses, defenderLosses, outcome, summary);

  return { ok: true, attackerLosses, defenderLosses, outcome, leaderKilled, planetId, layer, summary };
}

function rollHits(strength, hitChance) {
  let hits = 0;
  for (let i = 0; i < strength; i++) {
    if (Math.random() < hitChance) hits++;
  }
  return hits;
}

async function applyDamage(units, totalHits) {
  let hitsLeft = totalHits;
  let losses = 0;
  for (const u of units) {
    if (hitsLeft <= 0) break;
    const damage = Math.min(hitsLeft, u.hp);
    u.hp -= damage;
    hitsLeft -= damage;
    await db.updateUnit(u.id, { hp: u.hp });
    if (u.hp <= 0) {
      await db.deleteUnit(u.id);
      losses++;
    }
  }
  return losses;
}

// ─────────────────────────────────────────────
// Production phase — fires at end of governor turn
// ─────────────────────────────────────────────
async function runProductionPhase(sessionId) {
  const session = await db.getSessionById(sessionId);
  const completed = await db.tickProductionQueue(sessionId);
  const newUnits = [];

  // Deliver completed units
  for (const item of completed) {
    const typeCfg = CONFIG.UNIT_TYPES[item.unit_type];
    if (!typeCfg) continue;
    const layer = typeCfg.canOrbit ? 'orbit' : 'surface';
    const unit = await db.createUnit(
      sessionId, item.unit_type, item.owner,
      item.planet_id, layer,
      typeCfg.strength, typeCfg.hp,
      item.owner.startsWith('rebel') || item.owner.startsWith('faction'),
      typeCfg.jumpDistance    ?? 1,
      typeCfg.transportCapacity ?? 0,
      typeCfg.designation     ?? typeCfg.label,
    );
    newUnits.push(unit);
  }

  // Accumulate credits for rebels/factions from planet economic output
  const rebelStates = await db.getAllRebelStates(sessionId);
  const rebelCredits = {};
  rebelStates.forEach(rs => rebelCredits[rs.player_id] = 0);

  for (const planet of session.planet_state) {
    if (planet.controlled_by === 'rebel' || planet.controlled_by.startsWith('faction:')) {
      const econ = CONFIG.PLANET_ECON[planet.id];
      if (!econ || econ.output === 0) continue;

      const cells = await db.getFactionCellsAtPlanet(sessionId, planet.id);
      if (cells.length > 0) {
        const sharePerFaction = Math.floor(econ.output / cells.length);
        for (const cell of cells) {
          const contributors = await db.getFactionContributors(sessionId, cell.faction_id);
          if (contributors.length === 0) continue;
          const totalContrib = contributors.reduce((sum, c) => sum + c.total, 0);
          for (const contrib of contributors) {
            const playerShare = Math.floor((sharePerFaction * contrib.total) / totalContrib);
            rebelCredits[contrib.player_id] = (rebelCredits[contrib.player_id] || 0) + playerShare;
          }
        }
      } else {
        const activeCount = rebelStates.length;
        if (activeCount > 0) {
          const splitEvenly = Math.floor(econ.output / activeCount);
          rebelStates.forEach(rs => {
            rebelCredits[rs.player_id] = (rebelCredits[rs.player_id] || 0) + splitEvenly;
          });
        }
      }
    }
  }

  // Apply accumulated credits to rebel states
  for (const playerId of Object.keys(rebelCredits)) {
    if (rebelCredits[playerId] > 0) {
      const rs = rebelStates.find(r => r.player_id === playerId);
      if (rs) {
        await db.upsertRebelState(sessionId, playerId, rs.current_planet, rs.actions_used,
          (rs.credits || 0) + rebelCredits[playerId]);
      }
    }
  }

  // Generate production points for each controlled planet
  const govProduction = { siris:0, crassus:0, maren:0, vektis:0 };
  for (const planet of session.planet_state) {
    if (planet.controlled_by === 'empire' || planet.controlled_by.startsWith('empire:')) {
      const econ = CONFIG.PLANET_ECON[planet.id];
      if (!econ) continue;
      const gov = planet.controlled_by.startsWith('empire:')
        ? planet.controlled_by.split(':')[1]
        : getAssignedGovernor(planet.id);
      if (govProduction[gov] !== undefined) {
        govProduction[gov] += econ.output;
      }
    }
  }

  // Update governor production pools
  const govState = session.governor_state;
  for (const [gov, points] of Object.entries(govProduction)) {
    if (govState[gov]) govState[gov].productionPool = (govState[gov].productionPool||0) + points;
  }
  await db.updateSession(sessionId, { governor_state: govState });

  return { newUnits, govProduction };
}

// Each governor is assigned "home" planets for production purposes
// They can still command units anywhere
function getAssignedGovernor(planetId) {
  const assignments = {
    p01:'crassus', p15:'crassus', p08:'crassus',
    p05:'siris',   p13:'siris',
    p04:'maren',   p12:'maren',   p01:'maren',
    p02:'vektis',  p06:'vektis',  p11:'vektis',
  };
  return assignments[planetId] || 'crassus';
}

// ─────────────────────────────────────────────
// Apply a rebel unit action
// ─────────────────────────────────────────────
async function applyRebelUnitMove(sessionId, playerId, unitId, targetPlanetId, targetLayer) {
  const units = await db.getUnits(sessionId);
  const unit = units.find(u => u.id === unitId);
  if (!unit) return { ok:false, error:'Unit not found' };
  if (!unit.owner.includes(playerId)) return { ok:false, error:'Not your unit' };

  const { reachableIn } = require('./world');
  const jumpDist = unit.jump_distance ?? CONFIG.UNIT_TYPES[unit.unit_type]?.jumpDistance ?? 1;
  if (jumpDist === 0) return { ok:false, error:'This unit cannot jump between planets' };
  if (!reachableIn(unit.planet_id, jumpDist).includes(targetPlanetId))
    return { ok:false, error:'Target out of jump range' };

  await db.updateUnit(unitId, { planet_id: targetPlanetId, layer: targetLayer });
  return { ok:true, unit: {...unit, planet_id: targetPlanetId, layer: targetLayer } };
}

async function queueRebelUnitProduction(sessionId, playerId, planetId, unitType) {
  const typeCfg = CONFIG.UNIT_TYPES[unitType];
  if (!typeCfg) return { ok:false, error:'Unknown unit type' };

  // Rebels cannot build imperial-only units
  if (typeCfg.imperialOnly) return { ok:false, error:`${typeCfg.label} is an Imperial-restricted unit` };

  // Fetch session state once for all checks
  const session = await db.getSessionById(sessionId);
  if (!session) return { ok:false, error:'Session not found' };

  const planet  = session?.planet_state?.find(p => p.id === planetId);
  if (!planet) return { ok:false, error:'Planet not found' };

  // Check planet type restriction
  if (typeCfg.requiredPlanetTypes?.length) {
    if (!typeCfg.requiredPlanetTypes.includes(planet.type))
      return { ok:false, error:`${typeCfg.label} can only be built on: ${typeCfg.requiredPlanetTypes.join(', ')} worlds` };
  }

  // Check specific planet restriction
  if (typeCfg.requiredPlanetIds?.length && !typeCfg.requiredPlanetIds.includes(planetId))
    return { ok:false, error:`${typeCfg.label} can only be built at its designated shipyard` };

  // Check rebel control or faction presence
  const rebelOwned = planet.controlled_by === 'rebel' ||
                     planet.controlled_by?.startsWith('faction:');

  if (!rebelOwned) {
    // Planet not controlled by rebels — check for faction cells
    const cells = await db.getFactionCellsAtPlanet(sessionId, planetId);
    if (cells.length === 0)
      return { ok:false, error:'Rebels cannot produce here — no control or faction presence' };

    // Validate unit type against faction classes
    const factions = await db.getFactions(sessionId);
    const allowed  = new Set();
    const factionIds = [];
    for (const f of factions.filter(f => cells.some(c => c.faction_id === f.id))) {
      factionIds.push(f.id);
      const ideo = CONFIG.FACTIONS.IDEOLOGIES[f.ideology];
      (ideo?.allowed_ship_classes || []).forEach(c => allowed.add(c));
      (f.unlocked_ship_classes   || []).forEach(c => allowed.add(c));
    }
    // Resolve named units to their base class for faction validation
    const effectiveClass = CONFIG.UNIT_BASE_CLASSES?.[unitType] || unitType;
    if (!allowed.has(effectiveClass))
      return { ok:false, error:`Faction network at this planet cannot produce ${typeCfg.label}` };

    // Check if unit has been researched by any of the factions here
    try {
      const hasResearch = await Promise.all(
        factionIds.map(async (fid) => {
          const research = await db.getFactionUnitResearchByType(fid, unitType);
          return research?.unlocked === true;
        })
      );
      if (!hasResearch.some(r => r)) {
        return { ok:false, error:`${typeCfg.label} must be researched first` };
      }
    } catch (err) {
      // Table may not exist yet; allow production
      if (err.message && !err.message.includes('faction_unit_research')) {
        throw err;
      }
    }
  }

  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok:false, error:'Rebel state not found' };
  if ((rebelState.credits||0) < typeCfg.cost) return { ok:false, error:`Need ${typeCfg.cost} credits` };

  await db.addToProductionQueue(
    sessionId, planetId, unitType,
    `rebel:${playerId}`, typeCfg.buildTime
  );

  const newCredits = (rebelState.credits||0) - typeCfg.cost;
  await db.upsertRebelState(sessionId, playerId, rebelState.current_planet,
    rebelState.actions_used, newCredits);

  return { ok:true, newCredits };
}

// ─────────────────────────────────────────────
// Build public unit state (filter hidden rebel units)
// ─────────────────────────────────────────────
async function buildPublicUnitState(sessionId, requestingPlayerId=null) {
  const units = await db.getUnits(sessionId);
  return units.filter(u => {
    if (!u.is_hidden) return true;                           // visible units always shown
    if (!requestingPlayerId) return false;                   // no player context → hide all hidden
    return u.owner === `rebel:${requestingPlayerId}`;        // only own hidden units visible
  }).map(u => ({
    id: u.id,
    unit_type: u.unit_type,
    designation: u.designation,
    owner: u.owner,
    planet_id: u.planet_id,
    layer: u.layer,
    strength: u.strength,
    hp: u.hp,
    is_hidden: u.is_hidden,
    jump_distance: u.jump_distance,
    transport_capacity: u.transport_capacity,
  }));
}

module.exports = {
  resolveAllCombat, resolveRebelVsRebelCombat, runProductionPhase,
  applyRebelUnitMove, queueRebelUnitProduction,
  buildPublicUnitState, getAssignedGovernor,
};
