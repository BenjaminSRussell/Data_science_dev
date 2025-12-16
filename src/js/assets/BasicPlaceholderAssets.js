/**
 * BasicPlaceholderAssets.js
 * Creates simple SVG placeholders for houses and stick figure characters
 * Used until proper sprites are added
 */

export class BasicPlaceholderAssets {
    constructor() {
        this.placeholders = new Map();
    }
    
    /**
     * Create stick figure SVG
     */
    createStickFigure(emotion = 'neutral', color = '#333') {
        const svg = `
            <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <!-- Head -->
                <circle cx="32" cy="12" r="6" fill="${this.getEmotionColor(emotion)}" stroke="#000" stroke-width="1"/>
                ${this.getFace(emotion)}
                <!-- Body -->
                <line x1="32" y1="18" x2="32" y2="40" stroke="${color}" stroke-width="2"/>
                ${this.getArms(emotion, color)}
                <!-- Legs -->
                <line x1="32" y1="40" x2="25" y2="50" stroke="${color}" stroke-width="2"/>
                <line x1="32" y1="40" x2="39" y2="50" stroke="${color}" stroke-width="2"/>
            </svg>
        `;
        
        return this.svgToImage(svg);
    }
    
    /**
     * Get face based on emotion
     */
    getFace(emotion) {
        const faces = {
            happy: `
                <ellipse cx="29" cy="11" rx="1" ry="1.5" fill="#000"/>
                <ellipse cx="35" cy="11" rx="1" ry="1.5" fill="#000"/>
                <path d="M 27 14 Q 32 17 37 14" stroke="#000" stroke-width="1.5" fill="none"/>
            `,
            sad: `
                <ellipse cx="29" cy="11" rx="1" ry="1.5" fill="#000"/>
                <ellipse cx="35" cy="11" rx="1" ry="1.5" fill="#000"/>
                <path d="M 27 16 Q 32 13 37 16" stroke="#000" stroke-width="1.5" fill="none"/>
            `,
            angry: `
                <line x1="28" y1="10" x2="30" y2="12" stroke="#000" stroke-width="2"/>
                <line x1="34" y1="10" x2="36" y2="12" stroke="#000" stroke-width="2"/>
                <path d="M 27 15 Q 32 18 37 15" stroke="#000" stroke-width="1.5" fill="none"/>
            `,
            neutral: `
                <circle cx="29" cy="11" r="1" fill="#000"/>
                <circle cx="35" cy="11" r="1" fill="#000"/>
                <line x1="28" y1="15" x2="36" y2="15" stroke="#000" stroke-width="1.5"/>
            `,
            crying: `
                <ellipse cx="29" cy="11" rx="1" ry="1.5" fill="#000"/>
                <ellipse cx="35" cy="11" rx="1" ry="1.5" fill="#000"/>
                <path d="M 27 16 Q 32 13 37 16" stroke="#000" stroke-width="1.5" fill="none"/>
                <line x1="29" y1="18" x2="29" y2="22" stroke="#1E90FF" stroke-width="1"/>
                <line x1="35" y1="18" x2="35" y2="22" stroke="#1E90FF" stroke-width="1"/>
            `,
            yelling: `
                <circle cx="29" cy="11" r="2" fill="#000"/>
                <circle cx="35" cy="11" r="2" fill="#000"/>
                <ellipse cx="32" cy="15" rx="4" ry="3" fill="#000"/>
            `,
            thinking: `
                <circle cx="29" cy="11" r="1" fill="#000"/>
                <circle cx="35" cy="11" r="1" fill="#000"/>
                <line x1="28" y1="15" x2="36" y2="15" stroke="#000" stroke-width="1.5"/>
                <circle cx="40" cy="8" r="2" fill="none" stroke="#9370DB" stroke-width="1" stroke-dasharray="2,2"/>
            `
        };
        
        return faces[emotion] || faces.neutral;
    }
    
    /**
     * Get arms based on emotion
     */
    getArms(emotion, color) {
        const arms = {
            happy: `
                <line x1="32" y1="25" x2="22" y2="28" stroke="${color}" stroke-width="2"/>
                <line x1="32" y1="25" x2="42" y2="28" stroke="${color}" stroke-width="2"/>
            `,
            sad: `
                <line x1="32" y1="25" x2="25" y2="32" stroke="${color}" stroke-width="2"/>
                <line x1="32" y1="25" x2="39" y2="32" stroke="${color}" stroke-width="2"/>
            `,
            angry: `
                <line x1="32" y1="25" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
                <circle cx="20" cy="30" r="3" fill="${color}"/>
                <line x1="32" y1="25" x2="44" y2="30" stroke="${color}" stroke-width="2"/>
                <circle cx="44" cy="30" r="3" fill="${color}"/>
            `,
            defensive: `
                <line x1="32" y1="25" x2="25" y2="25" stroke="${color}" stroke-width="2"/>
                <line x1="32" y1="25" x2="39" y2="25" stroke="${color}" stroke-width="2"/>
            `,
            talking: `
                <line x1="32" y1="25" x2="20" y2="28" stroke="${color}" stroke-width="2"/>
                <line x1="32" y1="25" x2="44" y2="28" stroke="${color}" stroke-width="2"/>
            `
        };
        
        return arms[emotion] || `
            <line x1="32" y1="25" x2="22" y2="30" stroke="${color}" stroke-width="2"/>
            <line x1="32" y1="25" x2="42" y2="30" stroke="${color}" stroke-width="2"/>
        `;
    }
    
    /**
     * Get emotion color
     */
    getEmotionColor(emotion) {
        const colors = {
            happy: '#FFD700',
            sad: '#4169E1',
            angry: '#FF4500',
            neutral: '#808080',
            crying: '#1E90FF',
            yelling: '#DC143C',
            fighting: '#8B0000',
            thinking: '#9370DB',
            excited: '#FF69B4'
        };
        
        return colors[emotion] || '#808080';
    }
    
    /**
     * Create simple house SVG
     */
    createHouse(color = '#DEB887', roofColor = '#8B4513') {
        const svg = `
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <!-- Roof -->
                <polygon points="100,20 160,60 40,60" fill="${roofColor}" stroke="#654321" stroke-width="2"/>
                <!-- House body -->
                <rect x="50" y="60" width="100" height="100" fill="${color}" stroke="#8B4513" stroke-width="2"/>
                <!-- Door -->
                <rect x="85" y="120" width="30" height="40" fill="#654321" stroke="#000" stroke-width="1"/>
                <!-- Window left -->
                <rect x="60" y="80" width="20" height="20" fill="#4B5563" stroke="#000" stroke-width="1"/>
                <!-- Window right -->
                <rect x="120" y="80" width="20" height="20" fill="#4B5563" stroke="#000" stroke-width="1"/>
                <!-- Door handle -->
                <circle cx="110" cy="140" r="2" fill="#FFD700"/>
            </svg>
        `;
        
        return this.svgToImage(svg);
    }
    
    /**
     * Convert SVG string to Image object
     */
    svgToImage(svgString) {
        const img = new Image();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        img.src = url;
        return img;
    }
    
    /**
     * Get placeholder for emotion
     */
    getEmotionPlaceholder(emotion) {
        const key = `emotion_${emotion}`;
        if (!this.placeholders.has(key)) {
            const img = this.createStickFigure(emotion);
            this.placeholders.set(key, img);
        }
        return this.placeholders.get(key);
    }
    
    /**
     * Get placeholder for house
     */
    getHousePlaceholder() {
        if (!this.placeholders.has('house')) {
            const img = this.createHouse();
            this.placeholders.set('house', img);
        }
        return this.placeholders.get('house');
    }
}

export const basicPlaceholderAssets = new BasicPlaceholderAssets();

