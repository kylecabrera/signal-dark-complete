import { useState } from 'react';

const IDEOLOGY_LABELS = {
  liberation_front:  'Liberation Front',
  workers_alliance:  "Worker's Alliance",
  fringe_collective: 'Fringe Collective',
  shadow_network:    'Shadow Network',
  loyalist_splinter: 'Loyalist Splinter',
};

const IDEOLOGY_COLORS = {
  liberation_front:  '#e84040',
  workers_alliance:  '#40c880',
  fringe_collective: '#607080',
  shadow_network:    '#6040a0',
  loyalist_splinter: '#3a8fe8',
};

export function FactionPanel({ game }) {
  const { privateState, publicState, playerId,
          contribute, foundFaction, foundCell, investigate, denounce,
          investigateResult, setInvestigateResult } = game;
  const factions = privateState?.factions || [];

  const [tab, setTab] = useState('browse'); // browse|found
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [contributeAmount, setContributeAmount] = useState(1);
  const [newName, setNewName]       = useState('');

  const credits  = privateState?.credits || 0;
  const myPlanet = privateState?.currentPlanet;
  const planets  = publicState?.planetState || [];

  function handleContribute() {
    if (!selectedFaction || contributeAmount < 1) return;
    contribute(selectedFaction.id, contributeAmount);
    setSelectedFaction(null);
  }

  function handleFound() {
    if (!newName.trim()) return;
    foundFaction(newName.trim(), 'liberation_front', myPlanet);
    setNewName(''); setTab('browse');
  }

  function handleInvestigate(factionId) {
    investigate(factionId);
  }

  function handleDenounce(factionId) {
    if (!window.confirm('Denounce this faction? Wrong denunciation costs rebellion strength.')) return;
    denounce(factionId);
  }

  const rankColors = { commander:'#e8d030', cell_leader:'#e8a030', operative:'#40c880', sympathiser:'#5a7090' };

  function getPlanetName(planetId) {
    return planets.find(p => p.id === planetId)?.name || planetId;
  }

  return (
    <div style={{ padding:'0 0 8px' }}>
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        {['browse','found'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1, padding:'5px 0', background:tab===t?'rgba(58,143,232,0.15)':'transparent',
            border:`1px solid ${tab===t?'rgba(58,143,232,0.4)':'rgba(80,140,220,0.18)'}`,
            borderRadius:4, color:tab===t?'#3a8fe8':'#5a7090',
            fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', cursor:'pointer',
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* Browse factions */}
      {tab === 'browse' && (
        <div>
          {factions.length === 0 && (
            <div style={{ color:'#5a7090', fontFamily:'var(--mono)', fontSize:9, textAlign:'center', padding:'12px 0' }}>
              NO FACTIONS ACTIVE
            </div>
          )}
          {factions.map(f => (
            <div key={f.id} style={{
              background:'rgba(30,50,90,0.2)', border:'1px solid rgba(80,140,220,0.15)',
              borderRadius:4, padding:'8px 10px', marginBottom:6,
              borderColor: f.is_denounced ? 'rgba(232,64,64,0.3)' : undefined,
              opacity: f.is_denounced ? 0.5 : 1,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:500, color:'#e8f4ff' }}>{f.name}</span>
                {f.myRank !== 'sympathiser' && (
                  <span style={{
                    fontFamily:'var(--mono)', fontSize:8, padding:'1px 5px', borderRadius:2,
                    background:`${rankColors[f.myRank]}22`, color:rankColors[f.myRank],
                    border:`1px solid ${rankColors[f.myRank]}44`,
                  }}>{f.myRank.replace('_',' ').toUpperCase()}</span>
                )}
              </div>

              <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6 }}>
                <span style={{
                  fontFamily:'var(--mono)', fontSize:8, padding:'1px 5px', borderRadius:2,
                  background:`${IDEOLOGY_COLORS[f.ideology]}22`,
                  color: IDEOLOGY_COLORS[f.ideology],
                  border:`1px solid ${IDEOLOGY_COLORS[f.ideology]}33`,
                }}>{IDEOLOGY_LABELS[f.ideology]}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090' }}>
                  Rep:{f.reputation} · Pool:{f.resource_pool}cr
                </span>
              </div>

              {f.myContribution > 0 && (
                <div style={{ marginBottom:6 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:8, color:'#5a7090', marginBottom:2 }}>
                    <span>Your stake</span><span>{f.myPct}%</span>
                  </div>
                  <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${f.myPct}%`, background:rankColors[f.myRank], borderRadius:2, transition:'width 0.6s' }}/>
                  </div>
                </div>
              )}

              {/* Cell presence */}
              {f.cells?.length > 0 && (
                <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090', marginBottom:6 }}>
                  CELLS: {f.cells.map(c=>`${getPlanetName(c.planet_id)}(${c.strength})`).join(' · ')}
                </div>
              )}

              {!f.is_denounced && (
                <div style={{ display:'flex', gap:4 }}>
                  {/* Contribute */}
                  {selectedFaction?.id === f.id ? (
                    <div style={{ display:'flex', gap:4, flex:1 }}>
                      <input type="number" min={1} max={credits} value={contributeAmount}
                        onChange={e=>setContributeAmount(parseInt(e.target.value)||1)}
                        style={{ width:40, background:'transparent', border:'1px solid rgba(80,140,220,0.3)',
                          borderRadius:3, color:'#c8d8f0', fontFamily:'var(--mono)', fontSize:9, padding:'2px 4px' }}
                      />
                      <button onClick={handleContribute} style={{
                        flex:1, padding:'3px 6px', background:'rgba(64,200,128,0.12)',
                        border:'1px solid rgba(64,200,128,0.35)', borderRadius:3,
                        color:'#40c880', fontFamily:'var(--mono)', fontSize:8, cursor:'pointer',
                      }}>COMMIT</button>
                      <button onClick={()=>setSelectedFaction(null)} style={{
                        padding:'3px 6px', background:'transparent', border:'1px solid rgba(80,140,220,0.2)',
                        borderRadius:3, color:'#5a7090', fontFamily:'var(--mono)', fontSize:8, cursor:'pointer',
                      }}>×</button>
                    </div>
                  ) : (
                    <button onClick={()=>setSelectedFaction(f)} style={{
                      flex:1, padding:'3px 6px', background:'rgba(58,143,232,0.1)',
                      border:'1px solid rgba(58,143,232,0.25)', borderRadius:3,
                      color:'#3a8fe8', fontFamily:'var(--mono)', fontSize:8, cursor:'pointer',
                    }}>CONTRIBUTE ({credits}cr available)</button>
                  )}

                  {/* Investigate */}
                  <button onClick={()=>handleInvestigate(f.id)} style={{
                    padding:'3px 6px', background:'rgba(96,64,160,0.12)',
                    border:'1px solid rgba(96,64,160,0.3)', borderRadius:3,
                    color:'#a080e0', fontFamily:'var(--mono)', fontSize:8, cursor:'pointer',
                  }}>AUDIT</button>

                  {/* Found cell */}
                  <button onClick={()=>foundCell(f.id)} disabled={credits < 75} style={{
                    padding:'3px 6px', background:'rgba(58,143,232,0.1)',
                    border:'1px solid rgba(58,143,232,0.25)', borderRadius:3,
                    color:'#3a8fe8', fontFamily:'var(--mono)', fontSize:8, cursor: credits >= 75 ? 'pointer' : 'not-allowed',
                    opacity: credits >= 75 ? 1 : 0.5,
                  }}>FOUND CELL (75cr)</button>

                  {/* Denounce if enough clues */}
                  {f.myContribution > 0 && (
                    <button onClick={()=>handleDenounce(f.id)} style={{
                      padding:'3px 6px', background:'rgba(232,64,64,0.08)',
                      border:'1px solid rgba(232,64,64,0.25)', borderRadius:3,
                      color:'#e84040', fontFamily:'var(--mono)', fontSize:8, cursor:'pointer',
                    }}>DENOUNCE</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Found a faction */}
      {tab === 'found' && (
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'#5a7090', marginBottom:8 }}>
            COST: 200 CREDITS · AVAILABLE: {credits}cr · LOCATION: {getPlanetName(myPlanet)}
          </div>
          <input placeholder="Faction name…" value={newName} onChange={e=>setNewName(e.target.value)}
            style={{ width:'100%', padding:'6px 8px', background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(80,140,220,0.2)', borderRadius:4, color:'#c8d8f0',
              fontFamily:'var(--mono)', fontSize:10, marginBottom:8, outline:'none', boxSizing:'border-box' }}
          />
          <button onClick={handleFound} disabled={credits < 200 || !newName.trim()}
            style={{ width:'100%', padding:'8px', background:'rgba(58,143,232,0.12)',
              border:'1px solid rgba(58,143,232,0.35)', borderRadius:4, color:'#3a8fe8',
              fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.1em', cursor:'pointer',
              opacity: credits < 200 ? 0.4 : 1 }}>
            FOUND FACTION
          </button>
        </div>
      )}


      {/* Investigate result overlay */}
      {investigateResult && (
        <div style={{ marginTop:8, background:'rgba(80,40,120,0.15)', border:'1px solid rgba(160,80,220,0.3)',
          borderRadius:4, padding:'8px 10px' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#a080e0', letterSpacing:'0.12em', marginBottom:4 }}>
            AUDIT REPORT — {investigateResult.factionName}
          </div>
          <div style={{ fontSize:10, color:'#c8d8f0', lineHeight:1.6, marginBottom:6 }}>
            {investigateResult.auditNote}
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090' }}>
            Evidence accumulated: {investigateResult.totalClues}/{3} · 
            {investigateResult.canDenounce
              ? <span style={{ color:'#e84040' }}> SUFFICIENT FOR DENUNCIATION</span>
              : ' continue investigating'}
          </div>
          <button onClick={()=>setInvestigateResult(null)} style={{
            marginTop:6, padding:'3px 8px', background:'transparent',
            border:'1px solid rgba(80,140,220,0.2)', borderRadius:3,
            color:'#5a7090', fontFamily:'var(--mono)', fontSize:8, cursor:'pointer',
          }}>DISMISS</button>
        </div>
      )}
    </div>
  );
}
