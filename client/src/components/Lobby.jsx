export function Lobby({ game }) {
  const { publicState, lobbyPlayers, allReady, markReady, playerId, startingPlanetInfo } = game;
  const code    = publicState?.code;
  const meReady = lobbyPlayers.find(p => p.id === playerId)?.isReady;
  const sp      = startingPlanetInfo;
  const spColor = sp?.alignment > 30 ? '#a0d4ff' : sp?.alignment < -30 ? '#c040e0' : '#8090a0';
  const spSide  = sp?.alignment > 30 ? 'LIGHT SIDE' : sp?.alignment < -30 ? 'DARK SIDE' : 'GREY JEDI';

  return (
    <div className="landing">
      <div className="landing-box">
        <div className="landing-logo">SIGNAL<span>//</span>DARK</div>
        <p className="landing-sub">Waiting for rebels to join</p>

        <div style={{
          background:'rgba(58,143,232,0.08)', border:'1px solid rgba(58,143,232,0.25)',
          borderRadius:6, padding:'14px 20px', marginBottom:8,
        }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'#5a7090',
            letterSpacing:'0.15em', display:'block', marginBottom:4 }}>GAME CODE</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:28, letterSpacing:'0.3em',
            color:'#00d4c8' }}>{code}</span>
        </div>
        <p style={{ fontSize:10, color:'#5a7090', fontFamily:'var(--mono)',
          marginBottom:18, letterSpacing:'0.04em' }}>
          Share this code with your co-conspirators
        </p>

        {sp && (
          <div style={{
            background:'rgba(0,0,0,0.3)', border:`1px solid ${spColor}44`,
            borderRadius:6, padding:'12px 16px', marginBottom:16, textAlign:'left',
          }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:8, color:spColor,
              letterSpacing:'0.15em', marginBottom:6 }}>⚡ FORCE ORIGIN — {spSide}</div>
            <div style={{ fontFamily:'var(--sans)', fontSize:15, fontWeight:600,
              color:'#e8f4ff', marginBottom:4 }}>{sp.name}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090',
              marginBottom:6 }}>{sp.type}</div>
            <p style={{ fontSize:11, color:'#a0b4c8', lineHeight:1.6, marginBottom:8 }}>
              {sp.desc}
            </p>
            <div style={{ display:'flex', gap:16 }}>
              <div>
                <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090' }}>FORCE STR</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:14, color:spColor }}>{sp.forceStrength}</div>
              </div>
              <div>
                <div style={{ fontFamily:'var(--mono)', fontSize:8, color:'#5a7090' }}>ALIGNMENT</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:14, color:spColor }}>
                  {sp.alignment > 0 ? `+${sp.alignment}` : sp.alignment}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          {lobbyPlayers.map(p => (
            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10,
              padding:'8px 0', borderBottom:'1px solid rgba(80,120,180,0.1)', fontSize:12 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
              <span style={{ flex:1, color: p.id===playerId ? p.color : '#c8d8f0' }}>
                {p.displayName}{p.id===playerId?' (you)':''}
              </span>
              <span style={{ fontFamily:'var(--mono)', fontSize:9,
                color: p.isReady ? '#40c880' : '#5a7090',
                letterSpacing:'0.1em' }}>
                {p.isReady ? 'READY' : 'waiting'}
              </span>
            </div>
          ))}
          {lobbyPlayers.length < 4 && Array.from({ length: 4-lobbyPlayers.length }, (_,i) => (
            <div key={`e${i}`} style={{ display:'flex', alignItems:'center', gap:10,
              padding:'8px 0', borderBottom:'1px solid rgba(80,120,180,0.07)', opacity:0.3 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#2a3a4a' }}/>
              <span style={{ fontSize:11, color:'#5a7090' }}>Waiting for rebel…</span>
            </div>
          ))}
        </div>

        {!meReady && (
          <button className="btn-primary" onClick={markReady}>
            Ready — begin campaign
          </button>
        )}
        {meReady && !allReady && (
          <p style={{ fontFamily:'var(--mono)', fontSize:10, color:'#5a7090',
            letterSpacing:'0.08em', marginTop:10 }}>
            Waiting for all rebels to ready up…
          </p>
        )}
      </div>
    </div>
  );
}

export function GameOver({ game }) {
  const { publicState } = game;
  const winner = publicState?.winner;
  const isRebelWin = winner === 'rebels';

  return (
    <div className="landing">
      <div className="landing-box">
        <div className="landing-logo">SIGNAL<span>//</span>DARK</div>
        <div style={{
          fontFamily:'var(--mono)', fontSize:20, letterSpacing:'0.2em',
          color: isRebelWin ? '#40c880' : '#e84040',
          margin:'16px 0 12px',
        }}>
          {isRebelWin ? 'REVOLUTION SUCCEEDS' : 'REBELLION CRUSHED'}
        </div>
        <p style={{ fontSize:13, color:'#5a7090', lineHeight:1.7, marginBottom:16 }}>
          {isRebelWin
            ? "Your rebellion has reached critical mass. Planets across the sector are rising. The Empire's governors cannot contain what you have started."
            : "The Empire's suppression campaign has broken the resistance. The rebellion ends not with a battle, but with silence."}
        </p>
        <p style={{ fontFamily:'var(--mono)', fontSize:10, color:'#5a7090',
          letterSpacing:'0.1em', marginBottom:20 }}>
          Survived {publicState?.round} rounds
        </p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          New campaign
        </button>
      </div>
    </div>
  );
}
