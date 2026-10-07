const { AISystem } = require('../../src/js/game/AISystem');

describe('AISystem', () => {
    let aiSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            ai: {
                hardware: [],
                slots: 5,
                intelligence: 1,
                level: 1,
                xp: 0,
                xpToNextLevel: 50,
                processingPower: 1.5
            }
        };
        aiSystem = new AISystem(mockGameState);
    });

    test('should initialize with default values', () => {
        expect(aiSystem.processingPower).toBe(1.5);
        expect(aiSystem.intelligenceRating).toBe(1.5);
        expect(aiSystem.level).toBe(1);
        expect(aiSystem.xp).toBe(0);
        expect(aiSystem.xpToNextLevel).toBe(50);
    });

    test('should update processingPower with hardware', () => {
        aiSystem.hardware.push({ multiplier: 2.0 });
        expect(aiSystem.processingPower).toBe(5.5);
    });

    test('should calculate intelligenceRating correctly', () => {
        expect(aiSystem.intelligenceRating).toBe(1.5);
    });

    test('should train and gain XP', () => {
        const result = aiSystem.train(5);
        expect(result.success).toBe(true);
        expect(result.xpGained).toBe(50);
        expect(aiSystem.xp).toBe(50);
    });

    test('should level up correctly', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.3);
        aiSystem.xp = 50;
        expect(aiSystem.checkLevelUp()).toBe(true);
        expect(aiSystem.level).toBe(2);
        expect(aiSystem.xpToNextLevel).toBe(Math.floor(50 * 1.5));
    });

    test('should fail to install hardware if no empty slots', () => {
        mockGameState.ai.slots = 0;
        const result = aiSystem.installHardware({ multiplier: 1.0 });
        expect(result.success).toBe(false);
        expect(result.reason).toBe('No empty server slots!');
    });

    test('should install hardware if slots available', () => {
        const result = aiSystem.installHardware({ multiplier: 1.0 });
        expect(result.success).toBe(true);
        expect(aiSystem.hardware.length).toBe(1);
    });

    test('should expand slots correctly', () => {
        aiSystem.expandSlots();
        expect(aiSystem.slots).toBe(6);
    });

    test('should serialize and deserialize correctly', () => {
        const serialized = aiSystem.toJSON();
        const newAiSystem = new AISystem();
        newAiSystem.fromJSON(serialized);
        expect(newAiSystem.processingPower).toBe(aiSystem.processingPower);
        expect(newAiSystem.intelligenceRating).toBe(aiSystem.intelligenceRating);
        expect(newAiSystem.level).toBe(aiSystem.level);
        expect(newAiSystem.xp).toBe(aiSystem.xp);
        expect(newAiSystem.xpToNextLevel).toBe(aiSystem.xpToNextLevel);
        expect(newAiSystem.hardware.length).toBe(aiSystem.hardware.length);
    });
});