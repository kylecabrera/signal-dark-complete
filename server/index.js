require('dotenv').config();
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const db      = require('./lib/db');

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
console.log('SERVER STARTING - CLIENT_ORIGIN:', clientOrigin);
console.log('PORT env var:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development and production
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const sessionRoutes = require('./routes/sessions');
const registerSocketHandlers = require('./routes/socket');

const app        = express();
const httpServer = http.createServer(app);

console.log('Creating Socket.io server with corsOptions:', corsOptions);
const io         = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});

console.log('✓ Socket.io server created');

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
});

io.on('error', (err) => {
  console.error('Socket.io error:', err);
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} from ${req.ip}`);
  next();
});

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Simple health check - responds immediately
app.get('/health', (_, res) => {
  console.log('Health check called');
  res.json({ status:'ok', ts:Date.now() });
});
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

console.log('About to call httpServer.listen');
const server = httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server listening on 0.0.0.0:${PORT}`);
});

console.log('httpServer.listen called, waiting for callback');

server.on('error', (err) => {
  console.error('SERVER ERROR:', err);
  process.exit(1);
});

server.on('listening', () => {
  console.log('✓ Server emitted listening event');
});

server.on('close', () => {
  console.log('✗ Server closed unexpectedly');
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Keep the process alive
setTimeout(() => {
  console.log('✓ Server still alive after 10 seconds');
}, 10000);
