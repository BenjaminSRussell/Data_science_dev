/**
 * NPC Dialogue Age Groups Unit Tests
 * Verifies that all relationship stages have ageGroups entries for all age categories
 */

import { describe, it, expect } from 'vitest';
import professorHigginsDialogue from '../../src/js/game/dialogue/npcs/professor_higgins.js';

describe('NPC Dialogue Age Groups', () => {
    const RELATIONSHIP_STAGES = ['stranger', 'friendly', 'acquaintance', 'friend', 'close_friend'];
    const AGE_GROUPS = ['young', 'adult', 'middle_aged', 'elderly'];

    describe('Professor Higgins', () => {
        RELATIONSHIP_STAGES.forEach(stage => {
            it(`should have ageGroups in ${stage} stage`, () => {
                const stageDialogue = professorHigginsDialogue.stages[stage];
                expect(stageDialogue, `${stage} stage should exist`).toBeDefined();
                expect(stageDialogue.ageGroups, `${stage} stage should have ageGroups`).toBeDefined();
            });

            it(`should have all age groups in ${stage} stage`, () => {
                const stageDialogue = professorHigginsDialogue.stages[stage];
                expect(stageDialogue.ageGroups, `${stage} stage should have ageGroups`).toBeDefined();

                AGE_GROUPS.forEach(ageGroup => {
                    expect(stageDialogue.ageGroups[ageGroup],
                        `${stage} stage should have ${ageGroup} age group`).toBeDefined();
                });
            });

            it(`${stage} stage age groups should have greeting content`, () => {
                const stageDialogue = professorHigginsDialogue.stages[stage];
                expect(stageDialogue.ageGroups, `${stage} stage should have ageGroups`).toBeDefined();

                AGE_GROUPS.forEach(ageGroup => {
                    const ageGroupDialogue = stageDialogue.ageGroups[ageGroup];
                    expect(ageGroupDialogue.greeting,
                        `${stage} stage ${ageGroup} should have greeting`).toBeDefined();
                    expect(Array.isArray(ageGroupDialogue.greeting),
                        `${stage} stage ${ageGroup} greeting should be an array`).toBe(true);
                    expect(ageGroupDialogue.greeting.length > 0,
                        `${stage} stage ${ageGroup} greeting should not be empty`).toBe(true);
                });
            });
        });
    });
});
