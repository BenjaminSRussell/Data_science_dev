class WorkInteractionSystem {
    constructor(game) {
        this.game = game;
    }

    generateBoss() {
        const boss = {
            relationship: 0,
            dialogue: this.getBossDialogue.bind(this)
        };
        return boss;
    }

    getBossDialogue(relationship, promotionReadiness) {
        if (relationship < 20) {
            if (promotionReadiness > 70) {
                return "I see you're making good progress. Keep it up.";
            } else {
                return "You're a long way from getting that promotion, bud.";
            }
        } else if (relationship < 50) {
            if (promotionReadiness > 70) {
                return "You're doing great. Just a bit more work and you'll be there.";
            } else {
                return "I know you can do better. Keep pushing.";
            }
        } else {
            if (promotionReadiness > 70) {
                return "You're almost there. Just a bit more effort and you'll get that promotion.";
            } else {
                return "I'm proud of you. Just keep working hard.";
            }
        }
    }

    talkToBoss() {
        const boss = this.game.getBoss();
        const relationship = this.game.getPlayer().relationship;
        const promotionReadiness = this.game.getPlayer().promotionReadiness;
        const dialogue = this.getBossDialogue(relationship, promotionReadiness);
        console.log(dialogue);
    }

    askForPromotion() {
        const player = this.game.getPlayer();
        const boss = this.game.getBoss();

        if (player.promotionReadiness > 80 && player.relationship > 60 && player.reputation > 500 && player.completedTasks > 20) {
            player.promotionReadiness = 0;
            player.reputation += 100;
            boss.relationship += 10;
            console.log("Congratulations! You've been promoted.");
        } else if (player.promotionReadiness > 60) {
            player.promotionReadiness += 10;
            console.log("You're making good progress. Keep it up.");
        } else if (player.promotionReadiness < 40) {
            player.promotionReadiness += 5;
            boss.relationship -= 2;
            console.log("You need to work harder on your promotion readiness.");
        } else {
            player.promotionReadiness += 5;
            console.log("You're close. Keep pushing.");
        }
    }

    getCoworkerDialogue(personality, relationship) {
        const dialogues = {
            friendly: {
                low: ["Hey, how's it going?", "Just a casual chat."],
                medium: ["You look tired. Need a break?", "What's been on your mind?"],
                high: ["Great work today!", "Keep up the good work."]
            },
            competitive: {
                low: ["Did you finish that project yet?", "Need help with something?"],
                medium: ["Your skills are impressive.", "How's your progress?"],
                high: ["You're really excelling!", "Keep it up, you're the best."]
            },
            gossipy: {
                low: ["Oh, did you hear about what happened to [Coworker]?", "What's new?"],
                medium: ["[Coworker] is doing really well.", "Have you talked to them?"],
                high: ["[Coworker] is amazing, isn't they?", "They're the talk of the office."]
            }
        };

        const tier = relationship < 20 ? 'low' : relationship < 50 ? 'medium' : 'high';
        return dialogues[personality][tier][Math.floor(Math.random() * dialogues[personality][tier].length)];
    }

    quitJob() {
        const player = this.game.getPlayer();
        const boss = this.game.getBoss();

        let message;
        if (boss.relationship > 70) {
            message = "I'm leaving the company, but I'll always remember you.";
        } else if (boss.relationship > 40) {
            message = "I'm leaving. Good luck with the company.";
        } else {
            message = "I'm leaving. No hard feelings.";
        }

        player.currentJob = null;
        boss.relationship = 0;
        player.promotionReadiness = 0;
        console.log(message);
    }

    talkToCoworker(coworkerId) {
        const coworker = this.game.getCoworker(coworkerId);
        if (!coworker) {
            console.log("Coworker not found.");
            return;
        }

        coworker.relationship = Math.min(coworker.relationship + 1, 100);
        const dialogue = this.getCoworkerDialogue(coworker.personality, coworker.relationship);
        console.log(dialogue);
    }
}