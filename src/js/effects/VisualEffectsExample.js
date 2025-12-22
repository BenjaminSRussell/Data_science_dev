/**
 * VisualEffectsExample.js
 * Example integration of visual effects into the game
 * Shows how to use VisualEffectsManager with game events
 */

import { VisualEffectsManager } from './VisualEffectsManager.js';

/**
 * Initialize visual effects for the game
 */
export function initializeVisualEffects(game) {
    // Create effects manager
    const effectsManager = new VisualEffectsManager(game.visualSystem);
    
    // Store in game object for easy access
    game.effectsManager = effectsManager;
    
    // Setup effect handlers
    setupEffectHandlers(game, effectsManager);
    
    return effectsManager;
}

/**
 * Setup event handlers for visual effects
 */
function setupEffectHandlers(game, effectsManager) {
    const gameContainer = document.getElementById('game-container') || document.body;
    
    // Example 1: Explosion on click
    gameContainer.addEventListener('click', (e) => {
        // Only create explosion if clicking on game area
        if (e.target.closest('.game-area')) {
            const rect = gameContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            effectsManager.createExplosion(x, y, gameContainer, {
                count: 50,
                speed: 4,
                colors: ['#ff6b6b', '#ffa500', '#ffff00']
            });
        }
    });
    
    // Example 2: Sparkle on button click
    document.querySelectorAll('.sparkle-button, .premium-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            effectsManager.createSparkle(x, y, document.body, {
                count: 20,
                duration: 800
            });
        });
    });
    
    // Example 3: Magic aura on level up (if game has level up events)
    if (game.on) {
        game.on('levelUp', (data) => {
            const characterElement = document.querySelector(`[data-character="${data.characterId}"]`);
            if (characterElement) {
                const rect = characterElement.getBoundingClientRect();
                const container = characterElement.closest('.game-container') || document.body;
                
                effectsManager.createMagicAura(
                    rect.left + rect.width / 2 - container.getBoundingClientRect().left,
                    rect.top + rect.height / 2 - container.getBoundingClientRect().top,
                    container,
                    {
                        radius: 40,
                        duration: 2000
                    }
                );
            }
        });
    }
    
    // Example 4: Explosion on task completion
    if (game.on) {
        game.on('taskComplete', (data) => {
            const taskElement = document.querySelector(`[data-task="${data.taskId}"]`);
            if (taskElement) {
                const rect = taskElement.getBoundingClientRect();
                const container = taskElement.closest('.game-container') || document.body;
                
                effectsManager.createExplosion(
                    rect.left + rect.width / 2 - container.getBoundingClientRect().left,
                    rect.top + rect.height / 2 - container.getBoundingClientRect().top,
                    container,
                    {
                        count: 30,
                        speed: 3,
                        colors: ['#4ecdc4', '#44a08d']
                    }
                );
            }
        });
    }
    
    // Example 5: Rain effect (can be toggled)
    let rainEffectId = null;
    
    window.toggleRain = function() {
        if (rainEffectId) {
            effectsManager.removeEffect(rainEffectId);
            rainEffectId = null;
        } else {
            const backgroundContainer = document.getElementById('background-container') || document.body;
            rainEffectId = effectsManager.createRain(backgroundContainer, {
                dropCount: 200,
                color: 'rgba(174, 194, 224, 0.5)'
            });
        }
    };
    
    // Example 6: Starfield background (can be toggled)
    let starfieldEffectId = null;
    
    window.toggleStarfield = function() {
        if (starfieldEffectId) {
            effectsManager.removeEffect(starfieldEffectId);
            starfieldEffectId = null;
        } else {
            const backgroundContainer = document.getElementById('background-container') || document.body;
            starfieldEffectId = effectsManager.createStarfield(backgroundContainer, {
                starCount: 150
            });
        }
    };
}

/**
 * Helper function to create effect at element position
 */
export function createEffectAtElement(element, effectType, options = {}) {
    if (!window.game?.effectsManager) {
        console.warn('Visual effects not initialized');
        return null;
    }
    
    const rect = element.getBoundingClientRect();
    const container = element.closest('.game-container') || document.body;
    const containerRect = container.getBoundingClientRect();
    
    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top + rect.height / 2 - containerRect.top;
    
    const effectsManager = window.game.effectsManager;
    
    switch (effectType) {
        case 'explosion':
            return effectsManager.createExplosion(x, y, container, options);
        case 'sparkle':
            return effectsManager.createSparkle(x, y, container, options);
        case 'magic':
            return effectsManager.createMagicAura(x, y, container, options);
        case 'smoke':
            return effectsManager.createSmoke(x, y, container, options);
        default:
            console.warn(`Unknown effect type: ${effectType}`);
            return null;
    }
}
