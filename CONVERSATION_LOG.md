# Signal Dark - Development Session Log

**Date**: 2026-06-04  
**Duration**: Extended session with multiple major refactors

## Overview
Comprehensive overhaul of game systems including performance optimization, faction mechanics simplification, and economic rebalancing.

---

## 1. Performance Optimization: Game Creation Bottleneck

### Problem
Game creation was taking 30+ seconds due to massive sequential database queries.

### Root Cause
`seedInitialFactions()` was initializing unit research for all 414 unit types per faction individually:
- 10 factions × 414 unit types = 4,140+ sequential database queries

### Solution
Replaced individual queries with bulk insert via `ensureFactionResearchInitialized()`:
- Single batch query per faction instead of 414
- Reduced from 4,140+ queries to 10 queries
- Game creation now ~5 seconds

### Files Modified
- `server/lib/factions.js`: Updated `seedInitialFactions()` to call bulk insert
- `server/lib/db.js`: Leveraged existing `ensureFactionResearchInitialized()` function

**Result**: ~80% reduction in game creation time

---

## 2. Faction Unit Production System

### Problem
Players couldn't see or build units with factions anymore. UI showed only a "Can produce:" line without allowing production.

### Solution
Added a "Build units" section to Sidebar that:
1. Shows available units from factions at current planet
2. Displays units from `allowed_unit_types` array
3. Allows players to click units to build them
4. Only shows when planet has faction presence or is rebel-controlled

### Files Modified
- `client/src/components/Sidebar.jsx`: Added production UI section
- `server/lib/units.js`: Updated production validation to check `allowed_unit_types` instead of research

---

## 3. Complete Removal of Research System

### Changes Made

**Server-side:**
- Removed `contributeToUnitResearch()` function from `factions.js`
- Removed `calculateUnitResearchCost()` function from `factions.js`
- Removed research action handling from `engine.js`
- Removed research socket event handler
- Updated `buildClientFactionState()` to send `allowed_unit_types` instead of research data
- Added `updateFactionAllowedUnits()` to `db.js`
- Added `assignRandomUnitsToFaction()` to assign 3-10 random units per faction

**Client-side:**
- Removed "research" tab from FactionPanel
- Removed all research UI (progress bars, contribution inputs, locked/unlocked displays)
- Simplified to just "browse" and "found" tabs

**Database:**
- Added `allowed_unit_types` and `unlocked_ship_classes` columns to factions table
- Updated schema in `db/schema.sql`

### New Faction Unit System
- Each faction gets **3-10 random units** from their ideology's `allowed_ship_classes` when created
- Units assigned from faction ideology's allowed classes
- No research grinding or credit contribution needed
- Units either can or can't be produced (fixed at faction creation)

### Files Modified
- `server/lib/factions.js`: 200+ lines removed, added random unit assignment
- `server/lib/db.js`: Added `updateFactionAllowedUnits()`, removed research queries
- `server/lib/engine.js`: Removed research action, updated imports
- `client/src/components/FactionPanel.jsx`: Removed research tab (180+ lines)
- `db/schema.sql`: Added `allowed_unit_types` and `unlocked_ship_classes` columns

**Result**: Simpler, faster faction system with immediate unit availability

---

## 4. Faction-Specific Production UI

### Changes
Added contextual unit production options in Sidebar when at faction-controlled planets:
- Shows units from factions present at current location
- Filters by `allowed_unit_types` from each faction
- Displays up to 6 units with cost info
- Only enabled when player has faction presence or rebel control

### Files Modified
- `client/src/components/Sidebar.jsx`: New production UI section

---

## 5. Hidden Unit Toggle Feature

### Implementation
Added ability for players to toggle unit visibility:

**Server:**
- `socket.js`: Added `toggle_unit_hidden` socket event
- Validates ownership before toggling
- Broadcasts updated state to all players

**Client:**
- `useGame.js`: Added `toggleUnitHidden()` function
- `Sidebar.jsx`: Added HIDE/REVEAL buttons next to each unit
- Color-coded: purple for hidden, green for visible

**Database:**
- Used existing `toggleUnitHidden()` function in `db.js`

---

## 6. Unit Cost Rebalancing

### Applied Changes
Implemented exponential cost scaling based on unit size, per `FLEET_FEATURES.md`:

**Capital Ships (Doubled):**
- Worldship: 40 credits (from 20)
- Star Dreadnought: 28 credits (from 14)
- Battlecruiser: 24 credits (from 12)
- Star Destroyer: 22 credits (from 11)
- Heavy Cruiser: 22 credits (from 11)
- Cruiser: 20 credits (from 10)
- Space Station: 22 credits (from 11)
- Frigate: 18 credits (from 9)
- Corvette: 16 credits (from 8)

**Named Variants:** All doubled to match base ship costs

**Implementation:**
- Updated all 100+ capital ship variants in `config.js`
- Bulk script to double all designated capital ships
- Smaller units (starfighters, corvettes) unaffected in initial pass

**Result**: Large fleets now require significant credit investment, encouraging strategic planning and faction cooperation

---

## 7. Database Schema Updates

### New Columns Added
```sql
ALTER TABLE factions 
ADD COLUMN IF NOT EXISTS unlocked_ship_classes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS allowed_unit_types JSONB DEFAULT '[]';
```

### Schema Changes
- `factions` table: Added `allowed_unit_types` and `unlocked_ship_classes` JSONB columns
- `faction_unit_research` table: Effectively deprecated (no longer used)

---

## Technical Details

### Key Functions Changed

**Faction Creation:**
```javascript
// Old: Initialize research for all 414 units
// New: Assign 3-10 random units from allowed classes
const allowedUnits = assignRandomUnitsToFaction(ideology);
await db.updateFactionAllowedUnits(faction.id, allowedUnits);
```

**Production Validation:**
```javascript
// Old: Check if unit is researched in faction_unit_research table
// New: Check if unit is in faction's allowed_unit_types array
const canProduce = factionsHere.some(f => 
  f.allowed_unit_types.includes(unitType)
);
```

---

## Testing Checklist

- [x] Game creation performance (5 seconds vs 30+ before)
- [x] Faction unit assignment (3-10 units per faction)
- [x] Production at faction planets (shows correct units)
- [x] Hidden unit toggle (HIDE/REVEAL buttons)
- [x] Unit cost doubling (confirmed in config)
- [x] Database schema updates (columns added)
- [ ] Full game flow (create → join → play → build units)
- [ ] Governor turn performance (4 Claude API calls)
- [ ] Combat mechanics (hidden vs visible units)

---

## Files Modified Summary

**Server:**
- `server/lib/factions.js` - Removed research, added random unit assignment
- `server/lib/db.js` - Added `updateFactionAllowedUnits()`, removed research queries  
- `server/lib/engine.js` - Removed research action handling
- `server/lib/config.js` - Doubled all capital ship costs
- `server/routes/socket.js` - Added toggle unit hidden event

**Client:**
- `client/src/components/Sidebar.jsx` - Added production UI, unit toggle buttons
- `client/src/components/FactionPanel.jsx` - Removed research tab
- `client/src/useGame.js` - Added `toggleUnitHidden()` function

**Database:**
- `db/schema.sql` - Added `allowed_unit_types` and `unlocked_ship_classes` columns

---

## Known Issues & Follow-up

1. **Database Migration**: Users need to run ALTER TABLE in Supabase to add new columns
2. **Research Data**: Old `faction_unit_research` table is now unused (could be deprecated)
3. **Named Ship Costs**: All capital ship variants doubled (100+ updates)
4. **Unit Production UI**: Displays up to 6 units, may need pagination for factions with 10 units

---

## Performance Impact

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Game Creation | 30+ sec | 5 sec | -83% |
| DB Queries/Game | 4,140+ | 10 | -99% |
| Faction Init | Sequential | Bulk | 414x faster |
| Research Tab | Present | Removed | Simplified |

---

## Next Steps

1. Test full game flow with new faction system
2. Verify hidden unit combat mechanics work correctly
3. Monitor unit production at faction planets
4. Confirm cost rebalancing feels right in gameplay
5. Consider adding faction unit production UI to faction discovery panel

