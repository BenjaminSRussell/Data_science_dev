import importlib.util
import json
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "generators" / "generate_asset_manifest.py"


def load_script():
    spec = importlib.util.spec_from_file_location("generate_asset_manifest", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def count_assets(manifest):
    return sum(len(category["assets"]) for category in manifest.values() if "assets" in category)


def test_total_assets_is_the_number_of_assets_listed(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)

    manifest = load_script().parse_asset_list()

    assert count_assets(manifest) > 0
    assert manifest["metadata"]["total_assets"] == count_assets(manifest)


def test_written_manifest_carries_the_same_total(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)

    load_script().parse_asset_list()
    written = json.loads((tmp_path / "asset_manifest.json").read_text())

    assert written["metadata"]["total_assets"] == count_assets(written)
