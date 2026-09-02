import { logger } from './utils/logger.js';
import { AssetManager } from './assetManager.js';
import { SpriteSheetManager } from './sprite/spriteSheetManager.js';
import { InventorySystem } from './game/InventorySystem.js';
import { LocationDetailSystem } from './game/LocationDetailSystem.js';
import { CompanyManagementSystem } from './game/CompanyManagementSystem.js';
import { RomanceProgressionSystem } from './game/RomanceProgressionSystem.js';
import { JealousySystem } from './game/JealousySystem.js';
import { DemandingBossSystem } from './game/DemandingBossSystem.js';
import { GameplaySettings } from './game/GameplaySettings.js';
import { RoommateSystem } from './game/RoommateSystem.js';
import { DirtyDataSystem } from './game/DirtyDataSystem.js';
import { DetailedMapSystem } from './game/DetailedMapSystem.js';
import { RoomSystem } from './game/RoomSystem.js';
import { EventSystem } from './game/EventSystem.js';
import { VisualProgressionSystem } from './game/VisualProgressionSystem.js';
import { RealWorldTaskSystem } from './game/RealWorldTaskSystem.js';
import { TaskVisualRenderer } from './game/TaskVisualRenderer.js';
import { AITrainingStoryline } from './game/AITrainingStoryline.js';
import { GitHubIssuesSystem } from './game/GitHubIssuesSystem.js';
import { ResearchPaperNotificationSystem } from './game/ResearchPaperNotificationSystem.js';
import { ResearchInboxUI } from './ui/ResearchInboxUI.js';
import { EmotionalBreakdownSystem } from './game/EmotionalBreakdownSystem.js';
import { RelationshipDialogueSystem } from './game/RelationshipDialogueSystem.js';
import { ComprehensiveSpriteSystem } from './sprite/ComprehensiveSpriteSystem.js';
import { ClientManager } from './game/ClientManager.js'; // Import ClientManager

class MainGame {
    constructor() {
        this.assetManager = new AssetManager();
        this.spriteSheetManager = new SpriteSheetManager(this.assetManager);
        this.gameState = {
            assetManager: this.assetManager,
            spriteSheetManager: this.spriteSheetManager
        };
        this.clientManager = new ClientManager(this.gameState); // Initialize ClientManager
    }

    async init() {
        try {
            // ... (rest of the init method remains unchanged)

            // Start the game loop
            this.startGameLoop();
        } catch (error) {
            logger.error('Error initializing game:', error);
            throw error;
        }
    }

    startGameLoop() {
        const gameLoop = () => {
            // ... (existing game loop logic remains unchanged)

            // Generate leads periodically
            this.clientManager.generateLeads();

            // ... (existing game loop logic remains unchanged)

            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }

    // ... (other methods remain unchanged)
}

// Initialize on DOM ready

const initGame = () => {
    try {
        logger.debug('DOM Content Loaded. Starting Game...');

        logger.debug('Before MainGame instantiation');

        game = new MainGame();

        window.game = game; // Expose for modal buttons
        logger.debug('MainGame instantiated. Calling init()...');

        // Show diagnostic
        if (game.showDiagnostic) {
            game.showDiagnostic('About to call game.init()');
        }

        // Call init and handle any errors
        game.init().catch(err => {
            logger.error('init() promise rejected:', err);
            if (game.showError) {
                game.showError('init() failed: ' + err.message);
            }
        });

        // Fallback: If game doesn't show after 3 seconds, force it
        setTimeout(() => {
            const gameContainer = document.getElementById('game-container');
            const loadingScreen = document.getElementById('loading-screen');
            if (gameContainer && gameContainer.classList.contains('hidden')) {
                logger.warn('Fallback: Forcing game to show after timeout');
                gameContainer.classList.remove('hidden');
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    loadingScreen.classList.add('hidden');
                }
                if (game.showDiagnostic) {
                    game.showDiagnostic('Fallback: Game forced to show');
                }
            }
        }, 3000);
    } catch (e) {
        logger.error('CRITICAL BOOT ERROR:', e);
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,0,0,0.9);color:white;z-index:99999;padding:20px;font-family:monospace;white-space:pre-wrap;overflow:auto;pointer-events:all;';
        errDiv.innerHTML = '<h1>CRITICAL BOOT ERROR</h1><h3>' + e.toString() + '</h3><pre>' + e.stack + '</pre>';
        document.body.appendChild(errDiv);
    }
};

// Handle both cases: DOM already loaded or still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM already loaded, call immediately
    initGame();
}

export { game };