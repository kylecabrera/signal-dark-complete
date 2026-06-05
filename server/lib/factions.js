const db = require('./db');
const CONFIG = require('./config');
const { getRecruitmentMultiplier, getPlayerRank, buildTraitorFaction, FACTION_NAME_POOL, PLANETS } = require('./world');

// ─────────────────────────────────────────────
// Seed templates for initial factions at game start
// ─────────────────────────────────────────────
const FACTION_TEMPLATES = [
  { name: 'Outer Rim Coalition', ideology: 'fringe_collective', homePlanet: 'p03' },
  { name: 'Trade Guild Alliance', ideology: 'spacer_guild', homePlanet: 'p48' },
  { name: 'Colonial Defense Force', ideology: 'planetary_militia', homePlanet: 'p29' },
  { name: 'Rim Smugglers Network', ideology: 'spacer_guild', homePlanet: 'p115' },
  { name: 'Free Sector Fighters', ideology: 'liberation_front', homePlanet: 'p61' },
  { name: 'Independent Operators', ideology: 'mercenary_band', homePlanet: 'p93' },
  { name: 'Guild of Information', ideology: 'tech_syndicate', homePlanet: 'p51' },
  { name: 'Ground Resistance', ideology: 'indigenous_resistance', homePlanet: 'p148' },
  { name: 'Worker Collective', ideology: 'workers_alliance', homePlanet: 'p107' },
  { name: 'Clandestine Network', ideology: 'shadow_network', homePlanet: 'p08' },
  { name: 'Loyalist Underground', ideology: 'loyalist_splinter', homePlanet: 'p116' },
  { name: 'Merchant Republic', ideology: 'spacer_guild', homePlanet: 'p98' },
];

// ─────────────────────────────────────────────
// Initialise factions at game start
// Creates one traitor faction, names others if any exist
// ─────────────────────────────────────────────
async function initTraitorFaction(sessionId) {
  const traitor = buildTraitorFaction(sessionId);
  // Choose a home planet that looks plausible but isn't too obvious
  const plausibleHomes = ['p04','p07','p09','p13'];
  const home = plausibleHomes[Math.floor(Math.random()*plausibleHomes.length)];
  const faction = await db.createFaction(
    sessionId, traitor.name, traitor.ideology, home, true, null
  );
  // Give the traitor faction some cells to look established
  await db.upsertFactionCell(faction.id, sessionId, home, 2);
  await db.upsertFactionCell(faction.id, sessionId, 'p03', 1);

  // Assign random buildable units to traitor faction
  const allowedUnits = assignRandomUnitsToFaction(traitor.ideology);
  await db.updateFactionAllowedUnits(faction.id, allowedUnits);

  return faction;
}

// ─────────────────────────────────────────────
// Assign random buildable units to a faction
// ─────────────────────────────────────────────
function assignRandomUnitsToFaction(ideology) {
  const allowedClasses = CONFIG.FACTIONS.IDEOLOGIES[ideology]?.allowed_ship_classes || [];

  // Get all units that match allowed classes
  const buildableUnits = Object.keys(CONFIG.UNIT_TYPES).filter(unitType => {
    const unitDef = CONFIG.UNIT_TYPES[unitType];
    if (!unitDef || unitDef.imperialOnly || unitDef.requiredPlanetIds) return false;

    const effectiveClass = CONFIG.UNIT_BASE_CLASSES?.[unitType] || unitType;
    return allowedClasses.includes(effectiveClass);
  });

  // Randomly select 3-6 units
  const count = Math.floor(Math.random() * 4) + 3; // 3-6
  const shuffled = buildableUnits.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─────────────────────────────────────────────
// Seed initial non-traitor factions across the map
// ─────────────────────────────────────────────
async function seedInitialFactions(sessionId) {
  // Shuffle and pick ~10 factions from the template pool
  const shuffled = [...FACTION_TEMPLATES].sort(() => Math.random() - 0.5);
  const toSeed = shuffled.slice(0, 10);

  for (const tmpl of toSeed) {
    const faction = await db.createFaction(
      sessionId, tmpl.name, tmpl.ideology, tmpl.homePlanet, false, null
    );
    // Establish founding cell at home planet with strength 2
    await db.upsertFactionCell(faction.id, sessionId, tmpl.homePlanet, 2);

    // Assign random buildable units
    const allowedUnits = assignRandomUnitsToFaction(tmpl.ideology);
    await db.updateFactionAllowedUnits(faction.id, allowedUnits);
  }
}

// ─────────────────────────────────────────────
// Player founds a new faction
// ─────────────────────────────────────────────
async function foundFaction(sessionId, playerId, name, ideology, homePlanet) {
  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok:false, error:'Rebel state not found' };

  const cost = CONFIG.FACTIONS.FOUND_COST;
  if ((rebelState.credits||0) < cost) {
    return { ok:false, error:`Need ${cost} credits to found a faction` };
  }

  // Validate home planet is accessible
  const { isAdjacent } = require('./world');
  const isAtOrAdjacent = rebelState.current_planet === homePlanet ||
    isAdjacent(rebelState.current_planet, homePlanet);
  if (!isAtOrAdjacent) {
    return { ok:false, error:'Must be at or adjacent to home planet' };
  }

  // Validate ideology
  if (!CONFIG.FACTIONS.IDEOLOGIES[ideology]) {
    return { ok:false, error:'Invalid ideology' };
  }

  const faction = await db.createFaction(sessionId, name, ideology, homePlanet, false, playerId);
  // Founder gets initial contribution equal to cost paid
  await db.addContribution(faction.id, sessionId, playerId, cost, 0, 'found');
  // Establish founding cell
  await db.upsertFactionCell(faction.id, sessionId, homePlanet, 1);

  // Assign random buildable units
  const allowedUnits = assignRandomUnitsToFaction(ideology);
  await db.updateFactionAllowedUnits(faction.id, allowedUnits);

  // Deduct credits
  await db.upsertRebelState(sessionId, playerId, rebelState.current_planet,
    rebelState.actions_used, (rebelState.credits||0) - cost);
  // Auto-discover the faction for the founder
  await db.recordFactionDiscovery(sessionId, playerId, faction.id, 0);

  return { ok:true, faction };
}


// ─────────────────────────────────────────────
// Player contributes to a faction
// ─────────────────────────────────────────────
async function contributeToFaction(sessionId, playerId, factionId, amount, round) {
  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok:false, error:'Rebel state not found' };

  if ((rebelState.credits||0) < amount) {
    return { ok:false, error:`Need ${amount} credits` };
  }
  if (amount < 1) return { ok:false, error:'Minimum contribution is 1 credit' };

  const faction = await db.getFactionById(factionId, true); // include traitor flag for server
  if (!faction || faction.session_id !== sessionId) {
    return { ok:false, error:'Faction not found' };
  }
  if (faction.is_denounced) return { ok:false, error:'Faction has been denounced' };

  await db.addContribution(factionId, sessionId, playerId, amount, round);
  await db.upsertRebelState(sessionId, playerId, rebelState.current_planet,
    rebelState.actions_used, (rebelState.credits||0) - amount);

  // Strengthen cell at current planet
  await db.upsertFactionCell(factionId, sessionId, rebelState.current_planet, 1);

  // Auto-discover the faction
  await db.recordFactionDiscovery(sessionId, playerId, factionId, round);

  // Calculate exposure if traitor faction
  const exposed = faction.is_traitor;

  // Chance to unlock a new ship class for this faction
  const result = { ok:true, exposed, factionIsTraitor: faction.is_traitor };
  const ideo = CONFIG.FACTIONS.IDEOLOGIES[faction.ideology];
  const currentlyUnlocked = faction.unlocked_ship_classes || [];
  const locked = (ideo?.unlockable_ship_classes || [])
    .filter(c => !currentlyUnlocked.includes(c));

  if (locked.length > 0 && Math.random() < CONFIG.FACTIONS.UNLOCK_CHANCE_PER_CONTRIBUTION) {
    const newClass = locked[Math.floor(Math.random() * locked.length)];
    await db.unlockFactionShipClass(factionId, newClass);
    result.unlockedShipClass = newClass;
  }

  return result;
}

// ─────────────────────────────────────────────
// Investigate a faction — accumulates clues toward denunciation
// Returns partial audit results (never the is_traitor flag directly)
// ─────────────────────────────────────────────
async function investigateFaction(sessionId, playerId, factionId, round) {
  const faction = await db.getFactionById(factionId, true);
  if (!faction) return { ok:false, error:'Faction not found' };

  // Base clue generation — traitor factions yield more suspicious clues
  const baseClues = faction.is_traitor ? 2 : 1;
  const noiseRoll = Math.random();

  let cluesFound = baseClues;
  let auditNote = '';

  if (faction.is_traitor) {
    const notes = [
      'Cell operations in this faction\'s territory show no measurable disruption to Empire infrastructure.',
      'Financial flows from this faction\'s resource pool are inconsistent with stated operations.',
      'Reported rebellion strength contributions from this faction cannot be independently verified.',
      'This faction\'s home planet has anomalously low suspicion despite claimed rebel activity.',
      'Cross-referencing cell locations against patrol sweep records reveals unusual safety.',
    ];
    auditNote = notes[Math.floor(Math.random()*notes.length)];
  } else {
    // Real factions occasionally generate false suspicion
    if (noiseRoll < 0.2) {
      cluesFound = 0;
      auditNote = 'Audit inconclusive — records appear legitimate but incomplete.';
    } else {
      auditNote = 'Faction finances appear consistent with stated resistance operations.';
    }
  }

  await db.recordInvestigation(sessionId, playerId, factionId, round, cluesFound);
  // Auto-discover the faction when investigating
  await db.recordFactionDiscovery(sessionId, playerId, factionId, round);
  const totalClues = await db.getPlayerInvestigationTotal(sessionId, playerId, factionId);
  const threshold = CONFIG.FACTIONS.DENUNCIATION_THRESHOLD;

  return {
    ok: true,
    cluesFound,
    totalClues,
    canDenounce: totalClues >= threshold,
    auditNote,
    factionName: faction.name,
  };
}

// ─────────────────────────────────────────────
// Denounce a faction
// ─────────────────────────────────────────────
async function denounceFaction(sessionId, playerId, factionId, round) {
  const faction = await db.getFactionById(factionId, true);
  if (!faction) return { ok:false, error:'Faction not found' };

  const totalClues = await db.getPlayerInvestigationTotal(sessionId, playerId, factionId);
  if (totalClues < CONFIG.FACTIONS.DENUNCIATION_THRESHOLD) {
    return { ok:false, error:'Insufficient evidence to denounce' };
  }

  const session = await db.getSessionById(sessionId);
  let rebellionDelta = 0;
  let suppressionDelta = 0;
  let outcome = '';

  if (faction.is_traitor) {
    rebellionDelta = CONFIG.FACTIONS.CORRECT_DENUNCIATION_REWARD;
    suppressionDelta = -10;
    outcome = 'correct';
    await db.updateFaction(factionId, {
      is_denounced: true,
      denounced_by: playerId,
      denounced_round: round,
    });
  } else {
    rebellionDelta = -CONFIG.FACTIONS.WRONG_DENUNCIATION_PENALTY;
    suppressionDelta = 4;
    outcome = 'wrong';
    // Wrongly denounced faction gets a sympathy boost
    await db.updateFaction(factionId, { reputation: Math.min(faction.reputation+15, 100) });
  }

  // Apply game state effects
  await db.updateSession(sessionId, {
    rebellion_strength: Math.max(0, Math.min(100, (session.rebellion_strength||0) + rebellionDelta)),
    empire_level: Math.max(0, Math.min(100, (session.empire_level||0) + suppressionDelta)),
  });

  // Auto-discover the faction when denouncing
  await db.recordFactionDiscovery(sessionId, playerId, factionId, round);

  return { ok:true, outcome, rebellionDelta, suppressionDelta, factionName: faction.name };
}

// ─────────────────────────────────────────────
// Calculate faction bonuses for a rebel action
// ─────────────────────────────────────────────
async function getFactionBonuses(sessionId, playerId, planetId, actionType) {
  const planetState = (await db.getSessionById(sessionId))?.planet_state || [];
  const planet = planetState.find(p => p.id === planetId);
  if (!planet) return { multiplier: 1, covertBonus: 0 };

  const cells = await db.getFactionCells(sessionId);
  const playerContribs = await db.getPlayerContributions(sessionId, playerId);

  let bestMultiplier = 1;
  let totalCovertBonus = 0;

  for (const contrib of playerContribs) {
    const cellHere = cells.find(c => c.faction_id === contrib.faction_id && c.planet_id === planetId);
    if (!cellHere) continue;

    const ideo = CONFIG.FACTIONS.IDEOLOGIES[contrib.ideology];
    if (!ideo) continue;

    const mult = getRecruitmentMultiplier(contrib.ideology, planet.type);
    if (mult > bestMultiplier) bestMultiplier = mult;

    if (ideo.covert_bonus) totalCovertBonus += ideo.covert_bonus;
    if (ideo.overt_locked && (actionType === 'sabotage' || actionType === 'incite')) {
      return { multiplier: 1, covertBonus: 0, blocked: true,
               reason: 'Shadow Network ideology cannot take overt actions' };
    }
  }

  return { multiplier: bestMultiplier, covertBonus: totalCovertBonus };
}

// ─────────────────────────────────────────────
// Build safe faction data for clients (no is_traitor flag)
// ─────────────────────────────────────────────
async function buildClientFactionState(sessionId, playerId) {
  const allFactions = await db.getFactions(sessionId, false); // is_traitor stripped
  const discoveredFactionIds = await db.getDiscoveredFactions(sessionId, playerId);
  const discoveredSet = new Set(discoveredFactionIds);
  const factions = allFactions.filter(f => discoveredSet.has(f.id));

  const playerContribs = await db.getPlayerContributions(sessionId, playerId);
  const cells = await db.getFactionCells(sessionId);

  const result = [];
  for (const f of factions) {
    const contribs = await db.getContributions(f.id);
    const total = contribs.reduce((s,c)=>s+parseInt(c.total),0);
    const myContrib = contribs.find(c=>c.player_id===playerId);
    const myTotal = parseInt(myContrib?.total||0);
    const myPct = total > 0 ? Math.round((myTotal/total)*100) : 0;

    result.push({
      id: f.id,
      name: f.name,
      ideology: f.ideology,
      ideologyLabel: CONFIG.FACTIONS.IDEOLOGIES[f.ideology]?.label || f.ideology,
      home_planet: f.home_planet,
      resource_pool: f.resource_pool,
      reputation: f.reputation,
      is_denounced: f.is_denounced,
      created_by: f.created_by,
      myContribution: myTotal,
      myPct,
      myRank: getPlayerRank(myPct),
      totalContributions: total,
      topContributors: contribs.slice(0,3),
      cells: cells.filter(c=>c.faction_id===f.id).map(c=>({
        planet_id: c.planet_id,
        strength: c.strength,
      })),
      allowed_unit_types: f.allowed_unit_types || [],
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// Get faction data safe for governor briefs
// Governors know which faction is the traitor
// ─────────────────────────────────────────────
async function buildGovernorFactionBrief(sessionId) {
  const factions = await db.getFactions(sessionId, true); // include is_traitor
  return factions.map(f => ({
    id: f.id,
    name: f.name,
    ideology: f.ideology,
    home_planet: f.home_planet,
    is_traitor: f.is_traitor,
    reputation: f.reputation,
    resource_pool: f.resource_pool,
  }));
}

// ─────────────────────────────────────────────
// Alliance system
// ─────────────────────────────────────────────
async function createNewAlliance(sessionId, playerId, allianceName, factionIds, round) {
  if (!allianceName || allianceName.trim().length === 0) {
    return { ok: false, error: 'Alliance name required' };
  }
  if (!factionIds || factionIds.length < 2) {
    return { ok: false, error: 'Need at least 2 factions to form an alliance' };
  }

  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok: false, error: 'Rebel state not found' };

  // Verify player has discovered all factions
  const discoveredIds = await db.getDiscoveredFactions(sessionId, playerId);
  const discoveredSet = new Set(discoveredIds);
  for (const fid of factionIds) {
    if (!discoveredSet.has(fid)) {
      return { ok: false, error: 'Must discover all factions before forming alliance' };
    }
  }

  // Verify all factions exist in this session
  const allFactions = await db.getFactions(sessionId);
  const factionSet = new Set(allFactions.map(f => f.id));
  for (const fid of factionIds) {
    if (!factionSet.has(fid)) {
      return { ok: false, error: 'One or more factions not found' };
    }
  }

  try {
    const alliance = await db.createAlliance(sessionId, allianceName.trim(), playerId, round);

    // Add all factions to the alliance
    for (const fid of factionIds) {
      await db.addFactionToAlliance(alliance.id, fid, sessionId, round);
    }

    return { ok: true, alliance };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function joinAlliance(sessionId, playerId, allianceId, factionIds, round) {
  if (!factionIds || factionIds.length === 0) {
    return { ok: false, error: 'Must add at least 1 faction to alliance' };
  }

  const alliance = await db.getAllianceById(allianceId);
  if (!alliance || alliance.session_id !== sessionId) {
    return { ok: false, error: 'Alliance not found' };
  }

  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok: false, error: 'Rebel state not found' };

  // Verify player has discovered all factions
  const discoveredIds = await db.getDiscoveredFactions(sessionId, playerId);
  const discoveredSet = new Set(discoveredIds);
  for (const fid of factionIds) {
    if (!discoveredSet.has(fid)) {
      return { ok: false, error: 'Must discover all factions before joining alliance' };
    }
  }

  // Verify all factions exist and aren't already in another alliance
  const allFactions = await db.getFactions(sessionId);
  const factionSet = new Set(allFactions.map(f => f.id));
  for (const fid of factionIds) {
    if (!factionSet.has(fid)) {
      return { ok: false, error: 'One or more factions not found' };
    }
    const currentAlliance = await db.getFactionAlliance(fid);
    if (currentAlliance) {
      return { ok: false, error: `Faction already in an alliance` };
    }
  }

  try {
    for (const fid of factionIds) {
      await db.addFactionToAlliance(allianceId, fid, sessionId, round);
    }
    return { ok: true, alliance };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function buildAllianceState(sessionId, playerId) {
  const alliances = await db.getAlliances(sessionId);
  const discoveredFactionIds = new Set(await db.getDiscoveredFactions(sessionId, playerId));
  const allFactions = await db.getFactions(sessionId);

  const result = [];
  for (const alliance of alliances) {
    const memberIds = await db.getAllianceMembers(alliance.id);
    const visibleMembers = memberIds.filter(id => discoveredFactionIds.has(id));

    if (visibleMembers.length > 0) {
      const members = allFactions.filter(f => visibleMembers.includes(f.id));
      result.push({
        id: alliance.id,
        name: alliance.name,
        created_by: alliance.created_by,
        created_round: alliance.created_round,
        members: members.map(f => ({
          id: f.id,
          name: f.name,
          ideology: f.ideology,
          reputation: f.reputation,
        })),
        totalMembers: memberIds.length,
      });
    }
  }

  return result;
}

// ─────────────────────────────────────────────
// Found a faction cell at a planet
// ─────────────────────────────────────────────
async function foundFactionCell(sessionId, playerId, factionId, planetId, round) {
  const rebelState = await db.getRebelState(sessionId, playerId);
  if (!rebelState) return { ok:false, error:'Rebel state not found' };

  const cost = CONFIG.FACTIONS.CELL_COST;
  if ((rebelState.credits||0) < cost) {
    return { ok:false, error:`Need ${cost} credits to establish a cell` };
  }

  const faction = await db.getFactionById(factionId, true);
  if (!faction || faction.session_id !== sessionId) {
    return { ok:false, error:'Faction not found' };
  }

  // Check if cell already exists at this planet
  const existingCells = await db.getFactionCellsAtPlanet(sessionId, planetId);
  if (existingCells.some(c => c.faction_id === factionId)) {
    return { ok:false, error:'Cell already established here' };
  }

  // Establish cell with strength 1
  await db.upsertFactionCell(factionId, sessionId, planetId, 1);

  return { ok:true, faction_name: faction.name };
}

module.exports = {
  initTraitorFaction, seedInitialFactions, foundFaction, foundFactionCell, contributeToFaction,
  investigateFaction, denounceFaction,
  getFactionBonuses, buildClientFactionState, buildGovernorFactionBrief,
  createNewAlliance, joinAlliance, buildAllianceState,
};
