# Testing Guide

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Structure

- `unit/` - Unit tests for individual modules
- `integration/` - Integration tests for system interactions
- `e2e/` - End-to-end tests (if added)

## Developer Menu

The developer menu provides quick testing tools:

1. **Open Dev Menu**: Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
2. **Or click**: The "🔧 DEV" button in bottom-right corner

### Features

- **Screens**: Quick navigation to all game screens
- **Locations**: Test all map locations
- **Dialogue Testing**: Test all NPC conversations
- **Quick Actions**: Modify game state (money, stats, etc.)
- **Testing**: Run automated test suites
- **Validation**: Validate graphs, spreadsheets, work systems

## Automated Testing

### Unit Tests

Test individual components in isolation:

```javascript
// test/unit/EnvironmentManager.test.js
import { describe, it, expect } from 'vitest';
import { EnvironmentManager } from '../../src/js/game/EnvironmentManager.js';

describe('EnvironmentManager', () => {
    it('should initialize correctly', () => {
        // Test code
    });
});
```

### Integration Tests

Test system interactions:

```javascript
// test/integration/gameflow.test.js
import { describe, it, expect } from 'vitest';

describe('Game Flow', () => {
    it('should complete a full task cycle', async () => {
        // Test task creation, completion, rewards
    });
});
```

## Browser-Based Testing

### Quick Bug Finder

Open browser console and run:
```javascript
speedRunBugFinder()
```

### Developer Tools API

```javascript
// Access dev tools
window.devTools.runAllTests().then(results => {
    console.log('All tests:', results);
});

// Test specific systems
window.devTools.dialogueTester.testAll();
window.devTools.graphValidator.validateAll();
window.devTools.assetValidator.validateAll();
```

## Writing Tests

### Example Unit Test

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from '../../src/js/MyClass.js';

describe('MyClass', () => {
    let instance;

    beforeEach(() => {
        instance = new MyClass();
    });

    it('should have correct initial state', () => {
        expect(instance.value).toBe(0);
    });

    it('should increment value', () => {
        instance.increment();
        expect(instance.value).toBe(1);
    });
});
```

### Testing Async Code

```javascript
it('should load data asynchronously', async () => {
    const data = await myClass.loadData();
    expect(data).toBeDefined();
});
```

### Mocking

```javascript
import { vi } from 'vitest';

it('should call callback', () => {
    const callback = vi.fn();
    myClass.doSomething(callback);
    expect(callback).toHaveBeenCalled();
});
```

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Critical Paths**: 100% coverage
- **Integration Tests**: Cover all major workflows

## Continuous Testing

Add to your workflow:

```javascript
// In browser console during development
setInterval(() => {
    window.devTools?.runAllTests();
}, 60000); // Every minute
```

