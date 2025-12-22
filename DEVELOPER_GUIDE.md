# Developer Guide - Complete Testing & Development System

## 🚀 Quick Start

### Enable Developer Mode

The developer menu automatically appears when:
- Running on `localhost` or `127.0.0.1`
- Or add `?dev` to URL: `http://localhost:5176?dev`
- Or set in console: `localStorage.setItem('dev_mode', 'true')`

### Open Developer Menu

- **Keyboard**: `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)
- **Button**: Click the "🔧 DEV" button in bottom-right corner

## 📋 Developer Menu Features

### 1. Screens Tab
Quick navigation to all game screens:
- Menu, Game, Map, Stats, Career, Shop, Office, Clients, etc.
- Click any screen name to instantly switch

### 2. Locations Tab
Test all map locations:
- Click location names to teleport
- Update environment settings

### 3. Dialogue Testing Tab
Test all NPC conversations:
- Click NPC names to start conversations
- Use input field to test specific NPC by ID
- "Test All" button runs automated dialogue tests

### 4. Quick Actions Tab
Modify game state instantly:
- **New Game**: Restart
- **Give $1000**: Add money
- **Max Stats**: Set all stats to maximum
- **Complete Task**: Instantly complete current task
- **Skip Time**: Advance time by 24 hours

### 5. Game State Tab
- **Show State**: Log entire game state to console
- **Reset State**: Reset game to initial state
- **Save Game**: Manually save
- **Load Game**: Manually load

### 6. Testing Tab
Automated test suites:
- **Run All Tests**: Execute all automated tests
- **Test Charts**: Validate all chart types
- **Test Spreadsheets**: Test table functionality
- **Validate Assets**: Check all sprite/asset loading

### 7. Validation Tab
System validation:
- **Validate Graphs**: Check chart accuracy
- **Validate Work System**: Test task/workflow systems
- **Test All Options**: Click all buttons/options to check for crashes
- **Check Crashes**: Scan for potential crash scenarios

## 🧪 Unit Testing

### Setup

Install dependencies:
```bash
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on file changes)
npm run test:watch

# With UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Writing Unit Tests

Create test files: `test/unit/[ModuleName].test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyModule } from '../../src/js/MyModule.js';

describe('MyModule', () => {
    let instance;

    beforeEach(() => {
        instance = new MyModule();
    });

    it('should initialize correctly', () => {
        expect(instance.value).toBe(0);
    });
});
```

## 🔍 Automated Testing Tools

### 1. Dialogue Tester (`DialogueTester.js`)

Tests all NPC dialogue systems:

```javascript
// In browser console
window.devTools.dialogueTester.testAll().then(results => {
    console.log('Dialogue test results:', results);
});

// Test specific dialogue path
window.devTools.dialogueTester.testDialogueFlow('npc_id', ['option1', 'option2']);
```

**Features:**
- Tests all NPC conversations
- Validates dialogue structure
- Tests all dialogue options
- Checks for crashes/errors

### 2. Option Tester (`OptionTester.js`)

Tests all clickable options:

```javascript
window.devTools.optionTester.testAll().then(results => {
    console.log('Option test results:', results);
});
```

**Features:**
- Tests all buttons
- Tests screen-specific options
- Tests dropdown menus
- Tests input fields
- Validates no crashes occur

### 3. Asset Validator (`AssetValidator.js`)

Validates all assets load correctly:

```javascript
window.devTools.assetValidator.validateAll().then(results => {
    console.log('Asset validation:', results);
});
```

**Features:**
- Validates sprite sheets
- Validates images
- Validates audio files
- Checks sprite sheet dimensions
- Reports missing assets

### 4. Graph Validator (`GraphValidator.js`)

Validates chart accuracy and rendering:

```javascript
window.devTools.graphValidator.validateAll().then(results => {
    console.log('Graph validation:', results);
});
```

**Features:**
- Tests all chart types (bar, line, pie, etc.)
- Validates data accuracy (sums, averages, etc.)
- Tests chart rendering
- Tests chart interactions
- Validates data integrity

### 5. Work System Validator (`WorkSystemValidator.js`)

Validates work/task systems and spreadsheets:

```javascript
window.devTools.workValidator.validateAll().then(results => {
    console.log('Work system validation:', results);
});
```

**Features:**
- Tests task system
- Validates spreadsheet sorting
- Validates spreadsheet filtering
- Tests data display
- Validates work flow
- Checks data integrity

## 📊 Test Coverage

### Current Coverage

Run coverage report:
```bash
npm run test:coverage
```

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Critical Systems**: 100% coverage
- **Integration Tests**: All major workflows

## 🎯 Testing Workflows

### Quick Test Flow

1. **Start Dev Server**: `npm run dev`
2. **Open Browser**: `http://localhost:5176?dev`
3. **Open Dev Menu**: Press `Ctrl+Shift+D`
4. **Run Tests**: Click "Run All Tests" in Testing tab
5. **Check Results**: View console for detailed results

### Comprehensive Test Flow

1. **Unit Tests**: `npm test`
2. **Browser Tests**: Use dev menu "Run All Tests"
3. **Manual Testing**: Use dev menu to navigate and test
4. **Coverage**: `npm run test:coverage`
5. **Fix Issues**: Address any failures
6. **Re-test**: Repeat until all pass

### Pre-Commit Checklist

- [ ] All unit tests pass: `npm test`
- [ ] No console errors in browser
- [ ] All dialogue options work
- [ ] All charts render correctly
- [ ] All spreadsheets respond correctly
- [ ] All buttons/options don't crash
- [ ] Assets load correctly

## 🐛 Debugging

### Using Dev Menu

1. **Quick Navigation**: Use Screens tab to jump to any screen
2. **State Inspection**: Use Game State tab to view/log state
3. **Quick Actions**: Modify state to test edge cases
4. **Validation**: Run validation tools to find issues

### Console Commands

```javascript
// Access dev tools
window.devTools

// Run all tests
window.devTools.runAllTests()

// Test specific system
window.devTools.dialogueTester.testAll()
window.devTools.graphValidator.validateAll()

// Access game object
window.game

// Access game state
window.game.gameState
```

## 📝 Best Practices

### Writing Tests

1. **Test one thing at a time**
2. **Use descriptive test names**
3. **Test edge cases** (null, undefined, empty arrays)
4. **Mock external dependencies**
5. **Test both success and failure cases**

### Using Dev Menu

1. **Test incrementally**: Test one feature at a time
2. **Check console**: Always watch for errors
3. **Test edge cases**: Use Quick Actions to create edge cases
4. **Validate frequently**: Run validation tools often

## 🔧 Configuration

### Vitest Config

See `vitest.config.js` for test configuration.

### Dev Menu Customization

Edit `src/js/dev/DevMenu.js` to add custom buttons or tests.

## 📚 Examples

### Example: Testing a New Feature

1. Write unit tests first (TDD)
2. Implement feature
3. Add to dev menu for quick testing
4. Test manually using dev menu
5. Run all automated tests
6. Check coverage

### Example: Debugging an Issue

1. Reproduce issue
2. Use dev menu to inspect state
3. Use Quick Actions to isolate the problem
4. Write a test that reproduces the bug
5. Fix the bug
6. Verify test passes

## 🎓 Learning Resources

- **Vitest Docs**: https://vitest.dev/
- **Testing Best Practices**: See `test/README.md`
- **Example Tests**: See `test/unit/` directory

## 🚨 Troubleshooting

### Dev Menu Not Appearing

- Check URL is localhost or has `?dev`
- Check console for errors
- Try: `localStorage.setItem('dev_mode', 'true')` and refresh

### Tests Not Running

- Run `npm install` to install dependencies
- Check `vitest.config.js` is correct
- Check test files are in correct location

### Assets Not Loading in Tests

- Tests use jsdom which doesn't load real assets
- Mock asset loading in tests
- Use integration tests for real asset testing

## 📞 Support

For issues or questions:
1. Check console for errors
2. Check test output for details
3. Use dev menu validation tools
4. Review this guide

