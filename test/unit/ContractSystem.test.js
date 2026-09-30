/**
 * ContractSystem Unit Tests
 * Verifies that bonus conditions are properly populated and applied to contracts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContractSystem, ContractGenerator, CONTRACT_CATEGORIES } from '../../src/js/game/contracts/ContractSystem.js';

describe('ContractSystem - Bonus Conditions', () => {
    let generator;
    let mockGameState;

    beforeEach(() => {
        generator = new ContractGenerator();
        mockGameState = {
            reputation: 10000,
            money: 1000,
            characterStats: {
                getStat: (stat) => {
                    if (stat === 'intelligence') return 70;
                    if (stat === 'analytics') return 70;
                    if (stat === 'focus') return 30;
                    if (stat === 'charisma') return 50;
                    return 0;
                }
            }
        };
    });

    describe('Template Bonus Conditions', () => {
        it('should populate bonusConditions from templates for DATA_ENTRY contracts', () => {
            const templates = generator.getContractTemplates('DATA_ENTRY');
            const hasBonus = templates.some(t => t.bonusConditions && t.bonusConditions.length > 0);
            expect(hasBonus).toBe(true);
        });

        it('should populate bonusConditions from templates for DATA_CLEANING contracts', () => {
            const templates = generator.getContractTemplates('DATA_CLEANING');
            const hasBonus = templates.some(t => t.bonusConditions && t.bonusConditions.length > 0);
            expect(hasBonus).toBe(true);
        });

        it('should populate bonusConditions from templates for DATA_ANALYSIS contracts', () => {
            const templates = generator.getContractTemplates('DATA_ANALYSIS');
            const hasBonus = templates.some(t => t.bonusConditions && t.bonusConditions.length > 0);
            expect(hasBonus).toBe(true);
        });

        it('should populate bonusConditions from templates for MACHINE_LEARNING contracts', () => {
            const templates = generator.getContractTemplates('MACHINE_LEARNING');
            const hasBonus = templates.some(t => t.bonusConditions && t.bonusConditions.length > 0);
            expect(hasBonus).toBe(true);
        });

        it('should populate bonusConditions on generated contracts', () => {
            const contract = generator.generateContract('DATA_ANALYSIS');
            expect(contract.bonusConditions).toBeDefined();
            expect(Array.isArray(contract.bonusConditions)).toBe(true);
        });
    });

    describe('Bonus Condition Checking', () => {
        it('should check perfect_quality bonus condition', () => {
            const contractSystem = new ContractSystem(mockGameState);
            const condition = {
                type: 'perfect_quality',
                achieved: true,
                multiplier: 0.2
            };
            expect(contractSystem.checkBonusCondition(condition)).toBe(true);
        });

        it('should not award perfect_quality bonus if not achieved', () => {
            const contractSystem = new ContractSystem(mockGameState);
            const condition = {
                type: 'perfect_quality',
                achieved: false,
                multiplier: 0.2
            };
            expect(contractSystem.checkBonusCondition(condition)).toBe(false);
        });

        it('should check skill_requirement bonus condition', () => {
            const contractSystem = new ContractSystem(mockGameState);
            const condition = {
                type: 'skill_requirement',
                skill: 'intelligence',
                value: 40,
                multiplier: 0.15
            };
            expect(contractSystem.checkBonusCondition(condition)).toBe(true);
        });

        it('should fail skill_requirement when skill is too low', () => {
            const lowSkillState = {
                reputation: 10000,
                money: 1000,
                characterStats: {
                    getStat: (stat) => {
                        if (stat === 'intelligence') return 30;
                        return 0;
                    }
                }
            };
            const contractSystem = new ContractSystem(lowSkillState);
            const condition = {
                type: 'skill_requirement',
                skill: 'intelligence',
                value: 60,
                multiplier: 0.15
            };
            expect(contractSystem.checkBonusCondition(condition)).toBe(false);
        });

        it('should check reputation_threshold bonus condition', () => {
            const contractSystem = new ContractSystem(mockGameState);
            const condition = {
                type: 'reputation_threshold',
                value: 4000,
                multiplier: 0.25
            };
            expect(contractSystem.checkBonusCondition(condition)).toBe(true);
        });

        it('should fail reputation_threshold when reputation is too low', () => {
            const lowRepState = {
                reputation: 1000,
                money: 1000,
                characterStats: {
                    getStat: (stat) => 0
                }
            };
            const contractSystem = new ContractSystem(lowRepState);
            const condition = {
                type: 'reputation_threshold',
                value: 10000,
                multiplier: 0.25
            };
            expect(contractSystem.checkBonusCondition(condition)).toBe(false);
        });
    });

    describe('Bonus Application During Contract Completion', () => {
        it('should apply perfect_quality bonus to final pay', () => {
            const contractSystem = new ContractSystem(mockGameState);

            // Create a contract with bonus condition
            const contract = generator.generateContract('DATA_CLEANING');
            contract.bonusConditions = [
                {
                    type: 'perfect_quality',
                    achieved: true,
                    multiplier: 0.2
                }
            ];
            contract.basePay = 100;
            contract.difficulty = 2;

            // Accept and complete the contract
            contractSystem.availableContracts.push(contract);
            contractSystem.acceptContract(contract.id);

            const activeContract = contractSystem.activeContracts.find(c => c.id === contract.id);
            activeContract.progress = activeContract.timeRequired; // Mark as complete

            const result = contractSystem.completeContract(contract.id);

            expect(result.success).toBe(true);
            // Base pay 100 + perfect_quality bonus (100 * 0.2 = 20) = 120 minimum
            expect(result.pay).toBeGreaterThan(100);
            expect(result.bonuses.some(b => b.type === 'perfect_quality')).toBe(true);
        });

        it('should apply skill_requirement bonus to final pay', () => {
            const contractSystem = new ContractSystem(mockGameState);

            const contract = generator.generateContract('MACHINE_LEARNING');
            contract.bonusConditions = [
                {
                    type: 'skill_requirement',
                    skill: 'intelligence',
                    value: 40,
                    multiplier: 0.15
                }
            ];
            contract.basePay = 100;
            contract.difficulty = 5;

            contractSystem.availableContracts.push(contract);
            contractSystem.acceptContract(contract.id);

            const activeContract = contractSystem.activeContracts.find(c => c.id === contract.id);
            activeContract.progress = activeContract.timeRequired;

            const result = contractSystem.completeContract(contract.id);

            expect(result.success).toBe(true);
            // Base pay 100 + skill_requirement bonus (100 * 0.15 = 15) = 115 minimum
            expect(result.pay).toBeGreaterThan(100);
            expect(result.bonuses.some(b => b.type === 'skill_requirement')).toBe(true);
        });

        it('should apply reputation_threshold bonus to final pay', () => {
            const contractSystem = new ContractSystem(mockGameState);

            const contract = generator.generateContract('CONSULTING');
            contract.bonusConditions = [
                {
                    type: 'reputation_threshold',
                    value: 4000,
                    multiplier: 0.25
                }
            ];
            contract.basePay = 100;
            contract.difficulty = 4;

            contractSystem.availableContracts.push(contract);
            contractSystem.acceptContract(contract.id);

            const activeContract = contractSystem.activeContracts.find(c => c.id === contract.id);
            activeContract.progress = activeContract.timeRequired;

            const result = contractSystem.completeContract(contract.id);

            expect(result.success).toBe(true);
            // Base pay 100 + reputation_threshold bonus (100 * 0.25 = 25) = 125 minimum
            expect(result.pay).toBeGreaterThan(100);
            expect(result.bonuses.some(b => b.type === 'reputation_threshold')).toBe(true);
        });

        it('should apply multiple bonus conditions to final pay', () => {
            const contractSystem = new ContractSystem(mockGameState);

            const contract = generator.generateContract('DATA_ANALYSIS');
            contract.bonusConditions = [
                {
                    type: 'perfect_quality',
                    achieved: true,
                    multiplier: 0.1
                },
                {
                    type: 'skill_requirement',
                    skill: 'analytics',
                    value: 40,
                    multiplier: 0.1
                }
            ];
            contract.basePay = 100;
            contract.difficulty = 3;

            contractSystem.availableContracts.push(contract);
            contractSystem.acceptContract(contract.id);

            const activeContract = contractSystem.activeContracts.find(c => c.id === contract.id);
            activeContract.progress = activeContract.timeRequired;

            const result = contractSystem.completeContract(contract.id);

            expect(result.success).toBe(true);
            // Both bonuses should be applied
            expect(result.bonuses.length).toBeGreaterThanOrEqual(2);
        });
    });
});
