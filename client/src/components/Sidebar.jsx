import { useState } from 'react';
import { FactionPanel } from './FactionPanel';

const TL = {
  'Deep Core':             'Deep Core',
  'Core Worlds':           'Core Worlds',
  'Colonies':              'Colonies',
  'Inner Rim':             'Inner Rim',
  'Expansion Region':      'Expansion Region',
  'Mid Rim':               'Mid Rim',
  'Outer Rim Territories': 'Outer Rim',
  'Tingel Arm':            'Tingel Arm',
  'Unknown Regions':       'Unknown Regions',
  'Wild Space':            'Wild Space',
};
const IDEOLOGY_COLORS = {
  liberation_front:  '#e84040',
  workers_alliance:  '#40c880',
  fringe_collective: '#8060c0',
  shadow_network:    '#606080',
  loyalist_splinter: '#3a8fe8',
};

const GOVERNOR_LABELS = {
  'empire:crassus': { label:'Crassus-9 (Military)', color:'#e84040' },
  'empire:siris':   { label:'Siris-Vael (Intel)',   color:'#a080e0' },
  'empire:maren':   { label:'Maren Osk (Civil)',    color:'#00d4c8' },
  'empire:vektis':  { label:'Vektis-4 (Adaptive)',  color:'#e8a030' },
};

function controlLabel(controlledBy, factionMap) {
  if (!controlledBy || controlledBy === 'neutral') return { label:'Uncontrolled', color:'#5a7090' };
  if (GOVERNOR_LABELS[controlledBy]) return GOVERNOR_LABELS[controlledBy];
  if (controlledBy === 'rebel') return { label:'Rebel Controlled', color:'#40c880' };
  if (controlledBy.startsWith('faction:')) {
    const fid = controlledBy.slice(8);
    const f   = factionMap?.[fid];
    if (f) return { label: f.name, color: IDEOLOGY_COLORS[f.ideology] || '#e8d030' };
    return { label:'Unknown Faction', color:'#e8d030' };
  }
  return { label: controlledBy, color:'#5a7090' };
}

const TC = {
  'Deep Core':             '#c0d8ff',
  'Core Worlds':           '#3a8fe8',
  'Colonies':              '#5ab0d0',
  'Inner Rim':             '#e8d030',
  'Expansion Region':      '#b06820',
  'Mid Rim':               '#40c880',
  'Outer Rim Territories': '#607080',
  'Tingel Arm':            '#5080a0',
  'Unknown Regions':       '#6040a0',
  'Wild Space':            '#803060',
};

function unitIcon(type) {
  if (!type) return '?';
  if (['worldship','star_dreadnought','battlecruiser','star_destroyer'].includes(type)) return '▲';
  if (['heavy_cruiser','cruiser','frigate','corvette'].includes(type)) return '△';
  if (type === 'space_station') return '◉';
  if (['freighter','large_transport','small_transport','landing_ship'].includes(type)) return '⬡';
  if (['large_starfighter','starfighter','aerocraft'].includes(type)) return '◇';
  if (type === 'garrison')  return '■';
  if (type === 'militia')   return '●';
  if (type === 'operative') return '◆';
  return '▸';
}

function UnitRow({ u, onToggleHidden }) {
  const color = u.is_hidden ? '#a080e0' : '#40c880';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6,
      padding:'4px 0', borderBottom:'1px solid rgba(80,140,220,0.08)' }}>
      <span style={{ fontSize:12, color, width:14, textAlign:'center' }}>
        {unitIcon(u.unit_type)}
      </span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text)' }}>
          {(u.designation || u.unit_type).toUpperCase()}
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'var(--text-dim)' }}>
          STR {u.strength} · HP {u.hp} · JUMP {u.jump_distance ?? 1}
          {u.transport_capacity > 0 ? ` · CAP ${u.transport_capacity}` : ''}
        </div>
      </div>
      <span style={{ fontFamily:'var(--mono)', fontSize:7,
        color: u.is_hidden ? '#a080e0' : 'var(--text-dim)' }}>
        {u.is_hidden ? 'HIDDEN' : u.layer.toUpperCase()}
      </span>
      {onToggleHidden && (
        <button onClick={() => onToggleHidden(u.id)} style={{
          padding: '2px 4px', fontSize: 7, fontFamily: 'var(--mono)',
          background: u.is_hidden ? 'rgba(160,128,224,0.15)' : 'rgba(64,200,128,0.15)',
          border: `1px solid ${u.is_hidden ? 'rgba(160,128,224,0.3)' : 'rgba(64,200,128,0.3)'}`,
          color: u.is_hidden ? '#a080e0' : '#40c880',
          borderRadius: 2, cursor: 'pointer',
        }}>
          {u.is_hidden ? 'REVEAL' : 'HIDE'}
        </button>
      )}
    </div>
  );
}

function isAdj(lanes, a, b) {
  return (lanes || []).some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
}

// All available rebel unit types (specific named ships + base classes)
const ALL_REBEL_UNITS = [
  // Ground
  { type:'militia',                baseClass:'militia',          cost:2,  label:'Militia',                    desc:'Hidden rebel ground forces. Combat ready.' },
  { type:'operative',              baseClass:'operative',        cost:3,  label:'Operative',                  desc:'Covert agent. Stealth surface unit.' },
  // Aerocraft
  { type:'t_47_airspeeder',        baseClass:'aerocraft',        cost:2,  label:'T-47 Airspeeder',            desc:'Atmospheric only. Fast and hidden.' },
  // Starfighters (rebel-specific real ships)
  { type:'t_65_x_wing',            baseClass:'starfighter',      cost:5,  label:'T-65 X-Wing',                desc:'Versatile assault starfighter. Hidden.' },
  { type:'rz_1_a_wing',            baseClass:'starfighter',      cost:5,  label:'RZ-1 A-Wing',                desc:'Fast interceptor. Long jump range.' },
  { type:'btl_b_y_wing',           baseClass:'starfighter',      cost:5,  label:'BTL-B Y-Wing',               desc:'Heavy bomber. Durable. Hidden.' },
  { type:'sf_01_b_wing',           baseClass:'starfighter',      cost:6,  label:'SF-01 B-Wing',               desc:'Fighter-bomber. Strong firepower.' },
  { type:'arc_170',                baseClass:'starfighter',      cost:5,  label:'ARC-170',                    desc:'Multi-crew fighter. Well-rounded.' },
  // Large Starfighters
  { type:'ut_60d_u_wing_fighter',  baseClass:'large_starfighter', cost:5, label:'UT-60D U-Wing',              desc:'Support fighter. Long range. Hidden.' },
  { type:'e_wing_escort_fighter',  baseClass:'large_starfighter', cost:6, label:'E-Wing Escort Fighter',      desc:'Heavy escort. Long jump range.' },
  // Transports / Logistics
  { type:'small_transport',        baseClass:'small_transport',  cost:6,  label:'Covert Transport',           desc:'Hidden courier. Moves rebel forces.' },
  { type:'large_transport',        baseClass:'large_transport',  cost:4,  label:'Alliance Transport',         desc:'Troop carrier. Visible.' },
  { type:'landing_ship',           baseClass:'landing_ship',     cost:4,  label:'Landing Ship',               desc:'Assault lander. Surface deployment.' },
  { type:'freighter',              baseClass:'freighter',        cost:8,  label:'Rebel Freighter',            desc:'Armed cargo ship. Hidden from governors.' },
  // Warships
  { type:'corvette',               baseClass:'corvette',         cost:8,  label:'CR90 Corvette',              desc:'Nimble escort. Anti-fighter specialist.' },
  { type:'frigate',                baseClass:'frigate',          cost:9,  label:'Nebulon-B Frigate',          desc:'Medical frigate. Versatile warship.' },
  { type:'cruiser',                baseClass:'cruiser',          cost:10, label:'Mon Calamari Cruiser',       desc:'Standard rebel warship.' },
  { type:'heavy_cruiser',          baseClass:'heavy_cruiser',    cost:11, label:'MC80 Star Cruiser',          desc:'Heavy rebel capital ship.' },
  { type:'star_destroyer',         baseClass:'star_destroyer',   cost:11, label:'MC Star Destroyer',          desc:'Rebel capital equivalent.' },
  { type:'battlecruiser',          baseClass:'battlecruiser',    cost:12, label:'MC80 Home One-class',        desc:'Flagship-class cruiser. Rare.' },
];

const ACTION_DESCRIPTIONS = {
  recruit:  'Loyalty -3 · +1cr · 20% chance: free militia spawns',
  intel:    'Loyalty -2 · +1cr · Reveal hidden units & faction cells',
  sabotage: 'Loyalty -8 · +2cr · 18% chance: block empire production 2 rounds [OVERT]',
  incite:   'Loyalty -10 · +2cr · 18% chance: damage/kill imperial unit [OVERT]',
  hide:     'Suspicion -1 · Lay low and avoid detection',
};

function FleetTab({ game, privateState, planetState, productionQueue }) {
  const myUnits  = privateState?.myUnits || [];
  const myPlanet = privateState?.currentPlanet;
  const credits = privateState?.credits || 0;
  const { produceUnit, toggleUnitHidden } = game;

  const escort   = myUnits.filter(u => u.layer === 'orbit' && u.planet_id === myPlanet);
  const deployed = myUnits.filter(u => !(u.layer === 'orbit' && u.planet_id === myPlanet));

  const byPlanet = {};
  for (const u of deployed) {
    if (!byPlanet[u.planet_id]) byPlanet[u.planet_id] = [];
    byPlanet[u.planet_id].push(u);
  }

  // Get available units for production at current planet
  const currentPlanetQueue = (productionQueue || []).filter(q => q.planet_id === myPlanet);
  const inProgress = currentPlanetQueue.map(q => ({ ...q, remaining: q.rounds_remaining }));

  return (
    <div style={{ overflowY:'auto', flex:1, padding:'0 13px' }}>
      <div className="sb">
        <div className="sbt" style={{ color:'#40c880' }}>◉ Traveling with you ({escort.length})</div>
        {escort.length === 0
          ? <div className="empty-state">No orbital units in escort</div>
          : escort.map(u => <UnitRow key={u.id} u={u} onToggleHidden={toggleUnitHidden} />)}
        {escort.length > 0 && (
          <div style={{ fontFamily:'var(--mono)', fontSize:7, color:'#5a7090', marginTop:6, letterSpacing:'0.08em' }}>
            Orbital units move with you automatically
          </div>
        )}
      </div>

      <div className="sb">
        <div className="sbt" style={{ color:'#e8a030' }}>⬡ Deployed ({deployed.length})</div>
        {deployed.length === 0
          ? <div className="empty-state">No deployed units</div>
          : Object.entries(byPlanet).map(([pid, pUnits]) => {
              const pInfo = (planetState || []).find(p => p.id === pid);
              return (
                <div key={pid} style={{ marginBottom:8 }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a9ae0',
                    marginBottom:3, letterSpacing:'0.08em' }}>
                    {pInfo?.name || pid}
                  </div>
                  {pUnits.map(u => <UnitRow key={u.id} u={u} onToggleHidden={toggleUnitHidden} />)}
                </div>
              );
            })}
        {deployed.length > 0 && (
          <div style={{ fontFamily:'var(--mono)', fontSize:7, color:'#5a7090', marginTop:6, letterSpacing:'0.08em' }}>
            Surface units stay when you move
          </div>
        )}
      </div>

      {myPlanet && (
        <div className="sb">
          <div className="sbt" style={{ color:'#e8d030' }}>⚙ Production at {(planetState || []).find(p => p.id === myPlanet)?.name || myPlanet}</div>

          {inProgress.length > 0 && (
            <div style={{ marginBottom:8 }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#a080e0', marginBottom:4 }}>
                IN PROGRESS:
              </div>
              {inProgress.map(q => (
                <div key={q.id} style={{
                  fontFamily:'var(--mono)', fontSize:8, padding:'4px 6px',
                  background:'rgba(160,128,224,0.08)', borderRadius:3, marginBottom:3
                }}>
                  <div>{q.unit_type} ({q.remaining} rounds)</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom:6, paddingTop:6, borderTop:'1px solid rgba(80,140,220,0.1)' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090', marginBottom:4, fontWeight:500 }}>
              QUEUE NEW UNIT ({credits}cr available)
            </div>
            {(() => {
              // Get factions with presence at current planet
              const { publicState } = game;
              const planet = publicState?.planetState?.find(p => p.id === myPlanet);
              const cells = publicState?.units?.filter(u => u.planet_id === myPlanet && u.owner?.startsWith('faction:')) || [];
              const factionIds = [...new Set(cells.map(u => u.owner.slice(8)))];

              // Collect all researched units from all factions at this planet
              const researchedUnits = new Set();
              for (const fid of factionIds) {
                const factionData = privateState?.factions?.find(f => f.id === fid);
                if (factionData?.unit_research) {
                  Object.entries(factionData.unit_research).forEach(([unitType, data]) => {
                    if (data.unlocked) researchedUnits.add(unitType);
                  });
                }
              }

              // Show only researched units that player can afford
              const availableUnits = ALL_REBEL_UNITS.filter(u =>
                researchedUnits.has(u.type) && credits >= u.cost
              );

              if (availableUnits.length === 0) {
                return <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090' }}>No researched units available</div>;
              }

              return availableUnits.map(u => (
                <button
                  key={u.type}
                  onClick={() => produceUnit(myPlanet, u.type)}
                  style={{
                    width:'100%',
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center',
                    padding:'5px 6px',
                    marginBottom:3,
                    background:'rgba(64,200,128,0.08)',
                    border:'1px solid rgba(64,200,128,0.2)',
                    borderRadius:3,
                    color:'#40c880',
                    fontFamily:'var(--mono)',
                    fontSize:8,
                    cursor:'pointer',
                    textAlign:'left'
                  }}
                >
                  <span>{u.label}</span>
                  <span style={{ color:'#5a7090', fontWeight:600 }}>{u.cost}cr</span>
                </button>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ game }) {
  const {
    publicState, privateState, feedEntries, governorThinking,
    selectedPlanet, playerId, submitTurn, endTurnEarly,
    recruit, intel, sabotage, incite, hide,
    produceUnit,
  } = game;

  const [sidebarTab, setSidebarTab] = useState('actions'); // actions|fleet|factions|feed|log

  if (!publicState) return null;

  const { planetState, governorState, rebellionStrength, empireLevel,
          players, phase, submittedPlayers, units, productionQueue } = publicState;

  const lanes         = publicState.lanes || [];
  const factionMap    = publicState.factionMap || {};
  const planet        = selectedPlanet ? planetState?.find(p => p.id === selectedPlanet) : null;
  const myPlanet      = privateState?.currentPlanet;
  const myPlanetInfo  = myPlanet ? planetState?.find(p => p.id === myPlanet) : null;
  const isRebelPhase  = phase === 'rebel';
  const actionsLeft   = privateState?.actionsRemaining ?? 0;
  const credits       = privateState?.credits ?? 0;
  const forceAlignment = privateState?.forceAlignment ?? 0;
  const forceStrength = privateState?.forceStrength ?? 0;
  const forceSide = privateState?.forceSide ?? 'grey';
  const myUnits = privateState?.myUnits || [];
  const jediAlive = myUnits.some(u => u.unit_type === 'jedi_avatar');
  const alreadySubmitted = submittedPlayers?.includes(playerId);
  const isHere        = planet?.id === myPlanet;
  const isAdjacent    = planet && myPlanet && isAdj(lanes, myPlanet, planet.id);
  const lockedLanes   = publicState.lockedLanes || [];
  const moveLocked    = planet && myPlanet && lockedLanes.some(
    ([a,b]) => (a===myPlanet&&b===planet.id)||(a===planet.id&&b===myPlanet)
  );

  const govGovState = governorState;

  return (
    <aside className="sidebar">
      {/* Rebellion + Empire */}
      <div className="sb">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#5a7090' }}>REBELLION</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#40c880' }}>{rebellionStrength}%</span>
        </div>
        <div className="rbar"><div className="rfill" style={{ width:`${rebellionStrength}%` }}/></div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, marginBottom:2 }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#5a7090' }}>EMPIRE</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#e84040' }}>{empireLevel}%</span>
        </div>
        <div className="rbar"><div className="rfill" style={{ width:`${empireLevel}%`, background:'var(--accent-red)' }}/></div>
      </div>

      {/* Player list */}
      <div className="sb">
        <div className="sbt">Rebel cell</div>
        {players?.map(p => (
          <div key={p.id} className="player-row">
            <div className="player-dot" style={{ background:p.color, opacity:p.connected?1:0.3 }}/>
            <span style={{ flex:1, fontSize:11, color: p.id===playerId ? p.color : 'var(--text)' }}>
              {p.displayName}{p.id===playerId?' (you)':''}
            </span>
            {submittedPlayers?.includes(p.id) && (
              <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#40c880' }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:3, padding:'6px 13px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {['actions','fleet','factions','feed','log'].map(t => (
          <button key={t} onClick={() => setSidebarTab(t)} style={{
            flex:1, padding:'4px 0',
            background: sidebarTab===t ? 'rgba(58,143,232,0.15)' : 'transparent',
            border: `1px solid ${sidebarTab===t ? 'rgba(58,143,232,0.4)' : 'rgba(80,140,220,0.18)'}`,
            borderRadius:3, color: sidebarTab===t ? '#3a8fe8' : '#5a7090',
            fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.08em', cursor:'pointer',
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* ACTIONS TAB */}
      {sidebarTab === 'actions' && (
        <div style={{ overflowY:'auto', flex:1 }}>

          {/* ── YOU ARE HERE ── */}
          {myPlanetInfo && (
            <div className="sb" style={{
              borderLeft: `3px solid ${TC[myPlanetInfo.type] || '#607080'}`,
              background: 'rgba(64,200,128,0.04)',
            }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#40c880',
                letterSpacing:'0.12em', marginBottom:4 }}>◉ YOUR LOCATION</div>
              <div style={{ fontFamily:'var(--sans)', fontSize:15, fontWeight:600,
                color:'#e8f4ff', marginBottom:2 }}>{myPlanetInfo.name}</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:8,
                  color: TC[myPlanetInfo.type], background:`${TC[myPlanetInfo.type]}18`,
                  border:`1px solid ${TC[myPlanetInfo.type]}44`,
                  borderRadius:3, padding:'1px 6px' }}>
                  {TL[myPlanetInfo.type] || myPlanetInfo.type}
                </span>
                <span style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090' }}>
                  SUSPICION: <span style={{ color: myPlanetInfo.suspicion>1?'#e84040':'#40c880' }}>
                    {['CLEAR','LOW','ELEVATED','HIGH','CRITICAL'][Math.min(myPlanetInfo.suspicion,4)]}
                  </span>
                </span>
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090', marginTop:4 }}>
                {actionsLeft} ACTION{actionsLeft!==1?'S':''} LEFT · {credits}cr
              </div>
            </div>
          )}

          {/* Force Panel */}
          <div className="sb" style={{
            background: forceSide === 'light' ? 'rgba(64,200,128,0.08)' : forceSide === 'dark' ? 'rgba(232,64,64,0.08)' : 'rgba(160,128,224,0.04)',
            borderLeft: `3px solid ${forceSide === 'light' ? '#40c880' : forceSide === 'dark' ? '#e84040' : '#a080e0'}`,
          }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#a080e0',
              letterSpacing:'0.12em', marginBottom:4 }}>
              {forceSide === 'light' ? '◈ LIGHT SIDE' : forceSide === 'dark' ? '◆ DARK SIDE' : '◇ GREY'}
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090', marginBottom:2 }}>
              Alignment: <span style={{ color: forceAlignment > 0 ? '#40c880' : forceAlignment < 0 ? '#e84040' : '#a080e0' }}>
                {forceAlignment > 0 ? '+' : ''}{forceAlignment}
              </span>
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090', marginBottom:2 }}>
              Force Strength: <span style={{ color:'#e8f4ff' }}>{forceStrength}</span>
            </div>
            {!jediAlive && (
              <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#e84040', marginTop:4 }}>
                ⚠ YOUR JEDI HAS FALLEN
              </div>
            )}
          </div>

          {/* Planet detail */}
          <div className="sb">
            {!planet ? (
              <div className="empty-state">— Select a planet —</div>
            ) : (
              <>
                <div className="pname">
                  {planet.name}
                  {isHere && <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#40c880', marginLeft:6 }}>◉ HERE</span>}
                </div>
                <div className="pbadge" style={{
                  background:`${TC[planet.type]}22`, color:TC[planet.type],
                  border:`1px solid ${TC[planet.type]}44`,
                }}>{TL[planet.type]}</div>

                {govGovState?.siris?.patrolTokens?.[planet.id] && (
                  <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#a080e0', marginBottom:4 }}>◆ SIRIS-VAEL PATROL</div>
                )}
                {govGovState?.crassus?.sweepTargets?.includes(planet.id) && (
                  <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#e84040', marginBottom:4 }}>■ CRASSUS SWEEP</div>
                )}

                <p className="planet-desc">{planet.desc}</p>

                <div className="drow"><span className="dk">POPULATION</span><span className="dv">{planet.pop?.toLocaleString()}</span></div>
                <div className="drow">
                  <span className="dk">LOYALTY</span>
                  <span className="dv" style={{ color: planet.loyalty>60?'#e84040':planet.loyalty>40?'#e8a030':'#40c880' }}>
                    {planet.loyalty}%
                  </span>
                </div>
                <div className="drow">
                  <span className="dk">SUSPICION</span>
                  <span className="dv" style={{ color: planet.suspicion>1?'#e84040':planet.suspicion>0?'#e8a030':'#40c880' }}>
                    {['CLEAR','LOW','ELEVATED','HIGH','CRITICAL'][Math.min(planet.suspicion,4)]}
                  </span>
                </div>
                <div className="drow">
                  <span className="dk">ECON OUTPUT</span>
                  <span className="dv" style={{ color:'#e8d030' }}>{planet.econ_output ?? 0}pts/round</span>
                </div>
                {(() => {
                  const ctrl = controlLabel(planet.controlled_by, factionMap);
                  return (
                    <div className="drow" style={{ marginTop:4 }}>
                      <span className="dk">CONTROLLED BY</span>
                      <span className="dv" style={{ color: ctrl.color, fontWeight:600 }}>{ctrl.label}</span>
                    </div>
                  );
                })()}
                <div className="sbar"><div className="sfill" style={{ width:`${Math.min(planet.suspicion*25,100)}%` }}/></div>
              </>
            )}
          </div>

          {/* Action buttons */}
          {planet && isRebelPhase && !alreadySubmitted && (
            <div className="sb">
              <div className="sbt">Actions ({actionsLeft} left · {credits}cr)</div>

              {isAdjacent && !isHere && (
                <button className="abtn move" disabled={actionsLeft<=0||moveLocked}
                  onClick={() => game.move(planet.id)}>
                  <span>{moveLocked ? `Move [LOCKED]` : `Move to ${planet.name}`}</span>
                  <span className="btag tm">MOVE</span>
                </button>
              )}

              {isHere && <>
                <div style={{ marginBottom:2 }}>
                  <button className="abtn covert" disabled={actionsLeft<=0} onClick={() => recruit(planet.id)}>
                    <span>Recruit sympathizers</span><span className="btag tc">COVERT</span>
                  </button>
                  <div style={{ fontSize:'9px', color:'rgba(140,160,200,0.45)', padding:'1px 9px 4px', lineHeight:1.3 }}>
                    {ACTION_DESCRIPTIONS.recruit}
                  </div>
                </div>
                <div style={{ marginBottom:2 }}>
                  <button className="abtn covert" disabled={actionsLeft<=0} onClick={() => intel(planet.id)}>
                    <span>Gather intelligence</span><span className="btag tc">COVERT</span>
                  </button>
                  <div style={{ fontSize:'9px', color:'rgba(140,160,200,0.45)', padding:'1px 9px 4px', lineHeight:1.3 }}>
                    {ACTION_DESCRIPTIONS.intel}
                  </div>
                </div>
                {(['Core Worlds','Deep Core','Colonies','Inner Rim'].includes(planet.type)) && (
                  <div style={{ marginBottom:2 }}>
                    <button className="abtn overt" disabled={actionsLeft<=0} onClick={() => sabotage(planet.id)}>
                      <span>Sabotage infrastructure</span><span className="btag to">OVERT</span>
                    </button>
                    <div style={{ fontSize:'9px', color:'rgba(140,160,200,0.45)', padding:'1px 9px 4px', lineHeight:1.3 }}>
                      {ACTION_DESCRIPTIONS.sabotage}
                    </div>
                  </div>
                )}
                {planet.loyalty < 70 && (
                  <div style={{ marginBottom:2 }}>
                    <button className="abtn overt" disabled={actionsLeft<=0} onClick={() => incite(planet.id)}>
                      <span>Incite unrest</span><span className="btag to">OVERT</span>
                    </button>
                    <div style={{ fontSize:'9px', color:'rgba(140,160,200,0.45)', padding:'1px 9px 4px', lineHeight:1.3 }}>
                      {ACTION_DESCRIPTIONS.incite}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom:2 }}>
                  <button className="abtn covert" disabled={actionsLeft<=0} onClick={() => hide(planet.id)}>
                    <span>Lie low (decay suspicion)</span><span className="btag tc">COVERT</span>
                  </button>
                  <div style={{ fontSize:'9px', color:'rgba(140,160,200,0.45)', padding:'1px 9px 4px', lineHeight:1.3 }}>
                    {ACTION_DESCRIPTIONS.hide}
                  </div>
                </div>

                {/* Unit production */}
                {(() => {
                  const rebelOwned = planet.controlled_by === 'rebel' ||
                                    planet.controlled_by?.startsWith('faction:');
                  const factions = privateState?.factions || [];
                  const factionsHere = factions.filter(f =>
                    f.cells?.some(c => c.planet_id === planet.id)
                  );
                  const hasFactionPresence = factionsHere.length > 0;

                  // Determine available classes using baseClass
                  let allowedClasses = null;  // null = all allowed
                  if (hasFactionPresence) {
                    // Collect all ship classes available from factions here
                    allowedClasses = new Set();
                    factionsHere.forEach(f => {
                      (f.allowed_ship_classes || []).forEach(c => allowedClasses.add(c));
                      (f.unlocked_ship_classes || []).forEach(c => allowedClasses.add(c));
                    });
                  }

                  // If planet is rebel-owned, player has access to all rebel units
                  // Otherwise, only faction-provided units are available
                  const availableUnits = rebelOwned
                    ? ALL_REBEL_UNITS
                    : (allowedClasses === null ? ALL_REBEL_UNITS : ALL_REBEL_UNITS.filter(u => allowedClasses.has(u.baseClass)));

                  const canProduce = planet.econ_output > 0 && credits >= 2 &&
                                     (rebelOwned || hasFactionPresence);

                  // Unit production moved to Fleet tab
                  return null;
                })()}
              </>}

              {!isHere && !isAdjacent && (
                <div className="empty-state" style={{ padding:'4px 0' }}>Not reachable</div>
              )}
            </div>
          )}

          {/* PvP combat */}
          {isHere && isRebelPhase && !alreadySubmitted && (() => {
            const otherRebels = {};
            for (const u of (units || [])) {
              if (!u.owner?.startsWith('rebel:')) continue;
              const ownerId = u.owner.slice(6);
              if (ownerId === playerId) continue;
              if (u.planet_id !== myPlanet || u.is_hidden) continue;
              if (!otherRebels[ownerId]) otherRebels[ownerId] = { orbit:0, surface:0 };
              otherRebels[ownerId][u.layer]++;
            }
            const entries = Object.entries(otherRebels);
            if (entries.length === 0) return null;
            return (
              <div style={{ marginTop:6, paddingTop:6, borderTop:'1px solid rgba(232,64,64,0.2)' }}>
                <div className="sbt" style={{ color:'#e84040' }}>Rebel forces present</div>
                {entries.flatMap(([targetId, counts]) => {
                  const tp = players?.find(p => p.id === targetId);
                  return ['orbit','surface']
                    .filter(layer => counts[layer] > 0)
                    .map(layer => (
                      <button key={`${targetId}-${layer}`} className="abtn overt"
                        disabled={actionsLeft <= 0}
                        onClick={() => game.attackRebel(targetId, layer)}
                        style={{ borderColor:'rgba(232,64,64,0.3)' }}>
                        <span style={{ color: tp?.color }}>Attack {tp?.displayName}</span>
                        <span style={{ flex:1, fontSize:8, color:'#5a7090', textAlign:'center' }}>{layer.toUpperCase()}</span>
                        <span className="btag to">PVP</span>
                      </button>
                    ));
                })}
              </div>
            );
          })()}

          {/* Turn control */}
          {isRebelPhase && (
            <div className="sb">
              {alreadySubmitted ? (
                <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'#5a7090',
                  letterSpacing:'0.1em', textAlign:'center', padding:'4px 0' }}>
                  Waiting for other rebels…
                </div>
              ) : (
                <>
                  <button className="end-turn-btn" onClick={submitTurn}>Submit turn</button>
                  <button className="end-early-btn" onClick={endTurnEarly}>End turn early (all skip)</button>
                </>
              )}
            </div>
          )}

          {governorThinking && (
            <div className="sb" style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#a080e0', flex:1 }}>
                Governor council deliberating
              </span>
              <div className="td"/><div className="td"/><div className="td"/>
            </div>
          )}

          {/* Production queue */}
          {(privateState?.myProductionQueue?.length > 0 ||
            publicState?.productionQueue?.length > 0) && (
            <div className="sb">
              <div className="sbt">Production queue</div>
              {[...(privateState?.myProductionQueue||[]),
                ...(publicState?.productionQueue||[])].map((q,i) => (
                <div key={i} style={{ fontFamily:'var(--mono)', fontSize:9,
                  color:'#5a7090', padding:'2px 0' }}>
                  {q.unit_type} @ {q.planet_id} — {q.rounds_remaining} round{q.rounds_remaining>1?'s':''} left
                </div>
              ))}
            </div>
          )}

          {/* Siris intel strip */}
          <div className="sb intel-strip">
            <div className="it">SIRIS-VAEL // ANALYSIS</div>
            <div className="ir"><span>PROBABLE REGION</span>
              <span className="iv">{govGovState?.siris?.probableRegion||'—'}</span></div>
            <div className="ir"><span>CONFIDENCE</span>
              <span className={`iv ${['CERTAIN','HIGH'].includes(govGovState?.siris?.confidence)?'ih':govGovState?.siris?.confidence==='MEDIUM'?'im':''}`}>
                {govGovState?.siris?.confidence||'—'}
              </span>
            </div>
            <div className="ir" style={{ border:'none' }}>
              <span>SUSPECTS</span>
              <span className="iv ih">{govGovState?.siris?.suspectPlanets?.length||0}</span>
            </div>
          </div>
        </div>
      )}

      {/* FLEET TAB */}
      {sidebarTab === 'fleet' && <FleetTab game={game} privateState={privateState} planetState={planetState} productionQueue={productionQueue} />}

      {/* FACTIONS TAB */}
      {sidebarTab === 'factions' && (
        <div style={{ overflowY:'auto', flex:1, padding:'0 13px' }}>
          <FactionPanel game={game} />
        </div>
      )}

      {/* FEED TAB */}
      {sidebarTab === 'feed' && (
        <div style={{ overflowY:'auto', flex:1 }} id="gov-feed">
          {feedEntries.length === 0 && <div className="empty-state">No broadcasts yet</div>}
          {feedEntries.map((e, i) => (
            <div key={i} className="fe">
              <div className={`fg gov-${e.gov}`}>[{e.gov?.toUpperCase()}]</div>
              <div className="ft">{e.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* LOG TAB */}
      {sidebarTab === 'log' && (
        <div style={{ overflowY:'auto', flex:1, padding:'8px 13px' }}>
          <div className="sbt">Sealed move log <span style={{ color:'#a080e0', fontSize:7 }}>(REBEL EYES ONLY)</span></div>
          <div className="mlog">
            {[...(privateState?.sealedLog||[])].reverse().map((e, i) => (
              <div key={i} className={`le${!e.covert?' overt':''}${e.label?.includes('LEAKED')?' leak':''}`}>
                R{e.round} · {e.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
