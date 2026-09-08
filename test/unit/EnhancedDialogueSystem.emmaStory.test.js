import { describe, it, expect } from 'vitest';
import enhancedDialogueSystem from 'src/js/game/dialogue/EnhancedDialogueSystem.js';
import { CHARACTER_STORIES } from 'src/js/game/dialogue/DeepCharacterStories.js';

describe('EnhancedDialogueSystem with Emma Bloom', () => {
    const emmaBloom = CHARACTER_STORIES.find(npc => npc.npcId === 'emma_bloom');
    const dialogueSystem = new enhancedDialogueSystem(emmaBloom);

    it('should correctly build the dialogue tree at the stranger stage', () => {
        const tree = dialogueSystem.buildEnhancedTree('stranger');
        expect(tree.greeting).toBeOneOf(['Hello.', 'Hi.', '...Hello.']);
        expect(tree.topics.work).toContain('I\'m a librarian.');
        expect(tree.topics.work).toContain('I organize information.');
        expect(tree.topics.work).toContain('I help people find what they need.');
    });

    it('should correctly build the dialogue tree at the friendly stage', () => {
        const tree = dialogueSystem.buildEnhancedTree('friendly');
        expect(tree.greeting).toBeOneOf(['Hello again.', 'Hi there.', 'Hey.']);
        expect(tree.topics.work).toContain('I love books.');
        expect(tree.topics.work).toContain('Information. Knowledge.');
        expect(tree.topics.work).toContain('There\'s beauty in organizing it.');
    });

    it('should correctly build the dialogue tree at the acquaintance stage', () => {
        const tree = dialogueSystem.buildEnhancedTree('acquaintance');
        expect(tree.greeting).toBeOneOf(['Hello! Good to see you.', 'Hi! How are you?', 'Hey there.']);
        expect(tree.topics.work).toContain('I\'ve published research papers.');
        expect(tree.topics.work).toContain('Three of them.');
        expect(tree.topics.work).toContain('Under a pseudonym.');
        expect(tree.topics.work).toContain('I\'m too shy to claim them publicly.');
    });

    it('should correctly build the dialogue tree at the friend stage', () => {
        const tree = dialogueSystem.buildEnhancedTree('friend');
        expect(tree.greeting).toBeOneOf(['My friend! Hello!', 'Hey! I\'m glad you\'re here.', 'Hello! Come, let\'s talk.']);
        expect(tree.topics.philosophy).toContain('Information is power.');
        expect(tree.topics.philosophy).toContain('But only if people can access it.');
        expect(tree.topics.philosophy).toContain('My job is to be a bridge.');
        expect(tree.topics.philosophy).toContain('Between information and people.');
    });

    it('should correctly build the dialogue tree at the close_friend stage', () => {
        const tree = dialogueSystem.buildEnhancedTree('close_friend');
        expect(tree.greeting).toBeOneOf(['My dear friend! I\'m so happy to see you.', 'Hello! You\'re the only one who really listens.', 'Hey! I\'ve been thinking about you.']);
        expect(tree.topics.secret).toContain('I\'ve published papers.');
        expect(tree.topics.secret).toContain('I\'m proud of the work.');
        expect(tree.topics.secret).toContain('It matters to me.');
        expect(tree.topics.secret).toContain('Even if no one knows it\'s me.');
    });

    it('should handle low relationship trigger correctly', () => {
        const tree = dialogueSystem.buildEnhancedTree('low_relationship');
        expect(tree.trigger.relationship).toBe('<20');
        expect(tree.emotion).toBe('hurt');
        expect(tree.dialogue).toContain('I thought...');
        expect(tree.dialogue).toContain('Never mind.');
        expect(tree.dialogue).toContain('...');
        expect(tree.quickTime).toBe('comfort');
    });

    it('should handle rejection trigger correctly', () => {
        const tree = dialogueSystem.buildEnhancedTree('rejection');
        expect(tree.trigger.rejection).toBe(true);
        expect(tree.emotion).toBe('crying');
        expect(tree.dialogue).toContain('I... I thought you understood.');
        expect(tree.dialogue).toContain('I should have known.');
        expect(tree.dialogue).toContain('I\'m always too quiet.');
        expect(tree.quickTime).toBe('support');
    });
});