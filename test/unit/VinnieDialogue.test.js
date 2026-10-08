/**
 * Vinnie "The Shark" gets the dialogue and story reveals from
 * story_line/vinnie_shark.txt (#561)
 */
import { describe, it, expect } from 'vitest';
import vinnie from '../../src/js/game/dialogue/npcs/vinnie_shark.js';
import { CHARACTER_STORIES, getStoryReveal } from '../../src/js/game/dialogue/DeepCharacterStories.js';

describe('vinnie_shark dialogue (#561)', () => {
    it('has all five relationship stages with greetings from the doc', () => {
        expect(vinnie.npcId).toBe('vinnie_shark');
        expect(Object.keys(vinnie.stages)).toEqual(['stranger', 'friendly', 'acquaintance', 'friend', 'close_friend']);
        expect(vinnie.stages.stranger.greeting).toContain('Need cash?');
        expect(vinnie.stages.close_friend.greeting).toContain('Family.');
    });

    it('has the gift reactions', () => {
        expect(vinnie.actions).toMatchObject({
            gift_cash: 'Back at ya.',
            gift_fancy_cigar: "Now we're talking. Cuban?",
            compliment: 'Watch it.'
        });
    });

    it('CHARACTER_STORIES has his story with reveals at 10/25/40/60/80', () => {
        const story = CHARACTER_STORIES.vinnie_shark;
        expect(story.personalStory.philosophy).toMatch(/Interest is the only thing/);
        expect(story.storyReveals.map(r => r.relationshipLevel)).toEqual([10, 25, 40, 60, 80]);
        expect(getStoryReveal('vinnie_shark', 45, 'secret')?.dialogue ?? getStoryReveal('vinnie_shark', 45)?.dialogue).toMatch(/cannoli|nonna/i);
    });
});
