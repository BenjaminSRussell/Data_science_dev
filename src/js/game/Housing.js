/**
 * Homes the player can buy at Property Investments.
 * gameState.housingLevel is what LocationBackgroundSystem paints at home (#2009).
 */

export const HOUSING_LADDER = [
    { id: 'apartment', name: 'Studio Apartment', price: 0, weeklyRent: 0 },
    { id: 'condo', name: 'Condo', price: 50000, weeklyRent: 250 },
    { id: 'house', name: 'House', price: 200000, weeklyRent: 800 },
    { id: 'mansion', name: 'Mansion', price: 1000000, weeklyRent: 2500 }
];

const BY_ID = new Map(HOUSING_LADDER.map(tier => [tier.id, tier]));

export function isHousingLevel(level) {
    return BY_ID.has(level);
}

export function housingTier(level) {
    return BY_ID.get(level) || HOUSING_LADDER[0];
}

export function nextHousingTier(level) {
    const index = HOUSING_LADDER.indexOf(housingTier(level));
    return HOUSING_LADDER[index + 1] || null;
}

/**
 * Button label for a real-estate activity, or null if it isn't one.
 */
export function housingActivityLabel(activity, housingLevel) {
    if (activity === 'browse_properties') return 'Browse Properties';
    if (activity === 'collect_rent') {
        const rent = housingTier(housingLevel).weeklyRent;
        return rent > 0 ? `Collect Rent ($${rent.toLocaleString()}/wk)` : 'Collect Rent';
    }
    if (activity === 'buy_property') {
        const next = nextHousingTier(housingLevel);
        return next ? `Buy ${next.name} ($${next.price.toLocaleString()})` : 'Home Maxed';
    }
    return null;
}

export function housingListings(level) {
    const current = housingTier(level).id;
    return HOUSING_LADDER.map(tier => {
        if (tier.id === current) return `${tier.name}: your home`;
        if (tier.price <= 0) return `${tier.name}: starter`;
        const rent = tier.weeklyRent ? `, rent $${tier.weeklyRent.toLocaleString()}/wk` : '';
        return `${tier.name}: $${tier.price.toLocaleString()}${rent}`;
    }).join('\n');
}

/**
 * Buy the next home. Writes housingLevel and renames the home location.
 */
export function buyNextHome(gameState) {
    if (!gameState) return { success: false, message: 'Real estate office is closed.' };
    const next = nextHousingTier(gameState.housingLevel);
    if (!next) return { success: false, message: 'You already live in a mansion.' };

    const money = Number(gameState.money) || 0;
    if (money < next.price) {
        return { success: false, message: `Not enough money! A ${next.name} costs $${next.price.toLocaleString()}.` };
    }

    gameState.money = money - next.price;
    gameState.totalSpent = (Number(gameState.totalSpent) || 0) + next.price;
    gameState.housingLevel = next.id;
    gameState.worldMap?.updateLocation?.('home', {
        name: next.name,
        description: `Your ${next.name}.`
    });

    return {
        success: true,
        level: next.id,
        cost: next.price,
        message: `You bought a ${next.name}. Your home screen will show the new place.`
    };
}

/**
 * Once per in-game week, an owned home pays rent. Apartment pays nothing.
 */
export function collectHousingRent(gameState) {
    if (!gameState) return { success: false, message: 'Real estate office is closed.' };
    const tier = housingTier(gameState.housingLevel);
    if (!tier.weeklyRent) {
        return { success: false, message: "This place doesn't pay rent. Buy a bigger home first." };
    }

    const day = Number(gameState.timeManager?.totalDays);
    const week = Number.isFinite(day) ? Math.floor(day / 7) : 0;
    if (gameState.lastHousingRentWeek === week) {
        return { success: false, message: 'Rent was already collected this week.' };
    }

    gameState.lastHousingRentWeek = week;
    gameState.money = (Number(gameState.money) || 0) + tier.weeklyRent;
    gameState.totalEarned = (Number(gameState.totalEarned) || 0) + tier.weeklyRent;
    gameState.weeklyIncome = (Number(gameState.weeklyIncome) || 0) + tier.weeklyRent;
    return {
        success: true,
        amount: tier.weeklyRent,
        message: `Collected $${tier.weeklyRent.toLocaleString()} in rent from your ${tier.name}.`
    };
}
