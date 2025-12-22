# Speed-Run Bug Finder

## Quick Start

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open the game in your browser (usually http://127.0.0.1:5176)

3. Open the browser console (F12 or Cmd+Option+I)

4. Copy the contents of `test/speed-run-bug-finder.js` and paste into the console, OR load it via:
   ```javascript
   // In browser console:
   const script = document.createElement('script');
   script.src = '/test/speed-run-bug-finder.js';
   document.head.appendChild(script);
   ```

5. Run the bug finder:
   ```javascript
   speedRunBugFinder()
   ```

## What It Tests

The speed-run bug finder automatically tests:
- ✅ Game initialization
- ✅ New game start
- ✅ Screen transitions
- ✅ NPC conversations
- ✅ Task system
- ✅ Map navigation
- ✅ Environment manager
- ✅ Chart creation
- ✅ Save/load system
- ✅ UI updates
- ✅ Economy system
- ✅ Bank system
- ✅ Character stats
- ✅ Button interactions
- ✅ Event system

## Output

The script will report:
- 🐛 Bugs found (test failures)
- ❌ Console errors
- ⚠️ Console warnings
- ⏱️ Duration of the test run

## Continuous Testing

For continuous bug finding, you can set up an interval:

```javascript
// Run every 30 seconds
setInterval(() => {
    speedRunBugFinder();
}, 30000);
```

## Adding More Tests

Edit `test/speed-run-bug-finder.js` and add new test cases in the `safeExecute` calls.
