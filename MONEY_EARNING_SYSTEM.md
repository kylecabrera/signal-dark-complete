# Money Earning System

## Overview
Replaced passive income generation with active player-driven actions. Players must now choose between **Earn Money** (light side) and **Steal Money** (dark side) to generate income.

## System Changes

### What Changed
- **Removed**: Automatic credit generation each turn from controlled planets
- **Kept**: Faction income remains (factions still earn from planets they control)
- **Added**: Two new action types: `earn_money` and `steal_money`

### Why This Matters
- **Player Agency**: Every credit must be earned through action and decision-making
- **Alignment System**: Money earning choices directly affect Force alignment
- **Economic Strategy**: Creates resource scarcity and forces prioritization of actions
- **Risk/Reward**: Stealing earns more but affects alignment negatively

## New Actions

### Earn Money
**Light Side Action**

| Property | Value |
|----------|-------|
| **Name** | Earn Money |
| **Alignment** | +3 (light side) |
| **Max Amount** | 50% of planet's economic output |
| **Loyalty Impact** | -1 |
| **Visibility** | Overt (visible to empire) |

**How it works:**
- Generate random amount from 1 to 50% of planet's economy
- Minimum: Always earn at least 1 credit
- Example: Planet with output=4 can earn 0-2 credits randomly

### Steal Money
**Dark Side Action**

| Property | Value |
|----------|-------|
| **Name** | Steal Money |
| **Alignment** | -4 (dark side) |
| **Max Amount** | 80% of planet's economic output |
| **Loyalty Impact** | -2 |
| **Visibility** | Hidden (covert action) |

**How it works:**
- Generate random amount from 1 to 80% of planet's economy
- Minimum: Always earn at least 2 credits (on low-output planets)
- Example: Planet with output=4 can earn 0-3 credits randomly
- Higher risk/reward vs Earn Money

## Money Generation Rules

### High-Economy Planets (output > 0)
```
Earn Money:  random(0% to 50% of output)  → 1-X credits
Steal Money: random(0% to 80% of output)  → 1-Y credits
```

### Low-Economy Planets (output = 0)
```
Earn Money:  always 1 credit
Steal Money: always 2 credits
```

### Minimum Guarantees
- **No planet has zero earning potential**
- **Earn Money minimum**: 1 credit
- **Steal Money minimum**: 2 credits (higher risk)
- **Even on "poor" planets**, players can generate resources

## Strategic Considerations

### Earn Money Strategy
✅ **Pros:**
- Increases light side alignment (+3)
- Works on any planet
- Sustainable choice

❌ **Cons:**
- Generates less income (50% max vs 80%)
- Less random (more predictable)
- Overt (governor can detect it)

### Steal Money Strategy
✅ **Pros:**
- Higher potential income (80% max)
- Works on any planet
- Hidden from empire (covert)

❌ **Cons:**
- Decreases alignment (-4)
- Can drift to dark side if overused
- Higher loyalty penalty

## Alignment Impact

### Per Action
- **Earn Money**: +3 light side per use
- **Steal Money**: -4 dark side per use

### Over Time
```
5x Earn Money → +15 alignment (light side)
5x Steal Money → -20 alignment (dark side)

Balance: 3x Earn + 2x Steal = +9 alignment (net light side)
```

### Combat Bonuses
- Light side (alignment > 30): +12% defense
- Dark side (alignment < -30): +12% attack
- **Alignment choice shapes combat effectiveness**

## Examples

### Example 1: High-Economy Planet
**Planet: Coruscant (output = 4)**

Earn Money attempt:
```
Max possible: 4 × 50% = 2 credits
Actual roll: random(0-2) = 1 credit
Result: +1 credit, +3 alignment
```

Steal Money attempt:
```
Max possible: 4 × 80% = 3 credits
Actual roll: random(0-3) = 2 credits
Result: +2 credits, -4 alignment
```

### Example 2: Low-Economy Planet
**Planet: Tatooine (output = 0)**

Earn Money:
```
Min guaranteed: 1 credit
Result: +1 credit, +3 alignment
```

Steal Money:
```
Min guaranteed: 2 credits
Result: +2 credits, -4 alignment
```

### Example 3: Poor Planet
**Planet: Asteroid Base (output = 1)**

Earn Money:
```
Max possible: 1 × 50% = 0.5 → rounds to 1
Actual: random(0-1) = 0-1 credit (minimum 1)
Result: Always +1 credit
```

Steal Money:
```
Max possible: 1 × 80% = 0.8 → rounds to 1
Actual: random(0-1) = 0-1 credit (minimum 2)
Result: Always +2 credits
```

## Interaction with Other Systems

### Faction Income
- **Still Active**: Factions earn passively from controlled planets
- **Separate System**: Doesn't interfere with player action-based earning
- **Stacking**: Player can Earn Money AND receive faction income same turn

### Action Economy
- Each money earning action costs **1 action**
- Players start with **2-5 actions per turn**
- Must balance money earning vs military/political actions

### Loyalty System
- Earning money affects planet loyalty
- Earn Money: -1 loyalty (minor)
- Steal Money: -2 loyalty (notable)
- Over many turns, repeated stealing can flip planets back to empire

## Configuration Reference

```javascript
EARN_MONEY: {
  earn_money: {
    percentOfEconomy: 0.5,  // 50% max
    alignment: 3,           // +3 light
  },
  steal_money: {
    percentOfEconomy: 0.8,  // 80% max
    alignment: -4,          // -4 dark
  },
}
```

## Balance Notes

### Why This Works
1. **Minimum guarantee** ensures players always get resources
2. **Percentage-based** scales with planet economy naturally
3. **Alignment cost** of stealing is higher than gain
4. **Scarcity** creates meaningful action choices
5. **Risk/reward** reflected in visibility and income

### Tuning Levers (if needed)
- Increase percentages for higher income overall
- Adjust alignment shifts to favor/penalize playstyles
- Modify minimums for different difficulties
- Change loyalty impacts if planets flip too quickly

## Future Enhancements
- **Rob faction bases** (faction-specific stealing)
- **Hacking terminals** (earn from imperial tech)
- **Smuggling routes** (earn from neutral zones)
- **Taxation** (earn from civilian populations)
- **Piracy** (steal from trade convoys)
