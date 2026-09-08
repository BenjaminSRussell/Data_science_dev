import unittest

class TownMapGenerator:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols

    def _place_buildings(self, roads, zones):
        buildings = []
        for i in range(self.rows):
            for j in range(self.cols):
                if roads[i][j] or zones[i][j] == 'none':
                    buildings.append(None)
                else:
                    adjacent_roads = any(
                        roads[i + di][j + dj] if 0 <= i + di < self.rows and 0 <= j + dj < self.cols else False
                        for di, dj in [(-1, 0), (1, 0), (0, -1), (0, 1)]
                    )
                    if adjacent_roads and (i * self.cols + j) % 10 == 0:
                        buildings.append('building')
                    else:
                        buildings.append(None)
        return buildings

    def _add_decorations(self, roads, zones):
        decorations = []
        for i in range(self.rows):
            for j in range(self.cols):
                if roads[i][j] or zones[i][j] != 'park':
                    decorations.append(None)
                else:
                    decorations.append('tree')
        return decorations

class TestTownMapGenerator(unittest.TestCase):
    def setUp(self):
        self.generator = TownMapGenerator(5, 5)

    def test_place_buildings(self):
        roads = [
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1]
        ]
        zones = [
            ['none', 'none', 'none', 'none', 'none'],
            ['none', 'park', 'park', 'park', 'none'],
            ['none', 'park', 'none', 'park', 'none'],
            ['none', 'park', 'park', 'park', 'none'],
            ['none', 'none', 'none', 'none', 'none']
        ]
        buildings = self.generator._place_buildings(roads, zones)
        expected = [
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None
        ]
        self.assertEqual(buildings, expected)

        roads = [
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1]
        ]
        zones = [
            ['none', 'none', 'none', 'none', 'none'],
            ['none', 'building', 'building', 'building', 'none'],
            ['none', 'building', 'none', 'building', 'none'],
            ['none', 'building', 'building', 'building', 'none'],
            ['none', 'none', 'none', 'none', 'none']
        ]
        buildings = self.generator._place_buildings(roads, zones)
        expected = [
            None, None, None, None, None,
            None, 'building', 'building', 'building', None,
            None, 'building', None, 'building', None,
            None, 'building', 'building', 'building', None,
            None, None, None, None, None
        ]
        self.assertEqual(buildings, expected)

    def test_add_decorations(self):
        roads = [
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1]
        ]
        zones = [
            ['none', 'none', 'none', 'none', 'none'],
            ['none', 'park', 'park', 'park', 'none'],
            ['none', 'park', 'none', 'park', 'none'],
            ['none', 'park', 'park', 'park', 'none'],
            ['none', 'none', 'none', 'none', 'none']
        ]
        decorations = self.generator._add_decorations(roads, zones)
        expected = [
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None
        ]
        self.assertEqual(decorations, expected)

        roads = [
            [1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1]
        ]
        zones = [
            ['none', 'none', 'none', 'none', 'none'],
            ['none', 'park', 'park', 'park', 'none'],
            ['none', 'park', 'none', 'park', 'none'],
            ['none', 'park', 'park', 'park', 'none'],
            ['none', 'none', 'none', 'none', 'none']
        ]
        decorations = self.generator._add_decorations(roads, zones)
        expected = [
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None,
            None, None, None, None, None
        ]
        self.assertEqual(decorations, expected)

if __name__ == '__main__':
    unittest.main()