-- Signal Dark v2 — Full Schema
-- Run in Supabase SQL editor or psql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- Game sessions
-- ─────────────────────────────────────────────
CREATE TABLE game_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code                CHAR(6) NOT NULL UNIQUE,
  status              TEXT NOT NULL DEFAULT 'lobby',       -- lobby|active|complete
  round               INTEGER NOT NULL DEFAULT 1,
  phase               TEXT NOT NULL DEFAULT 'rebel',       -- rebel|governor|production
  alert_level         TEXT NOT NULL DEFAULT 'ELEVATED',
  alert_value         INTEGER NOT NULL DEFAULT 1,
  rebellion_strength  INTEGER NOT NULL DEFAULT 12,
  empire_level        INTEGER NOT NULL DEFAULT 18,
  planet_state        JSONB NOT NULL DEFAULT '[]',
  governor_state      JSONB NOT NULL DEFAULT '{}',
  vektis_memory       JSONB NOT NULL DEFAULT '{}',
  watched_lanes       JSONB NOT NULL DEFAULT '[]',
  locked_lanes        JSONB NOT NULL DEFAULT '[]',
  submitted_players   JSONB NOT NULL DEFAULT '[]',
  winner              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Players
-- ─────────────────────────────────────────────
CREATE TABLE players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  socket_id     TEXT,
  display_name  TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#40c880',
  is_ready      BOOLEAN NOT NULL DEFAULT FALSE,
  connected     BOOLEAN NOT NULL DEFAULT FALSE,
  is_eliminated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Rebel private state
-- ─────────────────────────────────────────────
CREATE TABLE rebel_state (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id       UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  current_planet  TEXT NOT NULL DEFAULT 'p03',
  actions_used    INTEGER NOT NULL DEFAULT 0,
  credits         INTEGER NOT NULL DEFAULT 5,
  suspicion       INTEGER NOT NULL DEFAULT 0,
  UNIQUE(session_id, player_id)
);

-- ─────────────────────────────────────────────
-- Sealed move log — server only, never sent to governors
-- ─────────────────────────────────────────────
CREATE TABLE sealed_moves (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round         INTEGER NOT NULL,
  action_type   TEXT NOT NULL,
  planet_id     TEXT,
  target_id     TEXT,                  -- second planet for unit moves
  covert        BOOLEAN NOT NULL DEFAULT TRUE,
  label         TEXT NOT NULL,
  metadata      JSONB DEFAULT '{}',   -- extra action data (unit_id, faction_id, amount)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE sealed_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY sealed_moves_service_only ON sealed_moves USING (FALSE);

-- ─────────────────────────────────────────────
-- Intel leaks
-- ─────────────────────────────────────────────
CREATE TABLE intel_leaks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round         INTEGER NOT NULL,
  planet_id     TEXT,
  leak_type     TEXT NOT NULL,         -- movement|informer|overt|traitor_exposure|unit_sighting|combat
  text          TEXT NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'LOW',  -- LOW|MEDIUM|HIGH|CERTAIN
  player_id     UUID REFERENCES players(id),  -- which rebel was exposed (if known)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Governor memory
-- ─────────────────────────────────────────────
CREATE TABLE governor_memory (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  governor      TEXT NOT NULL,
  round         INTEGER NOT NULL,
  brief         TEXT NOT NULL,
  response      JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, governor, round)
);

-- ─────────────────────────────────────────────
-- Units — the "dudes on a map"
-- ─────────────────────────────────────────────
CREATE TABLE units (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  unit_type     TEXT NOT NULL,         -- fleet|garrison|militia|operative
  owner         TEXT NOT NULL,         -- 'rebel:<player_id>'|'empire:<governor>'|'faction:<faction_id>'
  planet_id     TEXT NOT NULL,
  layer         TEXT NOT NULL DEFAULT 'surface',  -- orbit|surface
  strength          INTEGER NOT NULL DEFAULT 1,
  hp                INTEGER NOT NULL DEFAULT 3,
  is_hidden         BOOLEAN NOT NULL DEFAULT FALSE,
  can_toggle_hidden BOOLEAN NOT NULL DEFAULT FALSE,  -- whether player can toggle visibility
  jump_distance     INTEGER NOT NULL DEFAULT 1,     -- hyperlane hops per move action
  transport_capacity INTEGER NOT NULL DEFAULT 0,    -- max friendly units this ship can carry
  transported_by    UUID REFERENCES units(id),      -- which fleet is transporting this unit
  designation       TEXT,                           -- display label (e.g. "Star Destroyer")
  fleet_id          UUID,                           -- which fleet this unit belongs to (nullable = ungrouped)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Fleets — groups of units moving together
-- ─────────────────────────────────────────────
CREATE TABLE fleets (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  owner             TEXT NOT NULL,         -- 'rebel:<player_id>'|'empire:<governor>'|'faction:<faction_id>'
  name              TEXT NOT NULL,
  planet_id         TEXT NOT NULL,
  layer             TEXT NOT NULL,         -- orbit|surface
  auto_grouped      BOOLEAN NOT NULL DEFAULT FALSE,
  created_round     INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Production queue — what's being built where
-- ─────────────────────────────────────────────
CREATE TABLE production_queue (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  planet_id     TEXT NOT NULL,
  unit_type     TEXT NOT NULL,
  owner         TEXT NOT NULL,
  rounds_remaining INTEGER NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Combat log
-- ─────────────────────────────────────────────
CREATE TABLE combat_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round           INTEGER NOT NULL,
  planet_id       TEXT NOT NULL,
  layer           TEXT NOT NULL,
  attacker_owner  TEXT NOT NULL,
  defender_owner  TEXT NOT NULL,
  attacker_losses INTEGER NOT NULL DEFAULT 0,
  defender_losses INTEGER NOT NULL DEFAULT 0,
  outcome         TEXT NOT NULL,        -- attacker_wins|defender_wins|draw
  summary         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Combat feed — visible combat events for players
-- ─────────────────────────────────────────────
CREATE TABLE combat_feed (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  round         INTEGER NOT NULL,
  planet_id     TEXT NOT NULL,
  description   TEXT NOT NULL,         -- human-readable combat event
  is_nearby     BOOLEAN NOT NULL DEFAULT FALSE,  -- intel reveals nearby system combat
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Factions
-- ─────────────────────────────────────────────
CREATE TABLE factions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id            UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  ideology              TEXT NOT NULL,        -- liberation_front|workers_alliance|fringe_collective|shadow_network|loyalist_splinter
  home_planet           TEXT NOT NULL,
  is_traitor            BOOLEAN NOT NULL DEFAULT FALSE,  -- sealed — never sent to clients
  resource_pool         INTEGER NOT NULL DEFAULT 0,
  reputation            INTEGER NOT NULL DEFAULT 50,     -- 0-100, visible to all
  is_denounced          BOOLEAN NOT NULL DEFAULT FALSE,
  denounced_by          UUID REFERENCES players(id),
  denounced_round       INTEGER,
  created_by            UUID REFERENCES players(id),
  unlocked_ship_classes JSONB NOT NULL DEFAULT '[]',
  allowed_unit_types    JSONB NOT NULL DEFAULT '[]',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: clients can see everything EXCEPT is_traitor
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
CREATE POLICY factions_hide_traitor_flag ON factions
  USING (TRUE)
  WITH CHECK (TRUE);
-- Note: the is_traitor column is filtered in the server layer, never sent in API responses

-- ─────────────────────────────────────────────
-- Faction contributions — the ledger
-- ─────────────────────────────────────────────
CREATE TABLE faction_contributions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faction_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,
  round         INTEGER NOT NULL,
  action_type   TEXT NOT NULL DEFAULT 'contribute',  -- contribute|found|cell_operation
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Faction cells — planet presence
-- ─────────────────────────────────────────────
CREATE TABLE faction_cells (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faction_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  planet_id     TEXT NOT NULL,
  strength      INTEGER NOT NULL DEFAULT 1,   -- 1-5, grows with contribution
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(faction_id, planet_id)
);

-- ─────────────────────────────────────────────
-- Investigation log — who has been investigating which factions
-- ─────────────────────────────────────────────
CREATE TABLE investigations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  faction_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  round         INTEGER NOT NULL,
  clues_found   INTEGER NOT NULL DEFAULT 0,  -- accumulates toward denunciation threshold
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Force users — tracks force user progression and apprenticeships
-- ─────────────────────────────────────────────
CREATE TABLE force_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id     UUID REFERENCES players(id) ON DELETE CASCADE,
  force_tier    INTEGER NOT NULL DEFAULT 1,        -- 1-10 progression tier
  force_points  INTEGER NOT NULL DEFAULT 0,        -- accumulated points
  alignment     INTEGER NOT NULL DEFAULT 0,        -- -100 to 100 (dark to light)
  master_id     UUID REFERENCES force_users(id),   -- master force user (for apprentices)
  apprentice_ids TEXT DEFAULT '[]',                -- JSON array of apprentice UUIDs
  discovered_round INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, player_id)
);

-- ─────────────────────────────────────────────
-- Discovered fleets — tracks which fleets player has seen through intel
-- ─────────────────────────────────────────────
CREATE TABLE discovered_fleets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  fleet_owner   TEXT NOT NULL,         -- 'empire:<gov>|faction:<id>|rebel:<player_id>'
  planet_id     TEXT NOT NULL,
  round_discovered INTEGER NOT NULL,
  unit_count    INTEGER NOT NULL DEFAULT 1,
  strongest_unit TEXT,                 -- designation of strongest unit in fleet
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, player_id, fleet_owner, planet_id)
);

-- ─────────────────────────────────────────────
-- Force power uses — tracks temporary power usage
-- ─────────────────────────────────────────────
CREATE TABLE force_power_uses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  force_user_id UUID NOT NULL REFERENCES force_users(id) ON DELETE CASCADE,
  power_name    TEXT NOT NULL,                     -- e.g., 'find_apprentice'
  round_used    INTEGER NOT NULL,
  duration      INTEGER NOT NULL DEFAULT 1,        -- rounds the power is active
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Faction discoveries — tracks which factions each player has discovered
-- ─────────────────────────────────────────────
CREATE TABLE faction_discoveries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id     UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  faction_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  discovered_round INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, player_id, faction_id)
);

-- ─────────────────────────────────────────────
-- Alliances — rebel factions can form alliances with custom names
-- ─────────────────────────────────────────────
CREATE TABLE alliances (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  created_by    UUID NOT NULL REFERENCES players(id),
  created_round INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Alliance memberships — tracks which factions are in which alliance
-- ─────────────────────────────────────────────
CREATE TABLE alliance_members (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alliance_id   UUID NOT NULL REFERENCES alliances(id) ON DELETE CASCADE,
  faction_id    UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
  session_id    UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  joined_round  INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(alliance_id, faction_id)
);

-- ─────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────
CREATE INDEX idx_sessions_code ON game_sessions(code);
CREATE INDEX idx_players_session ON players(session_id);
CREATE INDEX idx_sealed_session_round ON sealed_moves(session_id, round);
CREATE INDEX idx_leaks_session_round ON intel_leaks(session_id, round);
CREATE INDEX idx_units_session ON units(session_id, planet_id);
CREATE INDEX idx_production_session ON production_queue(session_id, planet_id);
CREATE INDEX idx_combat_session ON combat_log(session_id, round);
CREATE INDEX idx_factions_session ON factions(session_id);
CREATE INDEX idx_contributions_faction ON faction_contributions(faction_id, player_id);
CREATE INDEX idx_cells_faction ON faction_cells(faction_id, planet_id);
CREATE INDEX idx_investigations ON investigations(session_id, player_id, faction_id);
CREATE INDEX idx_force_users_session ON force_users(session_id, player_id);
CREATE INDEX idx_force_power_uses_session ON force_power_uses(session_id, force_user_id);
CREATE INDEX idx_units_fleet ON units(fleet_id);
CREATE INDEX idx_fleets_session_owner ON fleets(session_id, owner);
CREATE INDEX idx_fleets_location ON fleets(session_id, planet_id, layer);

-- ─────────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sessions_updated BEFORE UPDATE ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_units_updated BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Migration: add unit fields (run against existing DB)
-- ─────────────────────────────────────────────
ALTER TABLE units ADD COLUMN IF NOT EXISTS jump_distance      INTEGER NOT NULL DEFAULT 1;
ALTER TABLE units ADD COLUMN IF NOT EXISTS transport_capacity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE units ADD COLUMN IF NOT EXISTS designation        TEXT;

-- ─────────────────────────────────────────────
-- Faction unit research — tracks unlock progress per unit type per faction
-- ─────────────────────────────────────────────
CREATE TABLE faction_unit_research (
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
);

-- ─────────────────────────────────────────────
-- Migration: add faction fields
-- ─────────────────────────────────────────────
ALTER TABLE factions ADD COLUMN IF NOT EXISTS unlocked_ship_classes JSONB DEFAULT '[]';
ALTER TABLE rebel_state ADD COLUMN IF NOT EXISTS force_alignment INTEGER DEFAULT 0;
ALTER TABLE rebel_state ADD COLUMN IF NOT EXISTS force_strength INTEGER DEFAULT 0;
ALTER TABLE rebel_state ADD COLUMN IF NOT EXISTS starting_planet TEXT;

-- ─────────────────────────────────────────────
-- Migration: add fleet system
-- ─────────────────────────────────────────────
ALTER TABLE units ADD COLUMN IF NOT EXISTS fleet_id UUID;
ALTER TABLE units DROP CONSTRAINT IF EXISTS units_fleet_id_fkey;
ALTER TABLE units ADD CONSTRAINT units_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE SET NULL;
