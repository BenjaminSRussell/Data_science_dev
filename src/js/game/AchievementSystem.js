class AchievementSystem {
    constructor() {
        this.achievements = [
            { id: 'firstPromotion', name: 'First Promotion', description: 'Promote to your first rank.', condition: (gameState) => gameState.getRankIndex() > 0, earned: false },
            { id: 'tenThousandDollars', name: '$10,000 Earned', description: 'Reach $10,000 in total money.', condition: (gameState) => gameState.getMoney() >= 10000, earned: false },
            { id: 'perfectChart', name: 'Perfect Chart', description: 'Score a perfect 100% on a chart.', condition: (gameState) => gameState.getTasksCompleted().some(task => task.score === 100), earned: false },
            { id: 'closeFriendNPC', name: 'Close Friend', description: 'Have a close relationship with an NPC.', condition: (gameState) => gameState.getNPCRelationships().some(relationship => relationship.strength === 'close friend'), earned: false },
            { id: 'firstCrime', name: 'First Crime', description: 'Commit your first crime.', condition: (gameState) => gameState.getCrimesCommitted().length > 0, earned: false },
            { id: 'firstYearSurvived', name: 'First Year Survived', description: 'Survive for one full year.', condition: (gameState) => gameState.getYearsSurvived() >= 1, earned: false }
        ];
    }

    checkAchievements(gameState) {
        this.achievements.forEach(achievement => {
            if (!achievement.earned && achievement.condition(gameState)) {
                this.earnAchievement(achievement.id, gameState);
            }
        });
    }

    earnAchievement(id, gameState) {
        const achievement = this.achievements.find(achievement => achievement.id === id);
        if (achievement) {
            achievement.earned = true;
            gameState.completedAchievements.push({ id, timestamp: new Date().toISOString() });
            this.showToast(`Achievement Unlocked: ${achievement.name}`);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Persistence
AchievementSystem.prototype.toJSON = function() {
    return JSON.stringify(this.achievements);
};

AchievementSystem.prototype.fromJSON = function(json) {
    const data = JSON.parse(json);
    this.achievements = data.map(achievement => {
        return { ...achievement, earned: achievement.earned };
    });
};

// Tests
function testAchievementSystem() {
    const system = new AchievementSystem();
    const gameState = {
        getRankIndex: () => 1,
        getMoney: () => 10000,
        getTasksCompleted: () => [{ score: 100 }],
        getNPCRelationships: () => [{ strength: 'close friend' }],
        getCrimesCommitted: () => [{ type: 'crime' }],
        getYearsSurvived: () => 1,
        completedAchievements: []
    };

    system.checkAchievements(gameState);
    console.assert(gameState.completedAchievements.length === 6, 'All achievements should be earned');
    console.assert(gameState.completedAchievements.every(achievement => typeof achievement.timestamp === 'string'), 'All achievements should have a timestamp');

    // Save and load
    const saved = JSON.parse(system.toJSON());
    system.fromJSON(JSON.stringify(saved));
    console.assert(system.achievements.length === 6, 'Achievements should persist');
    console.assert(system.achievements.every(achievement => achievement.earned === true), 'Achievements should retain earned status');
}

// Integrate with main game loop
const achievementSystem = new AchievementSystem();

function checkVictoryConditions() {
    // Existing victory condition checks
    // ...

    // Check achievements
    achievementSystem.checkAchievements(gameState);
}