import { useRef, useEffect, useState, useCallback } from 'react';

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

const OWNER_COLORS = {
  'empire:crassus': '#e84040',
  'empire:siris':   '#a080e0',
  'empire:maren':   '#00d4c8',
  'empire:vektis':  '#e8a030',
};

const IDEOLOGY_COLORS = {
  liberation_front:  '#e84040',
  workers_alliance:  '#40c880',
  fringe_collective: '#8060c0',
  shadow_network:    '#606080',
  loyalist_splinter: '#3a8fe8',
};

function controlColor(controlledBy, factionMap) {
  if (!controlledBy || controlledBy === 'neutral') return null;
  if (OWNER_COLORS[controlledBy]) return OWNER_COLORS[controlledBy];
  if (controlledBy === 'rebel') return '#40c880';
  if (controlledBy.startsWith('faction:')) {
    const fid = controlledBy.slice(8);
    const ideology = factionMap?.[fid]?.ideology;
    return IDEOLOGY_COLORS[ideology] || '#e8d030';
  }
  return null;
}

function ownerColor(owner) {
  if (OWNER_COLORS[owner]) return OWNER_COLORS[owner];
  if (owner?.startsWith('rebel'))   return '#40c880';
  if (owner?.startsWith('faction')) return '#e8d030';
  return '#607080';
}

function unitIcon(type) {
  if (!type) return '?';
  if (['worldship','star_dreadnought','battlecruiser','star_destroyer'].includes(type)) return '▲';
  if (['heavy_cruiser','cruiser','frigate','corvette'].includes(type)) return '△';
  if (['space_station'].includes(type)) return '◉';
  if (['freighter','large_transport','small_transport','landing_ship'].includes(type)) return '⬡';
  if (['large_starfighter','starfighter','aerocraft'].includes(type)) return '◇';
  if (type === 'garrison')  return '■';
  if (type === 'militia')   return '●';
  if (type === 'operative') return '◆';
  return '▸';
}

function buildAdjSet(lanes) {
  const s = new Set();
  for (const [a, b] of (lanes || [])) { s.add(`${a}|${b}`); s.add(`${b}|${a}`); }
  return s;
}
function isAdj(adjSet, a, b) { return adjSet.has(`${a}|${b}`); }

function reachableIn(adjSet, allIds, fromId, steps) {
  let frontier = new Set([fromId]);
  for (let i = 0; i < steps; i++) {
    const next = new Set(frontier);
    for (const id of frontier)
      for (const other of allIds)
        if (!frontier.has(other) && isAdj(adjSet, id, other)) next.add(other);
    frontier = next;
  }
  return frontier;
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 4;

export function SectorMap({ game }) {
  if (!game) return null;

  const svgRef      = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });
  const vpInitRef   = useRef(false);   // fire auto-fit only once

  // Pan + zoom state — starts with default, set to auto-fit on first measure
  const [vp, setVp] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef    = useRef(null);
  const movedRef   = useRef(false);
  const [grabbing, setGrabbing] = useState(false);

  const { publicState, privateState, myColor, myName,
          selectedPlanet, setSelectedPlanet,
          selectedUnit, setSelectedUnit, move, moveUnit } = game || {};

  // Measure SVG and set auto-fit viewport once
  useEffect(() => {
    function measure() {
      const el = svgRef.current;
      if (!el) return;
      const w = el.clientWidth, h = el.clientHeight;
      setDims({ w, h });
      // Auto-fit: scale so the 2000×2000 world fits with 5% padding
      if (!vpInitRef.current && w > 0 && h > 0) {
        vpInitRef.current = true;
        const scale = Math.min(w, h) / 2100;
        setVp({ x: w / 2 - 1000 * scale, y: h / 2 - 1000 * scale, scale });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Prevent page scroll while hovering map
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const prevent = e => e.preventDefault();
    el.addEventListener('wheel', prevent, { passive: false });
    return () => el.removeEventListener('wheel', prevent);
  }, []);

  const planets      = publicState?.planetState   || [];
  const govState     = publicState?.governorState || {};
  const units        = publicState?.units         || [];
  const lanes        = publicState?.lanes         || [];
  const factionMap   = publicState?.factionMap    || {};
  const watchedLanes = publicState?.watchedLanes  || [];
  const lockedLanes  = publicState?.lockedLanes   || [];
  const myPlanet     = privateState?.currentPlanet;
  const isRebelPhase = publicState?.phase === 'rebel';
  const discoveredFleets = privateState?.discoveredFleets || [];

  const adjSet = buildAdjSet(lanes);
  const allIds = planets.map(p => p.id);
  const { w, h } = dims;

  // Planets use absolute 2000-unit world coordinates — render directly
  const pos = (p) => ({ x: p.x, y: p.y });

  function isWatched(a, b) { return watchedLanes.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a)); }
  function isLocked(a, b)  { return lockedLanes.some(([x,y])  => (x===a&&y===b)||(x===b&&y===a)); }

  const unitReachable = selectedUnit
    ? reachableIn(adjSet, allIds, selectedUnit.planet_id, selectedUnit.jump_distance ?? 1)
    : null;

  // ── Pan / zoom handlers ────────────────────────────────────────
  const handleMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, vpX: vp.x, vpY: vp.y };
    movedRef.current = false;
    setGrabbing(true);
    e.preventDefault();
  }, [vp]);

  const handleMouseMove = useCallback(e => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!movedRef.current && Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
    if (movedRef.current) {
      setVp(v => ({ ...v, x: dragRef.current.vpX + dx, y: dragRef.current.vpY + dy }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    setGrabbing(false);
  }, []);

  const handleWheel = useCallback(e => {
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    setVp(v => {
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.scale * factor));
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return v;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      return {
        scale: newScale,
        x: mx - (mx - v.x) * (newScale / v.scale),
        y: my - (my - v.y) * (newScale / v.scale),
      };
    });
  }, []);

  const resetView = useCallback(() => {
    const scale = Math.min(w, h) / 2100;
    setVp({ x: w / 2 - 1000 * scale, y: h / 2 - 1000 * scale, scale });
  }, [w, h]);

  // ── Planet click — only fires if no drag occurred ──────────────
  function handlePlanetClick(planetId) {
    if (movedRef.current) return;
    if (selectedUnit) {
      if (unitReachable?.has(planetId) && planetId !== selectedUnit.planet_id) {
        moveUnit(selectedUnit.id, planetId, selectedUnit.layer);
        setSelectedUnit(null);
      }
      setSelectedPlanet(planetId);
      return;
    }
    if (isRebelPhase && myPlanet && isAdj(adjSet, myPlanet, planetId)
        && planetId !== myPlanet && !isLocked(myPlanet, planetId)) {
      move(planetId);
    }
    setSelectedPlanet(planetId === selectedPlanet ? null : planetId);
  }

  const unitsByLocation = {};
  for (const u of units) {
    const key = `${u.planet_id}:${u.layer}`;
    if (!unitsByLocation[key]) unitsByLocation[key] = [];
    unitsByLocation[key].push(u);
  }

  const transform = `translate(${vp.x},${vp.y}) scale(${vp.scale})`;

  // Force re-render on visibility/focus changes
  const [, setRenderKey] = useState(0);
  useEffect(() => {
    const handleVisChange = () => setRenderKey(k => k + 1);
    window.addEventListener('focus', handleVisChange);
    return () => window.removeEventListener('focus', handleVisChange);
  }, []);

  return (
    <div className="map-area" style={{ position: 'relative' }}>
      <svg
        key={vp ? Math.floor(vp.x / 100) : 0} // Force re-render on pan
        ref={svgRef}
        className="map-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{ cursor: grabbing ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={resetView}
      >
        <g transform={transform}>

          {/* Lanes */}
          {lanes.map(([a, b], i) => {
            const pa = planets.find(p => p.id === a);
            const pb = planets.find(p => p.id === b);
            if (!pa || !pb) return null;
            const locked  = isLocked(a, b);
            const watched = isWatched(a, b);
            const hl = selectedPlanet === a || selectedPlanet === b;
            const unitHL = unitReachable &&
              (unitReachable.has(a) && unitReachable.has(b));
            let cls = 'lane';
            if (locked)       cls += ' lane-locked';
            else if (watched) cls += ' lane-watched';
            if (unitHL)       cls += ' lane-unit-reach';
            else if (hl && !locked) cls += ' lane-highlighted';
            const pa_ = pos(pa), pb_ = pos(pb);
            return <line key={i} className={cls} x1={pa_.x} y1={pa_.y} x2={pb_.x} y2={pb_.y} />;
          })}

          {/* Siris suspect halos */}
          {(govState.siris?.suspectPlanets || []).map(pid => {
            const p = planets.find(x => x.id === pid); if (!p) return null;
            const { x, y } = pos(p);
            return <circle key={`sh-${pid}`} className="suspect-halo" cx={x} cy={y} r={30} />;
          })}

          {/* Crassus sweep halos */}
          {(govState.crassus?.sweepTargets || []).map(pid => {
            const p = planets.find(x => x.id === pid); if (!p) return null;
            const { x, y } = pos(p);
            return <circle key={`ch-${pid}`} className="sweep-halo" cx={x} cy={y} r={36} />;
          })}

          {/* Vektis prediction halos */}
          {(govState.vektis?.predictedPlanets || []).map(pid => {
            const p = planets.find(x => x.id === pid); if (!p) return null;
            const { x, y } = pos(p);
            return <circle key={`vh-${pid}`} className="vektis-halo" cx={x} cy={y} r={26} />;
          })}

          {/* Planets */}
          {planets.map(planet => {
            const { x, y } = pos(planet);
            const color   = TC[planet.type] || '#607080';
            const isHere  = planet.id === myPlanet;
            const isSel   = planet.id === selectedPlanet;
            const canMove = isRebelPhase && isAdj(adjSet, myPlanet, planet.id)
                            && planet.id !== myPlanet && !isLocked(myPlanet, planet.id);
            const isUnitTarget = unitReachable?.has(planet.id)
                                 && planet.id !== selectedUnit?.planet_id;
            const hasPatrol = govState.siris?.patrolTokens?.[planet.id];
            const hasSweep  = govState.crassus?.sweepTargets?.includes(planet.id);
            const orbitUnits   = (unitsByLocation[`${planet.id}:orbit`]   || []).filter(u => u.unit_type !== 'police_patrol');
            const surfaceUnits = (unitsByLocation[`${planet.id}:surface`] || []).filter(u => u.unit_type !== 'police_patrol');

            return (
              <g key={planet.id} onClick={() => handlePlanetClick(planet.id)}
                style={{ cursor: movedRef.current ? 'grabbing' : 'pointer' }}>

                {/* Control territory glow */}
              {(() => {
                const cc = controlColor(planet.controlled_by, factionMap);
                return cc ? (
                  <circle cx={x} cy={y} r={26}
                    fill={cc} fillOpacity={0.13}
                    stroke={cc} strokeOpacity={0.35} strokeWidth={1.2} />
                ) : null;
              })()}

              <circle cx={x} cy={y} r={22} fill={color} opacity={0.04} />

                {/* Player marker */}
                {isHere && (
                  <>
                    <circle cx={x} cy={y} r={28} fill="none"
                      stroke={myColor || '#40c880'} strokeWidth={1.5}
                      className="player-pulse-outer" />
                    <circle cx={x} cy={y} r={20} fill="none"
                      stroke={myColor || '#40c880'} strokeWidth={2} strokeOpacity={0.9} />
                    <text x={x} y={y - 32} textAnchor="middle"
                      fontSize={9} fontFamily="var(--mono)"
                      fill={myColor || '#40c880'} fontWeight="bold"
                      style={{ letterSpacing: '0.08em', pointerEvents: 'none' }}>
                      ▼ {myName || 'YOU'}
                    </text>
                  </>
                )}

                <circle cx={x} cy={y} r={13}
                  stroke={color} strokeOpacity={isHere || isSel ? 1 : 0.4}
                  fill="none" strokeWidth={1}
                  className={isHere ? 'ring-rebel' : isSel ? 'ring-selected' : ''} />

                <circle cx={x} cy={y} r={7} fill={color} opacity={0.9} />
                <circle cx={x-2} cy={y-2} r={2} fill="rgba(255,255,255,0.35)" />

                {hasPatrol && (
                  <polygon points={`${x+13},${y-18} ${x+18},${y-13} ${x+13},${y-8} ${x+8},${y-13}`}
                    fill="rgba(160,80,220,0.75)" stroke="rgba(200,160,255,0.4)" strokeWidth={1} />
                )}
                {hasSweep && (
                  <rect x={x+7} y={y-22} width={9} height={9}
                    fill="rgba(232,64,64,0.7)" stroke="rgba(255,100,100,0.4)" strokeWidth={1} />
                )}

                {(() => {
                  // Show single red triangle if any empire/faction fleets present (excluding police)
                  const hasImperialUnits = (publicState?.units || [])
                    .some(u => u.planet_id === planet.id &&
                             (u.owner?.startsWith('empire:') || u.owner?.startsWith('faction:')) &&
                             u.unit_type !== 'police_patrol' &&
                             !u.is_hidden);
                  return hasImperialUnits ? (
                    <polygon key={`fleet-${planet.id}`} points={`${x},${y+5},${x-4},${y-3},${x+4},${y-3}`}
                      fill="#e84040" opacity={0.85} className="imperial-fleet-marker"
                      title="Imperial/Faction Fleet Present" />
                  ) : null;
                })()}

                {orbitUnits.slice(0, 4).map((u, i) => {
                  const angle = (i / Math.max(orbitUnits.length, 1)) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <text key={u.id}
                      x={x + Math.cos(angle) * 20} y={y + Math.sin(angle) * 20}
                      textAnchor="middle" dominantBaseline="central"
                      fontSize={8} fill={ownerColor(u.owner)}
                      style={{ cursor: u.owner?.startsWith('rebel') ? 'pointer' : 'default' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (!movedRef.current && u.owner?.startsWith('rebel'))
                          setSelectedUnit(selectedUnit?.id === u.id ? null : u);
                      }}
                      opacity={selectedUnit?.id === u.id ? 1 : 0.85}>
                      {unitIcon(u.unit_type)}
                    </text>
                  );
                })}

                {surfaceUnits.length > 0 && (
                  <text x={x} y={y + 34} textAnchor="middle" fontSize={7}
                    fill="rgba(200,220,255,0.7)" fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}>
                    {surfaceUnits.slice(0,5).map(u => unitIcon(u.unit_type)).join('')}
                    {surfaceUnits.length > 5 ? `+${surfaceUnits.length-5}` : ''}
                  </text>
                )}

                {canMove && !isSel && (
                  <circle cx={x} cy={y} r={17} fill="none"
                    stroke="rgba(0,212,200,0.35)" strokeWidth={1} strokeDasharray="3 3" />
                )}
                {isUnitTarget && (
                  <circle cx={x} cy={y} r={17} fill="none"
                    stroke="rgba(232,208,48,0.5)" strokeWidth={1.5} strokeDasharray="4 2" />
                )}

                <text x={x} y={y + (surfaceUnits.length > 0 ? 44 : 24)}
                  textAnchor="middle" className="planet-label"
                  fill={isHere ? (myColor||'#40c880') : isSel ? '#00d4c8' : '#5a7090'}
                  style={{ pointerEvents: 'none' }}>
                  {planet.name}
                </text>

                {planet.econ_output > 0 && (
                  <text x={x+14} y={y-14} textAnchor="middle"
                    fontSize={7} fill="rgba(232,208,48,0.6)" fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}>
                    {planet.econ_output}⚡
                  </text>
                )}

                {(() => {
                  const policeUnits = (publicState?.units || [])
                    .filter(u => u.planet_id === planet.id && u.unit_type === 'police_patrol');
                  if (policeUnits.length === 0) return null;
                  return (
                    <g key={`police-${planet.id}`}>
                      <rect x={x-10} y={y-28} width={20} height={10}
                        fill="rgba(160,120,80,0.7)" stroke="rgba(200,150,100,0.5)" strokeWidth={0.5} rx={2} />
                      <text x={x} y={y-21} textAnchor="middle"
                        fontSize={7} fill="rgba(255,220,180,0.9)" fontFamily="monospace" fontWeight="bold"
                        style={{ pointerEvents: 'none' }}>
                        🛡️ {policeUnits.length}
                      </text>
                    </g>
                  );
                })()}

                {/* Discovered fleets indicators */}
                {(() => {
                  const fleetsHere = discoveredFleets.filter(f => f.planet_id === planet.id);
                  if (fleetsHere.length === 0) return null;
                  return fleetsHere.map((fleet, idx) => {
                    const isRebel = fleet.fleet_owner?.startsWith('rebel:');
                    const isEmpire = fleet.fleet_owner?.startsWith('empire:');
                    const isFaction = fleet.fleet_owner?.startsWith('faction:');
                    const fleetColor = isRebel ? '#40c880' : isEmpire ? '#e84040' : '#e8d030';
                    const glowColor = isRebel ? 'rgba(64,200,128,0.6)' : isEmpire ? 'rgba(232,64,64,0.6)' : 'rgba(232,208,48,0.6)';
                    const angle = (idx / Math.max(fleetsHere.length, 1)) * Math.PI * 2 - Math.PI / 2;
                    const fx = x + Math.cos(angle) * 30;
                    const fy = y + Math.sin(angle) * 30;
                    const icon = isRebel ? '◆' : isEmpire ? '▲' : '●';
                    return (
                      <g key={`fleet-${fleet.fleet_owner}-${idx}`}>
                        {/* Glow halo */}
                        <circle cx={fx} cy={fy} r={16} fill={glowColor} opacity={0.4} />
                        <circle cx={fx} cy={fy} r={12} fill="none" stroke={fleetColor} strokeWidth={1.5} strokeOpacity={0.5} />

                        {/* Fleet icon */}
                        <text
                          x={fx} y={fy}
                          textAnchor="middle" dominantBaseline="central"
                          fontSize={16} fill={fleetColor} fontWeight="bold"
                          style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))' }}>
                          {icon}
                        </text>

                        {/* Unit count label */}
                        {fleet.unit_count && (
                          <text
                            x={fx + 10} y={fy + 10}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize={7} fill={fleetColor} fontWeight="bold"
                            style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))' }}>
                            {fleet.unit_count}
                          </text>
                        )}
                      </g>
                    );
                  });
                })()}
              </g>
            );
          })}

          {/* Selected unit ring */}
          {selectedUnit && (() => {
            const p = planets.find(x => x.id === selectedUnit.planet_id);
            if (!p) return null;
            const { x, y } = pos(p);
            return <circle cx={x} cy={y} r={24} fill="none"
              stroke="rgba(232,208,48,0.7)" strokeWidth={2} strokeDasharray="4 2" />;
          })()}

        </g>{/* end transform group */}
      </svg>

      {/* Zoom controls */}
      <div style={{
        position:'absolute', bottom:12, right:12, display:'flex', flexDirection:'column',
        gap:4, zIndex:10,
      }}>
        {[['＋', 1.25], ['－', 0.8], ['⌂', null]].map(([label, factor]) => (
          <button key={label} onClick={() => {
            if (factor === null) { resetView(); return; }
            setVp(v => {
              const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.scale * factor));
              // Zoom toward galaxy center (world 1000,1000)
              const cx = w / 2, cy = h / 2;
              return {
                scale: newScale,
                x: cx - (cx - v.x) * (newScale / v.scale),
                y: cy - (cy - v.y) * (newScale / v.scale),
              };
            });
          }} style={{
            width:28, height:28, background:'rgba(8,14,30,0.9)',
            border:'1px solid rgba(80,140,220,0.3)', borderRadius:4,
            color:'#5a9ae0', fontFamily:'var(--mono)', fontSize:14,
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }}>{label}</button>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position:'absolute', bottom:12, left:12,
        fontFamily:'var(--mono)', fontSize:8, color:'rgba(90,112,144,0.6)',
        pointerEvents:'none', letterSpacing:'0.06em',
      }}>DRAG · SCROLL TO ZOOM · DOUBLE-CLICK TO RESET</div>

      {/* Selected unit toast */}
      {selectedUnit && (
        <div style={{
          position:'absolute', bottom:48, left:'50%', transform:'translateX(-50%)',
          background:'rgba(8,14,30,0.96)', border:'1px solid rgba(232,208,48,0.4)',
          borderRadius:4, padding:'6px 14px', fontFamily:'var(--mono)',
          fontSize:10, color:'#e8d030', letterSpacing:'0.1em', pointerEvents:'none', zIndex:10,
        }}>
          {unitIcon(selectedUnit.unit_type)} {(selectedUnit.designation||selectedUnit.unit_type).toUpperCase()}
          — JUMP RANGE: {selectedUnit.jump_distance ?? 1} — CLICK TARGET PLANET
        </div>
      )}
    </div>
  );
}
