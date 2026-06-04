export function CombatReportModal({ report, onClose, isPvp }) {
  if (!report) return null;

  const attackerName = report.attackerName || report.attackerKey;
  const defenderName = report.defenderName || report.defenderKey;
  const outcomeLabel = {
    attacker_wins: 'ATTACKER WINS',
    defender_wins: 'DEFENDER WINS',
    draw: 'DRAW',
  }[report.outcome] || 'UNKNOWN';

  const outcomeColor = {
    attacker_wins: '#40c880',
    defender_wins: '#e84040',
    draw: '#e8a030',
  }[report.outcome] || '#5a7090';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid rgba(80, 140, 220, 0.3)',
          borderRadius: 8,
          padding: 20,
          maxWidth: 400,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: '#5a7090', letterSpacing: '0.12em', marginBottom: 4 }}>
              ⚔ COMBAT REPORT
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8f4ff' }}>
              {report.planetName}
            </div>
            <div style={{ fontSize: 9, color: '#a080e0', letterSpacing: '0.08em', marginTop: 2 }}>
              {report.layer?.toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#5a7090',
              fontSize: 16,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Combatants */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16,
            padding: '12px 0',
            borderTop: '1px solid rgba(80, 140, 220, 0.15)',
            borderBottom: '1px solid rgba(80, 140, 220, 0.15)',
          }}
        >
          <div>
            <div style={{ fontSize: 9, color: '#5a7090', marginBottom: 4 }}>ATTACKER</div>
            <div style={{ fontSize: 10, color: report.attackerColor || '#40c880', fontWeight: 600 }}>
              {attackerName}
            </div>
            <div style={{ fontSize: 9, color: '#e84040', marginTop: 6 }}>
              LOSSES: {report.attackerLosses} {report.attackerLosses === 1 ? 'UNIT' : 'UNITS'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#5a7090', marginBottom: 4 }}>DEFENDER</div>
            <div style={{ fontSize: 10, color: report.defenderColor || '#607080', fontWeight: 600 }}>
              {defenderName}
            </div>
            <div style={{ fontSize: 9, color: '#e84040', marginTop: 6 }}>
              LOSSES: {report.defenderLosses} {report.defenderLosses === 1 ? 'UNIT' : 'UNITS'}
            </div>
          </div>
        </div>

        {/* Outcome */}
        <div style={{ marginBottom: 12, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: `${outcomeColor}22`,
              border: `1px solid ${outcomeColor}44`,
              borderRadius: 4,
              color: outcomeColor,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
            }}
          >
            {outcomeLabel}
          </div>
        </div>

        {/* Leader killed banner */}
        {report.leaderKilled && (
          <div
            style={{
              background: '#e8404044',
              border: '1px solid #e84040aa',
              borderRadius: 4,
              padding: 10,
              marginBottom: 12,
              color: '#e84040',
              fontSize: 9,
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            ⚠ REBEL LEADER ELIMINATED
          </div>
        )}

        {/* Summary */}
        {report.summary && (
          <div
            style={{
              fontSize: 8,
              color: '#5a7090',
              lineHeight: 1.5,
              padding: '8px 0',
              borderTop: '1px solid rgba(80, 140, 220, 0.15)',
            }}
          >
            {report.summary}
          </div>
        )}

        {/* Close button */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'rgba(58, 143, 232, 0.15)',
              border: '1px solid rgba(58, 143, 232, 0.4)',
              borderRadius: 3,
              color: '#3a8fe8',
              fontFamily: 'var(--mono)',
              fontSize: 9,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
