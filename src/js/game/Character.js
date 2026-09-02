class Character {
    constructor(data = {}) {
        this.name = data.name || 'Unnamed';
        this.skinTone = data.skinTone || 0;
        this.hairstyle = data.hairstyle || 'short';
        this.accessory = data.accessory || 'none';
        this.outfit = data.outfit || 'casual';
        this.mood = data.mood || 'neutral';
        this.energy = data.energy || 100;
        this.animation = 'idle';
    }

    getEmoji() {
        const hairstyles = {
            short: ['ðŸ™‚', 'ðŸ™ƒ', 'ðŸ˜‰', 'ðŸ˜�', 'ðŸ˜˜'],
            long: ['ðŸ¤¯', 'ðŸ˜¤', 'ðŸ˜¡', 'ðŸ˜ ', 'ðŸ˜¡'],
            bald: ['ðŸ˜±', 'ðŸ¤¯', 'ðŸ˜¤', 'ðŸ˜¡', 'ðŸ˜ ']
        };
        const skinTones = ['', 'ï¸�', 'ï¸�ï¸�', 'ï¸�ï¸�ï¸�', 'ï¸�ï¸�ï¸�ï¸�', 'ï¸�ï¸�ï¸�ï¸�ï¸�'];

        const style = hairstyles[this.hairstyle];
        if (!style) return '';

        return style[this.skinTone % style.length] + skinTones[this.skinTone];
    }

    getAccessory() {
        const accessories = {
            glasses: 'ðŸ‘“',
            hat: 'ðŸŽ©',
            none: ''
        };

        return accessories[this.accessory] || '';
    }

    getMoodEmoji() {
        const moodEmojis = {
            happy: 'ðŸ˜„',
            neutral: 'ðŸ˜�',
            tired: 'ðŸ˜´',
            stressed: 'ðŸ˜«',
            frustrated: 'ðŸ˜¡'
        };

        return moodEmojis[this.mood] || '';
    }

    updateEnergy(delta) {
        this.energy = Math.min(100, Math.max(0, this.energy + delta));

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

    setAnimation(anim) {
        if (anim === 'walking' || anim === 'idle') {
            this.animation = anim;
        } else {
            this.animation = 'idle';
        }
    }

    static fromJSON(data) {
        if (!data) return;

        return new Character({
            name: data.name,
            skinTone: data.skinTone || 0,
            hairstyle: data.hairstyle || 'short',
            accessory: data.accessory || 'none',
            outfit: data.outfit || 'casual',
            mood: data.mood || 'neutral',
            energy: data.energy || 100
        });
    }
}