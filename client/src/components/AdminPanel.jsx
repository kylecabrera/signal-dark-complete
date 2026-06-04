import { useState } from 'react';

const UNIT_TYPES = ['fleet','garrison','militia','operative'];
const GOVERNORS  = ['empire:crassus','empire:siris','empire:maren','empire:vektis'];

export function AdminPanel({ game, sessionId, onClose }) {
  const { publicState } = game;
  const planets = publicState?.planetState || [];

  const [adminToken, setAdminToken] = useState('');
  const [activeTab, setActiveTab]   = useState('units');
  const [status, setStatus]         = useState('');

  // Unit placement state
  const [unitType, setUnitType]     = useState('garrison');
  const [owner, setOwner]           = useState('empire:crassus');
  const [planetId, setPlanetId]     = useState('p01');
  const [layer, setLayer]           = useState('surface');
  const [strength, setStrength]     = useState(2);
  const [hp, setHp]                 = useState(3);
  const [isHidden, setIsHidden]     = useState(false);

  // Planet edit state
  const [editPlanet, setEditPlanet] = useState('p01');
  const [editLoyalty, setEditLoyalty]   = useState('');
  const [editSuspicion, setEditSuspicion] = useState('');
  const [editEconOutput, setEditEconOutput] = useState('');

  // Production state
  const [prodPlanet, setProdPlanet] = useState('p01');
  const [prodUnit, setProdUnit]     = useState('garrison');
  const [prodOwner, setProdOwner]   = useState('empire:crassus');
  const [prodRounds, setProdRounds] = useState(1);

  async function post(path, body) {
    const res  = await fetch(path, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ adminToken, ...body }),
    });
    return res.json();
  }
  async function patch(path, body) {
    const res = await fetch(path, {
      method:'PATCH',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ adminToken, ...body }),
    });
    return res.json();
  }

  async function placeUnit() {
    setStatus('Placing unit…');
    const r = await post(`/api/admin/${sessionId}/units`, {
      unit_type:unitType, owner, planet_id:planetId, layer,
      strength:parseInt(strength), hp:parseInt(hp), is_hidden:isHidden,
    });
    setStatus(r.ok ? `Unit placed: ${unitType} at ${planetId}` : `Error: ${r.error}`);
  }

  async function editPlanetValues() {
    setStatus('Updating planet…');
    const body = {};
    if (editLoyalty)    body.loyalty    = parseInt(editLoyalty);
    if (editSuspicion)  body.suspicion  = parseInt(editSuspicion);
    if (editEconOutput) body.econ_output = parseInt(editEconOutput);
    const r = await patch(`/api/admin/${sessionId}/planets/${editPlanet}`, body);
    setStatus(r.ok ? `Planet ${editPlanet} updated` : `Error: ${r.error}`);
  }

  async function queueProduction() {
    setStatus('Queuing production…');
    const r = await post(`/api/admin/${sessionId}/production`, {
      planet_id:prodPlanet, unit_type:prodUnit, owner:prodOwner,
      rounds_remaining:parseInt(prodRounds),
    });
    setStatus(r.ok ? `Queued ${prodUnit} at ${prodPlanet}` : `Error: ${r.error}`);
  }

  const inputStyle = {
    padding:'5px 8px', background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(80,140,220,0.2)', borderRadius:4, color:'#c8d8f0',
    fontFamily:'var(--mono)', fontSize:10, outline:'none', width:'100%', boxSizing:'border-box',
  };
  const selectStyle = {
    ...inputStyle, background:'rgba(10,15,30,0.95)',
  };
  const btnStyle = {
    padding:'7px 12px', background:'rgba(58,143,232,0.12)',
    border:'1px solid rgba(58,143,232,0.35)', borderRadius:4, color:'#3a8fe8',
    fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.1em', cursor:'pointer', marginTop:8,
  };
  const tabStyle = (active) => ({
    flex:1, padding:'5px 0', background:active?'rgba(58,143,232,0.15)':'transparent',
    border:`1px solid ${active?'rgba(58,143,232,0.4)':'rgba(80,140,220,0.18)'}`,
    borderRadius:4, color:active?'#3a8fe8':'#5a7090',
    fontFamily:'var(--mono)', fontSize:8, letterSpacing:'0.1em', cursor:'pointer',
  });
  const label = { fontFamily:'var(--mono)', fontSize:9, color:'#5a7090', display:'block', marginBottom:3, marginTop:8 };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:500,
      display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:'rgba(8,12,24,0.98)', border:'1px solid rgba(80,140,220,0.3)',
        borderRadius:8, padding:'20px 24px', width:380, maxHeight:'80vh', overflowY:'auto',
      }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'#e8a030', letterSpacing:'0.15em' }}>
            ADMIN PANEL
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#5a7090', cursor:'pointer', fontSize:16 }}>×</button>
        </div>

        {/* Token */}
        <span style={label}>Admin token</span>
        <input type="password" placeholder="Enter admin token" value={adminToken}
          onChange={e=>setAdminToken(e.target.value)} style={inputStyle}/>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, margin:'12px 0 10px' }}>
          {['units','planets','production'].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={tabStyle(activeTab===t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Unit placement */}
        {activeTab==='units' && (
          <div>
            <span style={label}>Unit type</span>
            <select value={unitType} onChange={e=>setUnitType(e.target.value)} style={selectStyle}>
              {UNIT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <span style={label}>Owner</span>
            <select value={owner} onChange={e=>setOwner(e.target.value)} style={selectStyle}>
              {GOVERNORS.map(g=><option key={g} value={g}>{g}</option>)}
              <option value="rebel:manual">rebel (manual)</option>
            </select>
            <span style={label}>Planet</span>
            <select value={planetId} onChange={e=>setPlanetId(e.target.value)} style={selectStyle}>
              {planets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span style={label}>Layer</span>
            <select value={layer} onChange={e=>setLayer(e.target.value)} style={selectStyle}>
              <option value="surface">surface</option>
              <option value="orbit">orbit</option>
            </select>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1 }}>
                <span style={label}>Strength</span>
                <input type="number" value={strength} onChange={e=>setStrength(e.target.value)} style={inputStyle} min={1} max={10}/>
              </div>
              <div style={{ flex:1 }}>
                <span style={label}>HP</span>
                <input type="number" value={hp} onChange={e=>setHp(e.target.value)} style={inputStyle} min={1} max={10}/>
              </div>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, cursor:'pointer' }}>
              <input type="checkbox" checked={isHidden} onChange={e=>setIsHidden(e.target.checked)}/>
              <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#5a7090' }}>Hidden unit</span>
            </label>
            <button onClick={placeUnit} style={btnStyle}>PLACE UNIT</button>
          </div>
        )}

        {/* Planet edit */}
        {activeTab==='planets' && (
          <div>
            <span style={label}>Planet</span>
            <select value={editPlanet} onChange={e=>setEditPlanet(e.target.value)} style={selectStyle}>
              {planets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span style={label}>Loyalty (0–100)</span>
            <input type="number" placeholder="unchanged" value={editLoyalty}
              onChange={e=>setEditLoyalty(e.target.value)} style={inputStyle} min={0} max={100}/>
            <span style={label}>Suspicion (0–4)</span>
            <input type="number" placeholder="unchanged" value={editSuspicion}
              onChange={e=>setEditSuspicion(e.target.value)} style={inputStyle} min={0} max={4}/>
            <span style={label}>Econ output (pts/round)</span>
            <input type="number" placeholder="unchanged" value={editEconOutput}
              onChange={e=>setEditEconOutput(e.target.value)} style={inputStyle} min={0} max={8}/>
            <button onClick={editPlanetValues} style={btnStyle}>UPDATE PLANET</button>
          </div>
        )}

        {/* Production queue */}
        {activeTab==='production' && (
          <div>
            <span style={label}>Planet</span>
            <select value={prodPlanet} onChange={e=>setProdPlanet(e.target.value)} style={selectStyle}>
              {planets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span style={label}>Unit type</span>
            <select value={prodUnit} onChange={e=>setProdUnit(e.target.value)} style={selectStyle}>
              {UNIT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <span style={label}>Owner</span>
            <select value={prodOwner} onChange={e=>setProdOwner(e.target.value)} style={selectStyle}>
              {GOVERNORS.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
            <span style={label}>Rounds remaining</span>
            <input type="number" value={prodRounds} onChange={e=>setProdRounds(e.target.value)}
              style={inputStyle} min={1} max={5}/>
            <button onClick={queueProduction} style={btnStyle}>QUEUE PRODUCTION</button>
          </div>
        )}

        {status && (
          <div style={{ marginTop:10, fontFamily:'var(--mono)', fontSize:9,
            color: status.includes('Error') ? '#e84040' : '#40c880', letterSpacing:'0.05em' }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
