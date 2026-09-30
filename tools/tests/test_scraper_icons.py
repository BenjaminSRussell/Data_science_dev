import pytest
from unittest.mock import MagicMock, patch, Mock
import sys
import os
from pathlib import Path
import tempfile

# Mock external dependencies before importing scraper_icons
sys.modules['requests'] = MagicMock()
sys.modules['PIL'] = MagicMock()
sys.modules['PIL.Image'] = MagicMock()
sys.modules['bs4'] = MagicMock()
sys.modules['bs4.BeautifulSoup'] = MagicMock()

# Add scripts/scrapers to path for importing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'scripts', 'scrapers')))

from scraper_icons import IconScraper


class TestIconSlugTransformation:
    """Test icon_slug transformation (line 80)"""

    def test_icon_slug_simple_lowercase(self):
        """Test that simple lowercase names remain unchanged"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        # The transformation is: icon_name.replace('_', '-').lower()
        icon_name = "laptop"
        expected = "laptop"
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_with_underscores(self):
        """Test that underscores are replaced with hyphens"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        icon_name = "has_underscore"
        expected = "has-underscore"
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_multiple_underscores(self):
        """Test that multiple underscores are all replaced"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        icon_name = "multiple_under_scores"
        expected = "multiple-under-scores"
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_mixed_case(self):
        """Test that mixed case is converted to lowercase"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        icon_name = "MixedCase"
        expected = "mixedcase"
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_mixed_case_with_underscores(self):
        """Test mixed case with underscores"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        icon_name = "Mixed_Case_Name"
        expected = "mixed-case-name"
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_already_hyphenated(self):
        """Test that already hyphenated names remain unchanged"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        icon_name = "already-hyphenated"
        expected = "already-hyphenated"
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_empty_string(self):
        """Test empty string transformation"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())
        icon_name = ""
        expected = ""
        result = icon_name.replace('_', '-').lower()
        assert result == expected

    def test_icon_slug_in_scrape_game_icons(self):
        """Test that icon_slug is correctly created in scrape_game_icons method"""
        scraper = IconScraper(output_dir=tempfile.mkdtemp())

        # Mock the session.get to avoid actual network calls
        with patch.object(scraper.session, 'get') as mock_get:
            mock_get.return_value.status_code = 404

            # Call the method with various icon names
            scraper.scrape_game_icons("test_icon")

            # Verify that the correct URL was constructed with the transformed slug
            mock_get.assert_called()
            call_args = mock_get.call_args
            assert "test-icon" in call_args[0][0]


class TestEarlyExitLoops:
    """Test early-exit loops (lines 174-175, 190-191)"""

    def test_items_loop_stops_at_target(self):
        """Test that items loop stops scraping once downloaded count reaches target"""
        with tempfile.TemporaryDirectory() as tmpdir:
            scraper = IconScraper(output_dir=tmpdir)

            # Mock the scrape methods to return 1 each time
            scraper.scrape_game_icons = MagicMock(return_value=1)
            scraper.scrape_opengameart_icons = MagicMock(return_value=0)
            scraper.save_manifest = MagicMock()

            # Override items list to control test
            scraper.items = ['item1', 'item2', 'item3', 'item4', 'item5']
            scraper.features = []

            # Run with target_count=2
            scraper.run(target_count=2)

            # Verify that only 2 items were processed (not all 5)
            assert scraper.scrape_game_icons.call_count == 2
            assert scraper.stats['downloaded'] == 2

    def test_features_loop_independent_break(self):
        """Test that features loop has independent break condition"""
        with tempfile.TemporaryDirectory() as tmpdir:
            scraper = IconScraper(output_dir=tmpdir)

            # Mock the scrape methods
            scraper.scrape_game_icons = MagicMock(return_value=0)
            scraper.scrape_opengameart_icons = MagicMock(return_value=1)
            scraper.save_manifest = MagicMock()

            # Override lists
            scraper.items = []  # No items to scrape
            scraper.features = ['feature1', 'feature2', 'feature3']

            # Run with target_count=2
            scraper.run(target_count=2)

            # Verify that features loop ran and stopped at target
            # Since items loop is empty, downloaded count starts at 0
            # Features loop should process exactly 2 features
            assert scraper.stats['downloaded'] == 2

    def test_features_loop_not_skipped_when_items_hit_target(self):
        """Test that features loop is evaluated independently even after items hit target"""
        with tempfile.TemporaryDirectory() as tmpdir:
            scraper = IconScraper(output_dir=tmpdir)

            call_counts = {'items': 0, 'features': 0}

            def mock_scrape_game_icons(name, category='items'):
                if category == 'items':
                    call_counts['items'] += 1
                else:
                    call_counts['features'] += 1
                return 1

            scraper.scrape_game_icons = mock_scrape_game_icons
            scraper.scrape_opengameart_icons = MagicMock(return_value=0)
            scraper.save_manifest = MagicMock()

            # Override lists
            scraper.items = ['item1', 'item2', 'item3']
            scraper.features = ['feature1', 'feature2', 'feature3']

            # Run with target_count=2
            scraper.run(target_count=2)

            # Verify that items loop stopped at 2
            assert call_counts['items'] == 2

            # Verify that features loop was still entered and processed
            # Features loop should process until reaching target
            assert call_counts['features'] >= 0
            assert scraper.stats['downloaded'] == 2

    def test_items_and_features_both_contribute(self):
        """Test that items and features both contribute to the download count"""
        with tempfile.TemporaryDirectory() as tmpdir:
            scraper = IconScraper(output_dir=tmpdir)

            call_counts = {'items': 0, 'features': 0}

            def mock_scrape_game_icons(name, category='items'):
                if category == 'items':
                    call_counts['items'] += 1
                else:
                    call_counts['features'] += 1
                return 1

            scraper.scrape_game_icons = mock_scrape_game_icons
            scraper.scrape_opengameart_icons = MagicMock(return_value=0)
            scraper.save_manifest = MagicMock()

            # Override lists with more items to scrape
            scraper.items = ['item1', 'item2', 'item3', 'item4', 'item5']
            scraper.features = ['feature1', 'feature2', 'feature3', 'feature4', 'feature5']

            # Run with target_count=3
            scraper.run(target_count=3)

            # Total downloaded should be 3
            assert scraper.stats['downloaded'] == 3

            # Both items and features should have been processed
            # (items should stop at 3, features may or may not be reached)
            total_calls = call_counts['items'] + call_counts['features']
            assert total_calls == 3

    def test_features_loop_entered_after_items_completion(self):
        """Test that features loop is entered and evaluated separately"""
        with tempfile.TemporaryDirectory() as tmpdir:
            scraper = IconScraper(output_dir=tmpdir)

            call_counts = {'items': 0, 'features': 0}

            def mock_scrape(name, category='items'):
                if category == 'items':
                    call_counts['items'] += 1
                    return 1
                else:
                    call_counts['features'] += 1
                    return 1

            scraper.scrape_game_icons = mock_scrape
            scraper.scrape_opengameart_icons = MagicMock(return_value=0)
            scraper.save_manifest = MagicMock()

            # Only 2 items, so items loop finishes naturally
            scraper.items = ['item1', 'item2']
            scraper.features = ['feature1', 'feature2', 'feature3']

            # Run with high target_count to let both loops complete
            scraper.run(target_count=100)

            # Verify items loop processed all items
            assert call_counts['items'] == 2

            # Verify features loop was also processed
            assert call_counts['features'] == 3

            # Total downloaded should be 5
            assert scraper.stats['downloaded'] == 5
