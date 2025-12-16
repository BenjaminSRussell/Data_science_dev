/**
 * CharacterAnimationSystem.js
 * Manages character animations, emotions, and body language
 * Non-static characters with dynamic expressions
 */

export class CharacterAnimationSystem {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.characters = new Map();
        this.animations = new Map();
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
     */
    animateTalking(characterId, duration = 2000) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.animationState = 'talking';
        this.setPose(characterId, 'talking');
        
        // Animate mouth movement
        const element = document.getElementById(`character-${characterId}`);
        if (element) {
            element.classList.add('talking');
            
            setTimeout(() => {
                element.classList.remove('talking');
                character.animationState = 'idle';
            }, duration);
        }
    }
    
    /**
     * Animate character thinking
     */
    animateThinking(characterId, duration = 3000) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        character.animationState = 'thinking';
        this.setEmotion(characterId, 'thinking');
        this.setPose(characterId, 'thinking');
        
        const element = document.getElementById(`character-${characterId}`);
        if (element) {
            element.classList.add('thinking');
            
            setTimeout(() => {
                element.classList.remove('thinking');
                character.animationState = 'idle';
            }, duration);
        }
    }
    
    /**
     * Animate emotion change
     */
    animateEmotionChange(characterId, emotion, duration = 1000) {
        const character = this.characters.get(characterId);
        if (!character) return;
        
        const element = document.getElementById(`character-${characterId}`);
        if (element) {
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
        
        // Update image source
        if (emotionAsset && element.tagName === 'IMG') {
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
        
        // Get asset
        const emotionAsset = this.assetManager?.getCharacterEmotion(character.currentEmotion);
        const poseAsset = this.assetManager?.getCharacterBodyLanguage(character.currentPose);
        
        if (emotionAsset) {
            const img = document.createElement('img');
            img.src = emotionAsset.src;
            img.alt = character.name;
            img.className = 'character-sprite';
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

