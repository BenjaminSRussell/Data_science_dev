/**
 * DirtyDataSystem.js
 * Handles unethical data work options
 * Manipulation, privacy violations, etc.
 */

export class DirtyDataSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.unethicalActions = [];
        this.reputation = 0; // Negative = bad reputation
    }
    
    /**
     * Available dirty data options
     */
    getDirtyOptions() {
        return [
            {
                id: 'manipulate_data',
                name: 'Manipulate Data',
                description: 'Alter data to show desired results',
                risk: 30,
                reward: 200,
                ethical: false,
                consequences: {
                    reputation: -10,
                    legal: 5
                }
            },
            {
                id: 'sell_data',
                name: 'Sell User Data',
                description: 'Sell collected data to third parties',
                risk: 50,
                reward: 500,
                ethical: false,
                consequences: {
                    reputation: -20,
                    legal: 15
                }
            },
            {
                id: 'fake_results',
                name: 'Fake Results',
                description: 'Create false analysis results',
                risk: 40,
                reward: 300,
                ethical: false,
                consequences: {
                    reputation: -15,
                    legal: 10
                }
            },
            {
                id: 'privacy_violation',
                name: 'Privacy Violation',
                description: 'Access data without permission',
                risk: 60,
                reward: 400,
                ethical: false,
                consequences: {
                    reputation: -25,
                    legal: 20
                }
            },
            {
                id: 'bias_algorithm',
                name: 'Create Biased Algorithm',
                description: 'Design algorithm with intentional bias',
                risk: 35,
                reward: 250,
                ethical: false,
                consequences: {
                    reputation: -12,
                    legal: 8
                }
            }
        ];
    }
    
    /**
     * Perform dirty data action
     */
    performAction(actionId) {
        const action = this.getDirtyOptions().find(a => a.id === actionId);
        if (!action) return { success: false };
        
        // Check if caught
        const caught = Math.random() * 100 < action.risk;
        
        if (caught) {
            return this.handleCaught(action);
        }
        
        // Success - get reward but suffer consequences
        this.unethicalActions.push({
            action: actionId,
            date: this.gameState.timeManager?.totalDays || 1,
            caught: false
        });
        
        this.applyConsequences(action.consequences);
        
        return {
            success: true,
            caught: false,
            reward: action.reward,
            message: `You performed ${action.name}. You got away with it... for now.`
        };
    }
    
    /**
     * Handle being caught
     */
    handleCaught(action) {
        this.unethicalActions.push({
            action: action.id,
            date: this.gameState.timeManager?.totalDays || 1,
            caught: true
        });
        
        // Severe consequences
        this.reputation -= action.consequences.reputation * 2;
        
        // Legal trouble
        if (this.gameState.legalSystem) {
            this.gameState.legalSystem?.addLegalIssue({
                type: 'data_violation',
                severity: action.consequences.legal,
                description: `Caught performing ${action.name}`
            });
        }
        
        return {
            success: false,
            caught: true,
            message: `You were caught performing ${action.name}. Your reputation has been damaged.`,
            consequences: {
                reputation: this.reputation,
                legal: true
            }
        };
    }
    
    /**
     * Apply consequences
     */
    applyConsequences(consequences) {
        this.reputation += consequences.reputation;
        
        // Update game state
        if (this.gameState.reputationSystem) {
            this.gameState.reputationSystem?.updateReputation(consequences.reputation);
        }
    }
    
    /**
     * Get reputation level
     */
    getReputationLevel() {
        if (this.reputation > -10) return 'clean';
        if (this.reputation > -30) return 'questionable';
        if (this.reputation > -50) return 'bad';
        return 'terrible';
    }
}

