/**
 * RoommateSystem.js
 * Manages interactions with the player's roommate.
 */

export class RoommateSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.roommate = {
            name: "Sam",
            relationship: 30,
            schedule: {
                morning: 'home',
                afternoon: 'home',
                evening: 'home',
                night: 'home'
            }
        };
        this.interactionTopics = [
            "Weather",
            "Books",
            "Movies",
            "Music"
        ];
    }

    /**
     * Interact with the roommate
     * @param {string} action - The type of interaction
     */
    interact(action) {
        switch (action) {
            case 'talk':
                this.talk();
                break;
            case 'askForHelp':
                this.askForHelp();
                break;
            case 'complain':
                this.complain();
                break;
            case 'hangout':
                this.hangout();
                break;
            default:
                this.defaultInteraction();
                break;
        }
    }

    /**
     * Talk to the roommate
     */
    talk() {
        this.roommate.relationship += 2;
        const randomTopic = this.interactionTopics[Math.floor(Math.random() * this.interactionTopics.length)];
        this.gameState.dispatch({ type: 'ROOMMATE_TALK', topic: randomTopic });
    }

    /**
     * Ask the roommate for help
     */
    askForHelp() {
        if (this.roommate.relationship < 40) {
            this.gameState.dispatch({ type: 'ROOMMATE_DECLINE_HELP' });
        } else {
            this.roommate.relationship += 3;
            this.gameState.dispatch({ type: 'ROOMMATE_AGREE_HELP', help: true });
        }
    }

    /**
     * Complain to the roommate
     */
    complain() {
        this.roommate.relationship -= 5;
        this.gameState.dispatch({ type: 'ROOMMATE_COMPLAIN' });
    }

    /**
     * Hang out with the roommate
     */
    hangout() {
        this.roommate.relationship += 5;
        this.gameState.dispatch({ type: 'ROOMMATE_HANGOUT', benefit: 'energy' });
    }

    /**
     * Default interaction with the roommate
     */
    defaultInteraction() {
        this.gameState.dispatch({ type: 'ROOMMATE_DEFAULT' });
    }
}