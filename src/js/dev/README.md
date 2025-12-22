# Developer Tools

The developer tools are **completely separate** from the main game and only load in dev mode.

## Features

### 📖 Storyline Navigation
- View all story beats organized by phase (Early, Mid, Late, Endgame)
- Jump to any story beat instantly
- Set storyline phase
- View current storyline state (phase, progress, arc, completed beats)

### 📍 Location Testing
- View all locations in the game
- Navigate to any location instantly
- Test all locations for errors
- Get detailed test results with error reporting

### 💬 Dialogue Testing
- Test all NPC dialogues
- Jump to specific conversations
- Test dialogue flows

### 🎯 Quick Actions
- Modify game state instantly
- Add money, max stats, complete tasks
- Skip time forward

### 🧪 Automated Testing
- Run all automated tests
- Test charts, spreadsheets, assets
- Validate work systems

## Access

**Keyboard Shortcut**: `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)

**Or**: Click the "🔧 DEV" button in bottom-right corner

## Dev Mode

Dev tools automatically enable when:
- Running on `localhost` or `127.0.0.1`
- URL contains `?dev` parameter
- `localStorage.setItem('dev_mode', 'true')` is set

## Isolation

- Dev tools are **never loaded** in production builds
- Dev tools **never interfere** with normal gameplay
- All dev functionality is isolated in `src/js/dev/` directory
- Dev menu only appears when explicitly enabled

## Usage

### Test a Location
1. Open dev menu (`Ctrl+Shift+D`)
2. Go to "Locations" section
3. Click any location name to test it
4. Check console for any errors

### Test All Locations
1. Open dev menu
2. Click "Test All Locations" button
3. View results in the results box
4. Check console for detailed error logs

### Navigate Storyline
1. Open dev menu
2. Go to "Storyline Navigation" section
3. Select phase from dropdown and click "Set Phase"
4. Click any story beat to trigger it
5. Check console for results

### Jump to Story Beat
1. Open dev menu
2. Find story beat in the list
3. Click the beat name to trigger it
4. Game will update to reflect the story beat

## API

Access dev tools programmatically:

```javascript
// Access dev tools
window.devTools

// Test location
window.devTools.locationTester.testLocation('home')

// Trigger story beat
window.devTools.storylineNavigator.triggerStoryBeat('first_job')

// Set storyline phase
window.devTools.storylineNavigator.setStorylinePhase('mid')

// Test all locations
window.devTools.locationTester.testAllLocations()
```

