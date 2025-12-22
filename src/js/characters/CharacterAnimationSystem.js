/**
 * CharacterAnimationSystem.js
 * Manages character animations, emotions, and body language
 * Phase 3: Now uses GSAP for animations
 */

import { GSAPAnimationManager } from '../animation/GSAPAnimationManager.js';

export class CharacterAnimationSystem {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.characters = new Map();
        this.animations = new Map();
        // Phase 3: Use GSAP for animations
        this.gsapAnimator = new GSAPAnimationManager();
    }
    
    /**
     * Register a character
     */
    registerCharacter(characterId, config) {
        this.characters.set(characterId, {
            id: characterId,
            name: config.name || 'Unknown',
            currentEmotion: 'neutral',
            currentPose: 'standing',
            emotionHistory: [],
            poseHistory: [],
            animationState: 'idle',
            ...config
        });
    }
    
    /**
     * Set character emotion
     */
    setEmotion(characterId, emotion) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        const validEmotions = [
            // Basic emotions
            'happy', 'sad', 'angry', 'neutral', 'excited', 'thinking',
            // Breakdown emotions
            'crying', 'yelling', 'fighting',
            // Relationship emotions
            'grateful', 'jealous', 'hurt', 'embarrassed', 'proud', 'worried',
            'relieved', 'surprised', 'disappointed', 'hopeful', 'confused',
            'determined', 'tired', 'content'
        ];
        if (!validEmotions.includes(emotion)) {
            console.warn(`Invalid emotion: ${emotion}`);
            return;
        }
        
        character.currentEmotion = emotion;
        character.emotionHistory.push({
            emotion: emotion,
            timestamp: Date.now()
        });
        
        // Keep only last 10 emotions
        if (character.emotionHistory.length > 10) {
            character.emotionHistory.shift();
        }
        
        this.updateCharacterDisplay(characterId);
    }
    
    /**
     * Set character body language/pose
     */
    setPose(characterId, pose) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        const validPoses = [
            // Basic poses
            'standing', 'sitting', 'walking',
            // Communication poses
            'talking', 'listening', 'thinking', 'explaining',
            // Work poses
            'working', 'typing', 'reading', 'presenting',
            // Emotional poses
            'happy_pose', 'sad_pose', 'angry_pose', 'defensive', 'open',
            // Breakdown poses
            'crying_pose', 'yelling_pose', 'fighting_pose',
            // Social poses
            'greeting', 'handshake', 'hugging', 'pointing', 'nodding', 'shaking_head',
            // Rest poses
            'resting', 'sleeping', 'stretching'
        ];
        if (!validPoses.includes(pose)) {
            console.warn(`Invalid pose: ${pose}`);
            return;
        }
        
        character.currentPose = pose;
        character.poseHistory.push({
            pose: pose,
            timestamp: Date.now()
        });
        
        // Keep only last 10 poses
        if (character.poseHistory.length > 10) {
            character.poseHistory.shift();
        }
        
        this.updateCharacterDisplay(characterId);
    }
    
    /**
     * Animate character talking
     * Phase 3: Uses GSAP for smooth animation
     */
    animateTalking(characterId, duration = 2000) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.animationState = 'talking';
        this.setPose(characterId, 'talking');
        
        // Animate mouth movement using GSAP
        const element = document.getElementById(`character-${characterId}`);
        if (element && this.gsapAnimator) {
            // Pulse animation for talking
            this.gsapAnimator.pulse(element, {
                scale: 1.05,
                duration: duration / 1000,
                repeat: Math.floor(duration / 500),
                onComplete: () => {
                    character.animationState = 'idle';
                }
            });
        } else if (element) {
            // Fallback to CSS class
            element.classList.add('talking');
            setTimeout(() => {
                element.classList.remove('talking');
                character.animationState = 'idle';
            }, duration);
        }
    }
    
    /**
     * Animate character thinking
     * Phase 3: Uses GSAP for smooth animation
     */
    animateThinking(characterId, duration = 3000) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.animationState = 'thinking';
        this.setEmotion(characterId, 'thinking');
        this.setPose(characterId, 'thinking');
        
        const element = document.getElementById(`character-${characterId}`);
        if (element && this.gsapAnimator) {
            // Rotate animation for thinking
            this.gsapAnimator.rotate(element, 5, {
                duration: duration / 1000,
                yoyo: true,
                repeat: Math.floor(duration / 600),
                onComplete: () => {
                    character.animationState = 'idle';
                }
            });
        } else if (element) {
            // Fallback to CSS class
            element.classList.add('thinking');
            setTimeout(() => {
                element.classList.remove('thinking');
                character.animationState = 'idle';
            }, duration);
        }
    }
    
    /**
     * Animate emotion change
     * Phase 3: Uses GSAP for smooth animation
     */
    animateEmotionChange(characterId, emotion, duration = 1000) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        const element = document.getElementById(`character-${characterId}`);
        if (element && this.gsapAnimator) {
            // Use GSAP to animate emotion change
            this.gsapAnimator.animateCharacterEmotion(element, emotion, {
                duration: duration / 1000,
                onComplete: () => {
                    this.setEmotion(characterId, emotion);
                }
            });
        } else if (element) {
            // Fallback to CSS class
            element.classList.add('emotion-changing');
            setTimeout(() => {
                this.setEmotion(characterId, emotion);
                element.classList.remove('emotion-changing');
            }, duration / 2);
        }
    }
    
    /**
     * Update character display
     */
    updateCharacterDisplay(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        const element = document.getElementById(`character-${characterId}`);
        if (!element) return;
        
        // Get asset for current emotion and pose
        const emotionAsset = this.assetManager?.getCharacterEmotion(character.currentEmotion);
        const poseAsset = this.assetManager?.getCharacterBodyLanguage(character.currentPose);
        
        // Update image source only if asset exists
        if (emotionAsset && emotionAsset.src && element.tagName === 'IMG') {
            element.src = emotionAsset.src;
        }
        
        // Update classes for CSS animations
        element.className = `character character-${characterId} emotion-${character.currentEmotion} pose-${character.currentPose}`;
    }
    
    /**
     * Create character element
     */
    createCharacterElement(characterId, container) {
        const character = this.characters.get(characterId);
        if (!character) return null;
        
        const element = document.createElement('div');
        element.id = `character-${characterId}`;
        element.className = `character character-${characterId} emotion-${character.currentEmotion} pose-${character.currentPose}`;
        
        // Get asset (may be null if not loaded)
        const emotionAsset = this.assetManager?.getCharacterEmotion(character.currentEmotion);
        const poseAsset = this.assetManager?.getCharacterBodyLanguage(character.currentPose);
        
        // Only add image if asset exists
        if (emotionAsset && emotionAsset.src) {
            const img = document.createElement('img');
            img.src = emotionAsset.src;
            img.alt = character.name;
            img.className = 'character-sprite';
            img.style.objectFit = 'contain';
            img.style.objectPosition = 'center bottom';
            element.appendChild(img);
        }
        
        // Add name label
        const label = document.createElement('div');
        label.className = 'character-name';
        label.textContent = character.name;
        element.appendChild(label);
        
        container.appendChild(element);
        return element;
    }
    
    /**
     * Get character state
     */
    getCharacterState(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return null;
        
        return {
            emotion: character.currentEmotion,
            pose: character.currentPose,
            animationState: character.animationState
        };
    }
    
    /**
     * Play idle animation
     */
    playIdleAnimation(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.animationState = 'idle';
        const element = document.getElementById(`character-${characterId}`);
        if (element) {
            element.classList.add('idle-animation');
        }
    }
}

