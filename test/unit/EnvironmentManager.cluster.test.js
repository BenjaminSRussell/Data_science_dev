import { describe, it, expect } from 'vitest';
import { EnvironmentManager } from '../../src/js/game/EnvironmentManager.js';
import { OFFICE_LOCATIONS } from '../../src/js/data/locations.js';

describe('EnvironmentManager cluster', () => {
    it('#1186 applies the office background without needing #game-container', () => {
        document.body.innerHTML = '';
        document.body.style.background = '';
        const env = new EnvironmentManager({ rankIndex: 0, tasksCompleted: 0 });
        env.currentLocation = OFFICE_LOCATIONS.find(l => !l.hidden);
        env.applyLocationStyles();
        expect(document.body.style.backgroundAttachment).toBe('fixed');
    });
});
