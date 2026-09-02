class RoommateSystem {
    constructor(roommate, timeManager) {
        this.roommate = roommate;
        this.timeManager = timeManager;
        this.rentSplit = 0.5; // hardcoded rent split
    }

    initializeRoommate() {
        this.roommate.rentContribution = 0; // sets rentContribution to 0
    }

    splitRent(totalRent) {
        return {
            player: totalRent * this.rentSplit,
            roommate: totalRent * (1 - this.rentSplit),
            total: totalRent
        };
    }

    getRelationshipLevel() {
        const relationshipPoints = this.roommate.relationshipPoints || 0;
        if (relationshipPoints < 20) {
            return 'stranger';
        } else if (relationshipPoints < 40) {
            return 'acquaintance';
        } else if (relationshipPoints < 70) {
            return 'friend';
        } else {
            return 'close_friend';
        }
    }

    getStatus() {
        return {
            name: this.roommate.name,
            relationship: this.getRelationshipLevel(),
            relationshipLevel: this.roommate.relationshipPoints || 0,
            atHome: this.isAtHome()
        };
    }

    isAtHome() {
        const timeSlot = this.timeManager?.timeSlot;
        if (!timeSlot) return false;
        return timeSlot >= 0 && timeSlot < 5; // true for slots 0-4, false beyond
    }
}

// Test cases
const roommate = { name: 'TestRoommate', relationshipPoints: 0, rentContribution: 0 };
const timeManager = { timeSlot: 2 }; // Example time slot
const roommateSystem = new RoommateSystem(roommate, timeManager);

// Test splitRent
console.assert(JSON.stringify(roommateSystem.splitRent(1000)) === JSON.stringify({ player: 500, roommate: 500, total: 1000 }), 'Test splitRent failed');

// Test getRelationshipLevel boundaries
roommate.relationshipPoints = 19;
console.assert(roommateSystem.getRelationshipLevel() === 'stranger', 'Test getRelationshipLevel (stranger) failed');
roommate.relationshipPoints = 20;
console.assert(roommateSystem.getRelationshipLevel() === 'acquaintance', 'Test getRelationshipLevel (acquaintance) failed');
roommate.relationshipPoints = 39;
console.assert(roommateSystem.getRelationshipLevel() === 'acquaintance', 'Test getRelationshipLevel (acquaintance) failed');
roommate.relationshipPoints = 40;
console.assert(roommateSystem.getRelationshipLevel() === 'friend', 'Test getRelationshipLevel (friend) failed');
roommate.relationshipPoints = 69;
console.assert(roommateSystem.getRelationshipLevel() === 'friend', 'Test getRelationshipLevel (friend) failed');
roommate.relationshipPoints = 70;
console.assert(roommateSystem.getRelationshipLevel() === 'close_friend', 'Test getRelationshipLevel (close_friend) failed');

// Test getStatus
roommate.relationshipPoints = 45;
roommateSystem.timeManager.timeSlot = 3;
console.assert(JSON.stringify(roommateSystem.getStatus()) === JSON.stringify({ name: 'TestRoommate', relationship: 'friend', relationshipLevel: 45, atHome: true }), 'Test getStatus failed');

// Test isAtHome
roommateSystem.timeManager.timeSlot = 4;
console.assert(roommateSystem.isAtHome() === true, 'Test isAtHome (true) failed');
roommateSystem.timeManager.timeSlot = 5;
console.assert(roommateSystem.isAtHome() === false, 'Test isAtHome (false) failed');