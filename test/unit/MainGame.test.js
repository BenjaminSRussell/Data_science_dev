```javascript
import { MainGame } from '../../src/js/main.js';

// Mock dependencies
const mockGameState = {
    money: 10000,
    staff: {}
};

// Minimal instance shape for testing
const minimalMainGameInstance = {
    lastTime: 0,
    staffCosts: {
        'junior': 2000,
        'senior': 5000,
        'expert': 15000
    }
};

describe('MainGame', () => {
    describe('handleHireStaff', () => {
        it('should reject invalid roles', () => {
            const result = MainGame.prototype.handleHireStaff.call(minimalMainGameInstance, 'invalid', mockGameState);
            expect(result).toBe(false);
        });

        it('should deduct correct amount for junior staff', () => {
            const result = MainGame.prototype.handleHireStaff.call(minimalMainGameInstance, 'junior', mockGameState);
            expect(result).toBe(true);
            expect(mockGameState.money).toBe(8000);
        });

        it('should deduct correct amount for senior staff', () => {
            const result = MainGame.prototype.handleHireStaff.call(minimalMainGameInstance, 'senior', mockGameState);
            expect(result).toBe(true);
            expect(mockGameState.money).toBe(5000);
        });

        it('should deduct correct amount for expert staff', () => {
            const result = MainGame.prototype.handleHireStaff.call(minimalMainGameInstance, 'expert', mockGameState);
            expect(result).toBe(true);
            expect(mockGameState.money).toBe(-5000);
        });
    });

    describe('gameLoop', () => {
        it('should calculate deltaTime correctly', () => {
            const newTimestamp = 1000;
            MainGame.prototype.gameLoop.call(minimalMainGameInstance, newTimestamp);
            expect(minimalMainGameInstance.lastTime).toBe(newTimestamp);
            expect(minimalMainGameInstance.deltaTime).toBe(0);
        });
    });

    // Additional tests for other pure methods can be added here
});