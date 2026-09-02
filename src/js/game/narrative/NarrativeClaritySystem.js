import { getNPC } from './NPCManager'; // Assuming NPCManager provides getNPC function

class NarrativeClaritySystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    getNarrativeContext() {
        const { totalDays, ethics, reputation, rank } = this.gameState;
        let chapter = 'Ch5';
        if (totalDays < 7) chapter = 'Ch1';
        else if (totalDays < 30) chapter = 'Ch2';
        else if (totalDays < 90) chapter = 'Ch3';
        else if (totalDays < 180) chapter = 'Ch4';

        const themes = [];
        if (ethics < -30) themes.push('corruption', 'power');
        else if (ethics > 30) themes.push('integrity', 'justice');
        if (reputation > 1000 || rank >= 5) themes.push('influence', 'leadership');

        return { chapter, themes };
    }

    getCharacterMotivation(npcId) {
        const npc = getNPC(npcId);
        if (!npc) return null;

        const relationship = this.gameState.relationships[npcId] || 0;
        if (npcId === 'alex_rivera' || npcId === 'professor_higgins' || npcId === 'emma_bloom') {
            if (relationship < 30) return 'low';
            if (relationship < 70) return 'medium';
            return 'high';
        }

        return null;
    }

    getConsequenceExplanation(decision) {
        let explanation = '';
        if (decision.ethics !== undefined) {
            explanation += decision.ethics > 0 ? '+ ' + decision.ethics : decision.ethics;
            explanation += ' Ethics, ';
        }
        if (decision.money !== undefined) {
            explanation += decision.money > 0 ? '+ $' + Math.abs(decision.money) : '$' + decision.money;
            explanation += ', ';
        }
        if (decision.reputation !== undefined) {
            explanation += decision.reputation > 0 ? '+ ' + decision.reputation : decision.reputation;
            explanation += ' Reputation, ';
        }
        if (decision.risk !== undefined) {
            explanation += 'Risk: ' + decision.risk + '.';
        }

        return explanation.trim();
    }

    getEconomyState() {
        const money = this.gameState.economy.money;
        if (money < 1000) return 'Economy Struggles';
        if (money < 5000) return 'Economy is Stable';
        if (money < 20000) return 'Economy is Thriving';
        if (money < 100000) return 'Economy is Booming';
        return 'Economy is Flourishing';
    }

    getSocialState() {
        const connections = Object.values(this.gameState.relationships).filter(rel => rel > 0);
        if (connections.length > 70) return 'Building connections';
        if (connections.length >= 3) return 'Well-connected';
        if (connections.length >= 1) return 'A few close friends';
        return 'Isolated';
    }
}

export default NarrativeClaritySystem;