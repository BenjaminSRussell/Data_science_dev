const { expect } = require('chai');
const { ContractSystem } = require('../../src/js/game/contracts/ContractSystem');
const { GameState } = require('../../src/js/game/GameState');

describe('ContractSystem', function() {
    let gameState;
    let contractSystem;

    beforeEach(function() {
        gameState = new GameState();
        contractSystem = new ContractSystem(gameState);
    });

    describe('refreshContracts()', function() {
        it('filters contracts based on reputation and stat requirements', function() {
            gameState.reputation = 50;
            gameState.stats = { skill: 10 };

            const contractTemplates = [
                { id: '1', reputation: 30, stats: { skill: 5 } },
                { id: '2', reputation: 70, stats: { skill: 15 } },
                { id: '3', reputation: 50, stats: { skill: 10 } }
            ];

            const expectedContracts = [
                { id: '1', reputation: 30, stats: { skill: 5 } },
                { id: '3', reputation: 50, stats: { skill: 10 } }
            ];

            gameState.contracts.contractTemplates = contractTemplates;
            contractSystem.refreshContracts();

            expect(gameState.contracts.activeContracts).to.deep.equal(expectedContracts);
        });
    });

    describe('acceptContract(contractId)', function() {
        it('rejects when reputation is insufficient', function() {
            gameState.reputation = 20;
            gameState.contracts.contractTemplates = [{ id: '1', reputation: 30, stats: { skill: 5 } }];

            expect(contractSystem.acceptContract('1')).to.have.property('success', false);
        });

        it('rejects when stats are insufficient', function() {
            gameState.reputation = 30;
            gameState.stats = { skill: 4 };
            gameState.contracts.contractTemplates = [{ id: '1', reputation: 30, stats: { skill: 5 } }];

            expect(contractSystem.acceptContract('1')).to.have.property('success', false);
        });

        it('rejects an unknown contractId', function() {
            gameState.reputation = 30;
            gameState.stats = { skill: 5 };
            gameState.contracts.contractTemplates = [];

            expect(contractSystem.acceptContract('1')).to.have.property('success', false);
        });

        it('accepts a valid contract and tracks it', function() {
            gameState.reputation = 30;
            gameState.stats = { skill: 5 };
            gameState.contracts.contractTemplates = [{ id: '1', reputation: 30, stats: { skill: 5 } }];

            expect(contractSystem.acceptContract('1')).to.have.property('success', true);

            expect(gameState.contracts.acceptedContracts['1']).to.exist;
        });
    });

    describe('checkBonusCondition()', function() {
        it('returns true for early_completion with qualifying input', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'early_completion', value: 5 }] }, progress: 5 };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('early_completion', true);
        });

        it('returns false for early_completion with non-qualifying input', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'early_completion', value: 5 }] }, progress: 4 };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('early_completion', false);
        });

        it('returns true for perfect_quality with qualifying input', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'perfect_quality', value: 5 }] }, quality: 5 };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('perfect_quality', true);
        });

        it('returns false for perfect_quality with non-qualifying input', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'perfect_quality', value: 5 }] }, quality: 4 };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('perfect_quality', false);
        });

        it('returns true for skill_requirement with qualifying input', function() {
            gameState.stats = { skill: 10 };
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'skill_requirement', value: 5 }] } };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('skill_requirement', true);
        });

        it('returns false for skill_requirement with non-qualifying input', function() {
            gameState.stats = { skill: 4 };
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'skill_requirement', value: 5 }] } };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('skill_requirement', false);
        });

        it('returns true for reputation_threshold with qualifying input', function() {
            gameState.reputation = 60;
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'reputation_threshold', value: 50 }] } };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('reputation_threshold', true);
        });

        it('returns false for reputation_threshold with non-qualifying input', function() {
            gameState.reputation = 40;
            gameState.contracts.acceptedContracts['1'] = { template: { bonusConditions: [{ type: 'reputation_threshold', value: 50 }] } };
            expect(contractSystem.checkBonusCondition('1')).to.have.property('reputation_threshold', false);
        });
    });

    describe('completeContract(contractId)', function() {
        it('grants the base reward', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { baseReward: 100 } };
            contractSystem.completeContract('1');
            expect(gameState.cash).to.equal(100);
        });

        it('grants the bonus reward when a bonus condition is met', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { baseReward: 100, bonusReward: 50, bonusConditions: [{ type: 'early_completion', value: 5 }] }, progress: 5 };
            contractSystem.completeContract('1');
            expect(gameState.cash).to.equal(150);
        });

        it('does not grant the bonus reward when no bonus condition is met', function() {
            gameState.contracts.acceptedContracts['1'] = { template: { baseReward: 100, bonusReward: 50, bonusConditions: [{ type: 'early_completion', value: 5 }] }, progress: 4 };
            contractSystem.completeContract('1');
            expect(gameState.cash).to.equal(100);
        });
    });
});