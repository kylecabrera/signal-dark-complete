# Signal Dark — Complete Build

Asymmetric hidden-movement rebellion game. Human rebels vs four AI governors.

## Quick start (Mac/Linux)

### 1. Database
Go to supabase.com → new project → SQL Editor → paste db/schema.sql → Run.
Copy the Transaction pooler connection string (port 6543) from Settings → Database.

### 2. Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env — fill in ANTHROPIC_API_KEY, DATABASE_URL, set ADMIN_TOKEN to anything
npm run dev
# Should print: Signal Dark v2 on port 3001
```

### 3. Client (second terminal)
```bash
cd client
npm install
echo "VITE_SERVER_URL=http://localhost:3001" > .env
npm run dev
# Should print: Local: http://localhost:5173/
```

### 4. Play
Open http://localhost:5173 in two browser tabs.
Tab 1: enter name → New campaign → get a 6-letter code.
Tab 2: enter name → Join campaign → paste code.
Both click Ready → game starts.

## Windows
Same steps but use PowerShell and replace `cp` with `copy`:
```powershell
copy .env.example .env
notepad .env
```

## Admin panel
Press F1 during a game to open the admin panel.
Enter your ADMIN_TOKEN to authenticate.
Place units, edit planet values, and queue production.

Debug state (all data including traitor faction flag):
GET http://localhost:3001/api/admin/SESSION_ID/state?adminToken=your-token

## Environment variables

### server/.env
| Variable | Description |
|---|---|
| ANTHROPIC_API_KEY | From console.anthropic.com |
| DATABASE_URL | Supabase Transaction pooler URI (port 6543) |
| PORT | Default 3001 |
| CLIENT_ORIGIN | Default http://localhost:5173 |
| ADMIN_TOKEN | Any secret string you choose |

### client/.env
| Variable | Value |
|---|---|
| VITE_SERVER_URL | http://localhost:3001 |

## Tuning the game
Edit server/lib/config.js to change unit costs, planet econ values,
faction thresholds, combat modifiers, and starting units.
Restart the server after editing.

## Deployment
Railway (server) + Vercel (client) + Supabase (database).
Change CLIENT_ORIGIN to your Vercel URL and VITE_SERVER_URL to your Railway URL.
