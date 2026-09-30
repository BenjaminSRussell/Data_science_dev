import { expect } from 'chai';
import { TopBar } from '../../src/js/ui/components/TopBar.js';

describe('TopBar', () => {
    let component;

    beforeEach(() => {
        component = new TopBar();
    });

    it('should populate money, reputation, and rank from full gameState', () => {
        const gameState = {
            money: 500,
            reputation: 150,
            currentRank: {
                title: 'Gold Member'
            }
        };

        component.updateFromGameState(gameState);

        expect(component.money).to.equal(500);
        expect(component.reputation).to.equal(150);
        expect(component.rank).to.equal('Gold Member');
    });

    it('should preserve money as 0, not swap for default', () => {
        const gameState = {
            money: 0,
            reputation: 50,
            currentRank: {
                title: 'Bronze'
            }
        };

        component.updateFromGameState(gameState);

        expect(component.money).to.equal(0);
        expect(component.money).not.to.be.null;
        expect(component.money).not.to.be.undefined;
    });

    it('should fall back to 0 when reputation is missing', () => {
        const gameState = {
            money: 100,
            currentRank: {
                title: 'Silver'
            }
        };

        component.updateFromGameState(gameState);

        expect(component.reputation).to.equal(0);
    });

    it('should fall back to empty string when currentRank is undefined', () => {
        const gameState = {
            money: 100,
            reputation: 75,
            currentRank: undefined
        };

        component.updateFromGameState(gameState);

        expect(component.rank).to.equal('');
    });

    it('should fall back to empty string when currentRank is null', () => {
        const gameState = {
            money: 100,
            reputation: 75,
            currentRank: null
        };

        component.updateFromGameState(gameState);

        expect(component.rank).to.equal('');
    });

    it('should not crash when accessing .title on null currentRank', () => {
        const gameState = {
            money: 100,
            reputation: 75,
            currentRank: null
        };

        expect(() => {
            component.updateFromGameState(gameState);
        }).not.to.throw();
    });

    it('should return immediately without throwing when gameState is null', () => {
        component.money = 500;
        component.reputation = 100;
        component.rank = 'Gold';

        expect(() => {
            component.updateFromGameState(null);
        }).not.to.throw();

        expect(component.money).to.equal(500);
        expect(component.reputation).to.equal(100);
        expect(component.rank).to.equal('Gold');
    });

    it('should not reset values when gameState is null', () => {
        // Set initial values
        component.money = 999;
        component.reputation = 888;
        component.rank = 'Platinum';

        // Call with null
        component.updateFromGameState(null);

        // Values should remain unchanged
        expect(component.money).to.equal(999);
        expect(component.reputation).to.equal(888);
        expect(component.rank).to.equal('Platinum');
    });

    it('should initialize with default values', () => {
        expect(component.money).to.equal(0);
        expect(component.reputation).to.equal(0);
        expect(component.rank).to.equal('');
    });

    it('should handle gameState with missing all optional fields', () => {
        const gameState = {};

        component.updateFromGameState(gameState);

        expect(component.money).to.equal(0);
        expect(component.reputation).to.equal(0);
        expect(component.rank).to.equal('');
    });
});
