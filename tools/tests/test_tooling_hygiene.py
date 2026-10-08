"""
scan_icons skips unreadable PNGs (#1912); scripts/requirements.txt matches
what scripts/ imports (#1914); scripts/README documents the Python tooling (#1915)
"""
import ast
import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts' / 'generators'))

PIL = pytest.importorskip('PIL')
from PIL import Image  # noqa: E402
import create_game_asset_manifest as manifest_mod  # noqa: E402


class TestScanIconsSkipsUnreadable:
    @pytest.mark.parametrize('kind,key', [('items', 'item'), ('features', 'feature')])
    def test_corrupt_png_skipped_svg_and_good_png_kept(self, tmp_path, kind, key):
        folder = tmp_path / 'icons' / kind
        folder.mkdir(parents=True)
        Image.new('RGBA', (48, 24)).save(folder / 'good.png')
        (folder / 'corrupt.png').write_bytes(b'not a png')
        (folder / 'empty.png').write_bytes(b'')
        (folder / 'vector.svg').write_text('<svg/>')

        creator = manifest_mod.GameAssetManifestCreator(assets_dir=tmp_path)
        creator.scan_icons()  # used to raise AttributeError on None.get
        entries = creator.manifest['icons'][kind]
        names = sorted(Path(e['path']).name for e in entries.values())
        assert names == ['good.png', 'vector.svg']
        good = next(e for e in entries.values() if e['path'].endswith('good.png'))
        assert (good['width'], good['height']) == (48, 24)
        assert all(k.startswith(f'{key}_') for k in entries)


STDLIB = set(getattr(sys, 'stdlib_module_names', ()))
# import name -> requirements.txt distribution name
DIST_NAMES = {'PIL': 'pillow', 'bs4': 'beautifulsoup4', 'requests': 'requests'}


def third_party_imports(folder):
    local = {p.stem for p in folder.rglob('*.py')} | {'scrapers', 'generators'}
    found = set()
    for path in folder.rglob('*.py'):
        tree = ast.parse(path.read_text(encoding='utf-8'))
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                names = [a.name for a in node.names]
            elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
                names = [node.module]
            else:
                continue
            for name in names:
                top = name.split('.')[0]
                if top not in STDLIB and top not in local:
                    found.add(top)
    return found


@pytest.mark.skipif(not STDLIB, reason='needs sys.stdlib_module_names (3.10+)')
class TestRequirements:
    def declared(self):
        lines = (ROOT / 'scripts' / 'requirements.txt').read_text().splitlines()
        reqs = set()
        for line in lines:
            line = line.split('#', 1)[0].strip()
            if line:
                reqs.add(line.split('>=')[0].split('==')[0].strip().lower())
        return reqs

    def test_every_import_is_declared_and_nothing_extra(self):
        imports = third_party_imports(ROOT / 'scripts')
        needed = {DIST_NAMES.get(name, name).lower() for name in imports}
        assert needed == self.declared()

    def test_unused_browser_stack_is_gone(self):
        assert not self.declared() & {'selenium', 'webdriver-manager', 'cairosvg', 'lxml'}


class TestScriptsReadme:
    def test_every_python_tool_is_documented(self):
        readme = (ROOT / 'scripts' / 'README.md').read_text()
        tools = sorted((ROOT / 'scripts' / 'generators').glob('*.py'))
        tools += [ROOT / 'scripts' / 'scrapers' / n for n in ('run_all_scrapers.py', 'mass_theme_scraper.py')]
        missing = [p.name for p in tools if p.name not in readme]
        assert missing == []
        assert 'requirements.txt' in readme
