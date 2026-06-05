const db      = require('../lib/db');
const engine  = require('../lib/engine');
const units   = require('../lib/units');
const CONFIG  = require('../lib/config');
const { getPlanetSector } = require('../lib/world');

const turnTimers = new Map();
const TURN_TIMEOUT_MS = (parseInt(process.env.TURN_TIMEOUT_SECONDS)||300) * 1000;

module.exports = function registerSocketHandlers(io) {

  io.on('connection', socket => {
    console.log(`Socket connected: ${socket.id}`);

    // ── Join game room ─────────────────────────
    socket.on('join_game', async ({ sessionId, playerId }) => {
      try {
        console.log(`[join_game] sessionId=${sessionId}, playerId=${playerId}`);
        const session = await db.getSessionById(sessionId);
        if (!session) return socket.emit('error', { message:'Session not found' });

        const players = await db.getPlayers(sessionId);
        const player  = players.find(p => p.id === playerId);
        if (!player) return socket.emit('error', { message:'Player not found' });

        await db.updatePlayerSocket(playerId, socket.id, true);
        socket.join(sessionId);
        socket.data = { sessionId, playerId };

        // Public state to all
        io.to(sessionId).emit('state_update', await engine.buildPublicState(session, players));

        // Private state to this player only
        const privateState = await engine.buildPrivateState(sessionId, playerId);
        if (privateState) socket.emit('private_state', privateState);

        socket.emit('joined', { playerId, displayName:player.display_name, color:player.color });
        console.log(`${player.display_name} joined ${session.code}`);
      } catch(err) {
        console.error('join_game error:', err);
        socket.emit('error', { message:'Failed to join' });
      }
    });

    // ── Ready up (lobby) ───────────────────────
    socket.on('player_ready', async () => {
      try {
        const { sessionId, playerId } = socket.data;
        if (!sessionId) return;
        await db.pool.query('UPDATE players SET is_ready=true WHERE id=$1',[playerId]);
        const players  = await db.getPlayers(sessionId);
        const allReady = players.length >= 1 && players.every(p=>p.is_ready);
        io.to(sessionId).emit('lobby_update', {
          players: players.map(p=>({ id:p.id, displayName:p.display_name, color:p.color, isReady:p.is_ready })),
          allReady,
        });
        if (allReady) {
          await db.updateSession(sessionId, { status:'active' });
          await units.autoGroupFleets(sessionId, db);
          const session = await db.getSessionById(sessionId);
          io.to(sessionId).emit('game_started', await engine.buildPublicState(session, players));
          startTurnTimer(io, sessionId);
        }
      } catch(err) { console.error('player_ready error:', err); }
    });

    // ── Rebel action ───────────────────────────
    socket.on('rebel_action', async (action) => {
      try {
        const { sessionId, playerId } = socket.data;
        console.log(`[rebel_action] ${action.type} from ${playerId}`);
        if (!sessionId) return;

        const result = await engine.applyRebelAction(sessionId, playerId, action);

        if (!result.ok) {
          return socket.emit('action_rejected', { reason:result.error });
        }

        // Confirm to acting player
        socket.emit('action_confirmed', {
          type:   action.type,
          covert: result.covert,
          label:  result.label,
          // Faction results
          traitorExposed:   result.traitorExposed,
          investigateResult: result.canDenounce !== undefined ? {
            cluesFound:  result.cluesFound,
            totalClues:  result.totalClues,
            canDenounce: result.canDenounce,
            auditNote:   result.auditNote,
          } : undefined,
          denounceResult: result.outcome ? {
            outcome:         result.outcome,
            rebellionDelta:  result.rebellionDelta,
            suppressionDelta:result.suppressionDelta,
            factionName:     result.factionName,
          } : undefined,
          // Research results
          researchUnlocked: result.researchUnlocked,
          researchProgress: result.researchProgress,
          unlockedUnit:     result.unlockedUnit,
          // Action bonuses
          discoveries:   result.discoveries,
          recruitBonus:  result.recruitBonus,
          sabotageBonus: result.sabotageBonus,
          inciteBonus:   result.inciteBonus,
          // Detention/Crime
          detentionTriggered: result.detentionTriggered,
          fineAmount: result.fineAmount,
          detentionMessage: result.detentionMessage,
        });

        // If traitor exposed, all governors get the info (board visual)
        if (result.traitorExposed) {
          io.to(sessionId).emit('traitor_exposure', {
            message:'A rebel operative has been exposed through a Empire intelligence asset.',
          });
        }

        // Updated private state
        const privateState = await engine.buildPrivateState(sessionId, playerId);
        socket.emit('private_state', privateState);

        // Updated public state (suspicion, planets, units may have changed)
        const session = await db.getSessionById(sessionId);
        const players = await db.getPlayers(sessionId);
        io.to(sessionId).emit('state_update', await engine.buildPublicState(session, players));

        // Fleet movement event
        if (action.type === 'fleet_move' && result.fleet) {
          io.to(sessionId).emit('fleet_moved', {
            fleetId: result.fleet.id,
            owner: result.fleet.owner,
            planetId: result.fleet.planet_id,
            layer: result.fleet.layer,
            unitCount: result.unitCount,
          });
        }

        // Overt actions emit an event
        if (!result.covert) {
          io.to(sessionId).emit('overt_action_detected', {
            planetId: action.planetId,
            type:     action.type,
          });
        }

        // PvP combat resolved — notify both parties
        if (result.pvpCombat) {
          const { targetPlayerId } = result;
          const players = await db.getPlayers(sessionId);
          const attacker = players.find(p => p.id === playerId);
          const planet = (await db.getSessionById(sessionId)).planet_state.find(p => p.id === result.pvpCombat.planetId);

          const payload = {
            ...result.pvpCombat,
            attackerName: attacker.display_name,
            attackerColor: attacker.color,
            planetName: planet?.name || result.pvpCombat.planetId,
          };

          // Attacker sees the result
          socket.emit('pvp_combat_result', payload);

          // Defender sees the result too
          const defenderSock = [...io.sockets.sockets.values()]
            .find(s => s.data?.playerId === targetPlayerId);
          defenderSock?.emit('pvp_combat_result', payload);

          // If leader killed, broadcast elimination to room
          if (result.pvpCombat.leaderKilled) {
            io.to(sessionId).emit('player_eliminated', {
              playerId: targetPlayerId,
              playerName: result.pvpCombat.defenderName,
              killedBy: attacker.display_name,
            });
          }

          // Updated private state for defender (now eliminated or unit-less)
          if (defenderSock) {
            const defenderPrivate = await engine.buildPrivateState(sessionId, targetPlayerId);
            if (defenderPrivate) defenderSock.emit('private_state', defenderPrivate);
          }
        }
      } catch(err) {
        console.error('rebel_action error:', err.message, err.stack);
        socket.emit('action_rejected', { reason:err.message || 'Action failed' });
      }
    });

    // ── Handle fine payment or detention ────────
    socket.on('resolve_fine', async ({ action }) => {
      try {
        const { sessionId, playerId } = socket.data;
        if (!sessionId) return;

        const rebelState = await db.getRebelState(sessionId, playerId);
        if (!rebelState) return socket.emit('fine_rejected', { reason: 'Rebel state not found' });

        const currentPlanet = rebelState.current_planet;
        const sector = getPlanetSector(currentPlanet);
        const sectorCriminality = rebelState.criminality?.[sector] || 0;
        const fineAmount = sectorCriminality * 50;

        if (action === 'pay') {
          // Player attempts to pay fine
          const result = await db.payFine(sessionId, playerId, fineAmount);
          if (!result) {
            // Payment failed - insufficient funds, force detention
            await db.forceDetention(sessionId, playerId, 3);
            socket.emit('fine_resolved', {
              success: false,
              message: `Insufficient credits. Fine: ${fineAmount}cr. Detained for 3 turns.`,
              detained: true,
              detentionTurns: 3
            });
          } else {
            // Payment successful
            socket.emit('fine_resolved', {
              success: true,
              message: `Fine paid: ${fineAmount}cr`,
              creditsRemaining: result.credits
            });
          }
        } else if (action === 'accept') {
          // Player accepts detention instead of paying
          await db.forceDetention(sessionId, playerId, 3);
          socket.emit('fine_resolved', {
            success: false,
            message: 'Detained for 3 turns. Cannot move or hide units.',
            detained: true,
            detentionTurns: 3
          });
        }

        // Update private state
        const privateState = await engine.buildPrivateState(sessionId, playerId);
        socket.emit('private_state', privateState);

        // Update public state
        const session = await db.getSessionById(sessionId);
        const players = await db.getPlayers(sessionId);
        io.to(sessionId).emit('state_update', await engine.buildPublicState(session, players));
      } catch(err) {
        console.error('resolve_fine error:', err.message);
        socket.emit('fine_rejected', { reason: err.message || 'Fine resolution failed' });
      }
    });

    // ── Submit turn ────────────────────────────
    socket.on('submit_turn', async () => {
      try {
        const { sessionId, playerId } = socket.data;
        if (!sessionId) return;

        const session   = await db.getSessionById(sessionId);
        if (!session || session.phase !== 'rebel') return;

        const submitted = session.submitted_players || [];
        if (!submitted.includes(playerId)) submitted.push(playerId);
        await db.updateSession(sessionId, { submitted_players:submitted });

        const players = await db.getPlayers(sessionId);
        io.to(sessionId).emit('turn_submitted', {
          playerId,
          submittedCount: submitted.length,
          totalPlayers:   players.length,
        });

        if (submitted.length >= players.length) {
          await triggerGovernorTurn(io, sessionId);
        }
      } catch(err) { console.error('submit_turn error:', err); }
    });

    // ── End turn early ─────────────────────────
    socket.on('end_turn_early', async () => {
      const { sessionId } = socket.data;
      if (!sessionId) return;
      clearTurnTimer(sessionId);
      await triggerGovernorTurn(io, sessionId);
    });

    // ── Toggle unit hidden ──────────────────────
    socket.on('toggle_unit_hidden', async (unitId) => {
      try {
        const { sessionId, playerId } = socket.data;
        if (!sessionId || !unitId) return;

        const unit = await db.pool.query('SELECT * FROM units WHERE id=$1 AND session_id=$2', [unitId, sessionId]);
        if (unit.rows.length === 0) return socket.emit('error', { message:'Unit not found' });

        // Only owner can toggle
        if (!unit.rows[0].owner.startsWith(`rebel:${playerId}`)) {
          return socket.emit('error', { message:'Not your unit' });
        }

        await db.toggleUnitHidden(unitId);

        // Update has_hidden_units flag for this player
        const allUnits = await db.getUnits(sessionId);
        const playerUnits = allUnits.filter(u => u.owner === `rebel:${playerId}`);
        const CONFIG = require('../lib/config');
        const hasHidden = playerUnits.some(u => u.is_hidden);
        await db.updateRebelStateHasHiddenUnits(sessionId, playerId, hasHidden);

        const session = await db.getSessionById(sessionId);
        const players = await db.getPlayers(sessionId);

        // Broadcast updated state
        io.to(sessionId).emit('state_update', await engine.buildPublicState(session, players));
        for (const player of players) {
          const privateState = await engine.buildPrivateState(sessionId, player.id);
          const sock = [...io.sockets.sockets.values()].find(s=>s.data?.playerId===player.id);
          if (sock && privateState) sock.emit('private_state', privateState);
        }
      } catch(err) {
        console.error('toggle_unit_hidden error:', err);
        socket.emit('error', { message:'Toggle failed' });
      }
    });

    // ── Disconnect ─────────────────────────────
    socket.on('disconnect', async () => {
      const { sessionId, playerId } = socket.data||{};
      if (playerId) {
        await db.updatePlayerSocket(playerId, null, false);
        if (sessionId) {
          const players = await db.getPlayers(sessionId);
          io.to(sessionId).emit('player_disconnected', {
            playerId,
            connectedCount: players.filter(p=>p.connected).length,
          });
        }
      }
    });
  });

  // ── Governor turn trigger ────────────────────
  async function triggerGovernorTurn(io, sessionId) {
    clearTurnTimer(sessionId);
    io.to(sessionId).emit('governor_phase_started', { message:'All rebels submitted — governors convening…' });

    try {
      const { session, feedEntries, leaks, combatLog, newUnits } =
        await engine.processGovernorTurn(sessionId);

      const players = await db.getPlayers(sessionId);

      // Stagger feed entries for atmosphere
      for (const entry of feedEntries) {
        io.to(sessionId).emit('governor_broadcast', entry);
        await sleep(300);
      }

      // Combat reports
      for (const combat of (combatLog||[])) {
        io.to(sessionId).emit('combat_report', combat);
        await sleep(200);
      }

      // New units delivered
      if (newUnits?.length > 0) {
        io.to(sessionId).emit('units_produced', { count:newUnits.length });
      }

      // Updated public state
      io.to(sessionId).emit('state_update', await engine.buildPublicState(session, players));

      // Updated private state per player
      for (const player of players) {
        const privateState = await engine.buildPrivateState(session.id, player.id);
        const sock = [...io.sockets.sockets.values()].find(s=>s.data?.playerId===player.id);
        if (sock && privateState) sock.emit('private_state', privateState);
      }

      if (session.status === 'complete') {
        io.to(sessionId).emit('game_over', { winner:session.winner, round:session.round });
        return;
      }

      startTurnTimer(io, sessionId);
    } catch(err) {
      console.error('Governor turn error:', err.message, err.stack);
      io.to(sessionId).emit('error', { message:`Governor turn processing failed: ${err.message}` });
    }
  }

  function startTurnTimer(io, sessionId) {
    clearTurnTimer(sessionId);
    const t = setTimeout(() => triggerGovernorTurn(io, sessionId), TURN_TIMEOUT_MS);
    turnTimers.set(sessionId, t);
    io.to(sessionId).emit('turn_timer_started', { timeoutSeconds: TURN_TIMEOUT_MS/1000 });
  }

  function clearTurnTimer(sessionId) {
    const t = turnTimers.get(sessionId);
    if (t) { clearTimeout(t); turnTimers.delete(sessionId); }
  }
};

function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }
