/**
 * BodyLanguageMapper.js
 * Maps all body language poses to sprite assets
 * Comprehensive body language system
 */

export class BodyLanguageMapper {
    constructor() {
        // Complete body language list with sprite mappings
        this.bodyLanguage = {
            // Basic poses
            standing: {
                sprite: '/assets/characters/body_language/standing.png',
                spriteSheet: { row: 0, col: 0 },
                animation: 'standing_idle',
                description: 'Standing upright, neutral stance'
            },
            sitting: {
                sprite: '/assets/characters/body_language/sitting.png',
                spriteSheet: { row: 1, col: 0 },
                animation: 'sitting_idle',
                description: 'Sitting comfortably'
            },
            walking: {
                sprite: '/assets/characters/body_language/walking.png',
                spriteSheet: { row: 2, col: 0 },
                animation: 'walking_loop',
                description: 'Walking animation'
            },
            
            // Communication poses
            talking: {
                sprite: '/assets/characters/body_language/talking.png',
                spriteSheet: { row: 3, col: 0 },
                animation: 'talking_loop',
                description: 'Talking, gesturing'
            },
            listening: {
                sprite: '/assets/characters/body_language/listening.png',
                spriteSheet: { row: 0, col: 1 },
                animation: 'listening_idle',
                description: 'Listening attentively'
            },
            thinking: {
                sprite: '/assets/characters/body_language/thinking.png',
                spriteSheet: { row: 1, col: 1 },
                animation: 'thinking_idle',
                description: 'Deep in thought'
            },
            explaining: {
                sprite: '/assets/characters/body_language/explaining.png',
                spriteSheet: { row: 2, col: 1 },
                animation: 'explaining_loop',
                description: 'Explaining something'
            },
            
            // Work poses
            working: {
                sprite: '/assets/characters/body_language/working.png',
                spriteSheet: { row: 3, col: 1 },
                animation: 'working_loop',
                description: 'Working at desk/computer'
            },
            typing: {
                sprite: '/assets/characters/body_language/typing.png',
                spriteSheet: { row: 0, col: 2 },
                animation: 'typing_loop',
                description: 'Typing on keyboard'
            },
            reading: {
                sprite: '/assets/characters/body_language/reading.png',
                spriteSheet: { row: 1, col: 2 },
                animation: 'reading_idle',
                description: 'Reading a book/document'
            },
            presenting: {
                sprite: '/assets/characters/body_language/presenting.png',
                spriteSheet: { row: 2, col: 2 },
                animation: 'presenting_loop',
                description: 'Giving a presentation'
            },
            
            // Emotional poses
            happy_pose: {
                sprite: '/assets/characters/body_language/happy_pose.png',
                spriteSheet: { row: 3, col: 2 },
                animation: 'happy_pose_idle',
                description: 'Open, welcoming stance'
            },
            sad_pose: {
                sprite: '/assets/characters/body_language/sad_pose.png',
                spriteSheet: { row: 0, col: 3 },
                animation: 'sad_pose_idle',
                description: 'Slumped, withdrawn'
            },
            angry_pose: {
                sprite: '/assets/characters/body_language/angry_pose.png',
                spriteSheet: { row: 1, col: 3 },
                animation: 'angry_pose_idle',
                description: 'Tense, defensive'
            },
            defensive: {
                sprite: '/assets/characters/body_language/defensive.png',
                spriteSheet: { row: 2, col: 3 },
                animation: 'defensive_idle',
                description: 'Arms crossed, closed off'
            },
            open: {
                sprite: '/assets/characters/body_language/open.png',
                spriteSheet: { row: 3, col: 3 },
                animation: 'open_idle',
                description: 'Open arms, welcoming'
            },
            
            // Breakdown poses
            crying_pose: {
                sprite: '/assets/characters/body_language/crying_pose.png',
                spriteSheet: { row: 0, col: 4 },
                animation: 'crying_pose_loop',
                description: 'Crying, head in hands'
            },
            yelling_pose: {
                sprite: '/assets/characters/body_language/yelling_pose.png',
                spriteSheet: { row: 1, col: 4 },
                animation: 'yelling_pose_loop',
                description: 'Yelling, gesturing angrily'
            },
            fighting_pose: {
                sprite: '/assets/characters/body_language/fighting_pose.png',
                spriteSheet: { row: 2, col: 4 },
                animation: 'fighting_pose_idle',
                description: 'Aggressive, confrontational'
            },
            
            // Social poses
            greeting: {
                sprite: '/assets/characters/body_language/greeting.png',
                spriteSheet: { row: 3, col: 4 },
                animation: 'greeting_once',
                description: 'Waving hello'
            },
            handshake: {
                sprite: '/assets/characters/body_language/handshake.png',
                spriteSheet: { row: 0, col: 5 },
                animation: 'handshake_once',
                description: 'Shaking hands'
            },
            hugging: {
                sprite: '/assets/characters/body_language/hugging.png',
                spriteSheet: { row: 1, col: 5 },
                animation: 'hugging_once',
                description: 'Giving a hug'
            },
            pointing: {
                sprite: '/assets/characters/body_language/pointing.png',
                spriteSheet: { row: 2, col: 5 },
                animation: 'pointing_idle',
                description: 'Pointing at something'
            },
            nodding: {
                sprite: '/assets/characters/body_language/nodding.png',
                spriteSheet: { row: 3, col: 5 },
                animation: 'nodding_loop',
                description: 'Nodding in agreement'
            },
            shaking_head: {
                sprite: '/assets/characters/body_language/shaking_head.png',
                spriteSheet: { row: 0, col: 6 },
                animation: 'shaking_head_loop',
                description: 'Shaking head no'
            },
            
            // Rest poses
            resting: {
                sprite: '/assets/characters/body_language/resting.png',
                spriteSheet: { row: 1, col: 6 },
                animation: 'resting_idle',
                description: 'Resting, relaxed'
            },
            sleeping: {
                sprite: '/assets/characters/body_language/sleeping.png',
                spriteSheet: { row: 2, col: 6 },
                animation: 'sleeping_idle',
                description: 'Sleeping'
            },
            stretching: {
                sprite: '/assets/characters/body_language/stretching.png',
                spriteSheet: { row: 3, col: 6 },
                animation: 'stretching_once',
                description: 'Stretching'
            }
        };
    }
    
    /**
     * Get body language config
     */
    getBodyLanguage(poseName) {
        return this.bodyLanguage[poseName] || this.bodyLanguage.standing;
    }
    
    /**
     * Get all poses
     */
    getAllPoses() {
        return Object.keys(this.bodyLanguage);
    }
    
    /**
     * Get sprite path for pose
     */
    getPoseSprite(poseName) {
        const pose = this.getBodyLanguage(poseName);
        return pose.sprite;
    }
    
    /**
     * Get sprite sheet coordinates
     */
    getSpriteSheetCoords(poseName) {
        const pose = this.getBodyLanguage(poseName);
        return pose.spriteSheet;
    }
    
    /**
     * Get animation name for pose
     */
    getPoseAnimation(poseName) {
        const pose = this.getBodyLanguage(poseName);
        return pose.animation;
    }
    
    /**
     * Get pose description
     */
    getPoseDescription(poseName) {
        const pose = this.getBodyLanguage(poseName);
        return pose.description;
    }
    
    /**
     * Get poses by category
     */
    getPosesByCategory(category) {
        const categories = {
            basic: ['standing', 'sitting', 'walking'],
            communication: ['talking', 'listening', 'thinking', 'explaining'],
            work: ['working', 'typing', 'reading', 'presenting'],
            emotional: ['happy_pose', 'sad_pose', 'angry_pose', 'defensive', 'open'],
            breakdown: ['crying_pose', 'yelling_pose', 'fighting_pose'],
            social: ['greeting', 'handshake', 'hugging', 'pointing', 'nodding', 'shaking_head'],
            rest: ['resting', 'sleeping', 'stretching']
        };
        
        return categories[category] || [];
    }
}

export const bodyLanguageMapper = new BodyLanguageMapper();

