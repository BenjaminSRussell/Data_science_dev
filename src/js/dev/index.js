/**
 * Developer Tools Entry Point
 * Loads all developer tools and testing utilities
 */

import { DevMenu } from './DevMenu.js';
import { DialogueTester } from './DialogueTester.js';
import { OptionTester } from './OptionTester.js';
import { AssetValidator } from './AssetValidator.js';
import { GraphValidator } from './GraphValidator.js';
import { WorkSystemValidator } from './WorkSystemValidator.js';
import { StorylineNavigator } from './StorylineNavigator.js';
import { LocationTester } from './LocationTester.js';

export class DevTools {
    constructor(game) {
        this.game = game;
        this.devMenu = null;
        this.dialogueTester = null;
        this.optionTester = null;
        this.assetValidator = null;
        this.graphValidator = null;
        this.workValidator = null;
        this.storylineNavigator = null;
        this.locationTester = null;
        
        this.init();
    }

    init() {
        if (this.isDevMode()) {
            console.log('Developer Tools Enabled');
            
            this.devMenu = new DevMenu(this.game);
            this.dialogueTester = new DialogueTester(this.game);
            this.optionTester = new OptionTester(this.game);
            this.assetValidator = new AssetValidator(this.game);
            this.graphValidator = new GraphValidator(this.game);
            this.workValidator = new WorkSystemValidator(this.game);
            this.storylineNavigator = new StorylineNavigator(this.game);
            this.locationTester = new LocationTester(this.game);

            // Make tools globally available
            window.devTools = this;
            
            // Enable dev mode in localStorage
            localStorage.setItem('dev_mode', 'true');
        }
    }

    isDevMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               localStorage.getItem('dev_mode') === 'true' ||
               new URLSearchParams(window.location.search).has('dev');
    }

    runAllTests() {
        const results = {
            dialogues: null,
            options: null,
            assets: null,
            graphs: null,
            work: null
        };

        return Promise.all([
            this.dialogueTester?.testAll().then(r => results.dialogues = r),
            this.optionTester?.testAll().then(r => results.options = r),
            this.assetValidator?.validateAll().then(r => results.assets = r),
            this.graphValidator?.validateAll().then(r => results.graphs = r),
            this.workValidator?.validateAll().then(r => results.work = r)
        ]).then(() => {
            console.log('All tests completed:', results);
            return results;
        });
    }
}

