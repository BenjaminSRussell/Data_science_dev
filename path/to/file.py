import pytest
from unittest.mock import patch, MagicMock

# Mocking the scraper_particles module
from scraper_particles import ParticleScraper

def test_early_exit_loop_and_forced_square_resize():
    # Mock the scraping method and time.sleep
    with patch.object(ParticleScraper, '_scrape_particle_type', return_value=None) as mock_scrape, \
         patch('time.sleep', return_value=None) as mock_sleep:
        
        # Initialize the scraper with a target count
        scraper = ParticleScraper(target_count=3)
        
        # Mock the list of particle types
        scraper.particle_types = ['type1', 'type2', 'type3', 'type4']
        
        # Run the scraper
        scraper.run()
        
        # Assert that the loop breaks early
        assert mock_scrape.call_count == 3
        
        # Assert that stats are updated correctly
        assert scraper.stats['total'] == 4
        assert scraper.stats['downloaded'] == 3
        
        # Assert that save_manifest is called exactly once
        scraper.save_manifest.assert_called_once()

# Mocking the PIL module
from PIL import Image

def test_forced_square_resize():
    # Mock the Image.open method
    with patch.object(Image, 'open', return_value=MagicMock(spec=Image.Image)) as mock_open:
        
        # Create an instance of ParticleScraper
        scraper = ParticleScraper()
        
        # Mock the image path
        image_path = 'path/to/image.png'
        
        # Mock the image mode
        mock_image = mock_open.return_value
        mock_image.mode = 'RGB'
        
        # Call the resize helper
        scraper._resize_image(image_path)
        
        # Assert that the image is converted to RGBA
        mock_image.convert.assert_called_once_with('RGBA')
        
        # Mock the image mode to be already RGBA
        mock_image.mode = 'RGBA'
        
        # Call the resize helper again
        scraper._resize_image(image_path)
        
        # Assert that the image is not converted to RGBA again
        assert mock_image.convert.call_count == 1