import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './SocketContext';

export function useGame() {
  const { socket } = useSocket();

  const [sessionId, setSessionId]       = useState(null);
  const [playerId, setPlayerId]         = useState(null);
  const [myColor, setMyColor]           = useState('#40c880');
  const [myName, setMyName]             = useState('');
  const [publicState, setPublicState]   = useState(null);
  const [privateState, setPrivateState] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [allReady, setAllReady]         = useState(false);
  const [feedEntries, setFeedEntries]   = useState([]);
  const [notification, setNotification] = useState('');
  const [governorThinking, setGovernorThinking] = useState(false);
  const [combatReports, setCombatReports]       = useState([]);
  const [selectedPlanet, setSelectedPlanet]     = useState(null);
  const [selectedUnit, setSelectedUnit]         = useState(null);
  const [adminOpen, setAdminOpen]               = useState(false);
  const [investigateResult, setInvestigateResult] = useState(null);
  const [traitorAlert, setTraitorAlert]         = useState(false);
  const [jediDeathAlert, setJediDeathAlert]     = useState(false);
  const [startingPlanetInfo, setStartingPlanetInfo] = useState(null);
  const [pvpCombatResult, setPvpCombatResult]   = useState(null);
  const [activeCombatReport, setActiveCombatReport] = useState(null);
  const [detentionAlert, setDetentionAlert] = useState(null);
  const [activeCombat, setActiveCombat] = useState(null);

  const notify = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  }, []);

  // Register all socket event listeners
  useEffect(() => {
    if (!socket) {
      console.log('useGame: no socket yet');
      return;
    }

    console.log('useGame: registering socket listeners');

    socket.on('connect', () => {
      console.log('socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.log('socket connect_error:', err.message);
    });

    socket.on('joined', ({ playerId: pid, displayName, color }) => {
      console.log('joined event received:', pid, displayName);
      setPlayerId(pid);
      setMyColor(color);
      setMyName(displayName);
    });

    socket.on('state_update', (state) => {
      console.log('state_update received, status:', state.status);
      setPublicState(state);
    });

    socket.on('private_state', (state) => {
      console.log('private_state received');
      setPrivateState(state);
    });

    socket.on('lobby_update', ({ players, allReady: ready }) => {
      console.log('lobby_update received:', players.length, 'players');
      setLobbyPlayers(players);
      setAllReady(ready);
    });

    socket.on('game_started', (state) => {
      console.log('game_started received');
      setPublicState(state);
      notify('CAMPAIGN BEGINS — REBEL PHASE');
    });

    socket.on('action_confirmed', ({ label, traitorExposed, investigateResult: ir, denounceResult: dr,
                                      discoveries, recruitBonus, sabotageBonus, inciteBonus,
                                      detentionTriggered, fineAmount, detentionMessage, cascadeEffects,
                                      policeKilled, policeKillMessage, watchedLaneWarning }) => {
      notify(label?.toUpperCase() || 'ACTION CONFIRMED');
      if (traitorExposed) {
        setTraitorAlert(true);
        setTimeout(() => setTraitorAlert(false), 6000);
      }
      if (ir) setInvestigateResult(ir);
      if (dr) notify(`DENUNCIATION: ${dr.outcome?.toUpperCase()} — ${dr.factionName}`);

      // Handle watched lane warnings
      if (watchedLaneWarning) {
        notify(watchedLaneWarning);
        setFeedEntries(prev => [{ gov:'system', text: watchedLaneWarning }, ...prev].slice(0,60));
      }

      // Handle police kills
      if (policeKilled) {
        notify(policeKillMessage?.toUpperCase() || 'POLICE NEUTRALIZED');
        setFeedEntries(prev => [{ gov:'system', text: policeKillMessage }, ...prev].slice(0,60));
      }

      // Handle cascade effects
      if (cascadeEffects?.length) {
        cascadeEffects.forEach(effect => {
          notify(`CASCADE: Criminal activity spreads to ${effect.sector}`);
          setFeedEntries(prev => [{ gov:'system', text: `CASCADE EFFECT: Criminal activity spreading to ${effect.sector}` }, ...prev].slice(0,60));
        });
      }

      // Handle detention trigger
      if (detentionTriggered) {
        notify(detentionMessage?.toUpperCase() || 'APPREHENDED');
        setFeedEntries(prev => [{ gov:'system', text: detentionMessage }, ...prev].slice(0,60));
        setDetentionAlert({
          triggered: true,
          fineAmount,
          message: detentionMessage
        });
      }

      // Intel discoveries
      if (discoveries?.length) {
        discoveries.forEach(d => {
          notify(d.text);
          setFeedEntries(prev => [{ gov:'intel', text: d.text }, ...prev].slice(0,60));
        });
      }

      // Recruit bonus
      if (recruitBonus) {
        notify('SYMPATHIZERS JOIN THE CAUSE — MILITIA SPAWNED');
        setFeedEntries(prev => [{ gov:'recruit', text: `REBEL MILITIA UNIT SPAWNED at ${recruitBonus.planetName || recruitBonus.planetId}` }, ...prev].slice(0,60));
      }

      // Sabotage bonus
      if (sabotageBonus?.blocked) {
        notify(`SABOTAGE SUCCESS — EMPIRE PRODUCTION BLOCKED UNTIL ROUND ${sabotageBonus.blockedUntil}`);
        setFeedEntries(prev => [{ gov:'sabotage', text: `INFRASTRUCTURE SABOTAGED — Empire production blocked until round ${sabotageBonus.blockedUntil}` }, ...prev].slice(0,60));
      }

      // Incite bonus
      if (inciteBonus?.killed) {
        notify(`UNREST ESCALATES — IMPERIAL ${inciteBonus.designation?.toUpperCase()} DESTROYED`);
        setFeedEntries(prev => [{ gov:'incite', text: `IMPERIAL ${inciteBonus.designation?.toUpperCase()} DESTROYED BY UNREST` }, ...prev].slice(0,60));
      } else if (inciteBonus?.damaged) {
        notify(`UNREST ESCALATES — IMPERIAL ${inciteBonus.designation?.toUpperCase()} DAMAGED`);
        setFeedEntries(prev => [{ gov:'incite', text: `IMPERIAL ${inciteBonus.designation?.toUpperCase()} DAMAGED BY UNREST` }, ...prev].slice(0,60));
      }
    });

    socket.on('action_rejected', ({ reason }) => {
      console.log('action_rejected:', reason);
      notify(`REJECTED: ${reason.toUpperCase()}`);
    });

    socket.on('turn_submitted', ({ submittedCount, totalPlayers }) => {
      notify(`${submittedCount}/${totalPlayers} REBELS SUBMITTED`);
    });

    socket.on('governor_phase_started', () => {
      setGovernorThinking(true);
      notify('GOVERNOR COUNCIL CONVENING…');
    });

    socket.on('rebel_phase_started', ({ phase, round }) => {
      setGovernorThinking(false);
      notify('REBEL PHASE RESUMED');
    });

    socket.on('governor_broadcast', (entry) => {
      setFeedEntries(prev => [entry, ...prev].slice(0, 60));
    });

    socket.on('combat_report', (report) => {
      setCombatReports(prev => [report, ...prev].slice(0, 20));
      setFeedEntries(prev => [{ gov: 'system', text: report.summary }, ...prev]);
      if (report.involvedPlayerIds?.includes(playerId)) {
        setActiveCombatReport(report);
      }
    });

    socket.on('pvp_combat_result', (result) => {
      setPvpCombatResult(result);
    });

    socket.on('player_eliminated', ({ playerName, killedBy }) => {
      notify(`${playerName.toUpperCase()} ELIMINATED BY ${killedBy.toUpperCase()}`);
      setFeedEntries(prev => [{
        gov: 'system',
        text: `[REBEL FACTION] ${playerName} eliminated by ${killedBy}`
      }, ...prev]);
    });

    socket.on('units_produced', ({ count }) => {
      notify(`${count} UNIT${count > 1 ? 'S' : ''} DELIVERED`);
    });

    socket.on('traitor_exposure', ({ message }) => {
      setFeedEntries(prev => [{ gov: 'system', text: `[ARCHITECT INTEL] ${message}` }, ...prev]);
    });

    socket.on('overt_action_detected', ({ type }) => {
      setFeedEntries(prev => [{ gov: 'system', text: `OVERT: ${type} detected` }, ...prev]);
    });

    socket.on('turn_timer_started', () => {
      setGovernorThinking(false);
    });

    socket.on('game_over', ({ winner }) => {
      notify(winner === 'rebels' ? 'REVOLUTION SUCCEEDS' : 'REBELLION CRUSHED');
    });

    socket.on('fine_resolved', ({ success, message, detained, detentionTurns, creditsRemaining }) => {
      notify(message?.toUpperCase() || 'FINE RESOLVED');
      setFeedEntries(prev => [{ gov:'system', text: message }, ...prev].slice(0,60));
      setDetentionAlert(null);
    });

    socket.on('fine_rejected', ({ reason }) => {
      console.log('fine_rejected:', reason);
      notify(`FINE REJECTION: ${reason.toUpperCase()}`);
    });

    socket.on('combat_initiated', ({ combatId, attackerUnits, defenderUnits, attackerKey, defenderKey, planetId, round }) => {
      notify('⚔️ COMBAT INITIATED');
      // Determine which side this player is on
      let playerSide = null;
      if (playerId) {
        const isRebelAttacker = attackerKey === 'rebel' || attackerKey === `rebel:${playerId}`;
        const isRebelDefender = defenderKey === 'rebel' || defenderKey === `rebel:${playerId}`;
        if (isRebelAttacker) playerSide = 'attacker';
        else if (isRebelDefender) playerSide = 'defender';
      }
      setActiveCombat({
        combatId,
        attackerUnits,
        defenderUnits,
        attackerKey,
        defenderKey,
        planetId,
        round,
        playerSide
      });
    });

    socket.on('combat_round_update', ({ combatId, attackerUnits, defenderUnits, round, outcome }) => {
      setActiveCombat(prev => {
        if (!prev || prev.combatId !== combatId) return prev;

        if (outcome && outcome !== 'continuing') {
          // Combat ended
          setFeedEntries(prev => [{ gov: 'system', text: `Combat ended: ${outcome}` }, ...prev].slice(0,60));
          return null;
        }

        return {
          ...prev,
          attackerUnits,
          defenderUnits,
          round: round || (prev.round + 1)
        };
      });
    });

    socket.on('combat_ended', ({ combatId, outcome, summary }) => {
      setActiveCombat(prev => prev?.combatId === combatId ? null : prev);
      notify(summary?.toUpperCase() || 'COMBAT ENDED');
      setFeedEntries(prev => [{ gov: 'system', text: summary }, ...prev].slice(0,60));
    });

    socket.on('error', ({ message }) => {
      console.log('socket error event:', message);
      notify(`ERROR: ${message.toUpperCase()}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('joined');
      socket.off('state_update');
      socket.off('private_state');
      socket.off('lobby_update');
      socket.off('game_started');
      socket.off('action_confirmed');
      socket.off('action_rejected');
      socket.off('turn_submitted');
      socket.off('governor_phase_started');
      socket.off('rebel_phase_started');
      socket.off('governor_broadcast');
      socket.off('combat_report');
      socket.off('units_produced');
      socket.off('traitor_exposure');
      socket.off('overt_action_detected');
      socket.off('pvp_combat_result');
      socket.off('player_eliminated');
      socket.off('turn_timer_started');
      socket.off('game_over');
      socket.off('fine_resolved');
      socket.off('fine_rejected');
      socket.off('combat_initiated');
      socket.off('combat_round_update');
      socket.off('combat_ended');
      socket.off('error');
    };
  }, [socket, notify]);

  // Detect when jedi dies
  const prevJediAliveRef = useRef(true);
  useEffect(() => {
    if (!privateState) return;
    const jediAlive = (privateState.myUnits || []).some(u => u.unit_type === 'jedi_avatar');

    // If jedi was alive but now isn't, show alert
    if (prevJediAliveRef.current && !jediAlive) {
      setJediDeathAlert(true);
      setTimeout(() => setJediDeathAlert(false), 5000);
    }
    prevJediAliveRef.current = jediAlive;
  }, [privateState]);

  // Fix black screen issues by forcing re-renders on focus changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab came back into focus, force update
        setPublicState(s => s ? {...s} : null);
      }
    };

    const handleFocus = () => {
      // Window regained focus - force re-render
      setPublicState(s => s ? {...s} : null);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Join a game room - waits for socket to be connected first
  const joinGame = useCallback((sid, pid, spInfo) => {
    if (spInfo) setStartingPlanetInfo(spInfo);
    console.log('joinGame called', { sid, pid, socketExists: !!socket });
    if (!socket) {
      console.log('joinGame: no socket, aborting');
      return;
    }

    setSessionId(sid);

    function doJoin() {
      console.log('emitting join_game', { sid, pid });
      socket.emit('join_game', { sessionId: sid, playerId: pid });
    }

    if (socket.connected) {
      console.log('socket already connected, joining immediately');
      doJoin();
    } else {
      console.log('socket not connected, connecting first...');
      socket.connect();
      socket.once('connect', () => {
        console.log('socket now connected, joining');
        doJoin();
      });
    }
  }, [socket]);

  const markReady    = useCallback(() => socket?.emit('player_ready'), [socket]);
  const submitTurn   = useCallback(() => { socket?.emit('submit_turn'); notify('TURN SUBMITTED'); }, [socket, notify]);
  const endTurnEarly = useCallback(() => socket?.emit('end_turn_early'), [socket]);

  const sendAction = useCallback((actionObj) => {
    console.log('sendAction:', actionObj.type);
    socket?.emit('rebel_action', actionObj);
  }, [socket]);

  const combatRound = useCallback((combatId) => {
    console.log('combatRound:', combatId);
    socket?.emit('rebel_action', { type: 'combat_round', combatId });
  }, [socket]);

  const withdraw = useCallback((combatId) => {
    console.log('withdraw from combat:', combatId);
    socket?.emit('combat_withdraw', { combatId });
  }, [socket]);

  const move       = useCallback((planetId) => sendAction({ type: 'move', planetId }), [sendAction]);
  const recruit    = useCallback((planetId) => sendAction({ type: 'recruit', planetId }), [sendAction]);
  const intel      = useCallback((planetId) => sendAction({ type: 'intel', planetId }), [sendAction]);
  const sabotage   = useCallback((planetId) => sendAction({ type: 'sabotage', planetId }), [sendAction]);
  const incite     = useCallback((planetId) => sendAction({ type: 'incite', planetId }), [sendAction]);
  const hide       = useCallback((planetId) => sendAction({ type: 'hide', planetId }), [sendAction]);
  const earnMoney  = useCallback((planetId) => sendAction({ type: 'earn_money', planetId }), [sendAction]);
  const stealMoney = useCallback((planetId) => sendAction({ type: 'steal_money', planetId }), [sendAction]);

  const useForcePower = useCallback((powerName) =>
    sendAction({ type: 'force_powers', powerName }), [sendAction]);
  const discoverForceMysteries = useCallback(() =>
    sendAction({ type: 'discover_force_mysteries' }), [sendAction]);

  const contribute   = useCallback((factionId, amount, mode='normal', unitType=null) => {
    const action = { type: mode === 'research' ? 'research' : 'contribute', planetId: privateState?.currentPlanet, factionId, amount };
    if (mode === 'research' && unitType) {
      action.targetId = unitType;
    }
    return sendAction(action);
  }, [sendAction, privateState]);
  const foundFaction = useCallback((factionName, ideology, planetId) =>
    sendAction({ type: 'found', planetId, factionName, ideology }), [sendAction]);
  const foundCell    = useCallback((factionId) =>
    sendAction({ type: 'found_cell', planetId: privateState?.currentPlanet, factionId }), [sendAction, privateState]);
  const investigate  = useCallback((factionId) =>
    sendAction({ type: 'investigate', planetId: privateState?.currentPlanet, factionId }), [sendAction, privateState]);
  const denounce     = useCallback((factionId) =>
    sendAction({ type: 'denounce', planetId: privateState?.currentPlanet, factionId }), [sendAction, privateState]);

  const moveUnit    = useCallback((unitId, targetId, layer) =>
    sendAction({ type: 'unit_move', planetId: privateState?.currentPlanet, unitId, targetId, layer }), [sendAction, privateState]);
  const produceUnit = useCallback((planetId, unitType) =>
    sendAction({ type: 'unit_produce', planetId, unitType }), [sendAction]);
  const attackWith  = useCallback((planetId, targetId, layer) =>
    sendAction({ type: 'unit_attack', planetId, targetId, layer }), [sendAction]);
  const attackEmpire = useCallback((planetId, layer) =>
    sendAction({ type: 'unit_attack', planetId, layer }), [sendAction]);
  const attackRebel = useCallback((targetPlayerId, layer) =>
    sendAction({ type: 'rebel_attack', targetPlayerId, layer }), [sendAction]);
  const toggleUnitHidden = useCallback((unitId) => {
    socket.emit('toggle_unit_hidden', unitId);
  }, [socket]);

  return {
    sessionId, playerId, myColor, myName,
    publicState, privateState,
    lobbyPlayers, allReady,
    feedEntries, notification, governorThinking, combatReports,
    selectedPlanet, setSelectedPlanet,
    selectedUnit, setSelectedUnit,
    adminOpen, setAdminOpen,
    investigateResult, setInvestigateResult,
    traitorAlert, jediDeathAlert, setJediDeathAlert, startingPlanetInfo,
    pvpCombatResult, setPvpCombatResult,
    activeCombatReport, setActiveCombatReport,
    detentionAlert, setDetentionAlert,
    activeCombat, setActiveCombat,
    socket,
    joinGame, markReady, submitTurn, endTurnEarly,
    sendAction, combatRound, withdraw, move, recruit, intel, sabotage, incite, hide, earnMoney, stealMoney, useForcePower, discoverForceMysteries,
    contribute, foundFaction, foundCell, investigate, denounce,
    moveUnit, produceUnit, attackWith, attackEmpire, attackRebel, toggleUnitHidden,
  };
}
