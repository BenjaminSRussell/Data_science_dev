"""
Tests for scraper_ui_elements.py search-string construction.

This test ensures that all UI elements in the scraper's element list
are correctly used in search-term construction without formatting issues.

These tests call the real UIElementScraper and generate_search_patterns()
from scripts/scrapers/scraper_ui_elements.py to ensure that if the element
list or search patterns change in production, this test immediately fails.
"""

from scripts.scrapers.scraper_ui_elements import UIElementScraper, generate_search_patterns


class TestUIElementScraperSearchTerms:
    """Test search-term construction for UI element scraping."""

    def setup_method(self):
        """Set up test fixtures using the REAL scraper module."""
        # Import the actual UIElementScraper class and instantiate it to get the real element list
        self.scraper = UIElementScraper()
        self.ui_elements = self.scraper.ui_elements

    def test_ui_elements_list_not_empty_and_correct_count(self):
        """Verify that the UI elements list exists and contains the expected count."""
        assert len(self.ui_elements) > 0, "UI elements list should not be empty"
        # As per issue #625, expect 30 entries
        assert len(self.ui_elements) == 30, (
            f"Expected 30 UI elements in UIElementScraper.ui_elements, "
            f"got {len(self.ui_elements)}"
        )

    def test_all_ui_elements_produce_search_patterns(self):
        """
        Test that every real UI element generates valid search patterns.

        This test uses the real generate_search_patterns() function to ensure
        the patterns match what scrape_opengameart_ui() actually uses. It verifies:
        - Each element generates exactly 4 search patterns
        - The element name appears verbatim in each pattern
        - No leading/trailing whitespace in any pattern
        - No adjacent double-spaces in any pattern
        """
        for element in self.ui_elements:
            # Call the real generate_search_patterns function (not a duplicate)
            patterns = generate_search_patterns(element)

            # Verify we get the expected number of patterns
            assert len(patterns) == 4, (
                f"Element '{element}' should generate exactly 4 search patterns, "
                f"got {len(patterns)}: {patterns}"
            )

            # Validate each pattern
            for pattern in patterns:
                # Element must appear verbatim (not changed by case, spacing, etc.)
                assert element in pattern, (
                    f"Element '{element}' should appear verbatim in pattern '{pattern}'"
                )

                # No leading/trailing whitespace
                assert pattern == pattern.strip(), (
                    f"Pattern '{pattern}' for element '{element}' has leading/trailing whitespace"
                )

                # No double-spaces
                assert "  " not in pattern, (
                    f"Pattern '{pattern}' for element '{element}' contains double-spaces"
                )

    def test_single_character_element_x_is_included(self):
        """
        Verify that the single-character entry 'x' is in the UI elements.

        Document that 'x' produces generic search patterns that may return
        irrelevant results. This serves as a TODO for future improvement.

        TODO: Consider improving search queries for single-character elements like 'x'
        to produce more relevant results (e.g., 'x-button' or 'close-x').
        """
        assert 'x' in self.ui_elements, (
            "Element 'x' should be in UIElementScraper.ui_elements per issue #625"
        )

        # Verify 'x' generates the expected patterns
        x_patterns = generate_search_patterns('x')
        expected_x_patterns = [
            "low poly x ui",
            "lowpoly x",
            "3d x icon",
            "polygonal x"
        ]

        assert x_patterns == expected_x_patterns, (
            f"Search patterns for 'x' don't match expected values. "
            f"Got: {x_patterns}, Expected: {expected_x_patterns}"
        )

    def test_search_patterns_structure_is_consistent(self):
        """
        Verify that generate_search_patterns() always returns consistent structure.

        This test ensures the function maintains its contract: always returns
        a list of exactly 4 string patterns in the same order.
        """
        # Test a few representative elements
        test_elements = ['button', 'x', 'shield']

        for element in test_elements:
            patterns = generate_search_patterns(element)

            # Must be a list
            assert isinstance(patterns, list), (
                f"generate_search_patterns('{element}') should return a list, "
                f"got {type(patterns)}"
            )

            # Must have exactly 4 patterns
            assert len(patterns) == 4, (
                f"generate_search_patterns('{element}') should return 4 patterns, "
                f"got {len(patterns)}"
            )

            # Each must be a string
            for i, pattern in enumerate(patterns):
                assert isinstance(pattern, str), (
                    f"Pattern {i} for '{element}' should be a string, "
                    f"got {type(pattern)}: {pattern}"
                )
