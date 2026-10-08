"""
Pure-logic coverage for scripts/generators:
TownMapGenerator roads/zones (#600) and buildings/decorations (#601),
LowPolyGenerator.fill_category branching (#603), ThemedBackdropGenerator
palette selection (#605), MasterManifestGenerator classification (#607),
generate_asset_manifest total_assets (#609)
"""
import os
import sys
from pathlib import Path
from unittest import mock

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'generators')))

pytest.importorskip('PIL')
from create_town_map import TownMapGenerator  # noqa: E402
from generate_more_low_poly import LowPolyGenerator  # noqa: E402
from generate_master_manifest import MasterManifestGenerator  # noqa: E402
from generate_themed_backdrops import ThemedBackdropGenerator  # noqa: E402
import generate_asset_manifest  # noqa: E402

ROAD_NAMES = {'road_end_h', 'road_end_v', 'road_intersection', 'road_main_h',
              'road_main_v', 'road_secondary_h', 'road_secondary_v'}

# Independent copy of the zone rectangles (x1, y1, x2, y2), end-exclusive
ZONE_RECTS = [
    ((0, 0, 12, 12), 'residential'), ((12, 0, 18, 12), 'commercial'),
    ((18, 0, 30, 12), 'education'), ((0, 12, 12, 18), 'park'),
    ((12, 12, 24, 18), 'finance'), ((24, 12, 30, 18), 'government'),
    ((0, 18, 18, 30), 'residential'), ((18, 18, 30, 30), 'commercial'),
]


@pytest.fixture
def town(tmp_path):
    return TownMapGenerator(output_dir=tmp_path / 'map')


# ---------- #600 roads / zones ----------

class TestTownRoads:
    def test_grid_length(self, town):
        assert len(town._generate_roads()) == 900

    def test_is_deterministic(self, town):
        assert town._generate_roads() == town._generate_roads()

    def test_only_known_road_names(self, town):
        assert {r for r in town._generate_roads() if r is not None} <= ROAD_NAMES

    def test_intersections_at_every_main_crossing(self, town):
        roads = town._generate_roads()
        cols = town.map_config['cols']
        for row in range(6, 30, 6):
            for col in range(6, 30, 6):
                assert roads[row * cols + col] == 'road_intersection', (row, col)

    def test_horizontal_main_roads_and_edge_markers(self, town):
        roads = town._generate_roads()
        cols = town.map_config['cols']
        for row in range(6, 30, 6):
            assert roads[row * cols + 0] == 'road_end_h'
            assert roads[row * cols + cols - 1] == 'road_end_h'
            for col in range(1, cols - 1):
                expected = 'road_intersection' if col % 6 == 0 else 'road_main_h'
                assert roads[row * cols + col] == expected, (row, col)

    def test_vertical_main_roads_and_edge_markers(self, town):
        roads = town._generate_roads()
        cols, rows = town.map_config['cols'], town.map_config['rows']
        for col in range(6, 30, 6):
            assert roads[col] == 'road_end_v'
            assert roads[(rows - 1) * cols + col] == 'road_end_v'
            for row in range(1, rows - 1):
                if row % 6 == 0:
                    continue
                assert roads[row * cols + col] == 'road_main_v', (row, col)

    def test_secondary_roads_only_fill_empty_col0_and_row0_slots(self, town):
        roads = town._generate_roads()
        cols = town.map_config['cols']
        secondary_h = [i for i, r in enumerate(roads) if r == 'road_secondary_h']
        secondary_v = [i for i, r in enumerate(roads) if r == 'road_secondary_v']
        assert secondary_h == [row * cols for row in range(3, 30, 6)]
        assert secondary_v == [col for col in range(3, 30, 6)]


class TestTownZones:
    def test_every_cell_is_road_xor_zoned_with_expected_region(self, town):
        roads = town._generate_roads()
        zones = town._generate_zones(roads)
        cols = town.map_config['cols']
        assert len(zones) == len(roads)
        for idx in range(len(roads)):
            row, col = divmod(idx, cols)
            regions = [z for (x1, y1, x2, y2), z in ZONE_RECTS if x1 <= col < x2 and y1 <= row < y2]
            assert len(regions) == 1, (row, col)  # no gaps, no overlap
            if roads[idx] is None:
                assert zones[idx] == regions[0], (row, col)
            else:
                assert zones[idx] is None, (row, col)

    def test_zone_types_exist_in_config(self, town):
        zones = town._generate_zones(town._generate_roads())
        assert {z for z in zones if z} <= set(town.zones)


# ---------- #601 buildings / decorations ----------

def small_grid(town, rows, cols):
    town.map_config['rows'] = rows
    town.map_config['cols'] = cols


class TestTownBuildings:
    def test_needs_adjacent_road_and_sparse_modulo(self, town):
        small_grid(town, 4, 4)
        roads = [None] * 16
        roads[0] = 'road_main_h'  # (0,0)
        zones = ['residential' if r is None else None for r in roads]
        buildings = town._place_buildings(roads, zones)
        # neighbours of (0,0): (1,0) sum 1, (0,1) sum 1 -> modulo fails
        assert all(b is None for b in buildings)

        roads = [None] * 16
        roads[1] = 'road_main_h'  # (0,1); neighbours (0,0) (0,2) (1,1)
        zones = ['residential' if r is None else None for r in roads]
        buildings = town._place_buildings(roads, zones)
        placed = {i for i, b in enumerate(buildings) if b}
        # (0,0): sum 0 -> placed; (0,2): sum 2 no; (1,1): sum 2 no
        assert placed == {0}
        assert buildings[0] == 'houses_0'

    def test_variant_uses_row_times_col(self, town):
        small_grid(town, 4, 4)
        roads = [None] * 16
        roads[2 * 4 + 2] = 'road_main_h'  # (2,2)
        zones = ['commercial' if r is None else None for r in roads]
        buildings = town._place_buildings(roads, zones)
        # neighbour (2,1) and (1,2) sum 3 -> placed with variant (row*col)%3 = 2%3
        assert buildings[2 * 4 + 1] == 'shops_2'
        assert buildings[1 * 4 + 2] == 'shops_2'

    def test_never_on_road_or_park_or_unzoned(self, town):
        roads = town._generate_roads()
        zones = town._generate_zones(roads)
        buildings = town._place_buildings(roads, zones)
        for idx, b in enumerate(buildings):
            if b:
                assert roads[idx] is None
                assert zones[idx] not in (None, 'park')

    def test_park_zone_gets_no_buildings_even_when_adjacent(self, town):
        small_grid(town, 3, 3)
        roads = [None] * 9
        roads[4] = 'road_intersection'  # centre
        zones = ['park' if r is None else None for r in roads]
        assert all(b is None for b in town._place_buildings(roads, zones))

    def test_boundary_rows_and_cols_do_not_wrap(self, town):
        # (2,2) is the last col of row 2; index 9 = (3,0) is index-adjacent
        # and passes the (row+col)%3 check, but is not grid-adjacent
        small_grid(town, 4, 3)
        roads = [None] * 12
        roads[2 * 3 + 2] = 'road_main_h'
        zones = ['finance' if r is None else None for r in roads]
        buildings = town._place_buildings(roads, zones)
        assert buildings[9] is None
        # grid neighbours (1,2) and (2,1) both have sum 3 -> placed
        assert {i for i, b in enumerate(buildings) if b} == {1 * 3 + 2, 2 * 3 + 1}

    def test_last_row_and_first_col_neighbours(self, town):
        small_grid(town, 3, 3)
        roads = [None] * 9
        roads[6] = 'road_main_h'  # (2,0): neighbours (1,0) sum 1, (2,1) sum 3
        zones = ['government' if r is None else None for r in roads]
        buildings = town._place_buildings(roads, zones)
        assert {i for i, b in enumerate(buildings) if b} == {7}
        assert buildings[7] == 'public_2'


class TestTownDecorations:
    def test_trees_only_on_park_non_road_tiles(self, town):
        roads = town._generate_roads()
        zones = town._generate_zones(roads)
        decorations = town._add_decorations(roads, zones)
        cols = town.map_config['cols']
        trees = [i for i, d in enumerate(decorations) if d]
        assert trees, 'expected some trees in the park'
        for idx in trees:
            row, col = divmod(idx, cols)
            assert decorations[idx] == 'tree'
            assert zones[idx] == 'park' and roads[idx] is None
            assert (row + col) % 4 == 0

    def test_every_eligible_park_tile_gets_a_tree(self, town):
        small_grid(town, 2, 4)
        roads = [None, 'road_main_h', None, None, None, None, None, None]
        zones = ['park', None, 'park', 'park', 'park', 'park', 'residential', 'park']
        decorations = town._add_decorations(roads, zones)
        # (0,0) sum0 tree; (1,3) sum4 tree; (1,2) is residential sum3
        assert [i for i, d in enumerate(decorations) if d] == [0, 7]


# ---------- #603 fill_category branching ----------

GEN_METHODS = ['generate_low_poly_character', 'generate_low_poly_icon',
               'generate_low_poly_ui_element', 'generate_low_poly_particle',
               'generate_low_poly_vehicle', 'generate_low_poly_map_asset']


@pytest.fixture
def mocked_gen(tmp_path):
    gen = LowPolyGenerator(output_dir=tmp_path)
    for name in GEN_METHODS:
        setattr(gen, name, mock.Mock(return_value=True))
    return gen


class TestFillCategory:
    @pytest.mark.parametrize('category,method', [
        ('characters/sprites', 'generate_low_poly_character'),
        ('icons/items', 'generate_low_poly_icon'),
        ('ui/elements', 'generate_low_poly_ui_element'),
        ('misc/element', 'generate_low_poly_ui_element'),
        ('effects/particles', 'generate_low_poly_particle'),
        ('effect', 'generate_low_poly_particle'),
        ('vehicles/sprites', 'generate_low_poly_vehicle'),
        ('map/assets', 'generate_low_poly_map_asset'),
    ])
    def test_routes_to_one_generator_needed_times(self, mocked_gen, category, method):
        assert mocked_gen.fill_category(category, 7, 3) == 4
        for name in GEN_METHODS:
            expected = 4 if name == method else 0
            assert getattr(mocked_gen, name).call_count == expected, name
        assert len(mocked_gen.generated) == 4

    @pytest.mark.parametrize('current', [5, 6, 100])
    def test_nothing_needed_returns_zero(self, mocked_gen, current):
        assert mocked_gen.fill_category('characters/sprites', 5, current) == 0
        assert all(getattr(mocked_gen, n).call_count == 0 for n in GEN_METHODS)

    def test_unknown_category_generates_nothing(self, mocked_gen):
        assert mocked_gen.fill_category('sounds', 3, 0) == 0
        assert all(getattr(mocked_gen, n).call_count == 0 for n in GEN_METHODS)

    def test_failed_generations_are_not_counted(self, mocked_gen):
        mocked_gen.generate_low_poly_icon.side_effect = [True, False, True]
        assert mocked_gen.fill_category('icons/items', 3, 0) == 2
        assert len(mocked_gen.generated) == 2

    def test_icon_types_rotate(self, mocked_gen):
        mocked_gen.fill_category('icons/items', 8, 0)
        types = [c.args[1] for c in mocked_gen.generate_low_poly_icon.call_args_list]
        assert types == ['bed', 'desk', 'chair', 'table', 'lamp', 'computer', 'phone', 'bed']

    def test_character_category_wins_over_icon_keyword(self, mocked_gen):
        mocked_gen.fill_category('character_icons', 1, 0)
        assert mocked_gen.generate_low_poly_character.call_count == 1
        assert mocked_gen.generate_low_poly_icon.call_count == 0


# ---------- #605 backdrop palette ----------

class TestThemedBackdropPalette:
    def test_unknown_theme_rejected(self, tmp_path):
        with pytest.raises(ValueError, match='Unsupported theme'):
            ThemedBackdropGenerator(output_dir=str(tmp_path), theme='vaporwave')

    @pytest.mark.parametrize('theme', ['low_poly', 'pixel_art', 'cartoon'])
    def test_each_region_filled_from_theme_palette(self, tmp_path, theme):
        gen = ThemedBackdropGenerator(output_dir=str(tmp_path), theme=theme)
        draw = mock.Mock()
        with mock.patch('generate_themed_backdrops.Image.new') as new, \
                mock.patch('generate_themed_backdrops.ImageDraw.Draw', return_value=draw):
            gen.generate_low_poly_backdrop(size=(300, 90), filename='b.png')
        fills = [c.kwargs['fill'] for c in draw.rectangle.call_args_list]
        palette = gen.color_palettes[theme]
        assert fills == [palette[k] for k in palette]
        new.return_value.save.assert_called_once_with(os.path.join(str(tmp_path), 'b.png'))

    def test_missing_palette_key_falls_back_to_white(self, tmp_path):
        gen = ThemedBackdropGenerator(output_dir=str(tmp_path))
        del gen.color_palettes['low_poly']['#CCA0C5']
        draw = mock.Mock()
        with mock.patch('generate_themed_backdrops.Image.new'), \
                mock.patch('generate_themed_backdrops.ImageDraw.Draw', return_value=draw):
            gen.generate_low_poly_backdrop(size=(300, 90))
        fills = [c.kwargs['fill'] for c in draw.rectangle.call_args_list]
        assert len(fills) == 7 and fills[4] == '#FFFFFF'

    def test_region_rectangles_follow_size(self, tmp_path):
        gen = ThemedBackdropGenerator(output_dir=str(tmp_path))
        draw = mock.Mock()
        with mock.patch('generate_themed_backdrops.Image.new'), \
                mock.patch('generate_themed_backdrops.ImageDraw.Draw', return_value=draw):
            gen.generate_low_poly_backdrop(size=(300, 90))
        rects = [c.args[0] for c in draw.rectangle.call_args_list]
        assert rects[0] == (0, 0, 300, 30)
        assert rects[2] == (0, 60, 300, 90)
        assert rects[6] == (150, 45, 250, 145)


# ---------- #607 classification ----------

@pytest.fixture
def master(tmp_path):
    return MasterManifestGenerator(assets_dir=tmp_path, generated_dir=tmp_path)


class TestCategorizeAsset:
    @pytest.mark.parametrize('path,expected', [
        ('a/characters/x.png', 'characters'),
        ('a/sprite_sheet.png', 'characters'),
        ('a/backdrop.png', 'backdrops'),
        ('a/background/x.png', 'backdrops'),
        ('a/location_cafe.png', 'backdrops'),
        ('a/map/tree.png', 'map_assets'),
        ('a/icons/features/x.png', 'icons_features'),
        ('a/icons/items/x.png', 'icons_items'),
        ('a/vehicles/car.png', 'vehicles'),
        ('a/ui/button.png', 'ui_elements'),
        ('a/element.png', 'ui_elements'),
        ('a/particle.png', 'particles'),
        ('a/effects/x.png', 'particles'),
        ('a/misc/x.png', 'other'),
        ('A/CHARACTERS/X.PNG', 'characters'),
    ])
    def test_branches(self, master, path, expected):
        assert master.categorize_asset(Path(path)) == expected

    def test_precedence_icon_before_vehicle(self, master):
        assert master.categorize_asset('icons/vehicle_car.png') == 'icons_items'

    def test_precedence_character_before_map(self, master):
        assert master.categorize_asset('map/character.png') == 'characters'


class TestDetermineStyle:
    @pytest.mark.parametrize('name,expected', [
        ('tree_lowpoly.png', 'low_poly'), ('low-poly.png', 'low_poly'),
        ('generated_low_poly_x.png', 'low_poly'), ('hero_pixel.png', 'pixel_art'),
        ('8bit.png', 'pixel_art'), ('realistic_car.png', 'realistic'),
        ('photo.png', 'realistic'), ('placeholder.png', 'placeholder'),
    ])
    def test_filename_keywords(self, master, name, expected):
        assert master.determine_style(Path(name), {'width': 1000, 'height': 1000}) == expected

    def test_no_analysis_is_unknown(self, master):
        assert master.determine_style(Path('x_pixel.png'), None) == 'unknown'

    @pytest.mark.parametrize('w,h,expected', [
        (255, 255, 'pixel_art'),
        (256, 256, 'low_poly'),   # < 256 is strict
        (255, 256, 'low_poly'),
        (512, 512, 'low_poly'),   # > 512 is strict
        (513, 10, 'realistic'),
        (10, 513, 'realistic'),
    ])
    def test_size_heuristic_boundaries(self, master, w, h, expected):
        assert master.determine_style(Path('x.png'), {'width': w, 'height': h}) == expected


# ---------- #609 total_assets ----------

class TestAssetManifestTotals:
    def test_total_matches_sum_of_categories(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        manifest = generate_asset_manifest.parse_asset_list()
        categories = {k: v for k, v in manifest.items() if isinstance(v, dict) and 'assets' in v}
        assert categories
        assert manifest['metadata']['total_assets'] == sum(len(c['assets']) for c in categories.values())
        assert (tmp_path / 'asset_manifest.json').exists()

    # Declared in the manifest skeleton but not populated by parse_asset_list
    # yet; listed explicitly so a newly-empty category (or a newly-filled
    # one) shows up as a test change
    INTENTIONALLY_EMPTY = {'chart_icons', 'ui_elements', 'particle_effects',
                           'dialogue_ui', 'npc_portraits', 'screen_transitions'}

    def test_only_documented_categories_are_empty(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        manifest = generate_asset_manifest.parse_asset_list()
        empty = {k for k, v in manifest.items() if isinstance(v, dict) and 'assets' in v and not v['assets']}
        assert empty == self.INTENTIONALLY_EMPTY
