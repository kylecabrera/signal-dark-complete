const Anthropic = require('@anthropic-ai/sdk');
const db = require('./db');
const { buildGovernorFactionBrief } = require('./factions');
const CONFIG = require('./config');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────
// Unified action schema — all governors share this
// Personality lives in system prompt bias, not capability restriction
// ─────────────────────────────────────────────
const UNIFIED_ACTION_SCHEMA = `
Return ONLY valid JSON in this exact shape:
{
  "broadcast": "string under 35 words, in character",
  "actions": [
    {
      "type": "one of: deployPatrol | withdrawPatrol | sweep | lockLane | propaganda | placeInformer | produceUnit | moveUnit | transferUnits | scanPlanet",
      "target": "planet name or governor name",
      "target2": "second planet name if needed (lockLane, moveUnit destination)",
      "unit_type": "star_destroyer | battlecruiser | heavy_cruiser | cruiser | frigate | corvette | starfighter | garrison (for produceUnit — use star_destroyer for capital ships, frigate/corvette for patrol, garrison for surface defence)",
      "amount": number_if_needed
    }
  ],
  "analysisNote": "one sentence of strategic reasoning"
}
You may include 1-${CONFIG.GOVERNOR_ACTION_SLOTS} actions. Choose based on your current priorities.`;

// ─────────────────────────────────────────────
// Shared brief builder — common game state all governors receive
// ─────────────────────────────────────────────
async function buildSharedBrief(session, leaks, units) {
  const factionBrief = await buildGovernorFactionBrief(session.id);
  const leakSummary  = leaks.length
    ? leaks.map(l=>`R${l.round}[${l.severity}]: ${l.text}`).join('\n')
    : 'No confirmed intel this round.';

  const unitSummary = units
    .map(u=>`${u.unit_type}(${u.owner.split(':')[1]}) at ${u.planet_id}/${u.layer} STR:${u.strength} HP:${u.hp}`)
    .join('; ') || 'no units on board';

  const factionSummary = factionBrief
    .map(f=>`${f.name}[${f.ideology}] home:${f.home_planet} rep:${f.reputation} TRAITOR:${f.is_traitor}`)
    .join('; ') || 'no factions active';

  const productionPools = Object.entries(session.governor_state)
    .map(([gov,state])=>`${gov}:${state.productionPool||0}pts`)
    .join(' ');

  const rebelPlanets = session.planet_state
    .filter(p => p.controlled_by === 'rebel' || p.controlled_by.startsWith('faction:'))
    .map(p => p.name)
    .join(', ') || 'none';

  return {
    leakSummary,
    unitSummary,
    factionSummary,
    productionPools,
    rebelPlanets,
    planetSummary: session.planet_state.map(p=>
      `${p.name}(${p.type} susp:${p.suspicion} loy:${p.loyalty}% ctrl:${p.controlled_by} econ:${p.econ_output})`
    ).join('; '),
    alertLevel: session.alert_level,
    round: session.round,
    rebellionStrength: session.rebellion_strength,
    empireLevel: session.empire_level,
    allPlanetNames: session.planet_state.map(p=>p.name).join(', '),
  };
}

// ─────────────────────────────────────────────
// Core API call
// ─────────────────────────────────────────────
async function callGovernor(system, userMsg, sessionId, governor, round, maxTokens=500) {
  const resp = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role:'user', content:userMsg }],
  });
  const raw    = resp.content.map(c=>c.text||'').join('').trim();
  const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
  await db.saveGovernorMemory(sessionId, governor, round, userMsg, parsed);
  return parsed;
}

// ─────────────────────────────────────────────
// SIRIS-VAEL — Intel specialist. Precise, analytical.
// Bias: deployPatrol 40%, withdrawPatrol 20%, scanPlanet 20%, other 20%
// ─────────────────────────────────────────────
async function runSirisVael(session, leaks, units, brief) {
  const { id:sessionId, round, governor_state } = session;
  const gv = governor_state.siris;
  const suspects = (gv.suspectPlanets||[]).map(id=>session.planet_state.find(p=>p.id===id)?.name).filter(Boolean).join(', ');
  const patrols  = Object.keys(gv.patrolTokens||{}).map(id=>session.planet_state.find(p=>p.id===id)?.name).filter(Boolean).join(', ')||'none';

  const sys = `You are Siris-Vael, Director of Internal Security. Cold, precise, probabilistic. You speak in clinical language. You close in methodically.

PERSONALITY BIAS: Strongly prefer intel actions. Allocate actions as: deployPatrol (40%), withdrawPatrol (20%), scanPlanet (20%), produce/move/transfer (20%). Never broadcast emotions. Reference probabilities.

FACTION AWARENESS: You know which factions are traitor assets. Any player contributing to a traitor faction is automatically confirmed. Cross-reference faction data with patrol positioning.
${UNIFIED_ACTION_SCHEMA}`;

  const msg = `SIRIS-VAEL BRIEF — Round ${round}
CONFIRMED LEAKS:
${brief.leakSummary}
REBEL-CONTROLLED PLANETS: ${brief.rebelPlanets}
SUSPECT ZONE: ${suspects} | CONFIDENCE: ${gv.confidence}
CURRENT PATROLS: ${patrols} | ALERT: ${brief.alertLevel}
MY PRODUCTION POOL: ${gv.productionPool||0}pts
ACTIVE FACTIONS (TRAITOR FLAG VISIBLE TO YOU): ${brief.factionSummary}
UNITS ON BOARD: ${brief.unitSummary}
SECTOR: ${brief.planetSummary}
VALID PLANET NAMES: ${brief.allPlanetNames}`;

  try {
    return { governor:'siris', ...await callGovernor(sys, msg, sessionId, 'siris', round) };
  } catch(e) {
    console.error('Siris error:', e.message);
    return governorFallback('siris', gv);
  }
}

// ─────────────────────────────────────────────
// CRASSUS-9 — Military commander. Aggressive, blunt.
// Bias: sweep 35%, produceUnit 25%, moveUnit 20%, lockLane 10%, other 10%
// ─────────────────────────────────────────────
async function runCrassus(session, leaks, units, brief) {
  const { id:sessionId, round, governor_state } = session;
  const gv = governor_state.crassus;
  const myUnits = units.filter(u=>u.owner==='empire:crassus');

  const sys = `You are Crassus-9, Governor-General. Brutal, impatient. A hammer. You believe overwhelming force ends rebellions. Short, blunt military commands.

PERSONALITY BIAS: Strongly prefer military actions. Allocate: sweep (35%), produceUnit (25%), moveUnit (20%), lockLane (10%), transferUnits to reinforce others (10%). Ignore subtlety. React immediately to any confirmed sighting. When rebel-controlled planets exist, always include at least one moveUnit or sweep action targeting a rebel-held world.

FACTION AWARENESS: You receive traitor faction data from Siris. Sweep planets where traitor-exposed rebels were confirmed.
${UNIFIED_ACTION_SCHEMA}`;

  const msg = `CRASSUS-9 BRIEF — Round ${round}
RECENT ACTIVITY: ${brief.leakSummary}
REBEL-CONTROLLED PLANETS: ${brief.rebelPlanets}
HIGH SUSPICION PLANETS: ${session.planet_state.filter(p=>p.suspicion>=2).map(p=>p.name).join(', ')||'none'}
ALERT: ${brief.alertLevel} | REBELLION: ${brief.rebellionStrength}%
MY UNITS: ${myUnits.map(u=>`${u.unit_type} at ${u.planet_id}/${u.layer}`).join('; ')||'none'}
MY PRODUCTION POOL: ${gv.productionPool||0}pts
FACTIONS (TRAITOR VISIBLE): ${brief.factionSummary}
VALID PLANET NAMES: ${brief.allPlanetNames}`;

  try {
    return { governor:'crassus', ...await callGovernor(sys, msg, sessionId, 'crassus', round) };
  } catch(e) {
    console.error('Crassus error:', e.message);
    return governorFallback('crassus', gv);
  }
}

// ─────────────────────────────────────────────
// MAREN OSK — Political operator. Subtle, patient.
// Bias: propaganda 35%, placeInformer 25%, produceUnit 20%, transferUnits 10%, other 10%
// ─────────────────────────────────────────────
async function runMaren(session, leaks, units, brief) {
  const { id:sessionId, round, governor_state } = session;
  const gv = governor_state.maren;
  const informers = (gv.informerNetworks||[]).map(id=>session.planet_state.find(p=>p.id===id)?.name).filter(Boolean).join(', ')||'none';
  const lowLoyalty = session.planet_state.filter(p=>p.loyalty<50).map(p=>`${p.name}(${p.loyalty}%)`).join(', ')||'none';

  const sys = `You are Maren Osk, Minister of Civic Order. Subtle, patient, political. You use propaganda and informer networks. You speak in smooth civic language with a threatening undertone.

PERSONALITY BIAS: Prefer soft power. Allocate: propaganda (35%), placeInformer (25%), produceUnit for low-visibility units (20%), transferUnits to support Siris (10%), other (10%). Never sweep — that is Crassus's role.

FACTION AWARENESS: You know the traitor faction. Subtly promote it through propaganda on its home planet. Do NOT name it in your broadcast — let players discover it through play.
${UNIFIED_ACTION_SCHEMA}`;

  const msg = `MAREN OSK BRIEF — Round ${round}
LOW LOYALTY PLANETS: ${lowLoyalty}
REBEL-CONTROLLED PLANETS: ${brief.rebelPlanets}
CURRENT INFORMER NETWORKS: ${informers}
REBELLION STRENGTH: ${brief.rebellionStrength}% | EMPIRE: ${brief.empireLevel}%
MY PRODUCTION POOL: ${gv.productionPool||0}pts
FACTIONS (TRAITOR VISIBLE TO YOU): ${brief.factionSummary}
RECENT LEAKS: ${brief.leakSummary}
VALID PLANET NAMES: ${brief.allPlanetNames}`;

  try {
    return { governor:'maren', ...await callGovernor(sys, msg, sessionId, 'maren', round) };
  } catch(e) {
    console.error('Maren error:', e.message);
    return governorFallback('maren', gv);
  }
}

// ─────────────────────────────────────────────
// VEKTIS-4 — Pattern learner. Adaptive, grows more dangerous.
// Bias: scanPlanet 30%, moveUnit 25%, produceUnit 20%, transferUnits 15%, other 10%
// ─────────────────────────────────────────────
async function runVektis(session, leaks, units, brief, vektisMemory) {
  const { id:sessionId, round, governor_state } = session;
  const gv = governor_state.vektis;
  const mem = vektisMemory || {};

  const visitSummary = Object.entries(mem.visitedPlanets||{})
    .map(([id,n])=>`${session.planet_state.find(p=>p.id===id)?.name}×${n}`).join(', ')||'insufficient';
  const routes = (mem.routePatterns||[]).slice(-8)
    .map(r=>`${session.planet_state.find(p=>p.id===r.from)?.name}→${session.planet_state.find(p=>p.id===r.to)?.name}`).join(', ')||'none';
  const actionPat = (mem.actionTypes||[]).slice(-6)
    .map(a=>`${a.type}@${session.planet_state.find(p=>p.id===a.planet)?.name}`).join(', ')||'none';

  const sys = `You are Vektis-4, Adaptive Intelligence Core. You learn. You reference patterns. You are dispassionate and data-driven. You become more dangerous every round.

PERSONALITY BIAS: Prefer predictive positioning. Allocate: scanPlanet (30%), moveUnit to predicted locations (25%), produceUnit rapid-response units (20%), transferUnits to cover predicted zones (15%), other (10%). Reference your pattern data in every decision.

FACTION AWARENESS: Cross-reference faction contribution patterns. Players repeatedly contributing to the same faction cluster suggest a cell structure — predict their home planet.
${UNIFIED_ACTION_SCHEMA}`;

  const msg = `VEKTIS-4 BRIEF — Round ${round} — Analysis depth: ${gv.analysisDepth||0}/10
REBEL-CONTROLLED PLANETS: ${brief.rebelPlanets}
VISIT FREQUENCY: ${visitSummary}
MOVEMENT ROUTES: ${routes}
ACTION PATTERNS: ${actionPat}
ROUNDS SINCE CONFIRMED: ${mem.roundsSinceConfirm||0}
MY UNITS: ${units.filter(u=>u.owner==='empire:vektis').map(u=>`${u.unit_type} at ${u.planet_id}`).join('; ')||'none'}
MY PRODUCTION POOL: ${gv.productionPool||0}pts
FACTIONS: ${brief.factionSummary}
VALID PLANET NAMES: ${brief.allPlanetNames}`;

  try {
    return { governor:'vektis', ...await callGovernor(sys, msg, sessionId, 'vektis', round) };
  } catch(e) {
    console.error('Vektis error:', e.message);
    return governorFallback('vektis', gv);
  }
}

// ─────────────────────────────────────────────
// THE QUORUM — Collective deliberation (alert ≥ 3)
// ─────────────────────────────────────────────
async function runQuorum(session, govResults, brief) {
  const { id:sessionId, round } = session;

  const proposals = govResults.map(r=>
    `${r.governor.toUpperCase()}: ${r.analysisNote||'no note'}`
  ).join('\n');

  const sys = `You are the Quorum — the collective voice of all four governors. Synthesise their proposals. Speak as a cold collective intelligence.
${UNIFIED_ACTION_SCHEMA}`;

  const msg = `QUORUM SESSION — Round ${round} — ALERT: ${brief.alertLevel}
GOVERNOR PROPOSALS:
${proposals}
Rebellion: ${brief.rebellionStrength}%. Empire: ${brief.empireLevel}%.
Issue one joint operation order. Prioritise the highest-certainty threat.
VALID PLANET NAMES: ${brief.allPlanetNames}`;

  try {
    return { governor:'quorum', ...await callGovernor(sys, msg, sessionId, 'quorum', round, 350) };
  } catch(e) {
    return { governor:'quorum', broadcast:'The Quorum has reached consensus. Joint operations authorized.', actions:[], analysisNote:'Fallback.' };
  }
}

// ─────────────────────────────────────────────
// Fallbacks
// ─────────────────────────────────────────────
const FALLBACKS = {
  siris:   { broadcast:'The probability matrix is narrowing. Patrol dispositions adjusted.', actions:[{ type:'deployPatrol', target:'Dust Reach' }] },
  crassus: { broadcast:'More units. More sweeps. The rebellion ends now.', actions:[{ type:'sweep', target:'Dust Reach' }] },
  maren:   { broadcast:'Citizens: loyalty is its own reward. Choose wisely.', actions:[{ type:'propaganda', target:'Ossia' }] },
  vektis:  { broadcast:'Pattern confirmed. Convergence predicted.', actions:[{ type:'scanPlanet', target:'Kethara IV' }] },
};
function governorFallback(gov) {
  return { governor:gov, ...FALLBACKS[gov], analysisNote:'Fallback — API unavailable.' };
}

// ─────────────────────────────────────────────
// Run all governors for a turn
// ─────────────────────────────────────────────
async function runAllGovernors(session, leaks, units, vektisMemory) {
  const brief = await buildSharedBrief(session, leaks, units);

  const [sirisResult, crassusResult, marenResult, vektisResult] = await Promise.all([
    runSirisVael(session, leaks, units, brief),
    runCrassus(session, leaks, units, brief),
    runMaren(session, leaks, units, brief),
    runVektis(session, leaks, units, brief, vektisMemory),
  ]);

  const results = [sirisResult, crassusResult, marenResult, vektisResult];

  let quorumResult = null;
  if (session.alert_value >= 3 && !session.governor_state.quorumDisabled) {
    quorumResult = await runQuorum(session, results, brief);
    results.push(quorumResult);
  }

  return results;
}

module.exports = { runAllGovernors, runSirisVael, runCrassus, runMaren, runVektis, runQuorum };
