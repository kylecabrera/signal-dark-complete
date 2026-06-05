const express = require('express');
const router  = express.Router();
const db      = require('../lib/db');
const { generateGameCode, buildInitialPlanetState, buildInitialGovernorState,
        buildInitialVektisMemory, PLAYER_COLORS, PLANETS } = require('../lib/world');
const { buildPublicState, buildPrivateState } = require('../lib/engine');
const { initTraitorFaction, seedInitialFactions } = require('../lib/factions');
const { createUnitsFromConfig } = require('../lib/db');
const CONFIG = require('../lib/config');

// POST /api/sessions — create game
router.post('/sessions', async (req, res) => {
  try {
    const { displayName } = req.body;
    if (!displayName?.trim()) return res.status(400).json({ error:'displayName required' });

    const code    = generateGameCode();
    const session = await db.createSession(
      code,
      buildInitialPlanetState(),
      buildInitialGovernorState(),
      buildInitialVektisMemory()
    );

    // Place initial architect units from config
    await createUnitsFromConfig(session.id, CONFIG.INITIAL_ARCHITECT_UNITS);

    // Initialise the hidden traitor faction
    await initTraitorFaction(session.id);

    // Seed initial non-traitor factions across the map
    await seedInitialFactions(session.id);

    const player = await db.createPlayer(session.id, displayName.trim(), PLAYER_COLORS[0]);
    const { startPlanet, forceOpts } = pickStartPlanet();
    await db.upsertRebelState(session.id, player.id, startPlanet.id, 0,
      CONFIG.STARTING_CREDITS + (forceOpts.creditBonus || 0), forceOpts);

    // Spawn player's starfighter and jedi avatar in orbit at starting planet
    await db.createUnit(session.id, 'starfighter', `rebel:${player.id}`,
      startPlanet.id, 'orbit',
      CONFIG.UNIT_TYPES.starfighter.strength,
      CONFIG.UNIT_TYPES.starfighter.hp,
      true, CONFIG.UNIT_TYPES.starfighter.jumpDistance,
      CONFIG.UNIT_TYPES.starfighter.transportCapacity, 'Personal Starfighter');

    await db.createUnit(session.id, 'jedi_avatar', `rebel:${player.id}`,
      startPlanet.id, 'orbit',
      forceOpts.strength || CONFIG.FORCE.BASE_STRENGTH,
      3, true, 2, 0, player.display_name);

    const bonus = CONFIG.FORCE.STARTING_BONUSES[startPlanet.type] || {};
    res.json({ sessionId:session.id, code:session.code, playerId:player.id,
      startingPlanet: { id:startPlanet.id, name:startPlanet.name, type:startPlanet.type,
        desc: bonus.desc, forceStrength: forceOpts.strength, alignment: forceOpts.alignment } });
  } catch(err) {
    console.error('Create session error:', err);
    res.status(500).json({ error:'Failed to create session' });
  }
});

// POST /api/sessions/:code/join
router.post('/sessions/:code/join', async (req, res) => {
  try {
    const { displayName } = req.body;
    const session = await db.getSessionByCode(req.params.code);
    if (!session)              return res.status(404).json({ error:'Game not found' });
    if (session.status !== 'lobby') return res.status(400).json({ error:'Game already started' });

    const existing = await db.getPlayers(session.id);
    if (existing.length >= CONFIG.MAX_PLAYERS)
      return res.status(400).json({ error:`Game is full (max ${CONFIG.MAX_PLAYERS})` });

    const color  = PLAYER_COLORS[existing.length];
    const player = await db.createPlayer(session.id, displayName.trim(), color);
    const { startPlanet, forceOpts } = pickStartPlanet();
    await db.upsertRebelState(session.id, player.id, startPlanet.id, 0,
      CONFIG.STARTING_CREDITS + (forceOpts.creditBonus || 0), forceOpts);

    // Spawn player's starfighter and jedi avatar in orbit at starting planet
    await db.createUnit(session.id, 'starfighter', `rebel:${player.id}`,
      startPlanet.id, 'orbit',
      CONFIG.UNIT_TYPES.starfighter.strength,
      CONFIG.UNIT_TYPES.starfighter.hp,
      true, CONFIG.UNIT_TYPES.starfighter.jumpDistance,
      CONFIG.UNIT_TYPES.starfighter.transportCapacity, 'Personal Starfighter');

    await db.createUnit(session.id, 'jedi_avatar', `rebel:${player.id}`,
      startPlanet.id, 'orbit',
      forceOpts.strength || CONFIG.FORCE.BASE_STRENGTH,
      3, true, 2, 0, player.display_name);

    const bonus = CONFIG.FORCE.STARTING_BONUSES[startPlanet.type] || {};
    res.json({ sessionId:session.id, code:session.code, playerId:player.id,
      startingPlanet: { id:startPlanet.id, name:startPlanet.name, type:startPlanet.type,
        desc: bonus.desc, forceStrength: forceOpts.strength, alignment: forceOpts.alignment } });
  } catch(err) {
    console.error('Join session error:', err);
    res.status(500).json({ error:'Failed to join' });
  }
});

// GET /api/sessions/:code
router.get('/sessions/:code', async (req, res) => {
  try {
    const session = await db.getSessionByCode(req.params.code);
    if (!session) return res.status(404).json({ error:'Game not found' });
    const players = await db.getPlayers(session.id);
    res.json(await buildPublicState(session, players));
  } catch(err) {
    res.status(500).json({ error:'Failed to fetch session' });
  }
});

// ── Alliance routes ─────────────────────────────
const { createNewAlliance, joinAlliance, buildAllianceState } = require('../lib/factions');

// POST /api/sessions/:sessionId/alliances — create a new alliance
router.post('/sessions/:sessionId/alliances', async (req, res) => {
  try {
    const { playerId, allianceName, factionIds } = req.body;
    if (!playerId) return res.status(400).json({ error:'playerId required' });
    if (!allianceName) return res.status(400).json({ error:'allianceName required' });
    if (!Array.isArray(factionIds)) return res.status(400).json({ error:'factionIds must be an array' });

    const session = await db.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error:'Session not found' });

    const result = await createNewAlliance(req.params.sessionId, playerId, allianceName, factionIds, session.round);
    if (!result.ok) return res.status(400).json({ error:result.error });

    res.json(result);
  } catch(err) {
    console.error('Create alliance error:', err);
    res.status(500).json({ error:'Failed to create alliance' });
  }
});

// POST /api/sessions/:sessionId/alliances/:allianceId/join — add factions to alliance
router.post('/sessions/:sessionId/alliances/:allianceId/join', async (req, res) => {
  try {
    const { playerId, factionIds } = req.body;
    if (!playerId) return res.status(400).json({ error:'playerId required' });
    if (!Array.isArray(factionIds)) return res.status(400).json({ error:'factionIds must be an array' });

    const session = await db.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error:'Session not found' });

    const result = await joinAlliance(req.params.sessionId, playerId, req.params.allianceId, factionIds, session.round);
    if (!result.ok) return res.status(400).json({ error:result.error });

    res.json(result);
  } catch(err) {
    console.error('Join alliance error:', err);
    res.status(500).json({ error:'Failed to join alliance' });
  }
});

// GET /api/sessions/:sessionId/alliances — get all alliances visible to a player
router.get('/sessions/:sessionId/alliances', async (req, res) => {
  try {
    const { playerId } = req.query;
    if (!playerId) return res.status(400).json({ error:'playerId required' });

    const session = await db.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error:'Session not found' });

    const alliances = await buildAllianceState(req.params.sessionId, playerId);
    res.json(alliances);
  } catch(err) {
    console.error('Get alliances error:', err);
    res.status(500).json({ error:'Failed to fetch alliances' });
  }
});

// ── Admin routes ────────────────────────────────
// POST /api/admin/:sessionId/units — manually place a unit
router.post('/admin/:sessionId/units', async (req, res) => {
  try {
    const { adminToken, unit_type, owner, planet_id, layer, strength, hp, is_hidden } = req.body;
    // Simple token check — set ADMIN_TOKEN env var
    if (adminToken !== process.env.ADMIN_TOKEN) return res.status(403).json({ error:'Forbidden' });

    const session = await db.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error:'Session not found' });

    const typeCfg = CONFIG.UNIT_TYPES[unit_type];
    if (!typeCfg) return res.status(400).json({ error:'Unknown unit type' });

    const unit = await db.createUnit(
      session.id, unit_type, owner || 'empire:crassus',
      planet_id, layer || 'surface',
      strength || typeCfg.strength,
      hp || typeCfg.hp,
      is_hidden || false
    );
    res.json({ ok:true, unit });
  } catch(err) {
    res.status(500).json({ error:err.message });
  }
});

// PATCH /api/admin/:sessionId/planets/:planetId — edit planet econ values
router.patch('/admin/:sessionId/planets/:planetId', async (req, res) => {
  try {
    const { adminToken, econ_output, econ_capacity, loyalty, suspicion } = req.body;
    if (adminToken !== process.env.ADMIN_TOKEN) return res.status(403).json({ error:'Forbidden' });

    const session = await db.getSessionById(req.params.sessionId);
    if (!session) return res.status(404).json({ error:'Session not found' });

    const planets = session.planet_state.map(p => {
      if (p.id !== req.params.planetId) return p;
      return {
        ...p,
        ...(econ_output   !== undefined && { econ_output }),
        ...(econ_capacity !== undefined && { econ_capacity }),
        ...(loyalty       !== undefined && { loyalty }),
        ...(suspicion     !== undefined && { suspicion }),
      };
    });
    await db.updateSession(session.id, { planet_state:planets });
    res.json({ ok:true });
  } catch(err) {
    res.status(500).json({ error:err.message });
  }
});

// POST /api/admin/:sessionId/production — queue a unit for production
router.post('/admin/:sessionId/production', async (req, res) => {
  try {
    const { adminToken, planet_id, unit_type, owner, rounds_remaining } = req.body;
    if (adminToken !== process.env.ADMIN_TOKEN) return res.status(403).json({ error:'Forbidden' });

    const typeCfg = CONFIG.UNIT_TYPES[unit_type];
    if (!typeCfg) return res.status(400).json({ error:'Unknown unit type' });

    const item = await db.addToProductionQueue(
      req.params.sessionId, planet_id, unit_type,
      owner || 'empire:crassus',
      rounds_remaining || typeCfg.buildTime
    );
    res.json({ ok:true, item });
  } catch(err) {
    res.status(500).json({ error:err.message });
  }
});

// GET /api/admin/:sessionId/state — full debug state (server only)
router.get('/admin/:sessionId/state', async (req, res) => {
  try {
    const { adminToken } = req.query;
    if (adminToken !== process.env.ADMIN_TOKEN) return res.status(403).json({ error:'Forbidden' });

    const session  = await db.getSessionById(req.params.sessionId);
    const players  = await db.getPlayers(req.params.sessionId);
    const units    = await db.getUnits(req.params.sessionId);
    const queue    = await db.getProductionQueue(req.params.sessionId);
    const factions = await db.getFactions(req.params.sessionId, true); // includes is_traitor
    const leaks    = await db.getRecentLeaks(req.params.sessionId, 20);

    // Get fleets (gracefully handle if table doesn't exist)
    let fleets = [];
    try {
      fleets = await db.getFleets(req.params.sessionId);
    } catch (err) {
      // Table may not exist yet
    }

    res.json({ session, players, units, queue, factions, leaks, fleets });
  } catch(err) {
    res.status(500).json({ error:err.message });
  }
});

function pickStartPlanet() {
  const validRegions = new Set(CONFIG.FORCE.VALID_START_REGIONS);
  const candidates = PLANETS.filter(p => validRegions.has(p.type));
  const planet = candidates[Math.floor(Math.random() * candidates.length)];
  const bonus  = CONFIG.FORCE.STARTING_BONUSES[planet.type] || {};
  return {
    startPlanet: planet,
    forceOpts: {
      alignment:     bonus.alignment     ?? 0,
      strength:      CONFIG.FORCE.BASE_STRENGTH + (bonus.force_strength ?? 0),
      startingPlanet: planet.id,
      creditBonus:   bonus.credits       ?? 0,
    },
  };
}

module.exports = router;
