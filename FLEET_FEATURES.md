# Fleet Features & Mechanics

## Overview
Comprehensive fleet system with hidden toggles, ground unit transport, balanced costs, combat feed, and intel-based movement reveal.

## 1. Fleet Cost Rebalancing

### New Fleet Costs (Doubled from Original)
**Capital Ships:**
- Worldship: 20 → **40** (most expensive)
- Star Dreadnought: 14 → **28**
- Battlecruiser: 12 → **24**
- Star Destroyer: 11 → **22**
- Heavy Cruiser: 11 → **22**
- Cruiser: 10 → **20**
- Space Station: 11 → **22**
- Frigate: 9 → **18**
- Corvette: 8 → **16**

**Strategic Impact:**
- Large fleets are now much more expensive
- Encourages strategic planning and faction cooperation
- Makes fleet loss more meaningful
- Smaller capital ships more viable relative to larger ones

## 2. Hidden/Visible Toggle for Rebel Fleets

### Mechanics
- Rebel fleets start **hidden** (invisible to governors until combat)
- Players can **toggle visibility** at any time via action
- Hidden units get combat advantage (strike first)
- Visible units provide: visual deterrent, intel for allies

### Database Fields
- `is_hidden`: Boolean (true = not visible)
- `can_toggle_hidden`: Boolean (true = player-controlled fleets can toggle)

### Usage
- **Hide fleet**: Sneak around, set ambushes
- **Reveal fleet**: Show strength, claim territory, control planets
- **Toggle cost**: Minimal (part of movement action)

## 3. Ground Unit Transport by Fleets

### How It Works
Each fleet (capital ship) has a `transport_capacity`:
- **Worldship**: 20 units
- **Star Dreadnought**: 20 units
- **Battlecruiser**: 10 units
- **Star Destroyer**: 10 units
- **Frigate/Corvette**: 2 units
- **Small Transport**: 2 units

### Ground Units (Can be Transported)
- Militia (strength 2)
- Operatives (strength 1)
- Aerocraft (surface fighters)

### Transport Mechanics
```
Load Unit: fleet.load(ground_unit)
Unload Unit: fleet.unload(ground_unit)

Unit Movement: 
- Ground units move WITH their transport fleet
- If fleet moves to new planet, transported units arrive too
- Unload to deploy units on planet surface
```

### Database Fields
- `transported_by`: UUID of transport fleet (null if not transported)
- Units in transit appear in fleet cargo, not on map

### Strategic Uses
- **Offensive**: Transport troops to enemy planets for assault
- **Defensive**: Evacuate ground forces before fleet is destroyed
- **Logistics**: Move militia between rebel-controlled planets
- **Combined Arms**: Fleet + troops working together in combat

## 4. Combat Feed

### What It Tracks
- All combats occurring in the game (fleet vs fleet, fleet vs garrison, etc.)
- Combat participants, winners, casualties
- Planet where combat occurred
- Round number

### Types of Combat Events

**Direct Combat**
```
Round 3 - Coruscant (Orbit):
  "Rebel starfighter squadron attacked Imperial corvette"
  "Outcome: Rebel victory (3 casualties vs 1 casualty)"
```

**Nearby System Intel**
```
Round 5 - Alderaan (Nearby Intel):
  "Intelligence: Combat detected in adjacent sector - Yavin 4"
  "Rebel forces engaged Star Destroyer fleet"
  "(Revealed via Intel action at adjacent planet)"
```

### Database Fields
- `round`: Turn number
- `planet_id`: Where combat occurred
- `description`: Human-readable event text
- `is_nearby`: Boolean (true = revealed via intel, not direct participation)

### Access
- Players see combat they participated in
- Players see nearby combat if they gathered intel in adjacent systems
- Combat feed shows last 50 events per session
- Filter by round for specific turn

## 5. Intel Gathering Reveals Fleet Movements

### How It Works
When a player **gathers intel at a planet**:

1. **Check adjacent planets** (nearby systems via hyperlanes)
2. **For each adjacent planet**: Small chance to detect fleet activity
3. **Detection rate**: ~15-25% chance per adjacent planet per intel action
4. **Detection reveals**: Recent fleet movements, combat events

### What Intel Reveals
- Fleet movements in nearby systems
- Combat that occurred in adjacent sectors
- Fleet composition (types, numbers)
- Enemy activity patterns

### Example Scenario
```
Player at: Coruscant
Intel action at: Coruscant (gathers info)
Adjacent systems: Tatoo ine, Alderaan, Naboo

Intel Reveals:
- ✓ Rebel fleet spotted at Tatooine
- ✓ Star Destroyer jumped to Alderaan  
- ✓ Combat detected: Frigate vs Garrison (Naboo)
```

### Strategic Implications
- **Scout planets** to learn enemy movements
- **Plan routes** around detected imperial forces
- **Coordinate attacks** based on fleet positions
- **Avoid detection** by using hidden fleets

### Database
- `is_nearby`: Boolean marking intel-revealed events
- Combat feed includes both direct and detected (nearby) events

## 6. Fleet Management Features

### Unit Operations

**Hide/Reveal Fleets**
```javascript
toggleUnitHidden(fleetId)
// Fleet switches: hidden ↔ visible
```

**Transport Ground Units**
```javascript
loadUnitIntoTransport(groundUnitId, fleetId)
// Ground unit loads into fleet cargo

unloadUnitFromTransport(groundUnitId)
// Ground unit deploys to current planet
```

**Record Combat**
```javascript
recordCombatEvent(sessionId, round, planetId, description, isNearby)
// Adds event to combat feed
```

**Access Combat Feed**
```javascript
getCombatFeed(sessionId, round)
// Get recent combat events for display
```

## 7. Strategic Considerations

### Fleet Building
- **Expensive capitals** require significant credit investment
- **Transport allocation** matters for combined arms
- **Hidden status** affects engagement strategy
- **Vulnerability**: Visible fleets can be tracked/targeted

### Combat Strategy
- **Ambush tactics**: Hide fleet, reveal when engaging
- **Transport assets**: Move troops safely in escorted transports
- **Fleet composition**: Mix of combat and transport ships
- **Intel economy**: Use intel to find enemy movement patterns

### Coordination
- **Faction fleets**: Different factions have different capabilities
- **Alliance fleets**: Combined fleet operations
- **Player fleets**: Individual commanders coordinating
- **Enemy response**: Governors adapt to detected fleet activity

## 8. Implementation Details

### Server Files
- `config.js`: Fleet costs doubled
- `db.js`: New unit functions (hide toggle, transport, combat feed)
- `engine.js`: Combat event recording
- `units.js`: Transport mechanics during movement

### Database Schema
```sql
-- Units table additions
can_toggle_hidden BOOLEAN -- player can toggle visibility
transported_by UUID       -- reference to transport fleet

-- New table
combat_feed (
  id, session_id, round, planet_id, 
  description, is_nearby, created_at
)
```

### Client Features (Ready for Implementation)
- Fleet visibility toggle button
- Unit loading/unloading UI
- Combat feed display panel
- Fleet capacity indicators
- Transport status on unit cards

## 9. Balance Notes

### Cost Impact
- Fleets are now a major resource commitment
- 40 credits for worldship = 8 full turns of starting credits
- Encourages early faction/alliance building
- Makes fleet loss significant

### Transport System
- Ground units rely on fleets for mobility
- Creates combined-arms gameplay
- Vulnerable during transport (lose fleet = lose cargo)
- Reward for protecting transport fleets

### Intel System
- Encourages exploration and intelligence gathering
- Hidden fleets avoid detection via intel
- Creates information asymmetry
- Risk/reward: hide (safety) vs reveal (deterrent)

## 10. Future Enhancements

### Possible Additions
- Fleet formations (grouped units)
- Fleet command abilities (bonuses to transported units)
- Long-range scanning (reveal movement from distance)
- Fleet maintenance (crew rest, repairs)
- Escorting mechanics (escort smaller ships)
- Stealth fleet detection (reduce intel reveal chance)
