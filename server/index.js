require('dotenv').config();
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const db      = require('./lib/db');

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
console.log('SERVER STARTING - CLIENT_ORIGIN:', clientOrigin);

const corsOptions = {
  origin: true, // Allow all origins for now
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  credentials: true,
};

const sessionRoutes = require('./routes/sessions');
const registerSocketHandlers = require('./routes/socket');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.get('/health', (_, res) => res.json({ status:'ok', ts:Date.now() }));
app.use('/api', sessionRoutes);
registerSocketHandlers(io);

// Initialize database schema (non-blocking)
function initializeDatabase() {
  db.pool.query(`
    CREATE TABLE IF NOT EXISTS faction_unit_research (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      faction_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
      session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      unit_type     TEXT NOT NULL,
      research_points INTEGER NOT NULL DEFAULT 0,
      unlocked      BOOLEAN NOT NULL DEFAULT FALSE,
      unlocked_round INTEGER,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(faction_id, unit_type)
    )
  `).then(() => {
    db.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_faction_unit_research ON faction_unit_research(faction_id, unit_type)
    `).then(() => console.log('✓ faction_unit_research table ready')).catch(err => {
      if (!err.message.includes('already exists')) console.warn('Index creation:', err.message);
    });
  }).catch(err => {
    if (!err.message.includes('already exists')) console.warn('Table creation:', err.message);
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Signal Dark v2 on port ${PORT}`);
  initializeDatabase();
});
