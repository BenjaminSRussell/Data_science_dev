# Speed-Run Bug Finding Guide

## Quick Methods to Find Bugs Fast

### 1. Static Code Analysis (Fastest - No Server Needed)

Run the static bug checker:
```bash
node scripts/static-bug-check.js
```

This checks for:
- Syntax errors
- Undefined method calls
- Missing cleanup (setInterval)
- Common bug patterns

**Time**: ~5 seconds

### 2. Browser Console Quick Scan

Open browser console (F12) and paste:
```javascript
// Quick bug scan - copy from test/inject-bug-finder.js
```

Or load it:
```javascript
fetch('/test/inject-bug-finder.js').then(r=>r.text()).then(eval);
```

**Time**: ~1 second

### 3. Full Automated Test Suite

1. Start dev server: `npm run dev`
2. Open game in browser
3. Open console (F12)
4. Load and run the speed-run bug finder:
```javascript
fetch('/test/speed-run-bug-finder.js')
  .then(r => r.text())
  .then(code => {
    eval(code);
    return speedRunBugFinder();
  })
  .then(results => console.table(results));
```

**Time**: ~10-30 seconds

## What Each Tool Finds

### Static Checker
- ✅ Syntax errors
- ✅ Undefined methods
- ✅ Missing null checks
- ✅ setInterval cleanup issues
- ✅ Multiple initialization issues

### Browser Quick Scan
- ✅ Missing game objects
- ✅ Missing methods
- ✅ DOM element issues
- ✅ Recent console errors

### Full Test Suite
- ✅ Game initialization
- ✅ Screen transitions
- ✅ NPC conversations
- ✅ Task system
- ✅ Map navigation
- ✅ Save/load
- ✅ All major systems

## Recommended Workflow

1. **Before coding**: Run static checker
2. **After code changes**: Run browser quick scan
3. **Before commit**: Run full test suite
4. **Continuous**: Set up interval in console:
   ```javascript
   setInterval(() => speedRunBugFinder(), 60000); // Every minute
   ```

## Bugs Found & Fixed

### ✅ Fixed Issues
1. `ComprehensiveSpriteSystem.registerAnimation` - Removed invalid method call
2. `PixiJS Assets.init()` multiple calls - Added initialization check
3. `sarah_martinez.js` syntax error - Fixed quote escaping

### ⚠️ Known Warnings (Not Bugs)
- Missing sprite assets (handled gracefully)
- Optional chaining suggestions (code works, just could be safer)
- setInterval warnings (intervals are properly cleaned up)

## Adding New Tests

Edit `test/speed-run-bug-finder.js` and add new `safeExecute` blocks for new features.

## Tips

- Run static checker first - it's fastest
- Use browser quick scan for immediate feedback
- Full test suite for comprehensive checks
- Check console errors after each major feature
- Test edge cases manually (empty states, null values, etc.)
