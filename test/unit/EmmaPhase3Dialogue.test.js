import { describe, it, expect } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { NPCManager } from '../../src/js/game/NPCManager.js';
import { CHARACTER_STORIES } from '../../src/js/game/dialogue/DeepCharacterStories.js';
import { STATS, CharacterStats } from '../../src/js/game/CharacterStats.js';

describe('Emma Bloom Phase 3 Dialogue Effects', () => {
    it('should have phase_3 dialogue in Emma Bloom story', () => {
        const emmaStory = CHARACTER_STORIES['emma_bloom'];
        expect(emmaStory).toBeDefined();
        expect(emmaStory.phases).toBeDefined();

        const phase3 = emmaStory.phases.find(p => p.id === 'phase_3');
        expect(phase3).toBeDefined();
        expect(phase3.title).toBe('The Digitization Project');
    });

    it('should have valid effect keys in phase_3 options', () => {
        const emmaStory = CHARACTER_STORIES['emma_bloom'];
        const phase3 = emmaStory.phases.find(p => p.id === 'phase_3');

        const validStats = Object.keys(STATS).concat(['relationship', 'money', 'xp', 'xpAmount', 'flag', 'reputation', 'ethics']);

        phase3.options.forEach((option, index) => {
            expect(option.effects).toBeDefined();

            Object.keys(option.effects).forEach(key => {
                expect(validStats).toContain(key);
            });
        });
    });

    it('efficiency option should use xp/xpAmount shape for analytics (not bare analytics or invalid logic)', () => {
        const emmaStory = CHARACTER_STORIES['emma_bloom'];
        const phase3 = emmaStory.phases.find(p => p.id === 'phase_3');
        const efficiencyOption = phase3.options[0];

        expect(efficiencyOption.text).toContain('Focus on speed and efficiency');
        expect(efficiencyOption.effects).toHaveProperty('xp', 'analytics');
        expect(efficiencyOption.effects).toHaveProperty('xpAmount', 5);
        expect(efficiencyOption.effects).not.toHaveProperty('logic');
        expect(efficiencyOption.effects).not.toHaveProperty('analytics');
    });

    it('accessibility option should have reputation effect', () => {
        const emmaStory = CHARACTER_STORIES['emma_bloom'];
        const phase3 = emmaStory.phases.find(p => p.id === 'phase_3');
        const accessibilityOption = phase3.options[2];

        expect(accessibilityOption.text).toContain('Make it free and accessible');
        expect(accessibilityOption.effects).toHaveProperty('reputation');
    });

    it('applyChoiceEffects should handle reputation when applied', () => {
        const gameState = new GameState();
        gameState.characterStats = new CharacterStats();
        const npcManager = new NPCManager(gameState);

        gameState.reputation = 0;
        npcManager.relationships['emma_bloom'] = 55;

        // Mock a conversation with emma_bloom to satisfy applyChoiceEffects requirement
        npcManager.currentConversation = { npc: { id: 'emma_bloom' } };

        const effects = { reputation: 10, relationship: 5 };
        npcManager.applyChoiceEffects(effects);

        expect(gameState.reputation).toBe(10);
    });

    it('applyChoiceEffects should apply analytics XP for efficiency option', () => {
        const gameState = new GameState();
        gameState.characterStats = new CharacterStats();
        const npcManager = new NPCManager(gameState);

        npcManager.relationships['emma_bloom'] = 55;

        // Mock a conversation with emma_bloom to satisfy applyChoiceEffects requirement
        npcManager.currentConversation = { npc: { id: 'emma_bloom' } };

        const initialAnalyticsXP = gameState.characterStats.xp['analytics'] || 0;

        const effects = { xp: 'analytics', xpAmount: 5, relationship: 5 };
        npcManager.applyChoiceEffects(effects);

        const finalAnalyticsXP = gameState.characterStats.xp['analytics'] || 0;
        expect(finalAnalyticsXP).toBe(initialAnalyticsXP + 5);
    });
});
