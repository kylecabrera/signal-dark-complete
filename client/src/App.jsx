import { useState, useEffect } from 'react';
import { SocketProvider } from './SocketContext';
import { useGame } from './useGame';
import { SectorMap } from './components/SectorMap';
import { Sidebar } from './components/Sidebar';
import { Lobby, GameOver } from './components/Lobby';
import { AdminPanel } from './components/AdminPanel';
import { CombatReportModal } from './components/CombatReportModal';
import CombatModal from './components/CombatModal';
import { SplashScreen } from './components/SplashScreen';
import './app.css';

function GameShell() {
  const game = useGame();
  const { publicState, notification, sessionId, adminOpen, setAdminOpen, traitorAlert, jediDeathAlert, detentionAlert, setDetentionAlert, activeCombat } = game;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    function handler(e) {
      if (e.key === 'F1') { e.preventDefault(); setAdminOpen(o => !o); }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setAdminOpen]);

  useEffect(() => {
    console.log('publicState changed:', publicState?.status, publicState);
  }, [publicState]);

  let screen = 'landing';
  if (publicState) {
    if (publicState.status === 'lobby')    screen = 'lobby';
    else if (publicState.status === 'complete') screen = 'gameover';
    else screen = 'game';
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      {screen === 'landing'  && <Landing game={game} />}
      {screen === 'lobby'    && <Lobby game={game} />}
      {screen === 'gameover' && <GameOver game={game} />}
      {screen === 'game' && (
        <div className="game-layout">
          <GameHeader game={game} />
          <SectorMap game={game} />
          <Sidebar game={game} />
        </div>
      )}
      {adminOpen && sessionId && (
        <AdminPanel game={game} sessionId={sessionId} onClose={() => setAdminOpen(false)} />
      )}
      {game.pvpCombatResult && (
        <CombatReportModal
          report={game.pvpCombatResult}
          isPvp={true}
          onClose={() => game.setPvpCombatResult(null)}
        />
      )}
      {game.activeCombatReport && (
        <CombatReportModal
          report={game.activeCombatReport}
          isPvp={false}
          onClose={() => game.setActiveCombatReport(null)}
        />
      )}
      {activeCombat && (
        <CombatModal
          combat={activeCombat}
          combatRound={game.combatRound}
          withdraw={game.withdraw}
          socket={game.socket}
        />
      )}
      {traitorAlert && (
        <div className="traitor-alert">
          INTELLIGENCE ASSET TRIGGERED — YOUR POSITION HAS BEEN EXPOSED
        </div>
      )}
      {jediDeathAlert && (
        <div className="jedi-death-alert">
          YOUR JEDI HAS FALLEN — YOU ARE ELIMINATED FROM THIS GAME
        </div>
      )}
      {detentionAlert && (
        <div className="detention-alert-overlay">
          <div className="detention-alert">
            <div className="detention-message">{detentionAlert.message}</div>
            {detentionAlert.fineAmount !== undefined && (
              <div className="detention-options">
                <button onClick={() => {
                  game.socket.emit('resolve_fine', { action: 'pay' });
                }} className="btn-pay-fine">
                  PAY FINE ({detentionAlert.fineAmount}cr)
                </button>
                <button onClick={() => {
                  game.socket.emit('resolve_fine', { action: 'accept' });
                }} className="btn-accept-detention">
                  ACCEPT DETENTION
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {notification && <div className="notification show">{notification}</div>}
    </div>
  );
}

function Landing({ game }) {
  const [name, setName]       = useState('');
  const [code, setCode]       = useState('');
  const [mode, setMode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  console.log('Landing: serverUrl =', serverUrl);

  async function createGame() {
    if (!name.trim()) return setError('Enter your callsign');
    console.log('Creating game, serverUrl:', serverUrl);
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${serverUrl}/api/sessions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ displayName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      game.joinGame(data.sessionId, data.playerId, data.startingPlanet);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function joinGame() {
    if (!name.trim() || !code.trim()) return setError('Enter callsign and game code');
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${serverUrl}/api/sessions/${code.trim().toUpperCase()}/join`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ displayName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      game.joinGame(data.sessionId, data.playerId, data.startingPlanet);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing">
      <div className="landing-box">
        <div className="landing-logo">SIGNAL<span>//</span>DARK</div>
        <p className="landing-sub">Asymmetric hidden-movement resistance</p>

        <input
          className="landing-input"
          placeholder="Callsign (your name)"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        {mode === '' && (
          <div className="landing-btns">
            <button className="btn-primary" onClick={() => setMode('create')}>New campaign</button>
            <button className="btn-secondary" onClick={() => setMode('join')}>Join campaign</button>
          </div>
        )}

        {mode === 'create' && (
          <div className="landing-btns">
            <button className="btn-primary" onClick={createGame} disabled={loading}>
              {loading ? 'Creating…' : 'Create game'}
            </button>
            <button className="btn-ghost" onClick={() => setMode('')}>Back</button>
          </div>
        )}

        {mode === 'join' && (
          <>
            <input
              className="landing-input"
              placeholder="Game code (e.g. XRAY42)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}
            />
            <div className="landing-btns">
              <button className="btn-primary" onClick={joinGame} disabled={loading}>
                {loading ? 'Joining…' : 'Join game'}
              </button>
              <button className="btn-ghost" onClick={() => setMode('')}>Back</button>
            </div>
          </>
        )}

        {error && <p className="landing-error">{error}</p>}
      </div>
    </div>
  );
}

function GameHeader({ game }) {
  const { publicState, privateState, governorThinking } = game;
  if (!publicState) return null;

  const alertColor = {
    DORMANT: 'good', ELEVATED: 'warn',
    MANHUNT: 'danger', PURGE: 'danger', ANNIHILATION: 'danger',
  }[publicState.alertLevel] || 'warn';

  const isGovPhase = governorThinking || publicState.phase === 'governor';

  return (
    <header className="game-header">
      <div className="logo">SIGNAL<span>//</span>DARK</div>
      <div className="round-badge">ROUND {String(publicState.round).padStart(2, '0')}</div>
      <div className={isGovPhase ? 'phase-badge phase-ai' : 'phase-badge phase-rebel'}>
        {isGovPhase ? 'GOVERNOR PHASE' : 'REBEL PHASE'}
      </div>
      {publicState.code && (
        <div className="code-badge">CODE: {publicState.code}</div>
      )}
      <div className="header-stats">
        <div className="stat">
          <span className="sl">REBELLION</span>
          <span className="sv good">{publicState.rebellionStrength}%</span>
        </div>
        <div className="stat">
          <span className="sl">ALERT</span>
          <span className={`sv ${alertColor}`}>{publicState.alertLevel}</span>
        </div>
        <div className="stat">
          <span className="sl">ACTIONS</span>
          <span className="sv">{privateState ? `${privateState.actionsRemaining} LEFT` : '—'}</span>
        </div>
        <div className="stat">
          <span className="sl">CREDITS</span>
          <span className="sv good">{privateState?.credits ?? '—'}</span>
        </div>
        <div className="stat">
          <span className="sl">SUPPRESS</span>
          <span className="sv danger">{publicState.empireLevel}%</span>
        </div>
        {privateState?.forceAlignment !== undefined && (
          <div className="stat" style={{ minWidth: 90 }}>
            <span className="sl">FORCE</span>
            <ForceMeter alignment={privateState.forceAlignment} side={privateState.forceSide} strength={privateState.forceStrength} />
          </div>
        )}
      </div>
    </header>
  );
}

function ForceMeter({ alignment, side, strength }) {
  const pct   = (alignment + 100) / 2;   // 0–100, 50 = neutral
  const color = side === 'light' ? '#a0d4ff'
              : side === 'dark'  ? '#c040e0'
              : '#8090a0';
  const label = side === 'light' ? 'LIGHT' : side === 'dark' ? 'DARK' : 'GREY';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:2, alignItems:'flex-end' }}>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ fontFamily:'var(--mono)', fontSize:8, color, letterSpacing:'0.08em' }}>
          {label} · STR {strength}
        </span>
      </div>
      <div style={{ width:72, height:4, background:'rgba(80,80,100,0.4)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color,
          boxShadow:`0 0 4px ${color}`, borderRadius:2, transition:'width 0.4s' }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <GameShell />
    </SocketProvider>
  );
}
