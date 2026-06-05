-- Migration: Add fleet system support
-- Run this against your Supabase database to add the fleet_id column and fleets table

-- 1. Add fleet_id column to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS fleet_id UUID;

-- 2. Create fleets table
CREATE TABLE IF NOT EXISTS fleets (
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

-- 3. Add foreign key constraint for fleet_id
ALTER TABLE units DROP CONSTRAINT IF EXISTS units_fleet_id_fkey;
ALTER TABLE units ADD CONSTRAINT units_fleet_id_fkey FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE SET NULL;

-- 4. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_units_fleet ON units(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleets_session_owner ON fleets(session_id, owner);
CREATE INDEX IF NOT EXISTS idx_fleets_location ON fleets(session_id, planet_id, layer);

-- Done! The fleet system is now ready.
