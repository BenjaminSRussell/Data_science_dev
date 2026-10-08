"""
Scraper logic coverage: particles run loop + resize (#613), OpenGameArt
filename sanitizing (#616), backdrop JPEG mode conversion (#620), vehicle
aspect-preserving resize + filename uniqueness (#621), map-assets run stats
(#622), UI element search strings (#625)
"""
import os
import sys
from unittest import mock

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'scrapers')))

pytest.importorskip('requests')
pytest.importorskip('bs4')
pytest.importorskip('PIL')
from PIL import Image  # noqa: E402

import scraper_particles  # noqa: E402
import scraper_backdrops  # noqa: E402
import scraper_vehicles  # noqa: E402
import scraper_map_assets  # noqa: E402
import scraper_ui_elements  # noqa: E402
import scraper_characters  # noqa: E402


def fake_image(mode, size=(64, 32)):
    img = mock.MagicMock()
    img.mode = mode
    img.size = size
    converted = mock.MagicMock()
    converted.mode = 'converted'
    img.convert.return_value = converted
    converted.resize.return_value = converted
    img.resize.return_value = img
    img.__enter__.return_value = img
    return img, converted


# ---------- run() loops: particles (#613) and map assets (#622) ----------

RUN_CASES = [
    (scraper_particles.ParticleScraper, 'scrape_opengameart_particle', 'particles'),
    (scraper_map_assets.MapAssetScraper, 'scrape_opengameart_map', 'map_items'),
]


@pytest.mark.parametrize('cls,method,items_attr', RUN_CASES)
class TestScraperRunLoop:
    def make(self, tmp_path, cls, method, counts):
        scraper = cls(output_dir=tmp_path)
        scrape = mock.Mock(side_effect=counts)
        setattr(scraper, method, scrape)
        scraper.save_manifest = mock.Mock()
        return scraper, scrape

    def test_stops_once_target_reached(self, tmp_path, cls, method, items_attr):
        scraper, scrape = self.make(tmp_path, cls, method, [4, 4, 4, 4, 4, 4])
        with mock.patch.object(sys.modules[cls.__module__].time, 'sleep') as sleep:
            scraper.run(target_count=10)
        assert scrape.call_count == 3  # 4, 8, 12 -> stop before the 4th
        called = [c.args[0] for c in scrape.call_args_list]
        assert called == getattr(scraper, items_attr)[:3]
        assert scraper.stats == {'total': 12, 'downloaded': 12}
        assert sleep.call_count == 3
        scraper.save_manifest.assert_called_once_with()

    def test_full_pass_when_target_never_reached(self, tmp_path, cls, method, items_attr):
        items = getattr(cls(output_dir=tmp_path), items_attr)
        counts = [i % 3 for i in range(len(items))]
        scraper, scrape = self.make(tmp_path, cls, method, counts)
        with mock.patch.object(sys.modules[cls.__module__].time, 'sleep'):
            scraper.run(target_count=10 ** 6)
        assert scrape.call_count == len(items)
        assert scraper.stats['downloaded'] == scraper.stats['total'] == sum(counts)
        scraper.save_manifest.assert_called_once_with()

    def test_zero_target_scrapes_nothing_but_still_saves(self, tmp_path, cls, method, items_attr):
        scraper, scrape = self.make(tmp_path, cls, method, [])
        with mock.patch.object(sys.modules[cls.__module__].time, 'sleep'):
            scraper.run(target_count=0)
        assert scrape.call_count == 0
        assert scraper.stats == {'total': 0, 'downloaded': 0}
        scraper.save_manifest.assert_called_once_with()

    def test_stats_move_in_lockstep(self, tmp_path, cls, method, items_attr):
        seen = []
        scraper, scrape = self.make(tmp_path, cls, method, None)

        def record(item, max_results=None):
            seen.append(dict(scraper.stats))
            return 2
        scrape.side_effect = record
        with mock.patch.object(sys.modules[cls.__module__].time, 'sleep'):
            scraper.run(target_count=7)
        assert all(s['total'] == s['downloaded'] for s in seen)
        assert scraper.stats == {'total': 8, 'downloaded': 8}

    def test_save_manifest_writes_stats(self, tmp_path, cls, method, items_attr):
        import json
        scraper = cls(output_dir=tmp_path)
        scraper.stats = {'total': 3, 'downloaded': 3}
        scraper.save_manifest()
        data = json.loads((tmp_path / 'manifest.json').read_text())
        assert data['stats'] == {'total': 3, 'downloaded': 3}


class TestParticleResize:
    def test_non_rgba_is_converted_then_resized_exactly(self, tmp_path):
        scraper = scraper_particles.ParticleScraper(output_dir=tmp_path)
        img, converted = fake_image('RGB')
        with mock.patch.object(scraper_particles.Image, 'open', return_value=img):
            assert scraper.resize_image('p.png') is True
        img.convert.assert_called_once_with('RGBA')
        converted.resize.assert_called_once_with((32, 32), scraper_particles.Image.Resampling.LANCZOS)
        converted.thumbnail.assert_not_called()

    def test_rgba_is_not_converted(self, tmp_path):
        scraper = scraper_particles.ParticleScraper(output_dir=tmp_path)
        img, _ = fake_image('RGBA')
        with mock.patch.object(scraper_particles.Image, 'open', return_value=img):
            scraper.resize_image('p.png')
        img.convert.assert_not_called()
        img.resize.assert_called_once()
        img.resize.return_value.save.assert_called_once_with('p.png', 'PNG', optimize=True)

    def test_real_image_becomes_square_rgba(self, tmp_path):
        path = tmp_path / 'p.png'
        Image.new('RGB', (100, 40), (255, 0, 0)).save(path)
        scraper_particles.ParticleScraper(output_dir=tmp_path).resize_image(path)
        with Image.open(path) as out:
            assert out.size == (32, 32) and out.mode == 'RGBA'


# ---------- #616 filename sanitizing ----------

class TestOpenGameArtFilename:
    @pytest.mark.parametrize('title', ['../../etc/passwd', '..\\..\\windows\\system32', 'a/b\\c'])
    def test_no_path_separators_survive(self, title):
        name = scraper_characters.opengameart_character_filename(0, title)
        assert '/' not in name and '\\' not in name
        assert os.path.basename(name) == name

    def test_traversal_title_collapses_to_single_component(self, tmp_path):
        name = scraper_characters.opengameart_character_filename(3, '../../etc/passwd')
        assert name == 'character_3_....etcpasswd.png'
        assert (tmp_path / name).parent == tmp_path

    def test_spaces_and_specials_removed(self):
        assert scraper_characters.sanitize_filename('Hero Pack: v2 (CC0)!*?<>|"') == 'HeroPackv2CC0'

    def test_whitelisted_punctuation_kept(self):
        assert scraper_characters.sanitize_filename('a_b-c.d') == 'a_b-c.d'

    def test_leading_and_trailing_dots_stay_inside_prefix(self):
        name = scraper_characters.opengameart_character_filename(1, '...hidden...')
        assert name == 'character_1_...hidden....png'
        assert not name.startswith('.')

    def test_unicode_letters_pass_isalnum(self):
        # str.isalnum() accepts non-ASCII letters/digits; emoji/symbols are dropped
        assert scraper_characters.sanitize_filename('Café 日本 ✨') == 'Café日本'

    def test_empty_and_whitespace_titles(self):
        assert scraper_characters.opengameart_character_filename(0, '') == 'character_0_.png'
        assert scraper_characters.opengameart_character_filename(0, '   ') == 'character_0_.png'

    def test_truncates_to_30_chars_before_sanitizing(self):
        title = 'a/' * 20  # 40 chars; first 30 hold 15 'a's
        name = scraper_characters.opengameart_character_filename(0, title)
        assert name == 'character_0_' + 'a' * 15 + '.png'

    def test_title_is_stripped_before_truncation(self):
        title = '   ' + 'b' * 40
        assert scraper_characters.opengameart_character_filename(2, title) == 'character_2_' + 'b' * 30 + '.png'


# ---------- #620 backdrop JPEG conversion ----------

class TestBackdropResize:
    @pytest.mark.parametrize('mode', ['RGBA', 'LA', 'P', 'L', 'CMYK'])
    def test_non_rgb_modes_converted_before_jpeg(self, tmp_path, mode):
        scraper = scraper_backdrops.BackdropScraper(output_dir=tmp_path)
        img, converted = fake_image(mode)
        with mock.patch.object(scraper_backdrops.Image, 'open', return_value=img):
            assert scraper.resize_image('b.jpg') is True
        img.convert.assert_called_once_with('RGB')
        converted.resize.return_value.save.assert_called_once_with('b.jpg', 'JPEG', quality=85, optimize=True)

    def test_rgb_not_converted(self, tmp_path):
        scraper = scraper_backdrops.BackdropScraper(output_dir=tmp_path)
        img, _ = fake_image('RGB')
        with mock.patch.object(scraper_backdrops.Image, 'open', return_value=img):
            scraper.resize_image('b.jpg')
        img.convert.assert_not_called()
        img.resize.assert_called_once_with((1920, 1080), scraper_backdrops.Image.Resampling.LANCZOS)

    @pytest.mark.parametrize('mode', ['RGBA', 'LA', 'P'])
    def test_real_images_with_alpha_or_palette_save_as_jpeg(self, tmp_path, mode):
        path = tmp_path / f'b_{mode}.png'
        Image.new(mode, (40, 20)).save(path)
        assert scraper_backdrops.BackdropScraper(output_dir=tmp_path).resize_image(path) is True
        with Image.open(path) as out:
            assert out.format == 'JPEG' and out.mode == 'RGB' and out.size == (1920, 1080)

    def test_open_failure_returns_false(self, tmp_path):
        scraper = scraper_backdrops.BackdropScraper(output_dir=tmp_path)
        assert scraper.resize_image(tmp_path / 'missing.png') is False


# ---------- #621 vehicles ----------

class TestVehicleResize:
    def test_uses_thumbnail_not_resize(self, tmp_path):
        scraper = scraper_vehicles.VehicleScraper(output_dir=tmp_path)
        img, converted = fake_image('RGB')
        with mock.patch.object(scraper_vehicles.Image, 'open', return_value=img):
            assert scraper.resize_image('v.png') is True
        converted.thumbnail.assert_called_once_with((128, 128), scraper_vehicles.Image.Resampling.LANCZOS)
        converted.resize.assert_not_called()
        img.resize.assert_not_called()

    def test_real_image_keeps_aspect_ratio(self, tmp_path):
        path = tmp_path / 'v.png'
        Image.new('RGBA', (400, 100)).save(path)
        scraper_vehicles.VehicleScraper(output_dir=tmp_path).resize_image(path)
        with Image.open(path) as out:
            assert out.size == (128, 32)

    def test_filenames_unique_within_a_run(self, tmp_path):
        scraper = scraper_vehicles.VehicleScraper(output_dir=tmp_path)
        search_html = '<div class="node"><a href="/content/x">X</a></div>' * 3
        asset_html = '<a href="/download/file.png">dl</a>'
        responses = []
        for _ in range(4):  # four search terms
            responses.append(mock.Mock(text=search_html))
            responses.extend(mock.Mock(text=asset_html) for _ in range(3))
        scraper.session = mock.Mock()
        scraper.session.get.side_effect = responses
        paths = []

        def fake_download(url, output_path):
            paths.append(output_path)
            return True
        scraper.download_file = fake_download
        with mock.patch.object(scraper_vehicles.time, 'sleep'):
            count = scraper.scrape_opengameart_vehicle('car', max_results=3)
        assert count == len(paths) == 12
        assert len(set(paths)) == len(paths)
        assert len({d['path'] for d in scraper.downloaded}) == 12


# ---------- #625 UI search strings ----------

class TestUISearchTerms:
    def test_templates(self):
        assert scraper_ui_elements.build_ui_search_terms('button') == [
            'low poly button ui', 'lowpoly button', '3d button icon', 'polygonal button',
        ]

    def test_every_element_produces_four_distinct_well_formed_terms(self, tmp_path):
        elements = scraper_ui_elements.UIElementScraper(output_dir=tmp_path).ui_elements
        assert len(elements) == 30
        assert len(set(elements)) == len(elements)
        for element in elements:
            assert element == element.strip() and element and ' ' not in element
            terms = scraper_ui_elements.build_ui_search_terms(element)
            assert len(terms) == 4 and len(set(terms)) == 4
            for term in terms:
                assert element in term.split()
                assert '  ' not in term and term == term.strip()

    def test_short_ambiguous_elements_still_get_ui_context(self):
        for element in ('x', 'plus', 'minus', 'star'):
            terms = scraper_ui_elements.build_ui_search_terms(element)
            assert terms[0] == f'low poly {element} ui'
            assert terms[2] == f'3d {element} icon'

    def test_scraper_queries_use_the_helper(self, tmp_path):
        scraper = scraper_ui_elements.UIElementScraper(output_dir=tmp_path)
        scraper.session = mock.Mock()
        scraper.session.get.return_value = mock.Mock(text='<html></html>')
        scraper.scrape_opengameart_ui('checkmark')
        urls = [c.args[0] for c in scraper.session.get.call_args_list]
        assert urls == [
            'https://opengameart.org/art-search-advanced?keys=' + t.replace(' ', '+')
            for t in scraper_ui_elements.build_ui_search_terms('checkmark')
        ]
