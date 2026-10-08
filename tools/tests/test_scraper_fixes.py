"""Regression tests for scraper fixes (#610, #611, #615, #617, #619)."""
import ast
import sys
from pathlib import Path

import pytest

SCRAPERS = Path(__file__).resolve().parent.parent.parent / "scripts" / "scrapers"
sys.path.insert(0, str(SCRAPERS))


def test_mass_theme_scraper_imports_urljoin():
    """#610: urljoin is used for OpenGameArt links, so it must be imported."""
    tree = ast.parse((SCRAPERS / "mass_theme_scraper.py").read_text())
    imported = {a.asname or a.name for n in ast.walk(tree) if isinstance(n, ast.ImportFrom) for a in n.names}
    assert "urljoin" in imported


class FakeImage:
    def __init__(self, size):
        self.size = size
        self.ops = []

    def resize(self, size, *_):
        self.ops.append(("resize", size))
        child = FakeImage(size)
        child.ops = list(self.ops)
        return child

    def crop(self, box):
        left, top, right, bottom = box
        child = FakeImage((right - left, bottom - top))
        child.ops = self.ops + [("crop", box)]
        return child


def test_fit_exact_keeps_aspect_ratio_and_hits_exact_size():
    """#611: exact=True scales to cover then centre-crops (no stretching)."""
    from mass_theme_scraper import fit_exact
    img = FakeImage((400, 200))  # 2:1 into a 100x100 box
    out = fit_exact(img, 100, 100)
    assert out.size == (100, 100)
    assert img.ops[0] == ("resize", (200, 100))  # aspect preserved (2:1)
    assert out.ops[-1] == ("crop", (50, 0, 150, 100))


def test_git_clone_has_timeout():
    """#615: the git clone subprocess call is bounded."""
    src = (SCRAPERS / "scraper_characters.py").read_text()
    tree = ast.parse(src)
    calls = [n for n in ast.walk(tree) if isinstance(n, ast.Call)
             and getattr(n.func, "attr", "") == "run"
             and any(isinstance(a, ast.List) and any(getattr(e, "value", None) == "clone" for e in a.elts) for a in n.args)]
    assert calls, "git clone call not found"
    assert all(any(k.arg == "timeout" for k in c.keywords) for c in calls)


@pytest.mark.parametrize("href,expected", [
    ("/icons/128/lorc/sword.svg", True),
    ("/icons/lorc/sword-128.svg", True),
    ("/icons/lorc/sword_128x128.svg", True),
    ("/icons/sword.svg?size=128", True),
    ("/icons/1280/lorc/sword.svg", False),
    ("/icons/lorc/sword-v2128.svg", False),
    ("/icons/id/91283/sword.svg", False),
    ("", False),
    (None, False),
])
def test_is_sized_href(href, expected):
    """#617: only structural size markers count, not any '128' substring."""
    # Load just the helper, so the test doesn't need requests/bs4/PIL
    tree = ast.parse((SCRAPERS / "scraper_icons.py").read_text())
    fn = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "is_sized_href")
    ns = {"re": __import__("re")}
    exec(compile(ast.Module(body=[fn], type_ignores=[]), "is_sized_href", "exec"), ns)
    assert ns["is_sized_href"](href, 128) is expected


def test_backdrop_loops_isolate_each_photo():
    """#619: the per-photo body is wrapped in its own try/except."""
    tree = ast.parse((SCRAPERS / "scraper_backdrops.py").read_text())
    for name in ("scrape_pexels_backdrop", "scrape_unsplash_backdrop"):
        fn = next(n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and n.name == name)
        loops = [n for n in ast.walk(fn) if isinstance(n, ast.For) and getattr(n.target, "id", "") == "photo"]
        assert loops, name
        assert all(isinstance(loop.body[0], ast.Try) for loop in loops), name
