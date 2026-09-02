class DetailedMapSystem:
    def __init__(self):
        self.unlocked_locations = set(['home', 'coffee_shop', 'office'])

    def isLocationUnlocked(self, locationId):
        return locationId in self.unlocked_locations

    def unlockLocation(self, locationId):
        self.unlocked_locations.add(locationId)
        return True

    def getCityAppearance(self, npcManager=None):
        if npcManager is None:
            return {
                'population': 0,
                'buildings': 0,
                'active': False,
                'empty': True
            }
        population = len(npcManager.getMetNPCs())
        return {
            'population': population,
            'buildings': 0,
            'active': population > 0,
            'empty': population == 0
        }