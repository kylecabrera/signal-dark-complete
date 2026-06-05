const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', err => console.error('DB client error', err));

// ── Sessions ────────────────────────────────
async function createSession(code, planetState, governorState, vektisMemory) {
  const { rows } = await pool.query(
    `INSERT INTO game_sessions (code,planet_state,governor_state,vektis_memory,watched_lanes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [code, JSON.stringify(planetState), JSON.stringify(governorState),
     JSON.stringify(vektisMemory), JSON.stringify([['p03','p09'],['p05','p08'],['p09','p13']])]
  );
  return rows[0];
}
async function getSessionByCode(code) {
  const { rows } = await pool.query('SELECT * FROM game_sessions WHERE code=$1',[code.toUpperCase()]);
  return rows[0]||null;
}
async function getSessionById(id) {
  const { rows } = await pool.query('SELECT * FROM game_sessions WHERE id=$1',[id]);
  return rows[0]||null;
}
async function updateSession(id, fields) {
  // Map empire_level to suppression_level for database compatibility
  const mappedFields = { ...fields };
  if (mappedFields.empire_level !== undefined) {
    mappedFields.suppression_level = mappedFields.empire_level;
    delete mappedFields.empire_level;
  }
  const keys=Object.keys(mappedFields);
  const vals=Object.values(mappedFields).map(v=>typeof v==='object'?JSON.stringify(v):v);
  const set=keys.map((k,i)=>`${k}=$${i+2}`).join(',');
  const { rows } = await pool.query(`UPDATE game_sessions SET ${set} WHERE id=$1 RETURNING *`,[id,...vals]);
  // Map suppression_level back to empire_level for consistency
  if (rows[0]) {
    rows[0].empire_level = rows[0].suppression_level;
  }
  return rows[0];
}

// ── Players ─────────────────────────────────
async function createPlayer(sessionId, displayName, color) {
  const { rows } = await pool.query(
    `INSERT INTO players (session_id,display_name,color,connected) VALUES ($1,$2,$3,true) RETURNING *`,
    [sessionId, displayName, color]
  );
  return rows[0];
}
async function getPlayers(sessionId) {
  const { rows } = await pool.query('SELECT * FROM players WHERE session_id=$1 ORDER BY created_at',[sessionId]);
  return rows;
}
async function eliminatePlayer(playerId) {
  const { rows } = await pool.query(
    'UPDATE players SET is_eliminated=true WHERE id=$1 RETURNING *',
    [playerId]
  );
  return rows[0];
}
async function updatePlayerSocket(playerId, socketId, connected=true) {
  await pool.query('UPDATE players SET socket_id=$1,connected=$2 WHERE id=$3',[socketId,connected,playerId]);
}
async function getPlayerBySocket(socketId) {
  const { rows } = await pool.query('SELECT * FROM players WHERE socket_id=$1',[socketId]);
  return rows[0]||null;
}

// ── Rebel state ──────────────────────────────
async function upsertRebelState(sessionId, playerId, currentPlanet, actionsUsed, credits, forceOpts={}) {
  const { alignment, strength, startingPlanet } = forceOpts;
  const { rows } = await pool.query(
    `INSERT INTO rebel_state
       (session_id,player_id,current_planet,actions_used,credits,force_alignment,force_strength,starting_planet)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6::int,0),COALESCE($7::int,0),$8)
     ON CONFLICT (session_id,player_id) DO UPDATE SET
       current_planet=$3, actions_used=$4, credits=$5,
       force_alignment = COALESCE($6::int, rebel_state.force_alignment, 0),
       force_strength  = COALESCE($7::int, rebel_state.force_strength, 0),
       starting_planet = CASE WHEN $8::text IS NOT NULL THEN $8::text ELSE rebel_state.starting_planet END
     RETURNING *`,
    [sessionId, playerId, currentPlanet, actionsUsed, credits ?? 5,
     alignment, strength, startingPlanet ?? null]
  );
  return rows[0];
}
async function getRebelState(sessionId, playerId) {
  const { rows } = await pool.query(
    'SELECT * FROM rebel_state WHERE session_id=$1 AND player_id=$2',[sessionId,playerId]);
  return rows[0]||null;
}
async function getAllRebelStates(sessionId) {
  const { rows } = await pool.query('SELECT * FROM rebel_state WHERE session_id=$1',[sessionId]);
  return rows;
}

// ── Sealed moves ─────────────────────────────
async function insertSealedMove(sessionId, playerId, round, actionType, planetId, covert, label, metadata={}, targetId=null) {
  const { rows } = await pool.query(
    `INSERT INTO sealed_moves (session_id,player_id,round,action_type,planet_id,target_id,covert,label,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [sessionId, playerId, round, actionType, planetId, targetId, covert, label, JSON.stringify(metadata)]
  );
  return rows[0];
}
async function getSealedMovesForRound(sessionId, round) {
  const { rows } = await pool.query(
    'SELECT * FROM sealed_moves WHERE session_id=$1 AND round=$2 ORDER BY created_at',[sessionId,round]);
  return rows;
}
async function getPlayerSealedMoves(sessionId, playerId) {
  const { rows } = await pool.query(
    'SELECT * FROM sealed_moves WHERE session_id=$1 AND player_id=$2 ORDER BY round,created_at',[sessionId,playerId]);
  return rows;
}

// ── Intel leaks ──────────────────────────────
async function insertIntelLeak(sessionId, round, planetId, leakType, text, severity='LOW', playerId=null) {
  const { rows } = await pool.query(
    `INSERT INTO intel_leaks (session_id,round,planet_id,leak_type,text,severity,player_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [sessionId, round, planetId||null, leakType, text, severity, playerId||null]
  );
  return rows[0];
}
async function getRecentLeaks(sessionId, limit=10) {
  const { rows } = await pool.query(
    `SELECT * FROM intel_leaks WHERE session_id=$1 ORDER BY created_at DESC LIMIT $2`,[sessionId,limit]);
  return rows.reverse();
}

// ── Governor memory ───────────────────────────
async function saveGovernorMemory(sessionId, governor, round, brief, response) {
  await pool.query(
    `INSERT INTO governor_memory (session_id,governor,round,brief,response)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (session_id,governor,round) DO UPDATE SET brief=$4,response=$5`,
    [sessionId, governor, round, brief, JSON.stringify(response)]
  );
}
async function getGovernorHistory(sessionId, governor, limit=5) {
  const { rows } = await pool.query(
    `SELECT * FROM governor_memory WHERE session_id=$1 AND governor=$2 ORDER BY round DESC LIMIT $3`,
    [sessionId, governor, limit]
  );
  return rows.reverse();
}

// ── Units ─────────────────────────────────────
async function createUnit(sessionId, unitType, owner, planetId, layer, strength, hp, isHidden=false, jumpDistance=1, transportCapacity=0, designation=null) {
  const { rows } = await pool.query(
    `INSERT INTO units (session_id,unit_type,owner,planet_id,layer,strength,hp,is_hidden,jump_distance,transport_capacity,designation)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [sessionId, unitType, owner, planetId, layer, strength, hp, isHidden, jumpDistance, transportCapacity, designation]
  );
  return rows[0];
}
async function escortOrbitalUnits(sessionId, playerId, planetId) {
  await pool.query(
    `UPDATE units SET planet_id=$1, updated_at=NOW()
     WHERE session_id=$2 AND owner=$3 AND layer='orbit'`,
    [planetId, sessionId, `rebel:${playerId}`]
  );
}
async function getUnits(sessionId) {
  const { rows } = await pool.query(
    'SELECT * FROM units WHERE session_id=$1 ORDER BY planet_id,layer',[sessionId]);
  return rows;
}
async function getUnitsAtPlanet(sessionId, planetId, layer=null) {
  const q = layer
    ? 'SELECT * FROM units WHERE session_id=$1 AND planet_id=$2 AND layer=$3'
    : 'SELECT * FROM units WHERE session_id=$1 AND planet_id=$2';
  const params = layer ? [sessionId,planetId,layer] : [sessionId,planetId];
  const { rows } = await pool.query(q, params);
  return rows;
}
async function updateUnit(unitId, fields) {
  const keys=Object.keys(fields);
  const vals=Object.values(fields);
  const set=keys.map((k,i)=>`${k}=$${i+2}`).join(',');
  const { rows } = await pool.query(`UPDATE units SET ${set} WHERE id=$1 RETURNING *`,[unitId,...vals]);
  return rows[0];
}
async function deleteUnit(unitId) {
  await pool.query('DELETE FROM units WHERE id=$1',[unitId]);
}
async function toggleUnitHidden(unitId) {
  const { rows } = await pool.query(
    'UPDATE units SET is_hidden = NOT is_hidden WHERE id=$1 RETURNING *',
    [unitId]
  );
  return rows[0];
}
async function loadUnitIntoTransport(unitId, transportId) {
  const { rows } = await pool.query(
    'UPDATE units SET transported_by=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
    [transportId, unitId]
  );
  return rows[0];
}
async function unloadUnitFromTransport(unitId) {
  const { rows } = await pool.query(
    'UPDATE units SET transported_by=NULL, updated_at=NOW() WHERE id=$1 RETURNING *',
    [unitId]
  );
  return rows[0];
}
async function recordCombatEvent(sessionId, round, planetId, description, isNearby=false) {
  const { rows } = await pool.query(
    `INSERT INTO combat_feed (session_id,round,planet_id,description,is_nearby)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [sessionId, round, planetId, description, isNearby]
  );
  return rows[0];
}
async function getCombatFeed(sessionId, round=null) {
  const q = round
    ? 'SELECT * FROM combat_feed WHERE session_id=$1 AND round=$2 ORDER BY created_at DESC'
    : 'SELECT * FROM combat_feed WHERE session_id=$1 ORDER BY round DESC, created_at DESC LIMIT 50';
  const params = round ? [sessionId, round] : [sessionId];
  const { rows } = await pool.query(q, params);
  return rows;
}
async function createUnitsFromConfig(sessionId, unitList) {
  const CONFIG = require('./config');
  for (const u of unitList) {
    const typeCfg = CONFIG.UNIT_TYPES[u.unit_type] || {};
    await createUnit(
      sessionId, u.unit_type, u.owner, u.planet_id, u.layer, u.strength, u.hp, false,
      u.jump_distance       ?? typeCfg.jumpDistance       ?? 1,
      u.transport_capacity  ?? typeCfg.transportCapacity  ?? 0,
      u.designation         ?? typeCfg.designation        ?? u.unit_type,
    );
  }
}

// ── Fleets ────────────────────────────────────
async function createFleet(sessionId, owner, name, planetId, layer, autoGrouped=false, createdRound=null) {
  const { rows } = await pool.query(
    `INSERT INTO fleets (session_id, owner, name, planet_id, layer, auto_grouped, created_round)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [sessionId, owner, name, planetId, layer, autoGrouped, createdRound]
  );
  return rows[0];
}

async function getFleet(fleetId) {
  const { rows } = await pool.query(
    'SELECT * FROM fleets WHERE id=$1',
    [fleetId]
  );
  return rows[0] || null;
}

async function getFleets(sessionId, owner=null) {
  let query = 'SELECT * FROM fleets WHERE session_id=$1';
  const params = [sessionId];
  if (owner) {
    query += ' AND owner=$2';
    params.push(owner);
  }
  const { rows } = await pool.query(query, params);
  return rows;
}

async function getFleetsByLocation(sessionId, planetId, layer) {
  const { rows } = await pool.query(
    'SELECT * FROM fleets WHERE session_id=$1 AND planet_id=$2 AND layer=$3',
    [sessionId, planetId, layer]
  );
  return rows;
}

async function updateFleet(fleetId, updates) {
  const fields = Object.keys(updates).map((k, i) => `${k}=$${i+2}`).join(', ');
  const values = [fleetId, ...Object.values(updates)];
  const { rows } = await pool.query(
    `UPDATE fleets SET ${fields}, updated_at=NOW() WHERE id=$1 RETURNING *`,
    values
  );
  return rows[0];
}

async function deleteFleet(fleetId) {
  await pool.query('DELETE FROM fleets WHERE id=$1', [fleetId]);
}

async function getUnitsByFleet(fleetId) {
  const { rows } = await pool.query(
    'SELECT * FROM units WHERE fleet_id=$1',
    [fleetId]
  );
  return rows;
}

async function assignUnitsToFleet(unitIds, fleetId) {
  if (unitIds.length === 0) return;
  const placeholders = unitIds.map((_, i) => `$${i+1}`).join(',');
  await pool.query(
    `UPDATE units SET fleet_id=$${unitIds.length + 1}, updated_at=NOW()
     WHERE id IN (${placeholders})`,
    [...unitIds, fleetId]
  );
}

// ── Production queue ──────────────────────────
async function addToProductionQueue(sessionId, planetId, unitType, owner, roundsRemaining) {
  const { rows } = await pool.query(
    `INSERT INTO production_queue (session_id,planet_id,unit_type,owner,rounds_remaining)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [sessionId, planetId, unitType, owner, roundsRemaining]
  );
  return rows[0];
}
async function getProductionQueue(sessionId) {
  const { rows } = await pool.query(
    'SELECT * FROM production_queue WHERE session_id=$1 ORDER BY planet_id,created_at',[sessionId]);
  return rows;
}
async function tickProductionQueue(sessionId) {
  // Decrement all rounds_remaining by 1, return items that just completed (rounds_remaining was 1)
  const { rows: completed } = await pool.query(
    `UPDATE production_queue SET rounds_remaining=rounds_remaining-1
     WHERE session_id=$1 AND rounds_remaining=1 RETURNING *`,
    [sessionId]
  );
  await pool.query(
    'DELETE FROM production_queue WHERE session_id=$1 AND rounds_remaining<=0',[sessionId]);
  await pool.query(
    'UPDATE production_queue SET rounds_remaining=rounds_remaining-1 WHERE session_id=$1 AND rounds_remaining>1',
    [sessionId]
  );
  return completed;
}

// ── Combat log ────────────────────────────────
async function insertCombatLog(sessionId, round, planetId, layer, attackerOwner, defenderOwner, attackerLosses, defenderLosses, outcome, summary) {
  const { rows } = await pool.query(
    `INSERT INTO combat_log (session_id,round,planet_id,layer,attacker_owner,defender_owner,attacker_losses,defender_losses,outcome,summary)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [sessionId, round, planetId, layer, attackerOwner, defenderOwner, attackerLosses, defenderLosses, outcome, summary]
  );
  return rows[0];
}
async function getRecentCombat(sessionId, limit=5) {
  const { rows } = await pool.query(
    `SELECT * FROM combat_log WHERE session_id=$1 ORDER BY created_at DESC LIMIT $2`,[sessionId,limit]);
  return rows;
}

// ── Factions ──────────────────────────────────
async function createFaction(sessionId, name, ideology, homePlanet, isTraitor, createdBy) {
  const resourcePool = isTraitor ? 8 : 0;
  const reputation   = isTraitor ? 62 : 50;
  const { rows } = await pool.query(
    `INSERT INTO factions (session_id,name,ideology,home_planet,is_traitor,resource_pool,reputation,created_by,unlocked_ship_classes,allowed_unit_types)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'[]','[]') RETURNING *`,
    [sessionId, name, ideology, homePlanet, isTraitor, resourcePool, reputation, createdBy||null]
  );
  return rows[0];
}
async function getFactions(sessionId, includeTraitorFlag=false) {
  const { rows } = await pool.query(
    'SELECT * FROM factions WHERE session_id=$1 AND is_denounced=false ORDER BY created_at',[sessionId]);
  if (!includeTraitorFlag) rows.forEach(r => delete r.is_traitor);
  return rows;
}
async function getFactionById(factionId, includeTraitorFlag=false) {
  const { rows } = await pool.query('SELECT * FROM factions WHERE id=$1',[factionId]);
  if (!includeTraitorFlag && rows[0]) delete rows[0].is_traitor;
  return rows[0]||null;
}
async function updateFaction(factionId, fields) {
  const keys=Object.keys(fields);
  const vals=Object.values(fields);
  const set=keys.map((k,i)=>`${k}=$${i+2}`).join(',');
  const { rows } = await pool.query(`UPDATE factions SET ${set} WHERE id=$1 RETURNING *`,[factionId,...vals]);
  return rows[0];
}
async function unlockFactionShipClass(factionId, shipClass) {
  await pool.query(
    `UPDATE factions SET unlocked_ship_classes = unlocked_ship_classes || $2::jsonb WHERE id=$1`,
    [factionId, JSON.stringify([shipClass])]
  );
}
async function updateFactionAllowedUnits(factionId, unitTypes) {
  await pool.query(
    `UPDATE factions SET allowed_unit_types = $2::jsonb WHERE id=$1`,
    [factionId, JSON.stringify(unitTypes)]
  );
}

// ── Faction contributions ─────────────────────
async function addContribution(factionId, sessionId, playerId, amount, round, actionType='contribute') {
  const { rows } = await pool.query(
    `INSERT INTO faction_contributions (faction_id,session_id,player_id,amount,round,action_type)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [factionId, sessionId, playerId, amount, round, actionType]
  );
  // Update faction resource pool
  await pool.query('UPDATE factions SET resource_pool=resource_pool+$1 WHERE id=$2',[amount,factionId]);
  return rows[0];
}
async function getContributions(factionId) {
  const { rows } = await pool.query(
    `SELECT player_id, SUM(amount) as total
     FROM faction_contributions WHERE faction_id=$1 GROUP BY player_id ORDER BY total DESC`,
    [factionId]
  );
  return rows;
}
async function getFactionContributors(sessionId, factionId) {
  const { rows } = await pool.query(
    `SELECT player_id, SUM(amount) as total
     FROM faction_contributions WHERE session_id=$1 AND faction_id=$2 GROUP BY player_id`,
    [sessionId, factionId]
  );
  return rows;
}
async function getPlayerContributions(sessionId, playerId) {
  const { rows } = await pool.query(
    `SELECT fc.faction_id, f.name, f.ideology, SUM(fc.amount) as total
     FROM faction_contributions fc
     JOIN factions f ON f.id=fc.faction_id
     WHERE fc.session_id=$1 AND fc.player_id=$2
     GROUP BY fc.faction_id, f.name, f.ideology`,
    [sessionId, playerId]
  );
  return rows;
}

// ── Faction cells ─────────────────────────────
async function upsertFactionCell(factionId, sessionId, planetId, strengthDelta=1) {
  const { rows } = await pool.query(
    `INSERT INTO faction_cells (faction_id,session_id,planet_id,strength)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (faction_id,planet_id)
     DO UPDATE SET strength=LEAST(faction_cells.strength+$4, 5) RETURNING *`,
    [factionId, sessionId, planetId, strengthDelta]
  );
  return rows[0];
}
async function getFactionCellsAtPlanet(sessionId, planetId) {
  const { rows } = await pool.query(
    `SELECT fc.*, f.name as faction_name, f.ideology
     FROM faction_cells fc JOIN factions f ON f.id=fc.faction_id
     WHERE fc.session_id=$1 AND fc.planet_id=$2 ORDER BY fc.strength DESC`,
    [sessionId, planetId]
  );
  return rows;
}
async function getFactionCells(sessionId) {
  const { rows } = await pool.query(
    `SELECT fc.*, f.name as faction_name, f.ideology
     FROM faction_cells fc JOIN factions f ON f.id=fc.faction_id
     WHERE fc.session_id=$1`,
    [sessionId]
  );
  return rows;
}

// ── Investigations ────────────────────────────
async function recordInvestigation(sessionId, playerId, factionId, round, cluesFound) {
  const { rows } = await pool.query(
    `INSERT INTO investigations (session_id,player_id,faction_id,round,clues_found)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT DO NOTHING RETURNING *`,
    [sessionId, playerId, factionId, round, cluesFound]
  );
  return rows[0];
}
async function getPlayerInvestigationTotal(sessionId, playerId, factionId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(clues_found),0) as total
     FROM investigations WHERE session_id=$1 AND player_id=$2 AND faction_id=$3`,
    [sessionId, playerId, factionId]
  );
  return parseInt(rows[0]?.total||0);
}

// ── Faction discoveries ──────────────────────
async function recordFactionDiscovery(sessionId, playerId, factionId, discoveredRound) {
  const { rows } = await pool.query(
    `INSERT INTO faction_discoveries (session_id,player_id,faction_id,discovered_round)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (session_id,player_id,faction_id) DO NOTHING
     RETURNING *`,
    [sessionId, playerId, factionId, discoveredRound]
  );
  return rows[0];
}

async function getDiscoveredFactions(sessionId, playerId) {
  const { rows } = await pool.query(
    'SELECT faction_id FROM faction_discoveries WHERE session_id=$1 AND player_id=$2',
    [sessionId, playerId]
  );
  return rows.map(r => r.faction_id);
}

// ── Force Users ──────────────────────────────
async function getOrCreateForceUser(sessionId, playerId, forceStrength, alignment) {
  const { rows } = await pool.query(
    `INSERT INTO force_users (session_id, player_id, force_points, alignment, force_tier)
     VALUES ($1, $2, 0, $3, 1)
     ON CONFLICT (session_id, player_id) DO NOTHING
     RETURNING *`,
    [sessionId, playerId, alignment]
  );
  if (rows.length > 0) return rows[0];

  const { rows: existing } = await pool.query(
    'SELECT * FROM force_users WHERE session_id=$1 AND player_id=$2',
    [sessionId, playerId]
  );
  return existing[0] || null;
}
async function getForceUser(sessionId, playerId) {
  const { rows } = await pool.query(
    'SELECT * FROM force_users WHERE session_id=$1 AND player_id=$2',
    [sessionId, playerId]
  );
  return rows[0] || null;
}
async function addForcePoints(forceUserId, points) {
  const { rows } = await pool.query(
    `UPDATE force_users SET force_points = force_points + $1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [points, forceUserId]
  );
  return rows[0];
}
async function updateForceTier(forceUserId, tier) {
  const { rows } = await pool.query(
    `UPDATE force_users SET force_tier = $1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [tier, forceUserId]
  );
  return rows[0];
}
async function updateForceAlignment(forceUserId, alignment) {
  const clamped = Math.max(-100, Math.min(100, alignment));
  const { rows } = await pool.query(
    `UPDATE force_users SET alignment = $1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [clamped, forceUserId]
  );
  return rows[0];
}
async function recordForcePowerUse(sessionId, forceUserId, powerName, round, duration) {
  const { rows } = await pool.query(
    `INSERT INTO force_power_uses (session_id, force_user_id, power_name, round_used, duration)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [sessionId, forceUserId, powerName, round, duration]
  );
  return rows[0];
}
async function getActiveForcePowers(sessionId, forceUserId, round) {
  const { rows } = await pool.query(
    `SELECT * FROM force_power_uses
     WHERE session_id=$1 AND force_user_id=$2 AND round_used + duration > $3`,
    [sessionId, forceUserId, round]
  );
  return rows;
}
async function createForceApprentice(sessionId, masterId, masterPlayerId) {
  const { rows } = await pool.query(
    `INSERT INTO force_users (session_id, player_id, force_tier, force_points, alignment, master_id)
     VALUES ($1, NULL, 1, 0, 0, $2) RETURNING *`,
    [sessionId, masterId]
  );
  return rows[0];
}
async function linkApprenticeToMaster(apprenticeId, masterId) {
  const { rows } = await pool.query(
    `UPDATE force_users SET master_id=$1, updated_at=NOW()
     WHERE id=$2 RETURNING *`,
    [masterId, apprenticeId]
  );
  return rows[0];
}

// ── Discovered Fleets ────────────────────────
async function recordFleetDiscovery(sessionId, playerId, fleetOwner, planetId, round, unitCount, strongestUnit) {
  const { rows } = await pool.query(
    `INSERT INTO discovered_fleets (session_id, player_id, fleet_owner, planet_id, round_discovered, unit_count, strongest_unit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (session_id, player_id, fleet_owner, planet_id) DO UPDATE
     SET round_discovered = $5, unit_count = $6, strongest_unit = $7
     RETURNING *`,
    [sessionId, playerId, fleetOwner, planetId, round, unitCount, strongestUnit]
  );
  return rows[0];
}

async function getDiscoveredFleets(sessionId, playerId) {
  const { rows } = await pool.query(
    `SELECT * FROM discovered_fleets
     WHERE session_id=$1 AND player_id=$2
     ORDER BY round_discovered DESC`,
    [sessionId, playerId]
  );
  return rows;
}

async function getDiscoveredFleetsByPlanet(sessionId, playerId, planetId) {
  const { rows } = await pool.query(
    `SELECT * FROM discovered_fleets
     WHERE session_id=$1 AND player_id=$2 AND planet_id=$3`,
    [sessionId, playerId, planetId]
  );
  return rows;
}

// ── Alliances ────────────────────────────────
async function createAlliance(sessionId, name, createdBy, createdRound) {
  const { rows } = await pool.query(
    `INSERT INTO alliances (session_id,name,created_by,created_round)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [sessionId, name, createdBy, createdRound]
  );
  return rows[0];
}

async function getAlliances(sessionId) {
  const { rows } = await pool.query(
    'SELECT * FROM alliances WHERE session_id=$1 ORDER BY created_at',
    [sessionId]
  );
  return rows;
}

async function getAllianceById(allianceId) {
  const { rows } = await pool.query(
    'SELECT * FROM alliances WHERE id=$1',
    [allianceId]
  );
  return rows[0] || null;
}

async function addFactionToAlliance(allianceId, factionId, sessionId, joinedRound) {
  const { rows } = await pool.query(
    `INSERT INTO alliance_members (alliance_id,faction_id,session_id,joined_round)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (alliance_id,faction_id) DO NOTHING
     RETURNING *`,
    [allianceId, factionId, sessionId, joinedRound]
  );
  return rows[0];
}

async function getAllianceMembers(allianceId) {
  const { rows } = await pool.query(
    'SELECT faction_id FROM alliance_members WHERE alliance_id=$1',
    [allianceId]
  );
  return rows.map(r => r.faction_id);
}

async function getFactionAlliance(factionId) {
  const { rows } = await pool.query(
    'SELECT alliance_id FROM alliance_members WHERE faction_id=$1',
    [factionId]
  );
  return rows[0]?.alliance_id || null;
}

// ── Faction Unit Research ────────────────────
async function getOrCreateFactionUnitResearch(factionId, sessionId, unitType) {
  const { rows } = await pool.query(
    `INSERT INTO faction_unit_research (faction_id, session_id, unit_type, research_points, unlocked)
     VALUES ($1, $2, $3, 0, false)
     ON CONFLICT (faction_id, unit_type) DO UPDATE SET faction_id = EXCLUDED.faction_id
     RETURNING *`,
    [factionId, sessionId, unitType]
  );
  return rows[0];
}

async function addUnitResearchPoints(factionId, unitType, points) {
  const { rows } = await pool.query(
    `UPDATE faction_unit_research
     SET research_points = research_points + $1, updated_at = NOW()
     WHERE faction_id = $2 AND unit_type = $3
     RETURNING *`,
    [points, factionId, unitType]
  );
  return rows[0] || null;
}

async function unlockFactionUnitResearch(factionId, unitType, round) {
  const { rows } = await pool.query(
    `UPDATE faction_unit_research
     SET unlocked = true, unlocked_round = $1, updated_at = NOW()
     WHERE faction_id = $2 AND unit_type = $3
     RETURNING *`,
    [round, factionId, unitType]
  );
  return rows[0] || null;
}

async function getFactionUnitResearch(factionId) {
  const { rows } = await pool.query(
    `SELECT * FROM faction_unit_research
     WHERE faction_id = $1
     ORDER BY created_at`,
    [factionId]
  );
  return rows;
}

async function getFactionUnitResearchByType(factionId, unitType) {
  const { rows } = await pool.query(
    `SELECT * FROM faction_unit_research
     WHERE faction_id = $1 AND unit_type = $2`,
    [factionId, unitType]
  );
  return rows[0] || null;
}

async function ensureFactionResearchInitialized(factionId, sessionId) {
  try {
    // Check if any research records exist
    const { rows: existing } = await pool.query(
      `SELECT COUNT(*) as count FROM faction_unit_research WHERE faction_id = $1`,
      [factionId]
    );

    // If research records already exist, return
    if (existing[0].count > 0) {
      return;
    }

    // Get faction ideology
    const { rows: factionRows } = await pool.query(
      `SELECT ideology FROM factions WHERE id = $1`,
      [factionId]
    );

    if (factionRows.length === 0) return;

    const faction = factionRows[0];
    const CONFIG = require('./config');

    // Create research records for all unit types (batch insert)
    const allowedClasses = CONFIG.FACTIONS.IDEOLOGIES[faction.ideology]?.allowed_ship_classes || [];
    const UNIT_BASE_CLASSES = CONFIG.UNIT_BASE_CLASSES || {};

    const values = [];
    const params = [];
    let paramIndex = 1;

    for (const unitType of Object.keys(CONFIG.UNIT_TYPES)) {
      const unitDef = CONFIG.UNIT_TYPES[unitType];
      if (!unitDef || unitDef.imperialOnly || unitDef.requiredPlanetIds) {
        continue;
      }

      const effectiveClass = UNIT_BASE_CLASSES[unitType] || unitType;
      const isAllowed = allowedClasses.includes(effectiveClass);

      values.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, 0, $${paramIndex+3})`);
      params.push(factionId, sessionId, unitType, isAllowed);
      paramIndex += 4;
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT INTO faction_unit_research (faction_id, session_id, unit_type, research_points, unlocked)
         VALUES ${values.join(', ')}
         ON CONFLICT (faction_id, unit_type) DO NOTHING`,
        params
      );
    }
  } catch (err) {
    // Silently fail if table doesn't exist yet
  }
}

module.exports = {
  pool,
  createSession, getSessionByCode, getSessionById, updateSession,
  createPlayer, getPlayers, eliminatePlayer, updatePlayerSocket, getPlayerBySocket,
  upsertRebelState, getRebelState, getAllRebelStates,
  insertSealedMove, getSealedMovesForRound, getPlayerSealedMoves,
  insertIntelLeak, getRecentLeaks,
  saveGovernorMemory, getGovernorHistory,
  createUnit, escortOrbitalUnits, getUnits, getUnitsAtPlanet, updateUnit, deleteUnit, toggleUnitHidden, loadUnitIntoTransport, unloadUnitFromTransport, recordCombatEvent, getCombatFeed, createUnitsFromConfig,
  addToProductionQueue, getProductionQueue, tickProductionQueue,
  insertCombatLog, getRecentCombat,
  createFaction, getFactions, getFactionById, updateFaction, unlockFactionShipClass, updateFactionAllowedUnits,
  addContribution, getContributions, getPlayerContributions, getFactionContributors,
  upsertFactionCell, getFactionCells, getFactionCellsAtPlanet,
  recordInvestigation, getPlayerInvestigationTotal,
  recordFactionDiscovery, getDiscoveredFactions,
  getOrCreateForceUser, getForceUser, addForcePoints, updateForceTier, updateForceAlignment, recordForcePowerUse, getActiveForcePowers, createForceApprentice, linkApprenticeToMaster,
  recordFleetDiscovery, getDiscoveredFleets, getDiscoveredFleetsByPlanet,
  createFleet, getFleet, getFleets, getFleetsByLocation, updateFleet, deleteFleet, getUnitsByFleet, assignUnitsToFleet,
  createAlliance, getAlliances, getAllianceById, addFactionToAlliance, getAllianceMembers, getFactionAlliance,
};
