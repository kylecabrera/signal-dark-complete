# Faction Discovery System

## Overview
Factions are now hidden until players discover them through various means. This adds an element of mystery and discovery to the game.

## How Factions Are Discovered

### 1. **Intel Gathering (Primary Method)**
When a player performs an **Intel** action at a planet, they have a **12% chance** to discover factions based in the same region as that planet.

Additionally:
- Factions with **cells present on that planet** are always discovered
- The discovery system respects regions (Core Worlds, Outer Rim, etc.)

### 2. **Direct Interaction**
Factions are auto-discovered when players:
- **Found** a new faction
- **Contribute** credits to a faction
- **Investigate** a faction (audit/denunciation mechanics)
- **Denounce** a faction

### 3. **Initial State**
- Players start with **zero visible factions**
- All non-traitor factions are hidden until discovered
- The traitor faction remains completely hidden until specifically discovered

## Implementation Details

### Database Changes
- New table: `faction_discoveries(session_id, player_id, faction_id, discovered_round)`
- Tracks which factions each player has discovered and when
- Index on `(session_id, player_id)` for fast lookups

### Code Changes

**Database (`db.js`)**
- `recordFactionDiscovery()` - Mark a faction as discovered for a player
- `getDiscoveredFactions()` - Retrieve list of discovered faction IDs for a player

**Factions (`factions.js`)**
- `buildClientFactionState()` - Now filters to only return discovered factions
- `foundFaction()` - Auto-discovers the faction for the founder
- `contributeToFaction()` - Auto-discovers when contributing
- `investigateFaction()` - Auto-discovers when investigating
- `denounceFaction()` - Auto-discovers when denouncing

**Engine (`engine.js`)**
- Intel action discovery logic:
  - Always discover factions with cells on the current planet
  - 12% chance to discover factions in the same region (based on home planet type)
  - Records discovery for the player

## Game Balance

### Discovery Rate
- **12% per intel action** for regional factions
- ~7-8 intel actions to discover most factions in a region
- ~14+ intel actions to discover all factions across the galaxy

### Strategy Implications
- Players should perform intel gathering to map out available factions
- Early game has limited faction options visible
- Different players may discover different factions at different times
- Creates asymmetric information where players have different faction knowledge

## Example Scenario

1. Player joins game and sees 0 factions
2. Player performs Intel at a planet in the Outer Rim
   - Discovers 1-2 Outer Rim factions (12% chance each)
3. Player performs Intel at a Core Worlds planet
   - Discovers 1-2 Core Worlds factions
4. Player performs Intel at same planet with faction cells
   - Always discovers those factions
5. After multiple intel actions, player has mapped ~30-50% of factions

## Future Enhancements
- Could add other discovery methods (spies, rebel broadcasts, etc.)
- Could vary discovery chance based on planet suspicion levels
- Could add discovery events in the intel leak feed
- Could unlock faction special abilities upon discovery
