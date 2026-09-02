```javascript
import { RomanceProgressionSystem } from '../../src/js/game/romance/RomanceProgressionSystem';

describe('RomanceProgressionSystem', () => {
    let system;
    let gameState;
    let romancePartner;

    beforeEach(() => {
        gameState = {
            economySystem: { money: 1000 }
        };
        romancePartner = {
            name: 'TestPartner',
            income: 500,
            personality: 'shy'
        };
        system = new RomanceProgressionSystem(gameState, romancePartner);
    });

    describe('determineBias', () => {
        it('should determine bias for shy personality', () => {
            romancePartner.personality = 'shy';
            const bias = system.determineBias(romancePartner);
            expect(bias).toBe('shy');
        });

        it('should determine bias for outgoing personality', () => {
            romancePartner.personality = 'outgoing';
            const bias = system.determineBias(romancePartner);
            expect(bias).toBe('outgoing');
        });

        it('should determine bias for reserved personality', () => {
            romancePartner.personality = 'reserved';
            const bias = system.determineBias(romancePartner);
            expect(bias).toBe('reserved');
        });

        it('should determine bias for adventurous personality', () => {
            romancePartner.personality = 'adventurous';
            const bias = system.determineBias(romancePartner);
            expect(bias).toBe('adventurous');
        });

        it('should determine bias for introverted personality', () => {
            romancePartner.personality = 'introverted';
            const bias = system.determineBias(romancePartner);
            expect(bias).toBe('introverted');
        });

        it('should determine bias for extroverted personality', () => {
            romancePartner.personality = 'extroverted';
            const bias = system.determineBias(romancePartner);
            expect(bias).toBe('extroverted');
        });
    });

    describe('getAdviceMessage', () => {
        it('should return advice message for "date" recommendation', () => {
            const message = system.getAdviceMessage('date');
            expect(message).toBe('Go on a date with them!');
        });

        it('should return advice message for "hang_out" recommendation', () => {
            const message = system.getAdviceMessage('hang_out');
            expect(message).toBe('Hang out with them!');
        });

        it('should return advice message for "gift" recommendation', () => {
            const message = system.getAdviceMessage('gift');
            expect(message).toBe('Get them a gift!');
        });

        it('should return advice message for "apologize" recommendation', () => {
            const message = system.getAdviceMessage('apologize');
            expect(message).toBe('Apologize to them!');
        });

        it('should return advice message for "flatter" recommendation', () => {
            const message = system.getAdviceMessage('flatter');
            expect(message).toBe('Flatter them!');
        });
    });

    describe('workTogether', () => {
        it('should work together on project with same projectId', () => {
            const result1 = system.workTogether('project1');
            const result2 = system.workTogether('project1');
            expect(result1.bonus).toBe(result2.bonus);
            expect(result1.message).toBe(result2.message);
        });

        it('should work together on project with different projectId', () => {
            const result1 = system.workTogether('project1');
            const result2 = system.workTogether('project2');
            expect(result1.bonus).toBe(result2.bonus);
            expect(result1.message).toBe(result2.message);
        });
    });
});