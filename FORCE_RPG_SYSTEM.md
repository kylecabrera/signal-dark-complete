# Force RPG System

## Overview
A 10-tier Force user progression system that allows players to develop their Jedi avatars with Force powers, apprenticeships, and alignment-based abilities.

## 1. Force Tier Progression (1-10)

Each tier represents increasing mastery of the Force and unlocks new capabilities.

### Tier Progression
| Tier | Name | Points Required | Apprentice Chance | Features |
|------|------|-----------------|-------------------|----------|
| 1 | Untrained | 0 | 2% | Basic Force awareness |
| 2 | Initiate | 10 | 4% | Force sensitivity awakens |
| 3 | Padawan | 25 | 6% | Active Force training begins |
| 4 | Acolyte | 45 | 8% | Advanced techniques learned |
| 5 | Knight | 70 | 10% | Reach far planets, enhanced powers |
| 6 | Master | 100 | 12% | Mastery over Force domain |
| 7 | Lord | 135 | 14% | Commanding presence |
| 8 | Archon | 175 | 16% | Rare power unlocked |
| 9 | Sage | 220 | 18% | Ancient wisdom gained |
| 10 | Ancient | 270 | 20% | Supreme Force mastery |

### Tier Benefits
- **Higher Tiers**: Increased apprentice discovery chance (2% per tier gain)
- **Knight+ (Tier 5)**: Can reach apprentices on far planets
- **Progression**: Accumulate force points through gameplay to advance tiers

## 2. Force Powers System

Force powers are special abilities accessed through a nested "Force Powers" action.

### How to Use Force Powers
1. Select the "Force Powers" action (nested under main actions)
2. Choose a specific power (e.g., "Find Apprentice")
3. Power consumes force points and activates for a duration
4. Results are displayed in the action feed

### Force Power Mechanics
- **Cost**: Force points required to activate
- **Duration**: Rounds the power remains active
- **Cooldown**: Some powers can stack, others have internal cooldowns
- **Tier Scaling**: Higher tiers increase success chances

## 3. Find Apprentice Power

The first Force power available to players.

### Details
| Property | Value |
|----------|-------|
| **Name** | Find Apprentice |
| **Cost** | 5 force points |
| **Duration** | 2 rounds |
| **Base Chance** | 15% + (1% × tier) |
| **Range** | Adjacent planets (same as intel) |

### How It Works
```
Player activates "Find Apprentice" at Coruscant
- Consumes 5 force points
- Searches adjacent planets for Force-sensitive individuals
- Success chance: 15% + (tier * 1%)
  - Tier 1: 16% chance
  - Tier 5: 20% chance
  - Tier 10: 25% chance

Success: New Force user joins as apprentice
Failure: No response from potential candidates
```

### Apprenticeship Mechanics
- **Apprentice Creation**: When found, apprentice becomes a new Force user
- **Master/Apprentice Bond**: Apprentice linked to master
- **Shared Benefits**: Master gains bonuses from apprentice activities
- **Advancement**: Both master and apprentice earn force points through actions

### Strategic Uses
- **Expand Your Force Network**: Build a network of Force users
- **Shared Powers**: Master can teach powers to apprentices
- **Influence Spread**: Apprentices carry your influence to new regions
- **Resource Multiplier**: More Force users = more force points generated

## 4. Force Alignment System

Players' Force users develop alignment through their actions, affecting abilities.

### Alignment Scale
```
-100 (Dark Side)  ←──────────────────→  +100 (Light Side)
      ↑                                        ↑
  Sabotage, Attack                   Recruit, Hide, Knowledge
  Fear, Anger                         Compassion, Patience
```

### Action Alignment Shifts
| Action | Shift | Reason |
|--------|-------|--------|
| recruit | +2 | Building popular support |
| intel | +1 | Knowledge and patience |
| hide | +1 | Caution over aggression |
| sabotage | -5 | Destruction |
| incite | -4 | Fear and anger |
| denounce | -2 | Manipulation |
| unit_attack | -3 | Violence |
| found | +1 | Creation |
| investigate | +1 | Justice |

### Combat Bonuses
- **Light Side** (alignment > 30): +12% defense bonus
- **Dark Side** (alignment < -30): +12% attack bonus
- **Neutral** (|alignment| ≤ 30): No bonus

### Alignment Starting Values
Based on starting planet:
- **Deep Core**: -15 (dark influences)
- **Core Worlds**: +10 (Jedi tradition)
- **Outer Rim**: -5 (survival-focused)
- **Unknown Regions**: 0 (raw potential)

## 5. Force Points System

Force points accumulate through gameplay and fuel Force power usage.

### Earning Force Points
- **Actions**: Each action generates a small amount (1-3 points)
- **Combat**: Defeating enemies generates points
- **Factions**: Contributing to factions with Force users
- **Apprentices**: Apprentices contribute points to master

### Spending Force Points
- **Force Powers**: Activate temporary Force abilities
- **Tier Advancement**: Higher tiers require more points

### Force Point Economy
```
Earning: 1-3 points per action
Spending: 5 points for Find Apprentice
Net: Positive with multiple actions per turn
```

## 6. Database Schema

### force_users Table
```sql
- id (UUID): Force user ID
- session_id: Game session
- player_id: Associated rebel player
- force_tier: Current tier (1-10)
- force_points: Current point pool
- alignment: Current alignment (-100 to 100)
- master_id: Master if apprentice
- apprentice_ids: JSON array of apprentice UUIDs
- discovered_round: When force user was discovered
```

### force_power_uses Table
```sql
- id (UUID): Power use record
- session_id: Game session
- force_user_id: Which Force user
- power_name: Power activated
- round_used: Round number
- duration: Rounds it stays active
```

## 7. Implementation Details

### Server Files Modified
- **config.js**: Added FORCE.TIERS and FORCE.FORCE_POWERS
- **db.js**: Added 7 Force user functions
- **engine.js**: Added force_powers action handler

### Database Migrations Applied
- Created `force_users` table
- Created `force_power_uses` table
- Added indices for performance

### Client Features (Ready for Implementation)
- Force Powers nested action UI
- Available powers dropdown
- Force point/tier display
- Apprentice list panel
- Alignment bar visualization
- Power activation confirmation

## 8. Action Flow Example

```
Player: "I want to find an apprentice"
│
├─ Check Force status
│  ├─ Get/create force user
│  └─ Verify force points (need 5)
│
├─ Activate Find Apprentice
│  ├─ Calculate success chance: 15% + (tier * 1%)
│  ├─ Roll for success
│  └─ Create apprentice if successful
│
├─ Record power use (2 round duration)
│  └─ Consume 5 force points
│
└─ Display result
   ├─ Success: "Apprentice joined!"
   └─ Failure: "No response..."
```

## 9. Future Force Powers

### Possible Powers (Not Yet Implemented)
- **Foresee**: Glimpse enemy movements ahead
- **Dominate Mind**: Control NPC units
- **Force Sense**: Detect hidden units beyond intel
- **Lightning**: Direct damage to enemies
- **Healing**: Restore unit HP
- **Repulse**: Push enemies away from planet
- **Bind**: Prevent unit movement
- **Drain**: Absorb opponent's force points

### Implementation Pattern
Each new power would:
1. Define config in `CONFIG.FORCE.FORCE_POWERS`
2. Add handler in engine.js `force_powers` action
3. Add database functions if needed
4. Add UI button to client power menu

## 10. Strategy & Balance

### Force as Resource
- Force points are **limited** (requires strategic spending)
- Higher tiers have **better chances** but need investment
- Apprentices **multiply** your Force presence

### Risk/Reward
- **Spending points**: Power activation risks leaving you vulnerable
- **Seeking apprentices**: Takes multiple attempts; uncertain reward
- **Alignment choice**: Affects combat bonuses but limits power pool

### Progression Path
```
1. Start as Tier 1 (Untrained)
2. Accumulate points through 5-10 actions
3. Reach Tier 2 (Initiate) → +4% apprentice chance
4. Continue advancing through gameplay
5. At Tier 5+ unlock advanced power mechanics
6. Eventually reach Tier 10 (Ancient) for maximum power
```

## 11. Integration with Game Systems

### Faction Connection
- Force users can belong to Force-sensitive factions
- Factions grant Force-specific bonuses
- Apprentices inherit faction affiliations

### Alliance Benefits
- Alliance with other Force users creates power networks
- Shared apprentices between allies possible
- Coordinated Force power effects

### Intel & Espionage
- Find Apprentice uses same range as Intel
- Apprentice discovery counts as intel revelation
- Can target specific regions or random search

## 12. Future Enhancements

### Planned Features
- Force power customization per tier
- Apprentice-to-master advancement chain
- Jedi Council formations (3+ masters)
- Dark/Light side faction powers
- Force nexus planets (power amplifiers)
- Cross-player Force battles
- Apprentice split to become independent masters

### Balance Tuning
- Adjust success percentages based on gameplay data
- Tier progression speed (points per action)
- Force power costs and durations
- Apprentice strength scaling
