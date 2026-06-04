# Faction Alliance System

## Overview
Rebel factions can now form alliances with custom names. These alliances allow multiple factions to work together against the empire while still maintaining independent control and potentially competing with each other.

## Core Concepts

### Alliance Formation
- **Initiator**: Any player can create an alliance by naming it and selecting 2+ discovered factions
- **Custom Names**: Alliances have player-defined names (e.g., "Rebel Coalition", "Free Systems Alliance")
- **Faction Independence**: Each faction retains its autonomy and ideology - alliances don't force homogeneity
- **Conflict**: Members of the same alliance can still fight each other (though typically they wouldn't)

### Alliance Membership
- A faction can only be in one alliance at a time
- Once joined, a faction cannot switch alliances (commitment mechanic)
- Multiple players can contribute to different factions within the same alliance
- Alliance is visible to all players who have discovered member factions

## Game Mechanics

### How Alliances Work
1. **Discovery**: Players discover factions through intel gathering or direct interaction
2. **Formation**: Player selects 2+ discovered factions and names the alliance
3. **Joining**: Other players can add their discovered factions to existing alliances
4. **Visibility**: Alliances only appear to players who've discovered at least one member faction
5. **Growth**: Members can be added as players discover more factions and have resources

### Alliance Benefits (Future Implementation)
While currently alliances don't provide mechanical bonuses, they could include:
- Shared resource pools
- Combined production bonuses when in same region
- Diplomatic status (immune to friendly fire)
- Coordinated special abilities
- Shared intelligence networks

## API Endpoints

### Create Alliance
```
POST /api/sessions/:sessionId/alliances
{
  "playerId": "<player-id>",
  "allianceName": "Rebel Coalition",
  "factionIds": ["<faction-id-1>", "<faction-id-2>"]
}
```
- Requires 2+ factions
- All factions must be discovered by the player
- All factions must not already be in an alliance

### Join Alliance
```
POST /api/sessions/:sessionId/alliances/:allianceId/join
{
  "playerId": "<player-id>",
  "factionIds": ["<faction-id>"]
}
```
- Adds one or more discovered factions to an existing alliance
- Factions must not already be in an alliance
- Player must have discovered the factions

### Get Alliances
```
GET /api/sessions/:sessionId/alliances?playerId=<player-id>
```
Returns all alliances visible to the player (those with at least one discovered member faction).

Response includes:
- Alliance name and creator
- Member factions with their ideologies
- Total member count (visible + hidden)
- Round when alliance was created

## Strategy Implications

### Early Game
- Limited faction visibility means few alliance options initially
- Alliances likely small (2-4 factions)
- Focus on intel gathering to find compatible factions

### Mid Game
- Larger alliances form as more factions are discovered
- Ideological alignment becomes a choice (diverse vs homogeneous)
- Alliance formation signals player strategy

### Late Game
- Established alliances vs rogue factions
- Large coalitions vs smaller independent operators
- Diplomatic considerations (which alliances to negotiate with)

## Example Scenario

1. **Turn 1-3**: Players gather intel, discover 3-4 factions each
2. **Turn 4**: Alice discovers "Liberation Front" and "Worker Alliance" - forms "United Rebellion" with these 2
3. **Turn 5**: Bob discovers "Liberation Front" (Alice already revealed it) - joins "United Rebellion" with "Independence Movement"
4. **Turn 7**: Carol discovers "Smuggler's Collective" and "Merchant Republic" - forms rival "Outer Rim Cartel"
5. **Turn 10**: Alice discovers "Merchant Republic" - attempts to poach it, but already in rival alliance (blocked)

## Database Schema

```sql
-- Alliances: Named rebel coalitions
CREATE TABLE alliances (
  id                UUID PRIMARY KEY,
  session_id        UUID REFERENCES game_sessions(id),
  name              TEXT,                    -- Custom alliance name
  created_by        UUID REFERENCES players(id),
  created_round     INTEGER,
  created_at        TIMESTAMPTZ
);

-- Alliance Members: Tracks faction memberships
CREATE TABLE alliance_members (
  id                UUID PRIMARY KEY,
  alliance_id       UUID REFERENCES alliances(id),
  faction_id        UUID REFERENCES factions(id),
  session_id        UUID REFERENCES game_sessions(id),
  joined_round      INTEGER,
  UNIQUE(alliance_id, faction_id)
);
```

## Implementation Details

### Functions

**factions.js**
- `createNewAlliance()` - Form a new alliance
- `joinAlliance()` - Add factions to existing alliance
- `buildAllianceState()` - Get player's visible alliances

**db.js**
- `createAlliance()` - Insert new alliance
- `addFactionToAlliance()` - Add faction to alliance
- `getAllianceMembers()` - Get faction IDs in alliance
- `getFactionAlliance()` - Check which alliance a faction belongs to

### Validation
- Players must discover factions before using them in alliances
- Factions can only be in one alliance
- Minimum 2 factions per alliance
- Alliance names cannot be empty

## Future Enhancements

### Mechanical Bonuses
- Faction cells in alliance grow faster
- Combined production in same region
- Shared faction abilities
- Alliance-wide diplomatic stance

### Diplomatic Systems
- Alliance dissolution/members leaving
- Alliance wars (one alliance vs another)
- Non-aggression pacts
- Formal diplomatic recognition

### Social Features
- Alliance chat/messaging
- Alliance leadership roles
- Alliance treasury/shared resources
- Alliance achievements/milestones

### Strategy Depth
- Espionage between alliances
- Alliance betrayals and defections
- Ideological conflicts within alliances
- Alliance trading (factions changing sides)
