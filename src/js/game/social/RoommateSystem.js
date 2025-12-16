/**
 * RoommateSystem.js
 * Manages roommate at game start
 * Shared living, rent splitting, interactions
 */

export class RoommateSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.roommate = null;
        this.relationship = 30; // Start as acquaintances
        this.rentSplit = 0.5; // 50/50 split
        this.initializeRoommate();
    }
    
    /**
     * Initialize starting roommate
     */
    initializeRoommate() {
        this.roommate = {
            id: 'roommate_start',
            name: 'Alex',
            personality: 'friendly',
            job: 'Junior Analyst',
            income: 2000,
            rentContribution: 0,
            relationship: 30,
            traits: ['messy', 'social', 'helpful'],
            schedule: {
                morning: 'home',
                afternoon: 'work',
                evening: 'home',
                night: 'out'
            }
        };
    }
    
    /**
     * Split rent
     */
    splitRent(totalRent) {
        const playerShare = totalRent * this.rentSplit;
        const roommateShare = totalRent * (1 - this.rentSplit);
        
        return {
            player: playerShare,
            roommate: roommateShare,
            total: totalRent
        };
    }
    
    /**
     * Interact with roommate
     */
    interact(action) {
        switch (action) {
            case 'talk':
                return this.talk();
            case 'ask_help':
                return this.askForHelp();
            case 'complain':
                return this.complain();
            case 'hangout':
                return this.hangout();
            default:
                return { message: 'You interact with your roommate' };
        }
    }
    
    /**
     * Talk to roommate
     */
    talk() {
        const topics = [
            'How was work today?',
            'Any plans for the weekend?',
            'How is your job going?',
            'Want to grab food together?'
        ];
        
        this.relationship += 2;
        
        return {
            message: `You chat with ${this.roommate.name}`,
            relationship: this.relationship,
            topic: topics[Math.floor(Math.random() * topics.length)]
        };
    }
    
    /**
     * Ask roommate for help
     */
    askForHelp() {
        if (this.relationship < 40) {
            return { message: `${this.roommate.name} seems hesitant to help` };
        }
        
        this.relationship += 3;
        return {
            message: `${this.roommate.name} agrees to help you`,
            help: true
        };
    }
    
    /**
     * Complain about something
     */
    complain() {
        this.relationship -= 5;
        return {
            message: `${this.roommate.name} seems annoyed`,
            relationship: this.relationship
        };
    }
    
    /**
     * Hang out with roommate
     */
    hangout() {
        this.relationship += 5;
        return {
            message: `You spend time with ${this.roommate.name}`,
            relationship: this.relationship,
            benefit: 'energy'
        };
    }
    
    /**
     * Get roommate status
     */
    getStatus() {
        return {
            name: this.roommate.name,
            relationship: this.relationship,
            relationshipLevel: this.getRelationshipLevel(),
            atHome: this.isAtHome()
        };
    }
    
    /**
     * Get relationship level
     */
    getRelationshipLevel() {
        if (this.relationship < 20) return 'stranger';
        if (this.relationship < 40) return 'acquaintance';
        if (this.relationship < 70) return 'friend';
        return 'close_friend';
    }
    
    /**
     * Check if roommate is at home
     */
    isAtHome() {
        // Simple check based on time
        const timeSlot = this.gameState.timeManager?.timeSlot || 0;
        const schedule = this.roommate.schedule;
        
        if (timeSlot <= 1) return schedule.morning === 'home';
        if (timeSlot <= 3) return schedule.afternoon === 'home';
        if (timeSlot <= 4) return schedule.evening === 'home';
        return schedule.night === 'home';
    }
}

