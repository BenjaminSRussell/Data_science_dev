/**
 * IconMapper - Converts emoji icons to text-based icons
 * Provides consistent icon system across the game
 */

export const ICON_MAP = {
    // Professors/Teachers
    '': 'Prof',
    '': 'Prof',
    
    // Business/Professional
    '': 'Biz',
    '': 'Exec',
    '': 'Invest',
    '': 'Corp',
    
    // Tech/Development
    '': 'Dev',
    '': 'Dev',
    '': 'Dev',
    '': 'Tech',
    '': 'Tech',
    
    // Science/Research
    '': 'Sci',
    '': 'Sci',
    
    // Food/Service
    '': 'Chef',
    '': 'Chef',
    '': 'Grow',
    
    // Fitness/Health
    '': 'Fit',
    '': 'Health',
    
    // Social/Relationships
    '': 'Book',
    '': 'Lux',
    '': 'Art',
    '': 'Social',
    
    // Criminal/Shady
    '': 'Shark',
    '': 'Broker',
    '': 'Shadow',
    
    // Rivals/Competition
    '': 'Rival',
    '': 'Compete',
    '': 'Fight',
    
    // Authority
    '': 'Agent',
    '': 'Judge',
    '': 'Shield',
    
    // Other
    '': 'Startup',
    '': 'Money',
    '': 'VC',
    '': 'Read'
};

/**
 * Get text icon for emoji
 */
export function getTextIcon(emoji) {
    return ICON_MAP[emoji] || 'NPC';
}

/**
 * Get icon class for styling
 */
export function getIconClass(emoji) {
    const text = getTextIcon(emoji);
    return `icon-${text.toLowerCase()}`;
}







