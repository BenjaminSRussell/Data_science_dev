/**
 * Character System - Player avatar and customization
 * Cartoon-style character for the tycoon game
 */

// Player character appearance options
export const CHARACTER_OPTIONS = {
    skinTones: ['', '', '', '', ''],

    hairstyles: [
        { id: 'short', name: 'Short Hair', male: '', female: '' },
        { id: 'curly', name: 'Curly Hair', male: '', female: '' },
        { id: 'bald', name: 'Bald', male: '', female: '' },
        { id: 'red', name: 'Red Hair', male: '', female: '' },
        { id: 'white', name: 'White Hair', male: '', female: '' }
    ],

    accessories: [
        { id: 'none', name: 'None', icon: '' },
        { id: 'glasses', name: 'Glasses', icon: '' },
        { id: 'sunglasses', name: 'Sunglasses', icon: '' },
        { id: 'headphones', name: 'Headphones', icon: '' }
    ],

    outfits: [
        { id: 'casual', name: 'Casual', description: 'T-shirt and jeans', unlockRank: 0 },
        { id: 'business_casual', name: 'Business Casual', description: 'Polo and khakis', unlockRank: 1 },
        { id: 'formal', name: 'Formal', description: 'Suit and tie', unlockRank: 3 },
        { id: 'startup', name: 'Startup CEO', description: 'Hoodie and sneakers', unlockRank: 2 },
        { id: 'executive', name: 'Executive', description: 'Power suit', unlockRank: 5 }
    ]
};

// Character mood states (affect dialogue and reactions)
export const MOODS = {
    excited: { emoji: '', energyBonus: 1.2 },
    happy: { emoji: '', energyBonus: 1.1 },
    neutral: { emoji: '', energyBonus: 1.0 },
    tired: { emoji: '', energyBonus: 0.8 },
    stressed: { emoji: '', energyBonus: 0.7 },
    frustrated: { emoji: '', energyBonus: 0.6 }
};

// Character animations (CSS-based)
export const ANIMATIONS = {
    idle: 'char-idle',
    working: 'char-working',
    thinking: 'char-thinking',
    celebrating: 'char-celebrating',
    stressed: 'char-stressed',
    walking: 'char-walking'
};

/**
 * Character class for managing player avatar
 */
export class Character {
    constructor() {
        this.name = "New Player";
        this.gender = 'neutral';
        this.skinTone = 0;
        this.hairstyle = 'short';
        this.accessory = 'glasses';
        this.outfit = 'casual';
        this.mood = 'neutral';
        this.energy = 100;
        this.currentAnimation = 'idle';
    }

    /**
     * Get character appearance emoji
     */
    getEmoji() {
        const style = CHARACTER_OPTIONS.hairstyles.find(h => h.id === this.hairstyle);
        const base = this.gender === 'female' ? style?.female : style?.male;
        const skinTone = CHARACTER_OPTIONS.skinTones[this.skinTone] || '';
        return base + skinTone;
    }

    /**
     * Get accessory if any
     */
    getAccessory() {
        const acc = CHARACTER_OPTIONS.accessories.find(a => a.id === this.accessory);
        return acc?.icon || '';
    }

    /**
     * Get mood emoji
     */
    getMoodEmoji() {
        return MOODS[this.mood]?.emoji || '';
    }

    /**
     * Update energy based on activity
     */
    updateEnergy(delta) {
        this.energy = Math.max(0, Math.min(100, this.energy + delta));

        // Update mood based on energy
        if (this.energy > 80) {
            this.mood = 'happy';
        } else if (this.energy > 60) {
            this.mood = 'neutral';
        } else if (this.energy > 40) {
            this.mood = 'tired';
        } else if (this.energy > 20) {
            this.mood = 'stressed';
        } else {
            this.mood = 'frustrated';
        }
    }

    /**
     * Set animation state
     */
    setAnimation(animName) {
        this.currentAnimation = ANIMATIONS[animName] || ANIMATIONS.idle;
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            name: this.name,
            gender: this.gender,
            skinTone: this.skinTone,
            hairstyle: this.hairstyle,
            accessory: this.accessory,
            outfit: this.outfit,
            mood: this.mood,
            energy: this.energy
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;
        this.name = data.name || "New Player";
        this.gender = data.gender || 'neutral';
        this.skinTone = data.skinTone || 0;
        this.hairstyle = data.hairstyle || 'short';
        this.accessory = data.accessory || 'none';
        this.outfit = data.outfit || 'casual';
        this.mood = data.mood || 'neutral';
        this.energy = data.energy || 100;
    }
}
