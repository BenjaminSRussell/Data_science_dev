/**
 * learnFromModel routes XP through CharacterStats instead of the
 * non-existent gameState.stats (#268)
 */
import { describe, it, expect } from 'vitest';
import { AITrainingStoryline } from '../../src/js/game/ai/AITrainingStoryline.js';
import { CharacterStats } from '../../src/js/game/CharacterStats.js';

describe('AITrainingStoryline.learnFromModel (#268)', () => {
    it('grants intelligence and focus XP via addExperience and does not throw', () => {
        const characterStats = new CharacterStats();
        const gs = { characterStats };
        const story = new AITrainingStoryline(gs);
        story.findTrainedModel = () => ({ id: 'p1', type: 'language model' });
        const before = { int: characterStats.xp.intelligence || 0, focus: characterStats.xp.focus || 0, intL: characterStats.stats.intelligence, focL: characterStats.stats.focus };
        const result = story.learnFromModel('p1');
        expect(result.success).toBe(true);
        expect(gs.stats).toBeUndefined();
        const gained = (id, xpKey, lvlKey) => (characterStats.stats[id] > before[lvlKey]) || ((characterStats.xp[id] || 0) > before[xpKey]);
        expect(gained('intelligence', 'int', 'intL')).toBe(true);
        expect(gained('focus', 'focus', 'focL')).toBe(true);
    });
});

describe('no divergent gameState.stats writes (#268)', () => {
    it('nothing in src/js indexes the non-existent gameState.stats', async () => {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const hits = [];
        const walk = dir => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const p = path.join(dir, entry.name);
                if (entry.isDirectory()) walk(p);
                else if (p.endsWith('.js') && /gameState\.stats\s*\[/.test(fs.readFileSync(p, 'utf8'))) hits.push(p);
            }
        };
        walk('src/js');
        expect(hits).toEqual([]);
    });
});
