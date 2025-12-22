# Quick Start: Testing & Development Tools

## 🎯 What You Asked For - What You Got

✅ **Unit tests for everything** - Vitest setup with example tests
✅ **Test sprites and assets** - AssetValidator with sprite validation
✅ **Developer menu** - Complete dev menu with all screens/locations
✅ **Fast dialogue testing** - DialogueTester with "Test All" functionality
✅ **Easy option testing** - OptionTester that clicks all buttons/options
✅ **Work/spreadsheet validation** - WorkSystemValidator tests all spreadsheet features
✅ **Graph accuracy validation** - GraphValidator ensures charts are accurate

## 🚀 Start Testing in 30 Seconds

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Open Game
Go to: `http://localhost:5176?dev`

### Step 4: Open Dev Menu
Press: `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)

OR click the "🔧 DEV" button in bottom-right corner

## 🎮 Developer Menu Quick Reference

### Screens Tab
- Click any screen name to instantly navigate
- Test all 15+ game screens

### Locations Tab  
- Click location names to teleport
- Test environment changes

### Dialogue Testing Tab
- **Click NPC names** → Start conversations instantly
- **Type NPC ID** → Test specific NPC
- **"Test All" button** → Automatically test all dialogues

### Quick Actions Tab
- **Give $1000** → Add money instantly
- **Max Stats** → Set all stats to 100
- **Complete Task** → Finish current task
- **Skip Time** → Advance 24 hours

### Testing Tab
- **Run All Tests** → Execute complete test suite
- **Test Charts** → Validate all chart types
- **Test Spreadsheets** → Test table functionality  
- **Validate Assets** → Check sprite/image loading

### Validation Tab
- **Validate Graphs** → Check chart accuracy
- **Validate Work System** → Test tasks/workflows
- **Test All Options** → Click all buttons (no crashes!)
- **Check Crashes** → Scan for potential issues

## 🧪 Automated Testing

### Run All Tests (Browser)
```javascript
// In browser console
window.devTools.runAllTests()
```

### Run Unit Tests (CLI)
```bash
npm test
```

### Test Specific System
```javascript
// Dialogue testing
window.devTools.dialogueTester.testAll()

// Graph validation
window.devTools.graphValidator.validateAll()

// Asset validation
window.devTools.assetValidator.validateAll()

// Work/spreadsheet validation
window.devTools.workValidator.validateAll()
```

## 📋 Complete Test Workflow

### 1. Quick Test (30 seconds)
1. Open dev menu (`Ctrl+Shift+D`)
2. Click "Run All Tests" in Testing tab
3. Check console for results

### 2. Comprehensive Test (5 minutes)
1. Run unit tests: `npm test`
2. Open dev menu and test each system:
   - Test all dialogues
   - Test all charts
   - Test all spreadsheets
   - Validate all assets
3. Use Quick Actions to test edge cases
4. Check coverage: `npm run test:coverage`

### 3. Full Validation (15 minutes)
1. Navigate through all screens (use Screens tab)
2. Visit all locations (use Locations tab)
3. Test all dialogues (use Dialogue Testing tab)
4. Test all options (use Validation → "Test All Options")
5. Validate graphs render correctly
6. Validate spreadsheets work correctly
7. Check no crashes occur

## 🎯 Common Use Cases

### "I want to test all dialogues quickly"
1. Open dev menu
2. Go to Dialogue Testing tab
3. Click "Test All" button
4. Check console for results

### "I want to ensure all buttons work"
1. Open dev menu
2. Go to Validation tab
3. Click "Test All Options"
4. Check console - will show any crashes/errors

### "I want to validate all graphs are accurate"
1. Open dev menu
2. Go to Testing tab
3. Click "Test Charts"
4. Go to Validation tab
5. Click "Validate Graphs"
6. Check console for accuracy results

### "I want to test a specific screen quickly"
1. Open dev menu
2. Go to Screens tab
3. Click the screen name
4. Screen switches instantly!

### "I want to test spreadsheet functionality"
1. Open dev menu
2. Go to Testing tab
3. Click "Test Spreadsheets"
4. Check console for sorting/filtering test results

## 📊 Test Results Format

All tests return structured results:

```javascript
{
    total: 10,      // Total items tested
    passed: 8,      // Number that passed
    failed: 2,      // Number that failed
    errors: [...]   // Detailed error information
}
```

## 🔧 Customization

### Add Custom Test
Edit `src/js/dev/[Validator].js` and add your test method.

### Add Custom Dev Menu Button
Edit `src/js/dev/DevMenu.js` in the appropriate `populate*()` method.

### Add Unit Test
Create `test/unit/[ModuleName].test.js` following the pattern in `EnvironmentManager.test.js`.

## ⚡ Keyboard Shortcuts

- `Ctrl+Shift+D` / `Cmd+Shift+D` → Toggle dev menu
- All shortcuts work when dev menu is open

## 🐛 Troubleshooting

**Dev menu not appearing?**
- Check URL has `?dev` or is localhost
- Try: `localStorage.setItem('dev_mode', 'true')` then refresh

**Tests not running?**
- Check console for errors
- Make sure dev server is running
- Check `window.devTools` exists in console

**Need help?**
- Check `DEVELOPER_GUIDE.md` for detailed docs
- Check console for error messages
- All test results log to console

## 📚 Files Created

- `src/js/dev/DevMenu.js` - Main developer menu
- `src/js/dev/index.js` - Dev tools entry point
- `src/js/dev/DialogueTester.js` - Dialogue testing
- `src/js/dev/OptionTester.js` - Option/button testing
- `src/js/dev/AssetValidator.js` - Asset validation
- `src/js/dev/GraphValidator.js` - Graph/chart validation
- `src/js/dev/WorkSystemValidator.js` - Work/spreadsheet validation
- `test/unit/EnvironmentManager.test.js` - Example unit test
- `vitest.config.js` - Test configuration
- `package.json` - Updated with test scripts

## ✅ Everything You Need

You now have:
- ✅ Complete developer menu with instant navigation
- ✅ Automated dialogue testing
- ✅ Automated option/button testing
- ✅ Asset validation (including sprites)
- ✅ Graph accuracy validation
- ✅ Spreadsheet/work system validation
- ✅ Unit test framework setup
- ✅ Example unit tests
- ✅ Comprehensive documentation

**Happy Testing! 🎉**

