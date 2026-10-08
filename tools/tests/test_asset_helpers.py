"""
sanitize_filename (#544), GameAssetManifestCreator.get_asset_info (#595),
create_character_sprite (#598)
"""
import os
import sys
import types
from unittest import mock

import pytest

# create_asset_workbench imports `markdown` at module load; sanitize_filename
# doesn't need it, so stub it when it isn't installed
try:
    import markdown  # noqa: F401
except ImportError:
    sys.modules['markdown'] = types.SimpleNamespace(markdown=lambda s: s)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'generators')))

from create_asset_workbench import sanitize_filename  # noqa: E402

PIL = pytest.importorskip('PIL')
from PIL import Image  # noqa: E402
import create_game_asset_manifest as manifest_mod  # noqa: E402
import create_character_sprites as sprites  # noqa: E402


class TestSanitizeFilename:
    def test_documented_examples(self):
        assert sanitize_filename('Rachel Green') == 'rachel_green'
        assert sanitize_filename('Small Business') == 'small_business'

    def test_runs_of_separators_collapse(self):
        assert sanitize_filename('a  -  b--c') == 'a_b_c'

    def test_leading_trailing_whitespace_and_dots_stripped(self):
        assert sanitize_filename('  Bob  ') == 'bob'
        assert sanitize_filename('...hidden') == 'hidden'
        assert sanitize_filename('../../etc/passwd') == 'etc_passwd'

    def test_punctuation_replaced(self):
        assert sanitize_filename("O'Brien & Sons, Inc.") == 'o_brien_sons_inc'

    def test_empty_or_all_punctuation_falls_back(self):
        assert sanitize_filename('') == 'unnamed'
        assert sanitize_filename('!!!') == 'unnamed'
        assert sanitize_filename(None) == 'unnamed'

    def test_case_digits_and_extension_dot(self):
        assert sanitize_filename('Agent 007.PNG') == 'agent_007.png'

    def test_non_ascii_and_emoji_become_separators(self):
        assert sanitize_filename('Café ☕ Owner') == 'caf_owner'


class FakeImg:
    def __init__(self, size=(64, 32), mode='RGBA'):
        self.size = size
        self.mode = mode

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class TestGetAssetInfo:
    @pytest.mark.parametrize('mode,alpha', [('RGBA', True), ('LA', True), ('RGB', False), ('P', False)])
    def test_alpha_by_mode(self, mode, alpha):
        with mock.patch.object(manifest_mod.Image, 'open', return_value=FakeImg(mode=mode)):
            info = manifest_mod.GameAssetManifestCreator().get_asset_info('x.png')
        assert info['has_alpha'] is alpha
        assert info['mode'] == mode

    def test_width_height_order(self):
        with mock.patch.object(manifest_mod.Image, 'open', return_value=FakeImg(size=(120, 45))):
            info = manifest_mod.GameAssetManifestCreator().get_asset_info('x.png')
        assert (info['width'], info['height']) == (120, 45)

    def test_unreadable_file_returns_none(self):
        with mock.patch.object(manifest_mod.Image, 'open', side_effect=OSError('truncated')):
            assert manifest_mod.GameAssetManifestCreator().get_asset_info('bad.png') is None


def solid(color, size=(8, 8)):
    return Image.new('RGBA', size, color)


class TestCreateCharacterSprite:
    def test_missing_body_returns_none(self, capsys):
        with mock.patch.object(sprites, 'load_image_safe', return_value=None):
            assert sprites.create_character_sprite('nope.png') is None
        assert 'Could not load body' in capsys.readouterr().out

    def test_body_only_skips_composite(self):
        body = solid((255, 0, 0, 255))
        with mock.patch.object(sprites, 'load_image_safe', return_value=body), \
                mock.patch.object(sprites.Image, 'alpha_composite') as comp:
            assert sprites.create_character_sprite('body.png') is body
        comp.assert_not_called()

    def test_body_and_hair_composited_in_order(self):
        body, hair = solid((255, 0, 0, 255)), solid((0, 0, 255, 128))
        sentinel = object()
        with mock.patch.object(sprites, 'load_image_safe', side_effect=[body, hair]), \
                mock.patch.object(sprites.Image, 'alpha_composite', return_value=sentinel) as comp:
            assert sprites.create_character_sprite('body.png', 'hair.png') is sentinel
        comp.assert_called_once_with(body, hair)

    def test_unloadable_hair_falls_back_to_body(self):
        body = solid((255, 0, 0, 255))
        with mock.patch.object(sprites, 'load_image_safe', side_effect=[body, None]):
            assert sprites.create_character_sprite('body.png', 'missing.png') is body

    def test_real_composite_and_size_mismatch(self, tmp_path):
        body_p, hair_p, out_p = tmp_path / 'b.png', tmp_path / 'h.png', tmp_path / 'out.png'
        solid((255, 0, 0, 255), (8, 8)).save(body_p)
        solid((0, 0, 255, 255), (4, 4)).save(hair_p)
        result = sprites.create_character_sprite(str(body_p), str(hair_p), str(out_p))
        assert result.size == (8, 8)
        assert result.getpixel((0, 0)) == (0, 0, 255, 255)
        assert result.getpixel((7, 7)) == (255, 0, 0, 255)
        assert out_p.exists()

    def test_save_only_with_output_path(self):
        body = mock.MagicMock()
        with mock.patch.object(sprites, 'load_image_safe', return_value=body):
            sprites.create_character_sprite('b.png')
            body.save.assert_not_called()
            sprites.create_character_sprite('b.png', output_path='o.png')
            body.save.assert_called_once_with('o.png', 'PNG')
