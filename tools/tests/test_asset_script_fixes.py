"""
generate_more_low_poly re-run numbering (#602), generate_master_manifest
extension matching (#606), run_all_scrapers process-group timeout (#623)
"""
import os
import subprocess
import sys
import time

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'generators')))

import run_all_scrapers  # noqa: E402

PIL = pytest.importorskip('PIL')
from PIL import Image  # noqa: E402
from generate_more_low_poly import LowPolyGenerator  # noqa: E402
from generate_master_manifest import MasterManifestGenerator  # noqa: E402


class TestLowPolyRerunNumbering:
    def test_second_run_extends_instead_of_overwriting(self, tmp_path):
        gen = LowPolyGenerator(output_dir=tmp_path)
        assert gen.fill_category('characters/sprites', 3, 0) == 3
        folder = tmp_path / 'characters' / 'sprites'
        first = folder / 'generated_low_poly_character_0000.png'
        marker = b'original-first-file'
        first.write_bytes(marker)

        assert gen.fill_category('characters/sprites', 5, 3) == 2
        names = sorted(p.name for p in folder.glob('*.png'))
        assert names == [f'generated_low_poly_character_{i:04d}.png' for i in range(5)]
        assert first.read_bytes() == marker

    def test_typed_categories_continue_after_highest_index(self, tmp_path):
        gen = LowPolyGenerator(output_dir=tmp_path)
        gen.fill_category('icons/items', 2, 0)
        gen.fill_category('icons/items', 4, 2)
        folder = tmp_path / 'icons' / 'items'
        indices = sorted(int(p.stem.rsplit('_', 1)[1]) for p in folder.glob('generated_low_poly_*.png'))
        assert indices == [0, 1, 2, 3]

    def test_next_generated_index(self, tmp_path):
        assert LowPolyGenerator.next_generated_index(tmp_path) == 0
        (tmp_path / 'generated_low_poly_star_0007.png').write_bytes(b'')
        (tmp_path / 'hand_made.png').write_bytes(b'')
        assert LowPolyGenerator.next_generated_index(tmp_path) == 8


class TestMasterManifestExtensions:
    def test_jpeg_and_uppercase_extensions_are_scanned(self, tmp_path):
        for name in ('a.png', 'b.jpeg', 'c.JPG', 'd.jpg'):
            img = Image.new('RGB', (8, 8))
            img.save(tmp_path / name, 'PNG' if name.endswith('png') else 'JPEG')
        (tmp_path / 'notes.txt').write_text('not an asset')

        gen = MasterManifestGenerator(assets_dir=tmp_path, generated_dir=tmp_path / 'none')
        gen.scan_directory(tmp_path)
        names = sorted(a['name'] for a in gen.manifest['assets'])
        assert names == ['a.png', 'b.jpeg', 'c.JPG', 'd.jpg']
        assert gen.manifest['total_assets'] == 4


def _alive(pid):
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    try:
        with open(f'/proc/{pid}/stat') as fh:
            return fh.read().split(')')[-1].split()[0] != 'Z'
    except OSError:
        return True


class TestRunProcessGroup:
    def test_returns_completed_process(self):
        result = run_all_scrapers.run_process_group([sys.executable, '-c', 'print("hi")'], timeout=30)
        assert result.returncode == 0
        assert result.stdout.strip() == 'hi'

    @pytest.mark.skipif(os.name != 'posix', reason='process groups are POSIX-only')
    def test_timeout_kills_grandchildren(self, tmp_path):
        pid_file = tmp_path / 'grandchild.pid'
        script = (
            'import subprocess, sys, time\n'
            f'p = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"])\n'
            f'open({str(pid_file)!r}, "w").write(str(p.pid))\n'
            'time.sleep(60)\n'
        )
        with pytest.raises(subprocess.TimeoutExpired):
            run_all_scrapers.run_process_group([sys.executable, '-c', script], timeout=2)
        grandchild = int(pid_file.read_text())
        deadline = time.time() + 5
        while _alive(grandchild) and time.time() < deadline:
            time.sleep(0.1)
        assert not _alive(grandchild)

    def test_run_scraper_uses_group_runner_and_handles_timeout(self, monkeypatch):
        def boom(cmd, timeout=run_all_scrapers.SCRAPER_TIMEOUT):
            raise subprocess.TimeoutExpired(cmd, timeout)
        monkeypatch.setattr(run_all_scrapers, 'run_process_group', boom)
        assert run_all_scrapers.run_scraper(run_all_scrapers.SCRAPERS[0]) is False
