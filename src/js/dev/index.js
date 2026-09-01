import DevMenu from './DevMenu';
import StorylineNavigator from './StorylineNavigator';
import LocationTester from './LocationTester';

export default class DevTools {
    constructor(game) {
        this.game = game;
        this.initialize();
    }

    initialize() {
        // Ensure the game is fully initialized
        if (!this.game) {
            console.error('Game instance is required for DevTools');
            return;
        }

        // Initialize StorylineNavigator
        this.storylineNavigator = new StorylineNavigator(this.game);

        // Initialize LocationTester
        this.locationTester = new LocationTester(this.game);

        // Assign to window.devTools
        window.devTools = this;

        // Initialize DevMenu after assigning to window.devTools
        this.devMenu = new DevMenu(this.game);
    }
}