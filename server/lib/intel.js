const db = require('./db');
const { BASE_WATCHED_LANES, getNeighbors, reachableIn } = require('./world');
const CONFIG = require('./config');
const { getGovernorStatement } = require('./governor_statements');

// ─────────────────────────────────────────────
// Process all sealed moves into observable intel leaks
// CRITICAL: never expose true rebel positions — only derive leaks from observable events
// ─────────────────────────────────────────────
async function processMovesIntoLeaks(sessionId, round, moves, session) {
  const leaks = [];
  const governorState = session.governor_state;
  const watchedLanes = session.watched_lanes || BASE_WATCHED_LANES;
  const marenInformers = governorState.maren?.informerNetworks || ['p04','p13'];

  for (const move of moves) {
    const { player_id, action_type, planet_id, target_id, covert, metadata } = move;
    const meta = typeof metadata === 'string' ? JSON.parse(metadata||'{}') : (metadata||{});

    // ── Movement ──────────────────────────────
    if (action_type === 'move') {
      // Find previous position from earlier moves this round or prior round
      const prevMoves = await db.getSealedMovesForRound(sessionId, round - 1);
      const prevPlanet = prevMoves.find(m => m.player_id === player_id)?.planet_id;

      if (prevPlanet) {
        const laneWatched = watchedLanes.some(
          ([a,b]) => (a===prevPlanet&&b===planet_id)||(b===prevPlanet&&a===planet_id)
        );
        const informerDetect = marenInformers.includes(planet_id) && Math.random() < 0.4;
        const randomLeak = Math.random() < 0.12;

        if (laneWatched) {
          leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
            'movement', `Hyperlane transit intercepted — arrival at ${planet_id}`, 'HIGH', player_id));
        } else if (informerDetect) {
          leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
            'informer', `Maren informer: unregistered vessel near ${planet_id}`, 'MEDIUM', player_id));
        } else if (randomLeak) {
          leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
            'movement', `Anomalous energy reading near ${planet_id}`, 'LOW', null));
        }
      }
    }

    // ── Overt actions — always leak ───────────
    if (action_type === 'sabotage' || action_type === 'incite') {
      leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
        'overt', `Confirmed ${action_type} at ${planet_id} — rebel presence certain`,
        'CERTAIN', player_id));
    }

    // ── Covert recruitment — partial leak ─────
    if (action_type === 'recruit') {
      const informerDetect = marenInformers.includes(planet_id) && Math.random() < 0.5;
      const randomDetect   = Math.random() < 0.15;
      if (informerDetect || randomDetect) {
        leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
          'informer', `Seditious gatherings reported near ${planet_id}`, 'MEDIUM', null));
      }
    }

    // ── Traitor faction exposure — full reveal ─
    if (action_type === 'contribute' && meta.faction_is_traitor) {
      leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
        'traitor_exposure',
        `Intelligence asset triggered — rebel operative confirmed at ${planet_id}`,
        'CERTAIN', player_id));
    }

    // ── Unit combat — always leaks ────────────
    if (action_type === 'unit_attack') {
      leaks.push(await db.insertIntelLeak(sessionId, round, target_id || planet_id,
        'combat', `Combat engagement at ${target_id || planet_id} — rebel units confirmed`,
        'CERTAIN', player_id));
    }

    // ── Unit movement on watched lanes ────────
    if (action_type === 'unit_move' && target_id) {
      const laneWatched = watchedLanes.some(
        ([a,b]) => (a===planet_id&&b===target_id)||(b===planet_id&&a===target_id)
      );
      if (laneWatched) {
        leaks.push(await db.insertIntelLeak(sessionId, round, target_id,
          'unit_sighting', `Unidentified vessels transiting watched lane to ${target_id}`, 'MEDIUM', null));
      }
    }

    // ── Denounce — overt and public ───────────
    if (action_type === 'denounce') {
      leaks.push(await db.insertIntelLeak(sessionId, round, planet_id,
        'overt', `Public denunciation event at ${planet_id}`, 'LOW', null));
    }
  }

  return leaks;
}

// ─────────────────────────────────────────────
// Update Siris-Vael's probabilistic model from leaks
// ─────────────────────────────────────────────
function updateSirisModel(governorState, leaks, round) {
  const siris = { ...governorState.siris };

  // Sort leaks by severity
  const certainLeaks = leaks.filter(l => l.severity === 'CERTAIN');
  const highLeaks    = leaks.filter(l => l.severity === 'HIGH');
  const medLeaks     = leaks.filter(l => l.severity === 'MEDIUM');

  if (certainLeaks.length > 0) {
    const latest = certainLeaks[certainLeaks.length - 1];
    siris.lastConfirmedPlanet = latest.planet_id;
    siris.lastConfirmedRound  = round;
    siris.confidence = 'CERTAIN';
    siris.suspectPlanets = [latest.planet_id, ...getNeighbors(latest.planet_id)];
  } else if (highLeaks.length > 0) {
    const latest = highLeaks[highLeaks.length - 1];
    siris.lastConfirmedPlanet = latest.planet_id;
    siris.lastConfirmedRound  = round;
    siris.confidence = 'HIGH';
    siris.suspectPlanets = [latest.planet_id, ...getNeighbors(latest.planet_id)];
  } else if (medLeaks.length > 0) {
    const latest = medLeaks[medLeaks.length - 1];
    siris.confidence = 'MEDIUM';
    // Expand suspect zone around medium-confidence leak
    siris.suspectPlanets = [...new Set([
      ...siris.suspectPlanets,
      latest.planet_id,
      ...getNeighbors(latest.planet_id),
    ])];
  } else {
    // No new intel — expand search based on rounds since confirmation
    const age = round - siris.lastConfirmedRound;
    siris.suspectPlanets = reachableIn(siris.lastConfirmedPlanet, Math.min(age + 1, 3));
    if (age >= 3) siris.confidence = 'LOW';
    else if (age >= 2 && siris.confidence === 'CERTAIN') siris.confidence = 'HIGH';
    else if (age >= 1 && siris.confidence === 'HIGH')    siris.confidence = 'MEDIUM';
  }

  return siris;
}

// ─────────────────────────────────────────────
// Apply governor action results back to game state
// ─────────────────────────────────────────────
async function applyGovernorActionResults(sessionId, round, govResults) {
  const session = await db.getSessionById(sessionId);
  const newPlanets  = JSON.parse(JSON.stringify(session.planet_state));
  const newGovState = JSON.parse(JSON.stringify(session.governor_state));
  const newWatched  = [...(session.watched_lanes || [])];
  const newLocked   = [...(session.locked_lanes  || [])];
  const feedEntries = [];

  for (const { governor, actions } of govResults) {
    // Only show broadcasts for accomplished actions, not every turn
    for (const action of (actions || [])) {
      await applyGovernorAction(
        sessionId, round, governor, action,
        newPlanets, newGovState, newWatched, newLocked, feedEntries
      );
    }
  }

  // Decay: old lockdowns expire occasionally
  if (newLocked.length > 0 && Math.random() < 0.35) newLocked.pop();

  // Suspicion decay on unpatrolled, unswept planets
  newPlanets.forEach(p => {
    const patrolled = newGovState.siris?.patrolTokens?.[p.id];
    const swept     = newGovState.crassus?.sweepTargets?.includes(p.id);
    if (!patrolled && !swept && p.suspicion > 0 && Math.random() < 0.25) {
      p.suspicion = Math.max(p.suspicion - 1, 0);
    }
  });

  return { newPlanets, newGovState, newWatched, newLocked, feedEntries };
}

async function applyGovernorAction(sessionId, round, governor, action, planets, govState, watched, locked, feed) {
  const { type, target, target2, unit_type, amount } = action;

  switch (type) {
    case 'deployPatrol': {
      const p = planets.find(x => x.name === target || x.id === target);
      if (p) {
        govState.siris.patrolTokens = govState.siris.patrolTokens || {};
        govState.siris.patrolTokens[p.id] = true;
        p.suspicion = Math.min(p.suspicion + 1, 4);
        const stmt = getGovernorStatement('siris', 'patrol');
        if (stmt) feed.push({ gov: 'siris', text: stmt });
      }
      break;
    }
    case 'withdrawPatrol': {
      const p = planets.find(x => x.name === target || x.id === target);
      if (p && govState.siris?.patrolTokens) delete govState.siris.patrolTokens[p.id];
      break;
    }
    case 'sweep': {
      const p = planets.find(x => x.name === target || x.id === target);
      if (p) {
        govState.crassus.sweepTargets = govState.crassus.sweepTargets || [];
        govState.crassus.sweepTargets.push(p.id);
        p.suspicion = Math.min(p.suspicion + 1, 4);
        const stmt = getGovernorStatement('crassus', 'sweep');
        if (stmt) feed.push({ gov: 'crassus', text: stmt });
      }
      break;
    }
    case 'lockLane': {
      const pa = planets.find(x => x.name === target  || x.id === target);
      const pb = planets.find(x => x.name === target2 || x.id === target2);
      if (pa && pb) {
        const already = locked.some(([a,b])=>(a===pa.id&&b===pb.id)||(a===pb.id&&b===pa.id));
        if (!already) {
          locked.push([pa.id, pb.id]);
          const stmt = getGovernorStatement('vektis', 'scan');
          if (stmt) feed.push({ gov: 'vektis', text: stmt });
        }
      }
      break;
    }
    case 'propaganda': {
      const p = planets.find(x => x.name === target || x.id === target);
      if (p) {
        p.loyalty = Math.min(p.loyalty + 5, 100);
        const stmt = getGovernorStatement('maren', 'propaganda');
        if (stmt) feed.push({ gov: 'maren', text: stmt });
        // Loyalty hits 100 → architect claims planet
        if (p.loyalty === 100 && !p.controlled_by.startsWith('empire:')) {
          p.controlled_by = `empire:${governor}`;
          p.loyalty = CONFIG.LOYALTY_RESET.architect;
        }
      }
      break;
    }
    case 'placeInformer': {
      const p = planets.find(x => x.name === target || x.id === target);
      if (p && govState.maren) {
        govState.maren.informerNetworks = govState.maren.informerNetworks || [];
        if (!govState.maren.informerNetworks.includes(p.id)) {
          govState.maren.informerNetworks.push(p.id);
          const stmt = getGovernorStatement('maren', 'blackmail');
          if (stmt) feed.push({ gov: 'maren', text: stmt });
        }
      }
      break;
    }
    case 'produceUnit': {
      const p = planets.find(x => x.name === target || x.id === target);
      const cfg = CONFIG.UNIT_TYPES[unit_type];
      // Skip production if planet is sabotaged (production_blocked_until > current round)
      const isBlocked = p && p.production_blocked_until && p.production_blocked_until > round;
      if (p && cfg && !isBlocked) {
        const pool = `${governor}ProductionPool` in govState[governor]
          ? govState[governor].productionPool
          : 0;
        if (pool >= cfg.cost) {
          govState[governor].productionPool -= cfg.cost;
          await db.addToProductionQueue(sessionId, p.id, unit_type,
            `empire:${governor}`, cfg.buildTime);
        }
      }
      break;
    }
    case 'moveUnit': {
      // Governor moves one of their existing units
      const units = await db.getUnits(sessionId);
      const unit = units.find(u => u.owner === `empire:${governor}` && u.planet_id === (planets.find(x=>x.name===target||x.id===target)?.id));
      if (unit && target2) {
        const dest = planets.find(x=>x.name===target2||x.id===target2);
        if (dest) await db.updateUnit(unit.id, { planet_id: dest.id });
      }
      break;
    }
    case 'transferUnits': {
      // Transfer production points between governors (coordination action)
      const fromGov = governor;
      const toGov   = target;
      const pts     = parseInt(amount) || 1;
      if (govState[fromGov] && govState[toGov]) {
        const available = govState[fromGov].productionPool || 0;
        const transfer  = Math.min(pts, available);
        govState[fromGov].productionPool -= transfer;
        govState[toGov].productionPool    = (govState[toGov].productionPool || 0) + transfer;
      }
      break;
    }
  }
}

module.exports = { processMovesIntoLeaks, updateSirisModel, applyGovernorActionResults };
