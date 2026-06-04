# Game Tutorial Splash Screen

## Overview
A comprehensive tutorial splash screen that explains Signal Dark's mechanics to new players. Appears when the game first loads and can be navigated through or skipped.

## Features

### 8-Page Tutorial
1. **Welcome** - Introduction to the game and the four AI governors
2. **The Goal** - Win/lose conditions (rebellion vs suppression)
3. **Actions & Resources** - How to spend actions and credits
4. **Factions & Alliances** - Faction discovery and alliance system
5. **Unit Production** - How to build units and faction-specific classes
6. **Combat & Movement** - Movement, combat, and intel mechanics
7. **The Governors** - Description of each AI governor's strategy
8. **Strategy Tips** - Tips for winning the game

### User Interface
- **Page Navigation**: Previous/Next buttons to move between pages
- **Page Indicators**: Dot indicators showing current page position
- **Quick Navigation**: Click any dot to jump to that page
- **Skip Option**: "Skip Tutorial" button to dismiss immediately
- **Completion Button**: "Start Game" button on final page

### Design
- Modern dark sci-fi aesthetic matching the game theme
- Blurred glass effect with semi-transparent background
- Monospace fonts for terminal-like feel
- Color-coded buttons (blue for navigation, green for start)
- Responsive layout that works on different screen sizes
- Smooth transitions between pages

## Implementation

### File
`client/src/components/SplashScreen.jsx`

### Integration
Added to `App.jsx`:
- Imported `SplashScreen` component
- Added `showSplash` state to `GameShell`
- Renders splash screen on top of all content when active
- Can be dismissed via button or skip option

### How It Works
```javascript
const [showSplash, setShowSplash] = useState(true);
// Splash screen shows until onDismiss is called
{showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
```

## Content Highlights

### Game Mechanics Explained
- Victory and defeat conditions (rebellion/suppression meters)
- Action economy (5 actions per turn)
- Resource management (credits, units, Jedi avatar)
- Faction system and alliances
- Unit production and faction-specific ships
- Combat and movement mechanics
- Governor AI behaviors

### Strategic Guidance
- Importance of action planning
- Faction discovery mechanics
- Planet control strategies
- Covert vs overt actions
- Learning governor patterns

## User Experience

### First-Time Players
- Complete introduction to all game systems
- Clear explanations of victory conditions
- Strategic tips for success
- Option to skip if already familiar

### Returning Players
- Can skip tutorial entirely with one click
- Quick reference if needed
- Non-blocking (can dismiss and start immediately)

## Future Enhancements
- Persist user preference (don't show again checkbox)
- Context-sensitive help during gameplay
- Video tutorials for complex mechanics
- Quick reference guide accessible from main menu
- Keyboard navigation (arrow keys to navigate)

## Styling Notes
The splash screen uses inline styles for:
- Gradient background (deep blue tones)
- Glass-morphism effect with backdrop blur
- Consistent color scheme (blue #3a8fe8, green #40c880)
- Monospace fonts via CSS variable `var(--mono)`
- Hover effects on buttons for interactivity

## Accessibility
- All text is readable with sufficient contrast
- Navigation buttons are clearly labeled
- Skip option is always available
- No automatic progression (user controls pacing)
