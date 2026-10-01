/**
 * NPCDialogueLoader Tests
 * Tests for getAgeGroup method which had unreachable buckets
 * Issue #2185: 'young' (<25) and 'elderly' (60+) were unreachable and have been removed
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NPCDialogueLoader } from '../../src/js/game/dialogue/NPCDialogueLoader.js';

describe('NPCDialogueLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new NPCDialogueLoader();
    });

    describe('getAgeGroup', () => {
        it('should return "adult" for ages under 40', () => {
            // Test ages that were previously in "young" bucket but should now be "adult"
            expect(loader.getAgeGroup(20)).toBe('adult');
            expect(loader.getAgeGroup(25)).toBe('adult');
            expect(loader.getAgeGroup(30)).toBe('adult');
            expect(loader.getAgeGroup(39)).toBe('adult');
        });

        it('should return "adult" for all current explicit NPC ages under 40', () => {
            // These are the actual ages from NPCs in the roster
            expect(loader.getAgeGroup(26)).toBe('adult'); // alex_rivera
            expect(loader.getAgeGroup(28)).toBe('adult'); // emma_bloom, brad_sterling, vinnie_shark, the_broker, zero_cool
            expect(loader.getAgeGroup(29)).toBe('adult'); // jordan_kim
            expect(loader.getAgeGroup(34)).toBe('adult'); // sarah_martinez
            expect(loader.getAgeGroup(35)).toBe('adult'); // flora_bloom
        });

        it('should return "adult" for default age of 30', () => {
            // Default age from RelationshipDialogueSystem line 34: npc?.age || 30
            expect(loader.getAgeGroup(30)).toBe('adult');
        });

        it('should return "middle_aged" for ages 40-59', () => {
            expect(loader.getAgeGroup(40)).toBe('middle_aged');
            expect(loader.getAgeGroup(41)).toBe('middle_aged'); // mike_johnson
            expect(loader.getAgeGroup(42)).toBe('middle_aged'); // donna_delight, victoria_sterling
            expect(loader.getAgeGroup(48)).toBe('middle_aged'); // bob_bagel
            expect(loader.getAgeGroup(52)).toBe('middle_aged'); // david_chen, lisa_wong
            expect(loader.getAgeGroup(58)).toBe('middle_aged'); // professor_higgins
            expect(loader.getAgeGroup(59)).toBe('middle_aged');
        });

        it('should return "middle_aged" for ages 60 and above (elderly bucket removed)', () => {
            // Narrowed buckets per issue #2185: 'elderly' (60+) was unreachable in current roster
            // Ages 60+ now map to 'middle_aged' since no NPCs in the roster are that old
            expect(loader.getAgeGroup(60)).toBe('middle_aged');
            expect(loader.getAgeGroup(65)).toBe('middle_aged');
            expect(loader.getAgeGroup(100)).toBe('middle_aged');
        });

        it('should not produce "young" bucket with current roster', () => {
            // The core issue: the "young" bucket was unreachable
            // With minimum explicit age of 26 and default of 30, no NPC can be < 25
            // After fix, ages < 25 should return "adult" instead of "young"
            const youngAges = [0, 10, 20, 24];
            youngAges.forEach(age => {
                const group = loader.getAgeGroup(age);
                expect(group).not.toBe('young');
                expect(group).toBe('adult');
            });
        });

        it('should only produce "adult" and "middle_aged" buckets for current roster', () => {
            // Narrowed buckets: only 'adult' and 'middle_aged' match actual roster data
            // Current roster ages: 26-58 explicit, 30 for defaults
            // All should be either 'adult' or 'middle_aged'
            const rosterAges = [26, 28, 28, 28, 28, 28, 29, 30, 34, 35, 41, 42, 42, 52, 52, 58];
            const ageGroups = rosterAges.map(age => loader.getAgeGroup(age));

            // Should only have 'adult' and 'middle_aged', no 'young' or 'elderly'
            expect(new Set(ageGroups)).toEqual(new Set(['adult', 'middle_aged']));
        });
    });
});
