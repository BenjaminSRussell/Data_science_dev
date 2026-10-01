import sys
import pytest
from pathlib import Path
from unittest.mock import MagicMock

# Mock external dependencies before importing MassThemeScraper
sys.modules['requests'] = MagicMock()
sys.modules['PIL'] = MagicMock()
sys.modules['PIL.Image'] = MagicMock()

# Add the scripts directory to the path so we can import the scraper
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from scrapers.mass_theme_scraper import MassThemeScraper


class TestGenerateMassAssetList:
    """Test suite for MassThemeScraper.generate_mass_asset_list()"""

    @pytest.fixture
    def scraper(self):
        """Create a MassThemeScraper instance for testing"""
        return MassThemeScraper()

    def test_target_count_zero_returns_empty_list(self, scraper):
        """Test that target_count=0 returns an empty list"""
        assets = scraper.generate_mass_asset_list(target_count=0)
        assert assets == []
        assert len(assets) == 0

    def test_unique_ids(self, scraper):
        """Test that every generated dict has a unique id"""
        assets = scraper.generate_mass_asset_list(target_count=1000)
        ids = [asset['id'] for asset in assets]

        # Check uniqueness
        assert len(ids) == len(set(ids)), "Found duplicate ids"
        # Check all ids are unique
        assert len(set(ids)) == 1000

    def test_strictly_increasing_ids(self, scraper):
        """Test that ids are strictly increasing (1, 2, 3, ...)"""
        assets = scraper.generate_mass_asset_list(target_count=100)
        ids = [asset['id'] for asset in assets]

        # IDs should be 1, 2, 3, ... target_count
        expected_ids = list(range(1, 101))
        assert ids == expected_ids

    def test_id_equals_position_plus_one(self, scraper):
        """Test that each id equals len(assets) at that point, which is index+1"""
        assets = scraper.generate_mass_asset_list(target_count=500)

        for i, asset in enumerate(assets):
            expected_id = i + 1
            assert asset['id'] == expected_id, f"Asset at index {i} has id {asset['id']}, expected {expected_id}"

    def test_no_gaps_in_ids(self, scraper):
        """Test that there are no gaps in the id sequence"""
        assets = scraper.generate_mass_asset_list(target_count=1000)
        ids = [asset['id'] for asset in assets]

        # Check that ids form a continuous sequence
        for i in range(len(ids)):
            assert ids[i] == i + 1

    def test_location_backdrop_count(self, scraper):
        """Test that location-backdrop category produces exactly len(self.locations)*10 entries"""
        # First, generate full list to analyze structure
        # We need to get the full list first to check structure before truncation
        assets = scraper.generate_mass_asset_list(target_count=10000)

        # Count location backdrop entries (should be 49 * 10 = 490)
        location_backdrops = [a for a in assets if a['category'] == 'background' and 'backdrop' in a['name']]
        expected_count = len(scraper.locations) * 10

        assert len(location_backdrops) == expected_count, \
            f"Expected {expected_count} location backdrops, got {len(location_backdrops)}"

    def test_truncation_with_small_target_count(self, scraper):
        """Test that target_count smaller than total size correctly truncates"""
        # Get full list
        full_assets = scraper.generate_mass_asset_list(target_count=10000)
        full_count = len(full_assets)

        # Test various truncation sizes
        truncation_size = 100
        truncated_assets = scraper.generate_mass_asset_list(target_count=truncation_size)

        assert len(truncated_assets) == truncation_size
        # Verify ids are still sequential
        ids = [a['id'] for a in truncated_assets]
        expected_ids = list(range(1, truncation_size + 1))
        assert ids == expected_ids

    def test_default_target_count_returns_less_than_5000(self, scraper):
        """Test that default target_count=5000 returns fewer than 5000 entries"""
        # Use default target_count
        assets = scraper.generate_mass_asset_list()

        # Should return fewer than 5000 (currently 3702)
        assert len(assets) < 5000, \
            f"Expected fewer than 5000 assets, got {len(assets)}"

    def test_default_target_count_returns_3702(self, scraper):
        """Test that default target_count=5000 returns exactly 3702 entries"""
        assets = scraper.generate_mass_asset_list()

        # The function generates 3702 assets total (all categories combined)
        assert len(assets) == 3702, \
            f"Expected 3702 assets, got {len(assets)}"

    def test_all_assets_have_required_fields(self, scraper):
        """Test that all generated assets have required fields"""
        assets = scraper.generate_mass_asset_list(target_count=100)
        required_fields = ['id', 'name', 'search_terms', 'sources', 'output_dir', 'size', 'category']

        for i, asset in enumerate(assets):
            for field in required_fields:
                assert field in asset, f"Asset {i} missing field '{field}'"

    def test_no_gaps_or_duplicates_across_categories(self, scraper):
        """Test that ids are unique and sequential across category boundaries"""
        assets = scraper.generate_mass_asset_list(target_count=1500)
        ids = [asset['id'] for asset in assets]

        # Check no duplicates
        assert len(ids) == len(set(ids)), "Found duplicate ids across categories"

        # Check no gaps
        for i, asset_id in enumerate(ids):
            assert asset_id == i + 1, \
                f"Gap in ids at position {i}: expected {i + 1}, got {asset_id}"

    def test_full_list_count_before_truncation(self, scraper):
        """Test that full un-truncated list has correct total count"""
        # Generate with a very large target_count to get full list
        assets = scraper.generate_mass_asset_list(target_count=10000)

        # Expected count: 490 + 980 + 480 + 480 + 300 + 300 + 192 + 480 = 3702
        # Location backdrops: 49 * 10 = 490
        # Character sprites: 10 * 14 * 7 = 980
        # Map assets: 24 * 20 = 480
        # Icons: 30 * 16 = 480
        # Vehicles: 15 * 20 = 300
        # UI elements: 30 * 10 = 300
        # Particle effects: 16 * 12 = 192
        # Feature icons: 30 * 16 = 480
        expected_total = 3702

        assert len(assets) == expected_total, \
            f"Expected {expected_total} total assets, got {len(assets)}"

    def test_ids_sequential_with_large_set(self, scraper):
        """Test that ids remain sequential even with all assets"""
        assets = scraper.generate_mass_asset_list(target_count=10000)

        for i, asset in enumerate(assets):
            assert asset['id'] == i + 1, \
                f"Asset at index {i} has id {asset['id']}, expected {i + 1}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
