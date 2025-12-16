/**
 * EmotionSpriteMapper.js
 * Maps all emotions to sprite assets
 * Comprehensive emotion system with visual representations
 */

export class EmotionSpriteMapper {
    constructor() {
        // Complete emotion list with sprite mappings
        this.emotions = {
            // Basic emotions
            happy: {
                sprite: '/assets/characters/emotions/happy.png',
                spriteSheet: { row: 0, col: 0 },
                animation: 'happy_idle',
                color: '#FFD700',
                intensity: 1.0
            },
            sad: {
                sprite: '/assets/characters/emotions/sad.png',
                spriteSheet: { row: 1, col: 0 },
                animation: 'sad_idle',
                color: '#4169E1',
                intensity: 1.0
            },
            angry: {
                sprite: '/assets/characters/emotions/angry.png',
                spriteSheet: { row: 2, col: 0 },
                animation: 'angry_idle',
                color: '#FF4500',
                intensity: 1.0
            },
            neutral: {
                sprite: '/assets/characters/emotions/neutral.png',
                spriteSheet: { row: 3, col: 0 },
                animation: 'neutral_idle',
                color: '#808080',
                intensity: 0.5
            },
            excited: {
                sprite: '/assets/characters/emotions/excited.png',
                spriteSheet: { row: 0, col: 1 },
                animation: 'excited_idle',
                color: '#FF69B4',
                intensity: 1.5
            },
            thinking: {
                sprite: '/assets/characters/emotions/thinking.png',
                spriteSheet: { row: 1, col: 1 },
                animation: 'thinking_idle',
                color: '#9370DB',
                intensity: 0.8
            },
            
            // Emotional breakdown emotions
            crying: {
                sprite: '/assets/characters/emotions/crying.png',
                spriteSheet: { row: 2, col: 1 },
                animation: 'crying_idle',
                color: '#1E90FF',
                intensity: 1.2
            },
            yelling: {
                sprite: '/assets/characters/emotions/yelling.png',
                spriteSheet: { row: 3, col: 1 },
                animation: 'yelling_idle',
                color: '#DC143C',
                intensity: 1.5
            },
            fighting: {
                sprite: '/assets/characters/emotions/fighting.png',
                spriteSheet: { row: 0, col: 2 },
                animation: 'fighting_idle',
                color: '#8B0000',
                intensity: 1.8
            },
            
            // Relationship emotions
            grateful: {
                sprite: '/assets/characters/emotions/grateful.png',
                spriteSheet: { row: 1, col: 2 },
                animation: 'grateful_idle',
                color: '#FFA500',
                intensity: 1.1
            },
            jealous: {
                sprite: '/assets/characters/emotions/jealous.png',
                spriteSheet: { row: 2, col: 2 },
                animation: 'jealous_idle',
                color: '#9ACD32',
                intensity: 1.3
            },
            hurt: {
                sprite: '/assets/characters/emotions/hurt.png',
                spriteSheet: { row: 3, col: 2 },
                animation: 'hurt_idle',
                color: '#FF1493',
                intensity: 1.2
            },
            embarrassed: {
                sprite: '/assets/characters/emotions/embarrassed.png',
                spriteSheet: { row: 0, col: 3 },
                animation: 'embarrassed_idle',
                color: '#FF69B4',
                intensity: 1.0
            },
            proud: {
                sprite: '/assets/characters/emotions/proud.png',
                spriteSheet: { row: 1, col: 3 },
                animation: 'proud_idle',
                color: '#FFD700',
                intensity: 1.1
            },
            worried: {
                sprite: '/assets/characters/emotions/worried.png',
                spriteSheet: { row: 2, col: 3 },
                animation: 'worried_idle',
                color: '#DAA520',
                intensity: 1.0
            },
            relieved: {
                sprite: '/assets/characters/emotions/relieved.png',
                spriteSheet: { row: 3, col: 3 },
                animation: 'relieved_idle',
                color: '#90EE90',
                intensity: 0.9
            },
            surprised: {
                sprite: '/assets/characters/emotions/surprised.png',
                spriteSheet: { row: 0, col: 4 },
                animation: 'surprised_idle',
                color: '#FF6347',
                intensity: 1.2
            },
            disappointed: {
                sprite: '/assets/characters/emotions/disappointed.png',
                spriteSheet: { row: 1, col: 4 },
                animation: 'disappointed_idle',
                color: '#696969',
                intensity: 1.0
            },
            hopeful: {
                sprite: '/assets/characters/emotions/hopeful.png',
                spriteSheet: { row: 2, col: 4 },
                animation: 'hopeful_idle',
                color: '#8B5CF6',
                intensity: 0.9
            },
            confused: {
                sprite: '/assets/characters/emotions/confused.png',
                spriteSheet: { row: 3, col: 4 },
                animation: 'confused_idle',
                color: '#DDA0DD',
                intensity: 0.8
            },
            determined: {
                sprite: '/assets/characters/emotions/determined.png',
                spriteSheet: { row: 0, col: 5 },
                animation: 'determined_idle',
                color: '#FF4500',
                intensity: 1.1
            },
            tired: {
                sprite: '/assets/characters/emotions/tired.png',
                spriteSheet: { row: 1, col: 5 },
                animation: 'tired_idle',
                color: '#778899',
                intensity: 0.7
            },
            content: {
                sprite: '/assets/characters/emotions/content.png',
                spriteSheet: { row: 2, col: 5 },
                animation: 'content_idle',
                color: '#98FB98',
                intensity: 0.8
            }
        };
    }
    
    /**
     * Get emotion config
     */
    getEmotion(emotionName) {
        return this.emotions[emotionName] || this.emotions.neutral;
    }
    
    /**
     * Get all emotions
     */
    getAllEmotions() {
        return Object.keys(this.emotions);
    }
    
    /**
     * Get sprite path for emotion
     */
    getEmotionSprite(emotionName) {
        const emotion = this.getEmotion(emotionName);
        return emotion.sprite;
    }
    
    /**
     * Get sprite sheet coordinates
     */
    getSpriteSheetCoords(emotionName) {
        const emotion = this.getEmotion(emotionName);
        return emotion.spriteSheet;
    }
    
    /**
     * Get animation name for emotion
     */
    getEmotionAnimation(emotionName) {
        const emotion = this.getEmotion(emotionName);
        return emotion.animation;
    }
    
    /**
     * Get emotion color (for UI indicators)
     */
    getEmotionColor(emotionName) {
        const emotion = this.getEmotion(emotionName);
        return emotion.color;
    }
    
    /**
     * Get emotion intensity (for animation speed)
     */
    getEmotionIntensity(emotionName) {
        const emotion = this.getEmotion(emotionName);
        return emotion.intensity;
    }
}

export const emotionSpriteMapper = new EmotionSpriteMapper();

