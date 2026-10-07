/**
 * IconMapper - Converts emoji icons to text-based icons
 * Provides consistent icon system across the game
 *
 * Keys use Unicode escapes so emoji survives tooling that strips literals.
 */

export const ICON_MAP = {
    // Professors/Teachers
    '\u{1F393}': 'Prof', // graduation cap
    '\u{1F3EB}': 'Prof', // school

    // Business/Professional
    '\u{1F4BC}': 'Biz', // briefcase
    '\u{1F454}': 'Exec', // necktie
    '\u{1F4C8}': 'Invest', // chart increasing
    '\u{1F3E2}': 'Corp', // office building

    // Tech/Development
    '\u{1F4BB}': 'Dev', // laptop
    '\u{1F5A5}': 'Dev', // desktop
    '\u{2328}': 'Dev', // keyboard
    '\u{1F50C}': 'Tech', // electric plug
    '\u{2699}': 'Tech', // gear

    // Science/Research
    '\u{1F52C}': 'Sci', // microscope
    '\u{1F9EA}': 'Sci', // test tube

    // Food/Service
    '\u{1F373}': 'Chef', // cooking
    '\u{1F372}': 'Chef', // pot of food
    '\u{1F33F}': 'Grow', // herb

    // Fitness/Health
    '\u{1F3CB}': 'Fit', // person lifting weights
    '\u{1F3E5}': 'Health', // hospital

    // Social/Relationships
    '\u{1F4DA}': 'Book', // books
    '\u{1F48E}': 'Lux', // gem
    '\u{1F3A8}': 'Art', // palette
    '\u{1F91D}': 'Social', // handshake

    // Criminal/Shady
    '\u{1F988}': 'Shark', // shark
    '\u{1F4B0}': 'Broker', // money bag
    '\u{1F575}': 'Shadow', // detective

    // Rivals/Competition
    '\u{1F3C6}': 'Rival', // trophy
    '\u{1F3C1}': 'Compete', // chequered flag
    '\u{1F94A}': 'Fight', // boxing glove

    // Authority
    '\u{1F575}\u{FE0F}': 'Agent', // detective emoji presentation
    '\u{2696}': 'Judge', // scales
    '\u{1F6E1}': 'Shield', // shield

    // Other
    '\u{1F680}': 'Startup', // rocket
    '\u{1F4B5}': 'Money', // dollar
    '\u{1F4B8}': 'VC', // money with wings
    '\u{1F4D6}': 'Read' // open book
};

const TEXT_LABELS = new Set(Object.values(ICON_MAP));

/**
 * Get text icon for emoji (or pass through known text labels).
 */
export function getTextIcon(emoji) {
    if (emoji == null || emoji === '') {
        return 'NPC';
    }
    if (ICON_MAP[emoji]) {
        return ICON_MAP[emoji];
    }
    // Already a mapped label (NPCs may store text after emoji strip)
    if (TEXT_LABELS.has(emoji)) {
        return emoji;
    }
    return 'NPC';
}

/**
 * Get icon class for styling
 */
export function getIconClass(emoji) {
    const text = getTextIcon(emoji);
    return `icon-${text.toLowerCase()}`;
}
