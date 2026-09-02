class VisualProgressionSystem:
    def __init__(self, initial_tier=None):
        self.currentTier = initial_tier
        self.unlockedTiers = set()
        self.milestones = {}
        self.visualUpgrades = {}

    def unlockTier(self, tier):
        self.unlockedTiers.add(tier)
        self.currentTier = tier
        self.applyVisualUpgrade(tier)

    def applyVisualUpgrade(self, tier):
        # Simulate applying a visual upgrade
        self.visualUpgrades[tier] = f"upgrade_{tier}"

    def fromJSON(self, data):
        if 'currentTier' in data:
            self.currentTier = data['currentTier']
        if 'unlockedTiers' in data:
            self.unlockedTiers = set(data['unlockedTiers'])
        if 'milestones' in data:
            self.milestones.update(data['milestones'])
        if 'visualUpgrades' in data:
            self.visualUpgrades = {tier: upgrade for tier, upgrade in data['visualUpgrades']}

        for tier in self.unlockedTiers:
            self.applyVisualUpgrade(tier)

    def toJSON(self):
        return {
            'currentTier': self.currentTier,
            'unlockedTiers': list(self.unlockedTiers),
            'milestones': self.milestones,
            'visualUpgrades': list(self.visualUpgrades.items())
        }

    def getSpriteSheetUrl(self, tier):
        return f"https://example.com/spritesheet_{tier}.png"

    def getBackgroundUrl(self, tier):
        return f"https://example.com/background_{tier}.jpg"

    def isTierUnlocked(self, tier):
        return tier in self.unlockedTiers