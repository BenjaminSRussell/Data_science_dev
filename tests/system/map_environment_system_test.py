import unittest
from unittest.mock import patch
from your_module import MapEnvironmentSystem, Zone

class TestMapEnvironmentSystem(unittest.TestCase):

    @patch('your_module.Math.random', return_value=0)
    def test_add_park_elements(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='park', minX=0, maxX=10, minY=0, maxY=10)
        with patch('your_module.assetPlacer.placeAsset', return_value=True):
            system.addParkElements(zone)
        self.assertEqual(len(system.getAllElements()), 25)  # (10-0)*(10-0)/4

    @patch('your_module.Math.random', return_value=0)
    def test_add_park_elements_road_skip(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='road', minX=0, maxX=10, minY=0, maxY=10)
        system.addParkElements(zone)
        self.assertEqual(len(system.getAllElements()), 0)

    @patch('your_module.Math.random', return_value=0)
    def test_add_park_elements_place_asset_false(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='park', minX=0, maxX=10, minY=0, maxY=10)
        with patch('your_module.assetPlacer.placeAsset', return_value=False):
            system.addParkElements(zone)
        self.assertEqual(len(system.getAllElements()), 0)

    @patch('your_module.Math.random', return_value=0)
    def test_add_street_trees(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='residential', minX=0, maxX=10, minY=0, maxY=10)
        with patch('your_module.isNearRoad', return_value=True):
            system.addStreetTrees(zone)
        self.assertEqual(len(system.getAllElements()), 20)  # (10-0+10-0)/3

    @patch('your_module.Math.random', return_value=0)
    def test_add_street_trees_road_skip(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='road', minX=0, maxX=10, minY=0, maxY=10)
        system.addStreetTrees(zone)
        self.assertEqual(len(system.getAllElements()), 0)

    @patch('your_module.Math.random', return_value=0)
    def test_add_street_trees_is_near_road_false(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='residential', minX=0, maxX=10, minY=0, maxY=10)
        with patch('your_module.isNearRoad', return_value=False):
            system.addStreetTrees(zone)
        self.assertEqual(len(system.getAllElements()), 0)

    @patch('your_module.Math.random', return_value=0)
    def test_add_commercial_decorations(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='commercial', minX=0, maxX=10, minY=0, maxY=10)
        system.addCommercialDecorations(zone)
        self.assertEqual(len(system.getAllElements()), 12)  # (10-0)*(10-0)/8

    @patch('your_module.Math.random', return_value=0)
    def test_add_commercial_decorations_road_skip(self, mock_random):
        system = MapEnvironmentSystem()
        zone = Zone(type='road', minX=0, maxX=10, minY=0, maxY=10)
        system.addCommercialDecorations(zone)
        self.assertEqual(len(system.getAllElements()), 0)

    @patch('your_module.getZonesByType')
    def test_initialize(self, mock_get_zones):
        system = MapEnvironmentSystem()
        mock_get_zones.side_effect = [
            [Zone(type='park')],
            [Zone(type='residential')],
            [Zone(type='commercial')]
        ]
        system.initialize()
        self.assertEqual(len(system.getAllElements()), 37)  # 25 + 20 + 12

if __name__ == '__main__':
    unittest.main()