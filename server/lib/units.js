const db = require('./db');
const CONFIG = require('./config');

// ─────────────────────────────────────────────
// Persistent Combat System
// ─────────────────────────────────────────────
async function resolveSingleCombatRound(sessionId, combatId, combatState) {
  const { attackerUnits, defenderUnits, attackerKey, defenderKey } = combatState;

  if (attackerUnits.length === 0 || defenderUnits.length === 0) {
    // Combat is over
    return { outcome: 'combat_ended', winner: attackerUnits.length === 0 ? defenderKey : attackerKey };
  }

  // Calculate total strength
  let attackerStrength = attackerUnits.reduce((s, u) => s + u.strength, 0);
  let defenderStrength = defenderUnits.reduce((s, u) => s + u.strength, 0);

  // Roll for hits
  let attackerHits = rollHits(attackerStrength, CONFIG.COMBAT.HIT_CHANCE);
  let defenderHits = rollHits(defenderStrength, CONFIG.COMBAT.HIT_CHANCE + CONFIG.COMBAT.DEFENDER_BONUS);

  // Apply damage
  const newAttackerUnits = [...attackerUnits];
  const newDefenderUnits = [...defenderUnits];

  applyDamageToUnits(newDefenderUnits, attackerHits);
  applyDamageToUnits(newAttackerUnits, defenderHits);

  // Remove destroyed units
  const survivingAttackers = newAttackerUnits.filter(u => u.hp > 0);
  const survivingDefenders = newDefenderUnits.filter(u => u.hp > 0);

  // Update combat state
  const updatedCombat = await db.updateCombat(sessionId, combatId, {
    attackerUnits: survivingAttackers,
    defenderUnits: survivingDefenders,
    round: (combatState.round || 0) + 1,
    lastDamage: {
      attackerHits,
      defenderHits,
      attackerLosses: attackerUnits.length - survivingAttackers.length,
      defenderLosses: defenderUnits.length - survivingDefenders.length
    }
  });

  // Check if combat is over
  if (survivingAttackers.length === 0) {
    return { outcome: 'defender_wins', updatedCombat };
  } else if (survivingDefenders.length === 0) {
    return { outcome: 'attacker_wins', updatedCombat };
  } else {
    return { outcome: 'continuing', updatedCombat };
  }
}

function applyDamageToUnits(units, hits) {
  let remainingHits = hits;
  for (const unit of units) {
    if (remainingHits <= 0) break;
    const damageToUnit = Math.min(remainingHits, unit.hp);
    unit.hp -= damageToUnit;
    remainingHits -= damageToUnit;
  }
}

// ─────────────────────────────────────────────
// Combat resolution — two-phase: orbital then surface
// ─────────────────────────────────────────────
async function resolveAllCombat(sessionId, round) {
  const units = await db.getUnits(sessionId);
  const combatLog = [];
  const resolvedCombats = new Set();

  // Find contested planets (opposing units in same planet+layer)
  const byLocation = {};
  for (const u of units) {
    const key = `${u.planet_id}:${u.layer}`;
    if (!byLocation[key]) byLocation[key] = [];
    byLocation[key].push(u);
  }

  for (const [key, locationUnits] of Object.entries(byLocation)) {
    const [planetId, layer] = key.split(':');

    // Group units by faction
    const sides = {};
    for (const u of locationUnits) {
      const faction = ownerFaction(u.owner);
      if (!sides[faction]) sides[faction] = [];
      sides[faction].push(u);
    }

    const factions = Object.keys(sides);
    if (factions.length < 2) continue; // no conflict

    // Combat rules:
    // 1. Empire vs Rebel - always combat
    // 2. Faction vs Rebel - always combat
    // 3. Rebel vs Rebel - manual only (not auto)
    // 4. Rebel vs Multiple Enemies - fight strongest enemy

    const hasRebel = factions.includes('rebel');
    const hasEmpire = factions.includes('empire');
    const factionFactions = factions.filter(f => f.startsWith('faction:'));

    if (hasRebel && (hasEmpire || factionFactions.length > 0)) {
      // Rebel encounters empire or faction - combat
      let enemySide = null;
      let enemyKey = null;

      if (hasEmpire) {
        enemySide = sides['empire'];
        enemyKey = 'empire';
      } else {
        // Fight the first faction (could expand to strongest)
        enemyKey = factionFactions[0];
        enemySide = sides[enemyKey];
      }

      const combatKey = `${planetId}:${layer}:rebel:${enemyKey}`;
      if (!resolvedCombats.has(combatKey)) {
        resolvedCombats.add(combatKey);

        // Create persistent combat instead of resolving immediately
        const combat = await db.startCombat(
          sessionId, planetId,
          sides['rebel'], enemySide,
          'rebel', enemyKey
        );

        // Extract involved player IDs
        const involvedPlayerIds = [];
        for (const u of locationUnits) {
          if (u.owner.startsWith('rebel:')) {
            const playerId = u.owner.slice(6);
            if (!involvedPlayerIds.includes(playerId)) involvedPlayerIds.push(playerId);
          }
        }

        // Log combat initiation
        combatLog.push({
          combatId: combat.id,
          planetId,
          layer,
          attackerKey: 'rebel',
          defenderKey: enemyKey,
          attackerUnits: sides['rebel'],
          defenderUnits: enemySide,
          involvedPlayerIds,
          round: 0,
          status: 'ongoing'
        });
      }
    }
  }

  return combatLog;
}

function ownerFaction(owner) {
  if (owner.startsWith('empire')) return 'empire';
  if (owner.startsWith('rebel'))     return 'rebel';
  if (owner.startsWith('faction'))   return owner; // faction:id
  return 'rebel';
}

// Generate dramatic, narrative-driven combat descriptions
function generateCombatNarrative(planetId, planetName, layer, attackerKey, defenderKey, outcome, aLosses, dLosses, hasPolice = false) {
  const isOrbital = layer === 'orbit';
  const attackerLabel = attackerKey === 'rebel' ? 'Rebel forces'
                       : attackerKey === 'empire' ? 'Imperial fleet'
                       : 'Faction forces';

  let defenderLabel = defenderKey === 'rebel' ? 'Rebel defenders'
                    : defenderKey === 'empire' ? (hasPolice ? 'Local police response' : 'Imperial garrison')
                    : 'Faction troops';

  if (hasPolice && layer === 'surface' && defenderKey === 'empire') {
    defenderLabel = 'Armed police forces';
  }

  const narratives = {
    // Attacker wins
    attacker_wins_orbit_rebel: `ORBITAL VICTORY: Rebel starfighters overwhelm Imperial patrol craft above ${planetName}. ${dLosses} Imperial ships destroyed. Rebel losses: ${aLosses}.`,
    attacker_wins_orbit_empire: `ORBITAL BLOCKADE: Imperial fleet establishes control over ${planetName}. ${dLosses} rebel vessels vaporized. Imperial losses: ${aLosses}.`,
    attacker_wins_surface_rebel: `GROUND ASSAULT: Rebel forces storm ${planetName} surface positions. ${dLosses} Imperial troops neutralized. Rebel casualties: ${aLosses}.`,
    attacker_wins_surface_empire: `PLANETARY PACIFICATION: Imperial ground forces secure ${planetName}. ${dLosses} rebels eliminated. Imperial casualties: ${aLosses}.`,

    // Defender wins
    defender_wins_orbit_rebel: `REBEL DEFENSE: Rebel pilots repel Imperial attack above ${planetName}. ${aLosses} Imperial ships shot down. ${dLosses} rebels lost.`,
    defender_wins_orbit_empire: `IMPERIAL DEFENSE: Imperial fighters intercept rebel attack. ${aLosses} rebel craft destroyed. Imperial losses: ${dLosses}.`,
    defender_wins_surface_rebel: `REBEL HOLDOUT: Rebel forces repel Imperial invasion of ${planetName}. ${aLosses} Imperial troops killed. Rebel defenders: ${dLosses} lost.`,
    defender_wins_surface_empire: `DEFENSIVE VICTORY: Imperial garrison holds ${planetName} against rebel assault. ${aLosses} rebels cut down. Garrison losses: ${dLosses}.`,

    // Draw
    draw_orbit: `STALEMATE AT ${planetName.toUpperCase()}: Both fleets withdraw after brutal orbital engagement. Both sides report heavy losses.`,
    draw_surface: `DEADLOCK ON ${planetName.toUpperCase()}: Ground forces locked in bitter stalemate. Combat ends inconclusively.`,
  };

  const key = `${outcome}_${layer}_${attackerKey === 'rebel' ? 'rebel' : 'empire'}`;
  return narratives[key] || `Combat at ${planetName}: ${outcome === 'draw' ? 'forces withdraw in stalemate' : attackerKey + ' ' + outcome}`;
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
      // Update police units to match new control
      const newPoliceOwner = newController === 'empire' ? 'empire:local_police' : newController;
      await db.updatePoliceAllegiance(sessionId, planetId, newPoliceOwner);
    }
  } else {
    outcome = 'defender_wins';
  }

  const planetName = session.planet_state.find(p => p.id === planetId)?.name || planetId;
  const hasPolice = defenders.some(u => u.unit_type === 'police_patrol');
  const summary = generateCombatNarrative(planetId, planetName, layer, attackerKey, defenderKey, outcome, attackerLosses, defenderLosses, hasPolice);

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
    if (planet.controlled_by === 'rebel' || planet.controlled_by?.startsWith('faction:')) {
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
    if (planet.controlled_by === 'empire' || planet.controlled_by?.startsWith('empire:')) {
      const econ = CONFIG.PLANET_ECON[planet.id];
      if (!econ) continue;
      const gov = planet.controlled_by?.startsWith('empire:')
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

    // Check if unit is in any faction's allowed units
    const factions = await db.getFactions(sessionId);
    const factionsHere = factions.filter(f => cells.some(c => c.faction_id === f.id));

    const canProduce = factionsHere.some(f => {
      const allowed = f.allowed_unit_types || [];
      return allowed.includes(unitType);
    });

    if (!canProduce) {
      const producibleUnits = new Set();
      for (const f of factionsHere) {
        (f.allowed_unit_types || []).forEach(u => producibleUnits.add(u));
      }
      const unitNames = [...producibleUnits]
        .map(u => CONFIG.UNIT_TYPES[u]?.label || u)
        .sort()
        .join(', ') || '(none)';
      return { ok:false, error:`Faction network here can only produce: ${unitNames}` };
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

async function applyFleetMove(sessionId, playerId, fleetId, targetPlanetId, targetLayer) {
  const fleet = await db.getFleet(fleetId);
  if (!fleet) return { ok:false, error:'Fleet not found' };

  const fleetOwner = fleet.owner;
  if (!fleetOwner.includes(playerId)) return { ok:false, error:'Not your fleet' };

  // Get all units in the fleet
  const fleetUnits = await db.getUnitsByFleet(fleetId);
  if (fleetUnits.length === 0) return { ok:false, error:'Fleet has no units' };

  // Verify all units are at the same location (sanity check)
  const currentPlanetId = fleet.planet_id;
  const currentLayer = fleet.layer;
  if (fleetUnits.some(u => u.planet_id !== currentPlanetId || u.layer !== currentLayer)) {
    return { ok:false, error:'Fleet units not coherent - cannot move' };
  }

  // Calculate effective jump range (use minimum jump_distance in fleet)
  const jumpDistances = fleetUnits.map(u => u.jump_distance ?? CONFIG.UNIT_TYPES[u.unit_type]?.jumpDistance ?? 1);
  const minJumpDist = Math.min(...jumpDistances);
  if (minJumpDist === 0) return { ok:false, error:'Fleet cannot jump between planets' };

  const { reachableIn } = require('./world');
  if (!reachableIn(currentPlanetId, minJumpDist).includes(targetPlanetId))
    return { ok:false, error:'Target out of fleet jump range' };

  // Move all units atomically
  const unitIds = fleetUnits.map(u => u.id);
  const placeholders = unitIds.map((_, i) => `$${i+1}`).join(',');
  await db.pool.query(
    `UPDATE units SET planet_id=$${unitIds.length+1}, layer=$${unitIds.length+2}, updated_at=NOW()
     WHERE id IN (${placeholders})`,
    [...unitIds, targetPlanetId, targetLayer]
  );

  // Update fleet location
  await db.updateFleet(fleetId, { planet_id: targetPlanetId, layer: targetLayer });

  // Return updated fleet state
  const updatedFleet = await db.getFleet(fleetId);
  return { ok:true, fleet: updatedFleet, unitCount: fleetUnits.length };
}

async function autoGroupFleets(sessionId, db) {
  // Group ungrouped units by (owner, planet_id, layer) into fleets
  const ungroupedUnits = await db.pool.query(
    `SELECT u.* FROM units u
     WHERE u.session_id = $1 AND u.fleet_id IS NULL
     ORDER BY u.owner, u.planet_id, u.layer, u.created_at`,
    [sessionId]
  );

  if (ungroupedUnits.rows.length === 0) return [];

  let currentOwner = null;
  let currentPlanetId = null;
  let currentLayer = null;
  let fleetUnits = [];
  const createdFleets = [];

  for (const unit of ungroupedUnits.rows) {
    // Check if we've moved to a different (owner, planet, layer) group
    if (unit.owner !== currentOwner || unit.planet_id !== currentPlanetId || unit.layer !== currentLayer) {
      // Save previous fleet if any
      if (fleetUnits.length > 0) {
        const fleet = await db.createFleet(
          sessionId,
          currentOwner,
          `${currentOwner} ${currentLayer} fleet at ${currentPlanetId}`,
          currentPlanetId,
          currentLayer,
          true, // auto_grouped = true
          null  // createdRound = null (mid-game auto-group)
        );
        await db.assignUnitsToFleet(fleetUnits.map(u => u.id), fleet.id);
        createdFleets.push(fleet);
      }
      // Start new group
      currentOwner = unit.owner;
      currentPlanetId = unit.planet_id;
      currentLayer = unit.layer;
      fleetUnits = [unit];
    } else {
      fleetUnits.push(unit);
    }
  }

  // Don't forget the last group
  if (fleetUnits.length > 0) {
    const fleet = await db.createFleet(
      sessionId,
      currentOwner,
      `${currentOwner} ${currentLayer} fleet at ${currentPlanetId}`,
      currentPlanetId,
      currentLayer,
      true,
      null
    );
    await db.assignUnitsToFleet(fleetUnits.map(u => u.id), fleet.id);
    createdFleets.push(fleet);
  }

  return createdFleets;
}

module.exports = {
  resolveAllCombat, resolveCombat, resolveRebelVsRebelCombat, resolveSingleCombatRound, runProductionPhase,
  applyRebelUnitMove, applyFleetMove, queueRebelUnitProduction,
  buildPublicUnitState, getAssignedGovernor, autoGroupFleets,
};
