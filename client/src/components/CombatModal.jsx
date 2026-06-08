import React, { useState } from 'react';

export default function CombatModal({ combat, combatRound, withdraw, socket, planets }) {
  const [selectedToRemove, setSelectedToRemove] = useState({});
  const [withdrawing, setWithdrawing] = useState(false);

  if (!combat) return null;

  const { combatId, attackerUnits, defenderUnits, attackerKey, defenderKey, round, playerSide, planetId } = combat;
  const planetName = (planets || []).find(p => p.id === planetId)?.name || planetId;

  const handleWithdraw = () => {
    if (withdrawing) {
      // Submit withdrawal with selected units to remove
      socket?.emit('combat_withdraw', {
        combatId,
        unitsToRemove: selectedToRemove,
      });
      setWithdrawing(false);
    } else {
      setWithdrawing(true);
    }
  };

  const handleCombatRound = () => {
    combatRound(combatId);
    setSelectedToRemove({});
    setWithdrawing(false);
  };

  const toggleUnitRemoval = (unitId) => {
    setSelectedToRemove(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const UnitRow = ({ unit, selected, onToggle, isAttacker }) => (
    <div style={{
      padding: '8px 12px',
      borderBottom: '1px solid #3a5a8a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: isAttacker ? 'rgba(232, 64, 64, 0.1)' : 'rgba(64, 200, 128, 0.1)',
      cursor: withdrawing ? 'pointer' : 'default',
      userSelect: 'none'
    }} onClick={() => withdrawing && onToggle(unit.id)}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '11px', color: '#e8f4ff', fontWeight: 500 }}>
          {unit.designation || unit.unit_type}
        </span>
        <div style={{ fontSize: '9px', color: '#8aa8c8', marginTop: '2px' }}>
          HP: {unit.hp} / STR: {unit.strength}
        </div>
      </div>
      {withdrawing && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(unit.id)}
          style={{ marginRight: '8px', cursor: 'pointer' }}
        />
      )}
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 500,
    }}>
      <div style={{
        background: '#0d1425',
        border: '2px solid #3a7aff',
        borderRadius: '4px',
        padding: '24px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 0 30px rgba(58, 122, 255, 0.3)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Attacker Side */}
          <div>
            <div style={{
              padding: '12px',
              background: 'rgba(232, 64, 64, 0.2)',
              border: '1px solid #e84040',
              borderRadius: '2px',
              marginBottom: '12px',
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#e84040',
              textAlign: 'center',
              letterSpacing: '0.1em'
            }}>
              {attackerKey === 'rebel' ? 'YOUR FORCES' : 'IMPERIAL FORCES'}
            </div>
            <div style={{
              border: '1px solid #3a5a8a',
              borderRadius: '2px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {attackerUnits.length === 0 ? (
                <div style={{ padding: '12px', color: '#8aa8c8', fontSize: '10px', textAlign: 'center' }}>
                  All units destroyed
                </div>
              ) : (
                attackerUnits.map(u => (
                  <UnitRow
                    key={u.id}
                    unit={u}
                    selected={selectedToRemove[u.id] || false}
                    onToggle={toggleUnitRemoval}
                    isAttacker={true}
                  />
                ))
              )}
            </div>
          </div>

          {/* Defender Side */}
          <div>
            <div style={{
              padding: '12px',
              background: 'rgba(64, 200, 128, 0.2)',
              border: '1px solid #40c880',
              borderRadius: '2px',
              marginBottom: '12px',
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#40c880',
              textAlign: 'center',
              letterSpacing: '0.1em'
            }}>
              {defenderKey === 'rebel' ? 'YOUR FORCES' : 'OPPOSING FORCES'}
            </div>
            <div style={{
              border: '1px solid #3a5a8a',
              borderRadius: '2px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              {defenderUnits.length === 0 ? (
                <div style={{ padding: '12px', color: '#8aa8c8', fontSize: '10px', textAlign: 'center' }}>
                  All units destroyed
                </div>
              ) : (
                defenderUnits.map(u => (
                  <UnitRow
                    key={u.id}
                    unit={u}
                    selected={selectedToRemove[u.id] || false}
                    onToggle={toggleUnitRemoval}
                    isAttacker={false}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status and Controls */}
        <div style={{
          background: 'rgba(58, 122, 255, 0.1)',
          border: '1px solid #3a7aff',
          borderRadius: '2px',
          padding: '12px',
          marginBottom: '16px',
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          color: '#a8c8e8'
        }}>
          <div>Combat at <span style={{ color: '#fff' }}>{planetName}</span> — Round {round + 1}</div>
          <div style={{ marginTop: '4px', fontSize: '9px', color: '#7a98b8' }}>
            {withdrawing ? '✓ Select units to remove and confirm withdrawal' : 'Continue fighting or withdraw'}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleWithdraw}
            disabled={!playerSide}
            style={{
              padding: '8px 16px',
              background: withdrawing ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 100, 100, 0.3)',
              border: withdrawing ? '1px solid #ff6464' : '1px solid #606080',
              color: withdrawing ? '#ff9999' : '#a0a0c0',
              borderRadius: '2px',
              cursor: playerSide ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              opacity: playerSide ? 1 : 0.5
            }}
            onMouseEnter={e => playerSide && (e.target.style.background = withdrawing ? 'rgba(255, 100, 100, 0.5)' : 'rgba(100, 100, 100, 0.5)')}
            onMouseLeave={e => playerSide && (e.target.style.background = withdrawing ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 100, 100, 0.3)')}
          >
            {withdrawing ? 'CONFIRM WITHDRAWAL' : 'WITHDRAW'}
          </button>
          <button
            onClick={handleCombatRound}
            disabled={!playerSide}
            style={{
              padding: '8px 16px',
              background: 'rgba(0, 150, 0, 0.3)',
              border: '1px solid #00cc00',
              color: '#00ff99',
              borderRadius: '2px',
              cursor: playerSide ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              opacity: playerSide ? 1 : 0.5
            }}
            onMouseEnter={e => playerSide && (e.target.style.background = 'rgba(0, 150, 0, 0.5)')}
            onMouseLeave={e => playerSide && (e.target.style.background = 'rgba(0, 150, 0, 0.3)')}
          >
            COMBAT ROUND (COSTS 1 ACTION)
          </button>
        </div>
      </div>
    </div>
  );
}
