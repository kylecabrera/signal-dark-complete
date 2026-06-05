import { useState } from 'react';

export function SplashScreen({ onDismiss }) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: 'SIGNAL DARK',
      subtitle: 'An Asymmetric Rebellion Game',
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: 16, color: '#a8c5dd' }}>
            You are Jedi who survived the purge. You are being hunted. You must build a rebellion to overthrow the Empire and restore freedom to the galaxy.
          </div>
          <div style={{ fontSize: '13px', color: '#7a9aad' }}>
            Four AI Governors (Siris, Crassus, Maren, Vektis) control the Empire's forces. The Emperor sits somewhere in the galaxy.
          </div>
        </div>
      ),
    },
    {
      title: 'THE GOAL',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2, color: '#a8c5dd' }}>
          <div>🎯 <strong>Win by Rebellion:</strong> Reach 100 rebellion strength</div>
          <div>🎯 <strong>Lose by Suppression:</strong> Reach 100 suppression level</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            You must balance growing your rebellion while avoiding drawing too much attention. Each turn, the governors will react to your actions and try to suppress you, find you and kill you.
            Planets start under Imperial control (loyalty level is indicative of this). Lower loyalty to 0 to claim them as part of a faction in the rebellion.
          </div>
        </div>
      ),
    },
    {
      title: 'ACTIONS & RESOURCES',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>Many available Actions per turn</strong> — Move, recruit, intel, sabotage, or incite - more tbd</div>
          <div><strong>Credits</strong> — Spend on units and founding factions</div>
          <div><strong>Jedi Avatar</strong> — Your personal Force user. If killed in combat, you lose the game.</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Some actions remove loyalty on the planet (helps you control it). Some actions are covert, others are overt. Some make money. Some find information.
          </div>
        </div>
      ),
    },
    {
      title: 'FACTIONS & ALLIANCES',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>Discover Factions:</strong> Use Intel actions to find them</div>
          <div><strong>Contribute Credits:</strong> Build influence and unlock ship classes</div>
          <div><strong>Form Alliances:</strong> Unite factions under a shared banner</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Factions control planets when they flip to rebel. Every faction has a limited number of different units they can build. Alliances let multiple factions work together strategically, develop each other's units and pool resources.
          </div>
        </div>
      ),
    },
    {
      title: 'UNIT PRODUCTION',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>Build Units:</strong> On planets you control with economy output</div>
          <div><strong>Faction Units:</strong> Different factions provide different ship classes</div>
          <div><strong>Hidden vs. Visible:</strong> Some units start hidden; revealed when discovered</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Build time and cost vary by unit type. Stronger units take longer and cost more.
          </div>
        </div>
      ),
    },
    {
      title: 'COMBAT & MOVEMENT',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>Move:</strong> Teleport to adjacent planets via hyperlanes</div>
          <div><strong>Combat:</strong> Automatic when units occupy the same planet/layer</div>
          <div><strong>Intel:</strong> Reveals hidden enemy units and faction cells</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Planets have surface and orbit layers. Some units can only exist in one layer. Combat is bad and I'm working on it.
          </div>
        </div>
      ),
    },
    {
      title: 'THE GOVERNORS',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>Siris-Vael:</strong> Tactical analyst. Tracks your movements.</div>
          <div><strong>Crassus-9:</strong> Military strategist. Commands the main fleet.</div>
          <div><strong>Maren Osk:</strong> Brutal enforcer. Crushes rebellions.</div>
          <div><strong>Vektis-4:</strong> Mysterious droid. Unpredictable actions.</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Alert level (1-5) activates the Quorum. When alert ≥ 3, all governors coordinate.
          </div>
        </div>
      ),
    },
    {
      title: 'STRATEGY TIPS',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div>💡 <strong>Plan your moves:</strong> Actions reset each turn. Use them wisely.</div>
          <div>💡 <strong>Discover factions:</strong> Build alliances to unlock powerful units.</div>
          <div>💡 <strong>Control planets:</strong> Economy output fuels production and credits.</div>
          <div>💡 <strong>Stay hidden:</strong> Covert actions raise suspicion slower.</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Each governor has different strategies. Learn their patterns to predict their moves.
          </div>
        </div>
      ),
    },
  ];

  const page = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #0a0f1e 0%, #15213a 50%, #0d1624 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '700px',
        width: '90%',
        padding: '40px',
        background: 'rgba(15, 25, 45, 0.8)',
        border: '2px solid rgba(58, 143, 232, 0.3)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#3a8fe8',
          marginBottom: '8px',
          fontFamily: 'var(--mono)',
          letterSpacing: '0.15em',
        }}>
          {page.title}
        </h1>
        {page.subtitle && (
          <div style={{
            fontSize: '12px',
            color: '#7a9aad',
            marginBottom: '24px',
            fontFamily: 'var(--mono)',
            letterSpacing: '0.05em',
          }}>
            {page.subtitle}
          </div>
        )}

        {/* Content */}
        <div style={{
          minHeight: '180px',
          marginBottom: '32px',
        }}>
          {page.content}
        </div>

        {/* Page indicator */}
        <div style={{
          display: 'flex',
          gap: '4px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          {pages.map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: i === currentPage ? '#3a8fe8' : 'rgba(80, 140, 220, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onClick={() => setCurrentPage(i)}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(58, 143, 232, 0.1)',
              border: '1px solid rgba(58, 143, 232, 0.3)',
              borderRadius: '4px',
              color: currentPage === 0 ? '#5a7090' : '#3a8fe8',
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              cursor: currentPage === 0 ? 'default' : 'pointer',
              opacity: currentPage === 0 ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            ← BACK
          </button>

          {isLastPage ? (
            <button
              onClick={onDismiss}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(64, 200, 128, 0.15)',
                border: '1px solid rgba(64, 200, 128, 0.4)',
                borderRadius: '4px',
                color: '#40c880',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(64, 200, 128, 0.25)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(64, 200, 128, 0.15)';
              }}
            >
              START GAME →
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(58, 143, 232, 0.1)',
                border: '1px solid rgba(58, 143, 232, 0.3)',
                borderRadius: '4px',
                color: '#3a8fe8',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              NEXT →
            </button>
          )}
        </div>

        {/* Skip button */}
        <button
          onClick={onDismiss}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '6px',
            background: 'transparent',
            border: '1px solid rgba(80, 140, 220, 0.2)',
            borderRadius: '4px',
            color: '#5a7090',
            fontFamily: 'var(--mono)',
            fontSize: '9px',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#7a9aad';
            e.target.style.borderColor = 'rgba(80, 140, 220, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#5a7090';
            e.target.style.borderColor = 'rgba(80, 140, 220, 0.2)';
          }}
        >
          SKIP TUTORIAL
        </button>
      </div>
    </div>
  );
}
