// EmotionalBreakdownSystem.js
// ...

// Test coverage for EmotionalBreakdownSystem

const assert = require('assert');

// Mocking NPC and Relationship for testing
class MockNPC {
    constructor(id) {
        this.id = id;
    }
}

class MockRelationship {
    constructor(level) {
        this.level = level;
    }
}

// Mocking gameState.npcManager for modifyRelationship
class MockNPCManager {
    modifyRelationship(npcId, change) {
        this.relationshipChanges = this.relationshipChanges || {};
        this.relationshipChanges[npcId] = (this.relationshipChanges[npcId] || 0) + change;
    }
}

// Mocking gameState with npcManager
class MockGameState {
    constructor() {
        this.npcManager = new MockNPCManager();
    }
}

describe('EmotionalBreakdownSystem', function() {
    let system;
    let npc;
    let relationship;
    let gameState;

    beforeEach(function() {
        gameState = new MockGameState();
        npc = new MockNPC('npc1');
        relationship = new MockRelationship(10);
        system = new EmotionalBreakdownSystem(gameState);
    });

    it('getBreakdownConditions should trigger for low relationship', function() {
        relationship.level = 19;
        const conditions = system.getBreakdownConditions(npc, relationship, 'low_relationship');
        assert.strictEqual(conditions.shouldTrigger, true);
    });

    it('getBreakdownConditions should not trigger for low relationship at threshold', function() {
        relationship.level = 20;
        const conditions = system.getBreakdownConditions(npc, relationship, 'low_relationship');
        assert.strictEqual(conditions.shouldTrigger, false);
    });

    it('getBreakdownConditions should return false for unknown trigger', function() {
        const conditions = system.getBreakdownConditions(npc, relationship, 'unknown_trigger_name');
        assert.strictEqual(conditions.shouldTrigger, false);
    });

    it('getBreakdownConditions should not trigger for rejection', function() {
        const conditions = system.getBreakdownConditions(npc, relationship, 'rejection');
        assert.strictEqual(conditions.shouldTrigger, false);
    });

    it('getBreakdownConditions should not trigger for betrayal', function() {
        const conditions = system.getBreakdownConditions(npc, relationship, 'betrayal');
        assert.strictEqual(conditions.shouldTrigger, false);
    });

    it('getBreakdownConditions should not trigger for jealousy', function() {
        const conditions = system.getBreakdownConditions(npc, relationship, 'jealousy');
        assert.strictEqual(conditions.shouldTrigger, false);
    });

    it('calculateRelationshipChange should return correct value for known cells', function() {
        assert.strictEqual(system.calculateRelationshipChange('positive', 'hurt'), 10);
        assert.strictEqual(system.calculateRelationshipChange('negative', 'betrayal'), -25);
        assert.strictEqual(system.calculateRelationshipChange('neutral', 'jealousy'), 0);
        assert.strictEqual(system.calculateRelationshipChange('unknown_effect', 'unknown_type'), 0);
    });

    it('handleQuickTimeTimeout should modify relationship by -5', function() {
        const breakdownId = 'bd1';
        system.activeBreakdowns.set(breakdownId, { npcId: npc.id, type: 'anger', resolved: false });
        system.handleQuickTimeTimeout(breakdownId);
        assert.strictEqual(gameState.npcManager.relationshipChanges[npc.id], -5);
    });

    it('handleQuickTimeTimeout should set playerResponse to timeout', function() {
        const breakdownId = 'bd2';
        system.activeBreakdowns.set(breakdownId, { npcId: npc.id, type: 'anger', resolved: false });
        system.handleQuickTimeTimeout(breakdownId);
        const breakdown = system.activeBreakdowns.get(breakdownId);
        assert.strictEqual(breakdown.playerResponse.choiceId, 'timeout');
        assert.strictEqual(breakdown.playerResponse.effect, 'negative');
    });
});