import time
from unittest.mock import patch
import pytest

class ScraperMapAssets:
    def __init__(self):
        self.stats = {'downloaded': 0, 'total': 0}

    def run(self, target_count):
        item_types = ['trees', 'roads', 'fences', 'buildings', 'signs', 'decor', 'props', 'misc']
        for item_type in item_types:
            count = self.scrape_item_type(item_type)
            self.stats['downloaded'] += count
            self.stats['total'] += count
            if self.stats['downloaded'] >= target_count:
                break
        self.save_manifest()

    def scrape_item_type(self, item_type):
        # Placeholder for actual scraping logic
        return 10  # Simulate downloading 10 items per type

    def save_manifest(self):
        # Placeholder for saving manifest logic
        pass

@patch('scraper_map_assets.ScraperMapAssets.scrape_item_type', return_value=5)
@patch('time.sleep')
def test_run(mock_scrape, mock_sleep):
    scraper = ScraperMapAssets()
    scraper.run(target_count=15)

    assert scraper.stats['downloaded'] == 15
    assert scraper.stats['total'] == 15
    assert scraper.stats['downloaded'] == scraper.stats['total']

@patch('scraper_map_assets.ScraperMapAssets.scrape_item_type', return_value=5)
@patch('time.sleep')
def test_run_early_exit(mock_scrape, mock_sleep):
    scraper = ScraperMapAssets()
    scraper.run(target_count=20)

    assert scraper.stats['downloaded'] == 20
    assert scraper.stats['total'] == 20
    assert scraper.stats['downloaded'] == scraper.stats['total']

@patch('scraper_map_assets.ScraperMapAssets.scrape_item_type', return_value=5)
@patch('time.sleep')
def test_save_manifest_called_once(mock_scrape, mock_sleep):
    scraper = ScraperMapAssets()
    scraper.run(target_count=10)

    scraper.save_manifest.assert_called_once()

if __name__ == '__main__':
    pytest.main()