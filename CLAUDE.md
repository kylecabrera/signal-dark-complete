# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Signal Dark is an asymmetric hidden-movement rebellion game. Human players are rebels; four AI governors (powered by Claude) act as the opposing faction. The project is a Node.js/Express + Socket.io server backed by PostgreSQL (Supabase), plus a React/Vite client with no routing library.

## Dev commands

**Server** (in `server/`):
```bash
npm run dev   # nodemon index.js — auto-restarts on changes
npm start     # node index.js — production
```

**Client** (in `client/`):
```bash
npm run dev     # Vite dev server — http://localhost:5173
npm run build   # production build
npm run preview # preview production build
```

**Workflow**: Run both in parallel in separate terminals. Server auto-reloads on code changes; client HMR is built-in via Vite.

No test runner or linter is configured.

## Required environment setup

**Server** (`server/.env`):
Copy from `server/.env.example` and fill in:
- `ANTHROPIC_API_KEY` — from console.anthropic.com; used for all four AI governor calls each turn
- `DATABASE_URL` — Supabase Transaction pooler URI (port 6543, not 5432)
- `ADMIN_TOKEN` — any secret string; gates the F1 admin panel
- `PORT` — optional; defaults to 3001
- `CLIENT_ORIGIN` — optional; defaults to http://localhost:5173

**Client** (`client/.env`):
```
VITE_SERVER_URL=http://localhost:3001
```

## Key files for common tasks

| Task | Key files |
|---|---|
| Modify game balance (costs, thresholds, unit stats) | `server/lib/config.js` |
| Add/modify governor behavior or system prompt | `server/lib/governors.js` |
| Change game state logic or validation | `server/lib/engine.js` |
| Modify planet/map data or initial state | `server/lib/world.js` |
| Change database schema or queries | `db/schema.sql`, `server/lib/db.js` |
| Add client UI components | `client/src/components/` |
| Modify game state hook (central state) | `client/src/useGame.js` |
| Handle Socket.io events | `server/routes/socket.js` |

## Architecture

### Client structure
The client has **no routing library** — it's a single-page app with conditional rendering. All game views (lobby, map, sidebar, admin panel) are in `App.jsx` and controlled by `useGame.js` state. Screens switch based on `publicState.status` and `publicState.phase`.

### Turn loop
Every game round works in two phases:
1. **Rebel phase** (`phase = 'rebel'`): players emit `rebel_action` socket events. Each action is validated by `engine.applyRebelAction`, written as a `sealed_move`, and immediately mutates `planet_state` in the DB.
2. **Governor phase**: triggered when all players submit (or the turn timer fires). `engine.processGovernorTurn` runs all four governor AI agents in parallel via `governors.runAllGovernors`, applies their actions, runs combat and production, increments the round, and broadcasts results.

### Server module responsibilities
| File | Responsibility |
|---|---|
| `routes/socket.js` | All Socket.io event handlers; owns the turn timer |
| `routes/sessions.js` | REST endpoints: create/join session, admin panel |
| `lib/engine.js` | `applyRebelAction`, `processGovernorTurn`, `buildPublicState`, `buildPrivateState` — the single source of truth for game state mutations |
| `lib/governors.js` | Four Claude API calls (Siris-Vael, Crassus-9, Maren Osk, Vektis-4) plus the Quorum (alert ≥ 3); each governor has a distinct personality bias hard-coded into its system prompt |
| `lib/world.js` | Static map data (15 planets, hyperlane graph), initial state factories |
| `lib/config.js` | All tuneable values: action costs, unit stats, faction rules, win thresholds |
| `lib/intel.js` | Converts sealed moves into intel leaks; updates Siris probability model |
| `lib/units.js` | Combat resolution, production queue processing, unit movement |
| `lib/factions.js` | Faction lifecycle: found, contribute, investigate, denounce; traitor faction logic |
| `lib/db.js` | All SQL queries; pool via `pg` |

### Client module responsibilities
| File | Responsibility |
|---|---|
| `useGame.js` | Central state hook; holds `publicState`, `privateState`, all socket listeners |
| `SocketContext.jsx` | Socket.io provider; exposes `useSocket()` |
| `components/SectorMap.jsx` | SVG map of the 15-planet sector; primary interaction surface |
| `components/Sidebar.jsx` | Action panel, governor feed, faction list |
| `components/AdminPanel.jsx` | F1 admin panel — place units, edit planets, queue production |
| `components/FactionPanel.jsx` | Faction actions: found, contribute, investigate, denounce |

### State model
- **Public state** (`buildPublicState`) — sent to all players: planets, alert level, rebellion/suppression meters, visible units, submitted player list.
- **Private state** (`buildPrivateState`) — sent only to the individual rebel: current planet, actions remaining, credits, sealed move log, own units, faction standings.
- **Sealed moves** — written to DB only; governors never see them directly. Intel leaks are derived probabilistically from them in `intel.js`.
- The `is_traitor` flag on factions is never sent to clients; filtered server-side in every query.

### AI governor model
All four governors call `claude-sonnet-4-20250514` via `governors.callGovernor`. They share a `UNIFIED_ACTION_SCHEMA` (JSON response format) but receive different system prompts with personality biases. Vektis-4 additionally receives a `vektisMemory` object tracking per-round visit and action patterns. The Quorum fires only when `alert_value >= 3` and synthesises the other four governors' proposals.

Governor fallbacks are hard-coded in `FALLBACKS` — if the Claude call throws, the governor still takes one default action.

## Common development tasks

### Game balance tuning
Edit `server/lib/config.js` and restart the server. Key knobs:
- `ACTIONS_PER_TURN`, `STARTING_CREDITS` — rebel economy
- `REBELLION_WIN_THRESHOLD`, `SUPPRESSION_LOSE_THRESHOLD` — win conditions (both default to 100)
- `ACTIONS[type].rebellion_delta / suppression_delta / base_leak_chance` — action balance
- `UNIT_TYPES[type].cost / buildTime / strength` — unit balance
- `FACTIONS.IDEOLOGIES` — faction ability tuning

### Working with AI governors
All governors are called in `server/lib/governors.js:callGovernor()`. Each has a different system prompt with personality bias. To change a governor's behavior:
1. Edit the system prompt in the corresponding `GOV_SYSTEM_PROMPTS` entry
2. Modify the `UNIFIED_ACTION_SCHEMA` if the JSON response format changes
3. Restart the server; the Anthropic SDK will use the new prompt on the next governor turn

The Quorum fires only when `alert_value >= 3`.

### Working with the database
Schema is in `db/schema.sql` — modify via Supabase SQL editor and restart.
All queries are in `server/lib/db.js` — uses the `pg` pool from `config()`.
Game state is stored as JSONB in `game_sessions.planet_state` for performance; modify via `engine.js` functions.

### Admin panel
Press F1 during a game to open it. Modify `client/src/components/AdminPanel.jsx` for new admin features.
Debug state (includes traitor faction flag): `GET /api/admin/{SESSION_ID}/state?adminToken={ADMIN_TOKEN}`

### Testing locally
1. Open http://localhost:5173 in two browser tabs
2. Tab 1: enter name → New campaign → copy the 6-letter code
3. Tab 2: enter name → Join campaign → paste code
4. Both click Ready → game starts
5. Press F1 to open admin panel and modify game state mid-game

## Deployment target

Railway (server) + Vercel (client) + Supabase (database). Change `CLIENT_ORIGIN` on the server and `VITE_SERVER_URL` on the client to match deployed URLs.
