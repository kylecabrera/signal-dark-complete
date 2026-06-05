import { useState } from 'react';

export function SplashScreen({ onDismiss }) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: 'SIGNAL DARK',
      subtitle: 'An Asymmetric Rebellion Game',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2, color: '#a8c5dd' }}>
          <div>You are Jedi survivors building a rebellion to overthrow the Empire.</div>
          <div style={{ marginTop: 8 }}>🎯 <strong>Win:</strong> Reach 100 rebellion strength</div>
          <div>🎯 <strong>Lose:</strong> Reach 100 imperial strength, or your jedi is eliminated.</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Four AI Governors (Siris-tactical, Crassus-military, Maren-enforcer, Vektis-adaptive) command Imperial forces. Lower planet loyalty from 100% to 0% to claim them. Covert actions raise suspicion slower.
          </div>
        </div>
      ),
    },
    {
      title: 'CORE MECHANICS',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>4 Actions/turn:</strong> Recruit, intel, sabotage, incite, hide, earn/steal money, move, produce units, attack</div>
          <div><strong>Credits:</strong> Build units, found factions (200cr), establish cells (75cr), control (500cr), upgrade units</div>
          <div><strong>Jedi Avatar:</strong> Strength 12 Force user. Embed in ships. Death = elimination.</div>
          <div><strong>Factions:</strong> Discover via intel. Contribute to build ranks. Found cells for intel. Establish fleets for cohesive movement.</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Planets have surface and orbit layers. Combat triggers automatically when units meet. Unit production varies by cost, time, and strength.
          </div>
        </div>
      ),
    },
    {
      title: 'ADVANCED SYSTEMS',
      content: (
        <div style={{ fontSize: '13px', lineHeight: 2.2, color: '#a8c5dd' }}>
          <div><strong>Force Powers:</strong> Discover Force mysteries to unlock 9 unique abilities (shield, lightning, healing, domination)</div>
          <div><strong>Alignment System:</strong> Lightside (+50 healing) vs darkside (-70 choke). Affects unit combat effectiveness.</div>
          <div><strong>Fleets:</strong> Group units by location. Move entire fleets with one action. Rigid cohesion enforced.</div>
          <div><strong>Alert Level:</strong> Rises 1-5 from overt actions. When ≥3, governors coordinate via Quorum.</div>
          <div style={{ marginTop: 12, color: '#7a9aad', fontSize: '12px' }}>
            Balance action economy carefully. Learn governor patterns. Economy output fuels production and credits. Hidden units reveal only via intel.
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
