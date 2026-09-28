import { describe, it, expect } from 'vitest';
import { CHARACTER_STORIES } from '../../src/js/game/dialogue/DeepCharacterStories.js';

const dialogueFiles = import.meta.glob('../../src/js/game/dialogue/npcs/*.js');

describe('NPC dialogue files', () => {
    const entries = Object.entries(dialogueFiles);

    it('finds the dialogue files', () => {
        expect(entries.length).toBeGreaterThan(0);
    });

    it.each(entries)('%s loads and is named after its NPC', async (path, load) => {
        const dialogue = (await load()).default;
        const fileName = path.split('/').pop().replace('.js', '');

        expect(dialogue.npcId).toBe(fileName);
    });

    it.each(entries)('%s has a character story', async (path, load) => {
        const dialogue = (await load()).default;

        expect(CHARACTER_STORIES[dialogue.npcId]?.personalStory).toBeDefined();
    });
});
