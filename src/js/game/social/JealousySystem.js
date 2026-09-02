class JealousySystem {
    constructor(gameState) {
        this.gameState = gameState;
    }

    checkJealousy(playerSuccess) {
        if (!this.gameState.npcManager) return;

        const allNPCs = this.gameState.npcManager.getAllNPCs();
        allNPCs.forEach(npc => {
            if (this.shouldBeJealous(npc, playerSuccess)) {
                this.increaseJealousy(npc.id, 10);
            } else {
                this.increaseJealousy(npc.id, 1);
            }
        });

        // Random chance for others to feel jealous
        if (Math.random() < 0.3) {
            const randomNPC = allNPCs[Math.floor(Math.random() * allNPCs.length)];
            this.increaseJealousy(randomNPC.id, 5);
        }
    }

    shouldBeJealous(npc, playerSuccess) {
        if (npc.type === 'competitive') return true;
        if (npc.type === 'business' || npc.type === 'mentor') {
            return playerSuccess.type === 'career' || playerSuccess.type === 'financial';
        }
        return false;
    }

    increaseJealousy(npcId, amount) {
        const currentJealousy = this.gameState.npcManager.getRelationship(npcId, 'jealousy') || 0;
        const newJealousy = Math.min(currentJealousy + amount, 100);
        this.gameState.npcManager.setRelationship(npcId, 'jealousy', newJealousy);

        if (newJealousy > 50) {
            this.affectRelationship(npcId, -10);
        }
        if (newJealousy > 75) {
            this.stopTalking(npcId);
        }
    }

    affectRelationship(npcId, amount) {
        const currentRelationship = this.gameState.npcManager.getRelationship(npcId, 'relationship') || 0;
        const newRelationship = Math.max(currentRelationship + amount, 0);
        this.gameState.npcManager.setRelationship(npcId, 'relationship', newRelationship);
    }

    stopTalking(npcId) {
        const npc = this.gameState.npcManager.getNPC(npcId);
        npc.willNotTalk = true;
        npc.jealousyMessage = "I'm too jealous to talk to you right now.";
    }
}

export default JealousySystem;