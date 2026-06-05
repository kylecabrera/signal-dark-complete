const db = require('./db');
const { processMovesIntoLeaks, updateSirisModel, applyGovernorActionResults } = require('./intel');
const { runAllGovernors } = require('./governors');
const { resolveAllCombat, runProductionPhase, buildPublicUnitState } = require('./units');
const { contributeToFaction, foundFaction, foundFactionCell, investigateFaction, denounceFaction, getFactionBonuses, buildClientFactionState, buildAllianceState } = require('./factions');
const { ALERT_LEVELS, isAdjacent, LANES, getPlanetSector, getAdjacentSectors, CRIMINALITY_LEVELS } = require('./world');
const CONFIG = require('./config');

// ─────────────────────────────────────────────
// Determine which faction claims a planet when it flips to rebel
// Priority: Strongest cell on planet > Nearest faction > Generic rebel
// ─────────────────────────────────────────────
async function determineClaimingFaction(sessionId, planetId, allPlanets) {
  // 1. Check for faction cells on this planet
  const cellsHere = await db.getFactionCellsAtPlanet(sessionId, planetId);
  if (cellsHere.length > 0) {
    // Find the faction with strongest cell presence
    const strongestCell = cellsHere.reduce((max, cell) =>
      (cell.strength > (max?.strength || 0)) ? cell : max
    );
    return `faction:${strongestCell.faction_id}`;
  }

  // 2. If no cells on planet, find nearest faction
  const allFactions = await db.getFactions(sessionId);
  const allCells = await db.getFactionCells(sessionId);

  if (allFactions.length === 0) return 'rebel';

  // Build map of which planets have faction cells
  const factionsWithCells = new Map();
  for (const cell of allCells) {
    if (!factionsWithCells.has(cell.faction_id)) {
      factionsWithCells.set(cell.faction_id, []);
    }
    factionsWithCells.get(cell.faction_id).push(cell.planet_id);
  }

  // Find closest faction by minimum hop distance to any of its cells
  let closestFaction = null;
  let minDistance = Infinity;

  for (const faction of allFactions) {
    const cellPlanets = factionsWithCells.get(faction.id) || [];
    if (cellPlanets.length === 0) continue;

    // Find closest cell planet for this faction
    for (const cellPlanetId of cellPlanets) {
      const distance = getHopDistance(planetId, cellPlanetId, allPlanets);
      if (distance < minDistance) {
        minDistance = distance;
        closestFaction = faction.id;
      }
    }
  }

  return closestFaction ? `faction:${closestFaction}` : 'rebel';
}

// Calculate shortest hop distance between two planets using the hyperlane graph
function getHopDistance(planetA, planetB, allPlanets) {
  if (planetA === planetB) return 0;

  const { LANES } = require('./world');
  const visited = new Set();
  const queue = [[planetA, 0]];

  while (queue.length > 0) {
    const [current, distance] = queue.shift();
    if (current === planetB) return distance;
    if (visited.has(current)) continue;
    visited.add(current);

    // Find adjacent planets via LANES
    for (const lane of LANES) {
      let adjacent = null;
      if (lane[0] === current) adjacent = lane[1];
      else if (lane[1] === current) adjacent = lane[0];

      if (adjacent && !visited.has(adjacent)) {
        queue.push([adjacent, distance + 1]);
      }
    }
  }

  return Infinity; // No path found
}

// ─────────────────────────────────────────────
// Apply a rebel action — single source of truth for all action types
// ─────────────────────────────────────────────
async function applyRebelAction(sessionId, playerId, action) {
  const session = await db.getSessionById(sessionId);
  if (!session) return { ok:false, error:'Session not found' };
  if (session.status !== 'active') return { ok:false, error:'Game not active' };
  if (session.phase !== 'rebel') return { ok:false, error:'Not rebel phase' };

  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok:false, error:'Rebel state not found' };

  const playerRow = (await db.getPlayers(sessionId)).find(p => p.id === playerId);
  if (playerRow?.is_eliminated) return { ok:false, error:'You have been eliminated' };

  // Check if player is detained - if so, prevent movement
  if (rebelState.is_detained) {
    if (action.type === 'move') {
      return { ok:false, error:`Detained: cannot move for ${rebelState.detention_turns} more turn${rebelState.detention_turns !== 1 ? 's' : ''}` };
    }
  }

  const currentPlanet = rebelState.current_planet;
  const currentSector = getPlanetSector(currentPlanet);

  // Get cell bonus actions (1 per cell in current sector)
  let cellBonusActions = 0;
  if (currentSector) {
    const cells = await db.getFactionCells(sessionId);
    cellBonusActions = cells.filter(c => {
      const cellSector = getPlanetSector(c.planet_id);
      return cellSector === currentSector;
    }).length;
  }

  const actionsLeft = CONFIG.ACTIONS_PER_TURN - rebelState.actions_used + cellBonusActions;
  if (actionsLeft <= 0) return { ok:false, error:'No actions remaining' };

  const { type, planetId, targetId, unitId, factionId, factionName,
          ideology, amount, unitType } = action;
  let covert = true;
  let label  = '';
  let metadata = {};
  let result = { ok:true };

  // ── Movement ──────────────────────────────
  if (type === 'move') {
    // Check if player's jedi is alive
    const allUnits = await db.getUnits(sessionId);
    const jediAlive = allUnits.some(u =>
      u.owner === `rebel:${playerId}` && u.unit_type === 'jedi_avatar'
    );
    if (!jediAlive) return { ok:false, error:'Your Jedi has fallen — you cannot move.' };

    if (!isAdjacent(currentPlanet, planetId)) return { ok:false, error:'Not adjacent' };
    const lockedLanes = session.locked_lanes || [];
    if (lockedLanes.some(([a,b])=>(a===currentPlanet&&b===planetId)||(a===planetId&&b===currentPlanet)))
      return { ok:false, error:'Hyperlane locked down' };
    label = `Moved to ${planetId}`;
    await db.upsertRebelState(sessionId, playerId, planetId, rebelState.actions_used+1, rebelState.credits||0);
    await db.escortOrbitalUnits(sessionId, playerId, planetId);
    result.newPlanet = planetId;
    // Decrease suspicion when moving to new planet
    const suspicionDecrease = Math.floor(Math.random() * 2) + 2; // 2-3 point decrease
    await db.updateRebelStateSuspicion(sessionId, playerId, -suspicionDecrease);

  // ── Money earning actions ───────────────────
  } else if (['earn_money','steal_money'].includes(type)) {
    if (planetId !== currentPlanet) return { ok:false, error:'Must be on this planet' };

    const econ = CONFIG.PLANET_ECON[planetId];
    const config = CONFIG.EARN_MONEY[type];

    // Determine covert status
    if (type === 'steal_money') {
      covert = true; // Theft is always covert
    } else {
      // Honest work has small chance of being detected
      let detectChance = 0.15; // 15% base chance of being overt

      // Reduce detection chance if player has hidden units
      if (rebelState.has_hidden_units) {
        detectChance *= 0.3; // 70% reduction if hidden
      }

      covert = Math.random() > detectChance;
    }

    // Generate random amount based on planet economy
    let maxAmount;
    let earnedAmount;

    if (!econ || econ.output === 0) {
      // No economic output - earn minimum amounts
      maxAmount = (type === 'earn_money') ? 1 : 2;
      earnedAmount = maxAmount;
    } else {
      // Calculate based on configured percentage
      maxAmount = Math.floor(econ.output * config.percentOfEconomy);
      // Guarantee at least 1 credit even if percentage rounds down
      maxAmount = Math.max(1, maxAmount);
      earnedAmount = Math.floor(Math.random() * (maxAmount + 1));
      earnedAmount = Math.max(1, earnedAmount); // Always at least 1
    }

    // Update credits
    const newCredits = (rebelState.credits || 0) + earnedAmount;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1, newCredits);

    label = `${config.name} at ${planetId} (+${earnedAmount}cr)${covert?' [HIDDEN]':''}`;
    result.moneyEarned = earnedAmount;
    result.maxPossible = maxAmount;

  // ── Standard covert/overt actions ─────────
  } else if (['recruit','intel','sabotage','incite','hide'].includes(type)) {
    if (planetId !== currentPlanet) return { ok:false, error:'Must be on this planet' };
    covert = !(type === 'sabotage' || type === 'incite');
    label  = `${type} at ${planetId}${covert?'':' [OVERT]'}`;

    const factionBonus = await getFactionBonuses(sessionId, playerId, planetId, type);
    if (factionBonus.blocked) return { ok:false, error:factionBonus.reason };

    await applyImmediateEffects(sessionId, session, type, planetId, rebelState, factionBonus);

    // Intel discovery check for hidden units and faction cells
    if (type === 'intel') {
      const unitsHere  = await db.getUnitsAtPlanet(sessionId, planetId);
      const planetName = session.planet_state.find(p => p.id === planetId)?.name || planetId;
      const hiddenEnemyUnits = unitsHere.filter(u => u.is_hidden && !u.owner?.startsWith('rebel:'));

      for (const unit of hiddenEnemyUnits) {
        const threshold = unit.unit_type === 'emperor' ? 0.15
                        : unit.unit_type === 'governor_avatar' ? 0.25
                        : 0.65;
        if (Math.random() < threshold) {
          result.discoveries = result.discoveries || [];
          result.discoveries.push({
            type: 'unit_discovered',
            text: `Intel reveals ${unit.designation || unit.unit_type} detected at ${planetName}`,
            layer: unit.layer,
          });
        }
      }

      // Discover factions through intel gathering
      const allFactions = await db.getFactions(sessionId);
      const currentPlanetType = session.planet_state.find(p => p.id === planetId)?.type;
      const cells = await db.getFactionCellsAtPlanet(sessionId, planetId);

      // Always discover factions with cells on this planet
      for (const cell of cells) {
        const f = allFactions.find(f => f.id === cell.faction_id);
        if (f) {
          await db.recordFactionDiscovery(sessionId, playerId, f.id, session.round);
          result.discoveries = result.discoveries || [];
          result.discoveries.push({
            type: 'faction_discovered',
            text: `Intel: ${f.name} operates on ${planetName} (strength ${cell.strength})`,
            factionId: f.id,
            factionName: f.name,
          });
        }
      }

      // Discover factions in the same region with a 12% chance
      if (currentPlanetType) {
        const factionsInRegion = allFactions.filter(f => {
          const homePlanet = session.planet_state.find(p => p.id === f.home_planet);
          return homePlanet?.type === currentPlanetType;
        });

        for (const f of factionsInRegion) {
          if (Math.random() < 0.12) {
            await db.recordFactionDiscovery(sessionId, playerId, f.id, session.round);
            result.discoveries = result.discoveries || [];
            result.discoveries.push({
              type: 'faction_discovered',
              text: `Intel: Discovered ${f.name} based in the ${currentPlanetType}`,
              factionId: f.id,
              factionName: f.name,
            });
          }
        }
      }

      // Discover nearby fleets on adjacent planets (30% chance per fleet)
      const { LANES } = require('./world');
      const adjSet = new Set();
      for (const [a, b] of (LANES || [])) { adjSet.add(`${a}|${b}`); adjSet.add(`${b}|${a}`); }
      const adjacentPlanets = [];
      for (const planet of session.planet_state) {
        if (adjSet.has(`${planetId}|${planet.id}`)) {
          adjacentPlanets.push(planet.id);
        }
      }

      const allUnits = await db.getUnits(sessionId);
      for (const adjPlanetId of adjacentPlanets) {
        const unitsOnAdjPlanet = allUnits.filter(u => u.planet_id === adjPlanetId);
        const fleetsByOwner = {};

        for (const unit of unitsOnAdjPlanet) {
          if (unit.owner?.startsWith('rebel:') && unit.owner !== `rebel:${playerId}`) {
            // Rebel ally fleet (other players)
            if (!fleetsByOwner[unit.owner]) fleetsByOwner[unit.owner] = [];
            fleetsByOwner[unit.owner].push(unit);
          } else if (unit.owner?.startsWith('empire:') || unit.owner?.startsWith('faction:')) {
            // Enemy fleet
            if (!fleetsByOwner[unit.owner]) fleetsByOwner[unit.owner] = [];
            fleetsByOwner[unit.owner].push(unit);
          }
        }

        for (const [owner, units] of Object.entries(fleetsByOwner)) {
          if (Math.random() < 0.30) { // 30% chance per fleet
            const adjPlanetName = session.planet_state.find(p => p.id === adjPlanetId)?.name || adjPlanetId;
            const strongest = units.reduce((max, u) =>
              (CONFIG.UNIT_TYPES[u.unit_type]?.strength || 0) > (CONFIG.UNIT_TYPES[max.unit_type]?.strength || 0) ? u : max
            );

            try {
              await db.recordFleetDiscovery(sessionId, playerId, owner, adjPlanetId, session.round, units.length, strongest.designation || strongest.unit_type);
            } catch (err) {
              // discovered_fleets table may not exist yet — skip recording
            }

            const isRebel = owner.startsWith('rebel:');
            const ownerLabel = isRebel ? 'Rebel ally' : owner.startsWith('empire:') ? `${owner.slice(7)} fleet` : 'Faction forces';

            result.discoveries = result.discoveries || [];
            result.discoveries.push({
              type: 'fleet_discovered',
              text: `Intel: ${ownerLabel} spotted at ${adjPlanetName} (${units.length} unit${units.length!==1?'s':''}, strongest: ${strongest.designation || strongest.unit_type})`,
              fleetOwner: owner,
              fleetPlanet: adjPlanetId,
              unitCount: units.length,
            });
          }
        }
      }
    }

    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1, rebelState.credits||0);

    // ── Chance-based action bonuses ──────────────
    // Recruit: 20% chance to spawn a free militia unit
    if (type === 'recruit' && Math.random() < 0.20) {
      await db.createUnit(sessionId, 'militia', `rebel:${playerId}`, currentPlanet, 'surface',
        CONFIG.UNIT_TYPES.militia.strength, CONFIG.UNIT_TYPES.militia.hp, true, 0, 0, 'Rebel Sympathizer');
      const planetName = session.planet_state.find(p => p.id === currentPlanet)?.name || currentPlanet;
      result.recruitBonus = { unit: 'militia', planetId: currentPlanet, planetName };
    }

    // Sabotage: 18% chance to block empire production on planet for 2 rounds
    if (type === 'sabotage' && Math.random() < 0.18) {
      const freshSession  = await db.getSessionById(sessionId);
      const freshPlanets  = JSON.parse(JSON.stringify(freshSession.planet_state));
      const freshPlanet   = freshPlanets.find(p => p.id === planetId);
      if (freshPlanet) {
        freshPlanet.production_blocked_until = freshSession.round + 2;
        await db.updateSession(sessionId, { planet_state: freshPlanets });
        result.sabotageBonus = { blocked: true, blockedUntil: freshSession.round + 2, planetId };
      }
    }

    // Incite: 18% chance to damage or destroy the weakest imperial unit
    if (type === 'incite' && Math.random() < 0.18) {
      const unitsHere     = await db.getUnitsAtPlanet(sessionId, planetId);
      const imperialUnits = unitsHere.filter(u => u.owner?.startsWith('empire:') || u.owner === 'empire');
      if (imperialUnits.length > 0) {
        const target = imperialUnits.reduce((w, u) => u.hp < w.hp ? u : w);
        if (target.hp <= 1) {
          await db.deleteUnit(target.id);
          result.inciteBonus = { killed: true, unitType: target.unit_type, designation: target.designation || target.unit_type };
        } else {
          await db.updateUnit(target.id, { hp: target.hp - 1 });
          result.inciteBonus = { damaged: true, unitType: target.unit_type, designation: target.designation || target.unit_type };
        }
      }
    }

  // ── Faction: contribute ───────────────────
  } else if (type === 'contribute') {
    if (!factionId || !amount) return { ok:false, error:'Need factionId and amount' };
    const fResult = await contributeToFaction(sessionId, playerId, factionId, amount||1, session.round);
    if (!fResult.ok) return fResult;
    covert = !fResult.factionIsTraitor; // traitor exposure is overt-equivalent
    label  = `Contributed ${amount} credits to faction`;
    metadata = { faction_id: factionId, faction_is_traitor: fResult.factionIsTraitor };
    result.traitorExposed = fResult.exposed;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      (rebelState.credits||0) - (amount||1));

  // ── Faction: found ────────────────────────
  } else if (type === 'found') {
    if (!factionName || !ideology || !planetId) return { ok:false, error:'Need name, ideology, homePlanet' };
    const fResult = await foundFaction(sessionId, playerId, factionName, ideology, planetId);
    if (!fResult.ok) return fResult;
    covert = true;
    label  = `Founded faction: ${factionName}`;
    metadata = { faction_id: fResult.faction?.id };
    result.faction = fResult.faction;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      (rebelState.credits||0) - CONFIG.FACTIONS.FOUND_COST);

  // ── Faction: found cell ────────────────────
  } else if (type === 'found_cell') {
    if (!factionId || !planetId) return { ok:false, error:'Need factionId and planetId' };
    const cResult = await foundFactionCell(sessionId, playerId, factionId, planetId, session.round);
    if (!cResult.ok) return cResult;
    covert = true;
    label  = `Established faction cell at ${planetId}`;
    result.cellFounded = true;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      (rebelState.credits||0) - CONFIG.FACTIONS.CELL_COST);

    // Decrease criminality when cell is founded
    const cellSector = getPlanetSector(planetId);
    if (cellSector) {
      await db.updateCriminality(sessionId, playerId, cellSector, -1);
      result.criminalityDecreased = 1;
    }

  // ── Faction: investigate ──────────────────
  } else if (type === 'investigate') {
    if (!factionId) return { ok:false, error:'Need factionId' };
    const iResult = await investigateFaction(sessionId, playerId, factionId, session.round);
    if (!iResult.ok) return iResult;
    covert = true;
    label  = `Investigated faction: ${iResult.factionName}`;
    result = { ...result, ...iResult };
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      rebelState.credits||0);

  // ── Faction: denounce ─────────────────────
  } else if (type === 'denounce') {
    if (!factionId) return { ok:false, error:'Need factionId' };
    const dResult = await denounceFaction(sessionId, playerId, factionId, session.round);
    if (!dResult.ok) return dResult;
    covert = false; // denounciations are public
    label  = `DENOUNCED faction: ${dResult.factionName} — ${dResult.outcome}`;
    result = { ...result, ...dResult };
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      rebelState.credits||0);

  // ── Unit: move ────────────────────────────
  } else if (type === 'unit_move') {
    if (!unitId || !targetId) return { ok:false, error:'Need unitId and targetId' };
    const { applyRebelUnitMove } = require('./units');
    const uResult = await applyRebelUnitMove(sessionId, playerId, unitId, targetId, action.layer||'surface');
    if (!uResult.ok) return uResult;
    covert = true;
    label  = `Moved unit to ${targetId}`;
    result.unit = uResult.unit;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      rebelState.credits||0);

  // ── Fleet: move ───────────────────────────
  } else if (type === 'fleet_move') {
    if (!action.fleetId || !targetId) return { ok:false, error:'Need fleetId and targetId' };
    const { applyFleetMove } = require('./units');
    const fResult = await applyFleetMove(sessionId, playerId, action.fleetId, targetId, action.layer||'orbit');
    if (!fResult.ok) return fResult;
    covert = true;
    label  = `Moved fleet (${fResult.unitCount} units) to ${targetId}`;
    result.fleet = fResult.fleet;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      rebelState.credits||0);

  // ── Unit: produce ─────────────────────────
  } else if (type === 'unit_produce') {
    if (!unitType || !planetId) return { ok:false, error:'Need unitType and planetId' };
    const { queueRebelUnitProduction } = require('./units');
    const pResult = await queueRebelUnitProduction(sessionId, playerId, planetId, unitType);
    if (!pResult.ok) return pResult;
    covert = true;
    label  = `Queued ${unitType} production at ${planetId}`;
    // Unit production does NOT consume an action
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used,
      pResult.newCredits);

  // ── Unit: attack empire/faction ───────────
  } else if (type === 'unit_attack') {
    if (!planetId) planetId = currentPlanet;
    const targetLayer = action.layer || 'orbit'; // default to orbit combat

    // Get all units at this planet
    const allUnitsHere = await db.getUnitsAtPlanet(sessionId, planetId);
    const myUnits = allUnitsHere.filter(u => u.owner === `rebel:${playerId}` && u.layer === targetLayer);
    const enemyUnits = allUnitsHere.filter(u => {
      const isEnemy = u.owner?.startsWith('empire:') || u.owner?.startsWith('faction:');
      return isEnemy && u.layer === targetLayer && !u.is_hidden;
    });

    if (myUnits.length === 0) {
      return { ok:false, error:`No units to attack with on ${targetLayer}` };
    }
    if (enemyUnits.length === 0) {
      return { ok:false, error:`No enemy units visible on ${targetLayer}` };
    }

    // Trigger immediate combat
    const { resolveCombat } = require('./units');
    const combatResult = await resolveCombat(sessionId, session.round, planetId, targetLayer,
      myUnits, enemyUnits, 'rebel', 'empire');

    covert = false;
    label = `Attacked ${targetLayer} forces at ${planetId} [OVERT]`;
    metadata = { target_planet: planetId, layer: targetLayer, combatOutcome: combatResult.outcome };
    result.combat = combatResult;

    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1,
      rebelState.credits||0);

  // ── Rebel vs Rebel attack ──────────────────
  } else if (type === 'rebel_attack') {
    const { targetPlayerId, layer } = action;
    if (!targetPlayerId || !layer)
      return { ok:false, error:'Need targetPlayerId and layer' };
    if (targetPlayerId === playerId)
      return { ok:false, error:'Cannot attack yourself' };

    const allPlayers = await db.getPlayers(sessionId);
    const target = allPlayers.find(p => p.id === targetPlayerId);
    if (!target) return { ok:false, error:'Target player not found' };
    if (target.is_eliminated) return { ok:false, error:'Target already eliminated' };

    const sessionUnits = await db.getUnits(sessionId);
    const myUnitsHere = sessionUnits.filter(u =>
      u.owner === `rebel:${playerId}` && u.planet_id === currentPlanet && u.layer === layer);
    if (myUnitsHere.length === 0)
      return { ok:false, error:'No units to fight with here' };

    const theirUnitsHere = sessionUnits.filter(u =>
      u.owner === `rebel:${targetPlayerId}` && u.planet_id === currentPlanet && u.layer === layer);
    if (theirUnitsHere.length === 0)
      return { ok:false, error:'Target has no units here' };

    const { resolveRebelVsRebelCombat } = require('./units');
    const combatResult = await resolveRebelVsRebelCombat(
      sessionId, session.round, playerId, targetPlayerId, currentPlanet, layer
    );
    if (!combatResult.ok) return combatResult;

    covert = false;
    label  = `Attacked ${target.display_name}'s ${layer} forces [OVERT]`;
    metadata = { target_player_id: targetPlayerId, layer };
    result.pvpCombat = {
      ...combatResult,
      attackerName: (await db.getPlayers(sessionId)).find(p=>p.id===playerId)?.display_name,
      defenderName: target.display_name,
      defenderColor: target.color,
      planetId: currentPlanet,
    };
    result.targetPlayerId = targetPlayerId;
    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1, rebelState.credits||0);

  // ── Force Powers (nested action) ──────────
  // ── Force: discover mysteries ──────────────
  } else if (type === 'discover_force_mysteries') {
    let forceUser = await db.getForceUser(sessionId, playerId);
    if (!forceUser) {
      forceUser = await db.getOrCreateForceUser(sessionId, playerId, CONFIG.FORCE.BASE_STRENGTH, 0);
    }

    if (!forceUser) return { ok:false, error:'Force user not initialized' };

    // Unlock all available force powers for this player
    const availablePowers = ['force_shield', 'healing_touch', 'sense_danger', 'inspire_allies',
                             'force_lightning', 'mind_trick', 'force_choke', 'dark_vision', 'dominate_will'];

    result.discoveredPowers = availablePowers;
    covert = true;
    label = `Discovered Force mysteries!`;
    result.forcePowersUnlocked = availablePowers.length;

    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1, rebelState.credits||0);

  } else if (type === 'force_powers') {
    const { powerName } = action;
    if (!powerName) return { ok:false, error:'Power name required' };

    let forceUser = await db.getForceUser(sessionId, playerId);
    if (!forceUser) {
      forceUser = await db.getOrCreateForceUser(sessionId, playerId, CONFIG.FORCE.BASE_STRENGTH, 0);
    }

    if (!forceUser) return { ok:false, error:'Force user not initialized' };

    const powerConfig = CONFIG.FORCE.FORCE_POWERS[powerName];
    if (!powerConfig) return { ok:false, error:`Unknown force power: ${powerName}` };

    const activePowers = await db.getActiveForcePowers(sessionId, forceUser.id, session.round);
    if (activePowers.some(p => p.power_name === powerName)) {
      return { ok:false, error:`${powerConfig.name} is already active` };
    }

    if (forceUser.force_points < powerConfig.costPoints) {
      return { ok:false, error:`Need ${powerConfig.costPoints} force points (have ${forceUser.force_points})` };
    }

    if (powerName === 'find_apprentice') {
      const chance = (powerConfig.baseChance + (forceUser.force_tier * 0.01));
      if (Math.random() < chance) {
        const apprentice = await db.createForceApprentice(sessionId, forceUser.id);
        result.forcePowerResult = {
          success: true,
          text: `Successfully sensed a Force user! They have been drawn to you as your apprentice.`,
          apprenticeFound: true,
          apprenticeId: apprentice?.id,
        };
      } else {
        result.forcePowerResult = {
          success: false,
          text: `Sensed potential Force users, but none responded to your call.`,
        };
      }
    }

    await db.addForcePoints(forceUser.id, -powerConfig.costPoints);
    await db.recordForcePowerUse(sessionId, forceUser.id, powerName, session.round, powerConfig.duration);

    covert = true;
    label = `Used ${powerConfig.name}`;
    metadata = { power_name: powerName };
    result.forcePowerUsed = powerName;

    await db.upsertRebelState(sessionId, playerId, currentPlanet, rebelState.actions_used+1, rebelState.credits||0);

  } else {
    return { ok:false, error:`Unknown action type: ${type}` };
  }

  // Write sealed move
  await db.insertSealedMove(
    sessionId, playerId, session.round, type,
    planetId||currentPlanet, covert, label, metadata, targetId||null
  );

  // Update player suspicion based on covert/overt status
  if (!covert) {
    // Overt actions increase suspicion by 3-5
    const suspicionIncrease = Math.floor(Math.random() * 3) + 3;
    await db.updateRebelStateSuspicion(sessionId, playerId, suspicionIncrease);
    result.suspicionAdded = suspicionIncrease;
  }

  // Update criminality for crimes
  const sector = getPlanetSector(planetId || currentPlanet);
  if (sector) {
    if (type === 'sabotage') {
      await db.updateCriminality(sessionId, playerId, sector, 1);
      result.criminalityAdded = 1;
    } else if (type === 'incite') {
      await db.updateCriminality(sessionId, playerId, sector, 1);
      result.criminalityAdded = 1;
    } else if (type === 'steal_money' && Math.random() < 0.40) {
      // 40% chance theft increases criminality
      await db.updateCriminality(sessionId, playerId, sector, 1);
      result.criminalityAdded = 1;
    }
  }

  // Check for detention based on criminality level and cascade effects
  if (sector) {
    const updatedState = await db.getRebelState(sessionId, playerId);
    const sectorCriminality = updatedState.criminality?.[sector] || 0;

    const detentionChances = {
      1: 0.20, // Wanted: 20%
      2: 0.40, // Fugitive: 40%
      3: 0.60, // Outlaw: 60%
      4: 0.80  // Terrorist: 80%
    };

    const detentionChance = detentionChances[sectorCriminality] || 0;
    if (detentionChance > 0 && Math.random() < detentionChance) {
      // Detention triggered!
      const fineAmount = sectorCriminality * 50; // 50, 100, 150, 200 credits
      result.detentionTriggered = true;
      result.fineAmount = fineAmount;
      result.detentionMessage = `Apprehended by local authorities! Fine: ${fineAmount}cr to avoid detention.`;
    }

    // Cascade effects: if player reached Terrorist level, decrease criminality in adjacent sectors
    if (sectorCriminality === 4) {
      const { getAdjacentSectors } = require('./world');
      const adjacentSectors = getAdjacentSectors(sector);
      result.cascadeEffects = [];

      for (const adjSector of adjacentSectors) {
        await db.updateCriminality(sessionId, playerId, adjSector, -1);
        result.cascadeEffects.push({
          sector: adjSector,
          change: -1,
          message: `Cascade: Increased criminal activity spreading to ${adjSector}`
        });
      }
    }
  }

  // Update Force user: earn points, apply alignment shift, check tier advancement
  let forceUser = await db.getForceUser(sessionId, playerId);
  if (forceUser) {
    // Earn 1-3 force points per action
    const pointsEarned = Math.floor(Math.random() * 3) + 1;
    forceUser = await db.addForcePoints(forceUser.id, pointsEarned);
    result.forcePointsEarned = pointsEarned;

    // Apply alignment shift
    const alignmentShift = CONFIG.FORCE.ALIGNMENT_SHIFTS[type] ?? 0;
    if (alignmentShift !== 0) {
      forceUser = await db.updateForceAlignment(forceUser.id, forceUser.alignment + alignmentShift);
      result.forceAlignment = forceUser.alignment;
    }

    // Check tier advancement
    let currentTier = forceUser.force_tier;
    for (let tier = currentTier + 1; tier <= 10; tier++) {
      const tierConfig = CONFIG.FORCE.TIERS[tier];
      if (forceUser.force_points >= tierConfig.pointsRequired) {
        await db.updateForceTier(forceUser.id, tier);
        result.forceTierAdvanced = tier;
        currentTier = tier;
      } else {
        break;
      }
    }
  }

  return { ok:true, covert, label, ...result };
}

// ─────────────────────────────────────────────
// Immediate planet/session effects for standard actions
// ─────────────────────────────────────────────
async function applyImmediateEffects(sessionId, session, type, planetId, rebelState, factionBonus) {
  const planets = JSON.parse(JSON.stringify(session.planet_state));
  const planet  = planets.find(p => p.id === planetId);
  if (!planet) return;

  const cfg = CONFIG.ACTIONS[type] || {};
  const multiplier = factionBonus?.multiplier || 1;

  // Per-action local loyalty erosion (from new config)
  const loyaltyDelta = CONFIG.LOYALTY_DELTAS[type] || 0;
  if (loyaltyDelta) {
    planet.loyalty = Math.max(0, Math.min(100, planet.loyalty + loyaltyDelta));

    // Loyalty flip: hits 0 → dominant faction (or rebels) claim it, reset to CONFIG.LOYALTY_RESET.rebel
    if (planet.loyalty === 0 &&
        !planet.controlled_by.startsWith('faction:') &&
        planet.controlled_by !== 'rebel') {
      const claimingFaction = await determineClaimingFaction(sessionId, planet.id, planets);
      planet.controlled_by = claimingFaction;
      planet.loyalty = CONFIG.LOYALTY_RESET.rebel;
    }

    // Loyalty flip: hits 100 → architect claims it, reset to CONFIG.LOYALTY_RESET.architect
    if (planet.loyalty === 100 && !planet.controlled_by.startsWith('empire:')) {
      // Default to architect (no governor specified in rebel actions)
      planet.controlled_by = 'empire';
      planet.loyalty = CONFIG.LOYALTY_RESET.architect;
    }
  }

  // Persist updated planet state and recompute global meters
  const { empireLevel, rebellionStrength } = computeGlobalMeters(planets);
  await db.updateSession(sessionId, {
    planet_state:       planets,
    rebellion_strength: rebellionStrength,
    empire_level:  empireLevel,
  });

  // Rebels earn credits for successful actions
  const creditReward = { recruit:1, intel:1, sabotage:2, incite:2, hide:0 }[type] || 0;
  if (creditReward > 0) {
    await db.upsertRebelState(sessionId, rebelState.player_id, rebelState.current_planet,
      rebelState.actions_used, (rebelState.credits||0) + creditReward);
  }
}

function computeGlobalMeters(planets) {
  // Weighted by population * loyalty — population is the primary weight
  const totalPop = planets.reduce((s, p) => s + (p.pop || 1), 0);
  const weightedLoyalty = planets.reduce((s, p) => s + (p.loyalty / 100) * (p.pop || 1), 0);
  const empireLevel = Math.round((weightedLoyalty / totalPop) * 100);
  const rebellionStrength = 100 - empireLevel;
  return { empireLevel, rebellionStrength };
}

// ─────────────────────────────────────────────
// Governor turn — called after all rebels submit
// ─────────────────────────────────────────────
async function processGovernorTurn(sessionId) {
  let session = await db.getSessionById(sessionId);
  if (!session || session.status !== 'active') return null;

  await db.updateSession(sessionId, { phase:'governor' });
  session = await db.getSessionById(sessionId);

  const moves = await db.getSealedMovesForRound(sessionId, session.round);
  const units  = await db.getUnits(sessionId);
  const vektisMemory = updateVektisMemory(session.vektis_memory, moves);

  // Compute intel leaks
  const leaks = await processMovesIntoLeaks(sessionId, session.round, moves, session);

  // Update Siris model
  const updatedSiris = updateSirisModel(session.governor_state, leaks, session.round);
  const govState = { ...session.governor_state, siris: updatedSiris };
  await db.updateSession(sessionId, { governor_state: govState });
  session = await db.getSessionById(sessionId);

  // Run all governor AI agents
  const govResults = await runAllGovernors(session, leaks, units, vektisMemory);

  // Apply governor actions to game state
  let { newPlanets, newGovState, newWatched, newLocked, feedEntries } =
    await applyGovernorActionResults(sessionId, session.round, govResults);

  // Calculate current alert level based on rebel planets (before we update it)
  const rebelPlanets = newPlanets.filter(p =>
    p.controlled_by === 'rebel' || p.controlled_by?.startsWith('faction:')
  ).length;

  // Apply alert-level escalation mechanics
  const alertLevel = rebelPlanets <= 1 ? 0 : rebelPlanets <= 3 ? 1 : rebelPlanets <= 5 ? 2 : rebelPlanets <= 7 ? 3 : 4;
  const ALERT_NAMES = ['DORMANT', 'ELEVATED', 'MANHUNT', 'PURGE', 'ANNIHILATION'];

  // Escalate lane lockdown with alert level
  if (alertLevel >= 1) {
    // ELEVATED: Lock 1 additional random lane
    const allLanes = require('./world').LANES;
    const unlockedLanes = allLanes.filter(lane =>
      !newLocked.some(l => (l[0] === lane[0] && l[1] === lane[1]) || (l[0] === lane[1] && l[1] === lane[0]))
    );
    if (unlockedLanes.length > 0) {
      const randomLane = unlockedLanes[Math.floor(Math.random() * unlockedLanes.length)];
      newLocked.push(randomLane);
      feedEntries.push({ gov:'empire', text:`[${ALERT_NAMES[alertLevel]}] Hyperlane ${randomLane[0]}-${randomLane[1]} locked down` });
    }
  }
  if (alertLevel >= 2) {
    // MANHUNT: Lock another lane
    const allLanes = require('./world').LANES;
    const unlockedLanes = allLanes.filter(lane =>
      !newLocked.some(l => (l[0] === lane[0] && l[1] === lane[1]) || (l[0] === lane[1] && l[1] === lane[0]))
    );
    if (unlockedLanes.length > 0) {
      const randomLane = unlockedLanes[Math.floor(Math.random() * unlockedLanes.length)];
      newLocked.push(randomLane);
      feedEntries.push({ gov:'empire', text:`[${ALERT_NAMES[alertLevel]}] INCREASED SURVEILLANCE: Hyperlane ${randomLane[0]}-${randomLane[1]} under lockdown` });
    }
  }
  if (alertLevel >= 3) {
    // PURGE: Lock another lane + emergency spawn units
    const allLanes = require('./world').LANES;
    const unlockedLanes = allLanes.filter(lane =>
      !newLocked.some(l => (l[0] === lane[0] && l[1] === lane[1]) || (l[0] === lane[1] && l[1] === lane[0]))
    );
    if (unlockedLanes.length > 0) {
      const randomLane = unlockedLanes[Math.floor(Math.random() * unlockedLanes.length)];
      newLocked.push(randomLane);
      feedEntries.push({ gov:'empire', text:`[${ALERT_NAMES[alertLevel]}] ⚠️ CRITICAL: Hyperlane ${randomLane[0]}-${randomLane[1]} SEALED` });
    }
  }

  // Resolve any combat triggered by unit movements
  const combatLog = await resolveAllCombat(sessionId, session.round);
  if (combatLog.length > 0) {
    combatLog.forEach(c => feedEntries.push({
      gov:'system', text:`COMBAT: ${c.summary}`
    }));
  }

  // Process destroyed special units
  for (const combat of combatLog) {
    if (combat.destroyedGovernor) {
      await handleGovernorDeath(sessionId, combat.destroyedGovernor);
      feedEntries.push({ gov:'system', text:`Governor ${combat.destroyedGovernor} has been eliminated!` });
    }
    if (combat.destroyedEmperor) {
      await handleEmperorDeath(sessionId, feedEntries);
    }
  }

  // Refresh session after special unit handling
  session = await db.getSessionById(sessionId);
  newGovState = session.governor_state;
  newPlanets = session.planet_state;

  // Production phase
  let { newUnits, govProduction } = await runProductionPhase(sessionId);
  if (newUnits.length > 0) {
    feedEntries.push({ gov:'system', text:`Production complete: ${newUnits.length} unit(s) delivered.` });
  }

  // Emergency unit spawning for high alert levels
  const finalRebelPlanets = newPlanets.filter(p =>
    p.controlled_by === 'rebel' || p.controlled_by?.startsWith('faction:')
  ).length;

  let alertValue;
  if (finalRebelPlanets <= 1) alertValue = 0;      // DORMANT
  else if (finalRebelPlanets <= 3) alertValue = 1; // ELEVATED
  else if (finalRebelPlanets <= 5) alertValue = 2; // MANHUNT
  else if (finalRebelPlanets <= 7) alertValue = 3; // PURGE (Quorum activates)
  else alertValue = 4;                            // ANNIHILATION

  // Spawn emergency units at high alert levels
  if (alertValue >= 3) {
    // PURGE: Spawn 1-2 fighter squadrons on adjacent planets to rebel activity
    const rebelActivePlanets = newPlanets.filter(p =>
      p.controlled_by === 'rebel' || p.controlled_by?.startsWith('faction:')
    );

    if (rebelActivePlanets.length > 0) {
      const targetPlanet = rebelActivePlanets[Math.floor(Math.random() * rebelActivePlanets.length)];
      const { LANES } = require('./world');
      const adjacentPlanets = LANES
        .filter(lane => lane[0] === targetPlanet.id || lane[1] === targetPlanet.id)
        .map(lane => lane[0] === targetPlanet.id ? lane[1] : lane[0]);

      for (let i = 0; i < (alertValue >= 4 ? 2 : 1); i++) {
        if (adjacentPlanets.length === 0) break;
        const spawnPlanet = adjacentPlanets[Math.floor(Math.random() * adjacentPlanets.length)];
        const spawnPlanetName = newPlanets.find(p => p.id === spawnPlanet)?.name || spawnPlanet;
        const unit = await db.createUnit(
          sessionId, 'starfighter', 'empire:crassus',
          spawnPlanet, 'orbit',
          CONFIG.UNIT_TYPES.starfighter.strength,
          CONFIG.UNIT_TYPES.starfighter.hp,
          false, 1, 0, 'Emergency Fighter Squadron'
        );
        newUnits.push(unit);
        const intensity = alertValue >= 4 ? '🚨 IMMEDIATE THREAT' : '⚠️ EMERGENCY RESPONSE';
        feedEntries.push({ gov:'empire', text:`[${ALERT_NAMES[alertValue]}] ${intensity}: Fighter squadron spawned at ${spawnPlanetName}` });
      }
    }
  }

  // Update Vektis depth
  newGovState.vektis = newGovState.vektis || {};
  newGovState.vektis.analysisDepth = Math.min((newGovState.vektis.analysisDepth||0)+1, 10);
  vektisMemory.roundsSinceConfirm = leaks.some(l=>l.severity==='CERTAIN'||l.severity==='HIGH')
    ? 0 : (vektisMemory.roundsSinceConfirm||0)+1;

  // Reset per-turn rebel actions, grant base credits, handle detention
  const rebelStates = await db.getAllRebelStates(sessionId);
  await Promise.all(rebelStates.map(async (rs) => {
    // Decrement detention turns and increase detection while detained
    if (rs.is_detained && rs.detention_turns > 0) {
      await db.decrementDetentionTurns(sessionId, rs.player_id);
      // Increase detection by 5 while detained
      await db.updateRebelStateSuspicion(sessionId, rs.player_id, 5);
      feedEntries.push({ gov:'system', text:`${rs.player_id} remains under arrest.` });
    }

    // Reset actions and grant credits
    return db.upsertRebelState(sessionId, rs.player_id, rs.current_planet, 0,
      (rs.credits||0) + 2); // +2 base credits per round
  }));

  // Recompute global meters from final planet state
  const { empireLevel, rebellionStrength } = computeGlobalMeters(newPlanets);

  // Persist
  const updatedSession = await db.updateSession(sessionId, {
    round:           session.round + 1,
    phase:           'rebel',
    planet_state:    newPlanets,
    governor_state:  newGovState,
    vektis_memory:   vektisMemory,
    watched_lanes:   newWatched,
    locked_lanes:    newLocked,
    alert_value:     alertValue,
    alert_level:     ALERT_LEVELS[alertValue],
    submitted_players: [],
    rebellion_strength: rebellionStrength,
    empire_level: empireLevel,
  });

  const players = await db.getAllRebelStates(sessionId);
  const outcome = checkOutcome(updatedSession, players);
  if (outcome) {
    await db.updateSession(sessionId, { status:'complete', winner:outcome });
    updatedSession.status  = 'complete';
    updatedSession.winner  = outcome;
  }

  return { session:updatedSession, feedEntries, leaks, combatLog, newUnits };
}

function checkOutcome(session, players) {
  const planets = session.planet_state;
  const architectPlanets = planets.filter(p => p.controlled_by?.startsWith('empire:'));
  const rebelPlanets = planets.filter(p => p.controlled_by === 'rebel' || p.controlled_by?.startsWith('faction:'));

  // Rebels win: no architect planets remain
  if (architectPlanets.length === 0 && planets.some(p => p.controlled_by === 'rebel' || p.controlled_by?.startsWith('faction:'))) {
    return 'rebels';
  }

  // Governors win: all rebel players are eliminated
  const allPlayersEliminated = players.every(p => p.is_eliminated);
  if (allPlayersEliminated) {
    return 'governors';
  }

  // Rebels win: all governors are dead
  const allGovernorsDead = ['siris','crassus','maren','vektis'].every(g => session.governor_state[g]?.isDead);
  if (allGovernorsDead) {
    return 'rebels';
  }

  return null;
}

function updateVektisMemory(existing, moves) {
  const mem = existing || { visitedPlanets:{}, actionTypes:[], routePatterns:[], roundsSinceConfirm:0 };
  moves.forEach(m => {
    if (m.action_type === 'move') {
      mem.visitedPlanets[m.planet_id] = (mem.visitedPlanets[m.planet_id]||0)+1;
    }
    mem.actionTypes.push({ type:m.action_type, planet:m.planet_id, round:m.round });
  });
  if (mem.actionTypes.length > 40) mem.actionTypes = mem.actionTypes.slice(-40);
  return mem;
}

// ─────────────────────────────────────────────
// State builders
// ─────────────────────────────────────────────
async function buildPublicState(session, players) {
  const units    = await buildPublicUnitState(session.id);
  const queue    = await db.getProductionQueue(session.id);
  const factions = await db.getFactions(session.id);  // is_traitor already stripped
  const factionMap = Object.fromEntries(
    factions.map(f => [f.id, { name: f.name, ideology: f.ideology }])
  );

  // Get all fleets (public view of all fleets)
  let fleets = [];
  try {
    fleets = await db.getFleets(session.id);
  } catch (err) {
    // Table may not exist yet
  }

  return {
    sessionId:         session.id,
    code:              session.code,
    status:            session.status,
    round:             session.round,
    phase:             session.phase,
    alertLevel:        session.alert_level,
    alertValue:        session.alert_value,
    rebellionStrength: session.rebellion_strength,
    empireLevel:  session.empire_level,
    planetState:       session.planet_state,
    governorState:     session.governor_state,
    lanes:             LANES,
    watchedLanes:      session.watched_lanes,
    lockedLanes:       session.locked_lanes,
    submittedPlayers:  session.submitted_players,
    units,
    fleets,
    factionMap,
    productionQueue:   queue.filter(q=>q.owner.startsWith('empire')), // only architect queue public
    winner:            session.winner,
    players: players.map(p=>({
      id: p.id, displayName:p.display_name, color:p.color, connected:p.connected,
    })),
  };
}

async function buildPrivateState(sessionId, playerId) {
  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return null;

  const sealedMoves = await db.getPlayerSealedMoves(sessionId, playerId);
  const myUnits     = await buildPublicUnitState(sessionId, playerId);
  const myQueue     = (await db.getProductionQueue(sessionId)).filter(q=>q.owner===`rebel:${playerId}`);
  const factions    = await buildClientFactionState(sessionId, playerId);

  // Get player's own fleets
  let myFleets = [];
  try {
    myFleets = await db.getFleets(sessionId, `rebel:${playerId}`);
  } catch (err) {
    // Table may not exist yet
  }

  // Get discovered fleets (gracefully handle if table doesn't exist yet)
  let discoveredFleets = [];
  try {
    discoveredFleets = await db.getDiscoveredFleets(sessionId, playerId);
  } catch (err) {
    // Table may not exist yet — that's ok
  }

  // Get force user data
  let forceUser = await db.getForceUser(sessionId, playerId);
  if (!forceUser) {
    forceUser = await db.getOrCreateForceUser(sessionId, playerId, CONFIG.FORCE.BASE_STRENGTH, 0);
  }

  const alignment    = forceUser?.alignment || 0;
  const forcePoints  = forceUser?.force_points || 0;
  const forceTier    = forceUser?.force_tier || 1;
  const forceSide    = alignment > CONFIG.FORCE.ALIGNMENT_THRESHOLD  ? 'light'
                     : alignment < -CONFIG.FORCE.ALIGNMENT_THRESHOLD ? 'dark'
                     : 'grey';

  // Calculate cell bonus actions
  let cellBonusActions = 0;
  const currentSector = getPlanetSector(rebelState.current_planet);
  if (currentSector) {
    const cells = await db.getFactionCells(sessionId);
    cellBonusActions = cells.filter(c => {
      const cellSector = getPlanetSector(c.planet_id);
      return cellSector === currentSector;
    }).length;
  }

  return {
    currentPlanet:     rebelState.current_planet,
    startingPlanet:    rebelState.starting_planet,
    actionsUsed:       rebelState.actions_used,
    actionsRemaining:  CONFIG.ACTIONS_PER_TURN - rebelState.actions_used + cellBonusActions,
    cellBonusActions,
    credits:           rebelState.credits || 0,
    suspicion:         rebelState.suspicion || 0,
    forceAlignment:    alignment,
    forcePoints,
    forceTier,
    forceSide,
    sealedLog: sealedMoves.map(m=>({
      round:  m.round,
      type:   m.action_type,
      planet: m.planet_id,
      covert: m.covert,
      label:  m.label,
    })),
    myUnits:           myUnits.filter(u=>u.owner===`rebel:${playerId}`),
    myProductionQueue: myQueue,
    myFleets,
    factions,
    alliances:         await buildAllianceState(sessionId, playerId),
    discoveredFleets,
  };
}

async function handleGovernorDeath(sessionId, governorName) {
  const session = await db.getSessionById(sessionId);
  const govState = JSON.parse(JSON.stringify(session.governor_state));
  const planets = JSON.parse(JSON.stringify(session.planet_state));

  govState[governorName] = govState[governorName] || {};
  govState[governorName].isDead = true;

  const deadGovPlanets = planets.filter(p => p.controlled_by === `empire:${governorName}`);
  const survivingGovs = ['siris','crassus','maren','vektis'].filter(g => !govState[g]?.isDead);

  if (deadGovPlanets.length > 0 && survivingGovs.length > 0) {
    let govIndex = 0;
    deadGovPlanets.forEach(planet => {
      const recipient = survivingGovs[govIndex % survivingGovs.length];
      planet.controlled_by = `empire:${recipient}`;
      govIndex++;
    });
  }

  await db.updateSession(sessionId, { governor_state: govState, planet_state: planets });
}

async function handleEmperorDeath(sessionId, feedEntries) {
  const session = await db.getSessionById(sessionId);
  const govState = JSON.parse(JSON.stringify(session.governor_state));
  const planets = JSON.parse(JSON.stringify(session.planet_state));

  for (const gov of ['siris','crassus','maren','vektis']) {
    if (govState[gov]) {
      govState[gov].productionPool = Math.floor((govState[gov].productionPool || 0) / 2);
    }
  }

  govState.quorumDisabled = true;

  planets.forEach(p => {
    p.loyalty = Math.max(0, p.loyalty - 20);
  });

  feedEntries.push({ gov:'system', text:'THE EMPEROR HAS FALLEN. The Empire fractures. Resistance spreads across the sector.' });

  const { empireLevel, rebellionStrength } = computeGlobalMeters(planets);

  await db.updateSession(sessionId, {
    governor_state: govState,
    planet_state: planets,
    empire_level: empireLevel,
    rebellion_strength: rebellionStrength,
  });
}

module.exports = { applyRebelAction, processGovernorTurn, buildPublicState, buildPrivateState, checkOutcome, handleGovernorDeath, handleEmperorDeath };
