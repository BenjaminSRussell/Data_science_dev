import random
from pathlib import Path
from unittest.mock import patch

class ThemedBackdropGenerator:
    def __init__(self, theme, color_palettes):
        self.theme = theme
        self.color_palettes = color_palettes

    def generate_low_poly_backdrop(self, location):
        # Palette fallback
        color = self.color_palettes[self.theme].get(location, self.color_palettes[self.theme]['default'])
        
        # Color-jitter clamping
        color = tuple(min(255, max(0, c + random.randint(-30, 30))) for c in color)
        
        return color

    def generate_all_backdrops(self, base_dir):
        total_backdrops = 0
        for location in self.color_palettes[self.theme]:
            location_dir = base_dir / location
            if location_dir.exists():
                total_backdrops += len(list(location_dir.glob('*.png')))
        return total_backdrops

# Test cases
def test_palette_selection():
    color_palettes = {
        'default': {'default': (255, 255, 255)},
        'test_theme': {
            'default': (200, 200, 200),
            'gym': (150, 150, 150)
        }
    }
    generator = ThemedBackdropGenerator('test_theme', color_palettes)
    
    # Known location
    assert generator.generate_low_poly_backdrop('gym') == (150, 150, 150)
    
    # Unknown location
    assert generator.generate_low_poly_backdrop('unknown') == (200, 200, 200)

def test_color_jitter_clamping():
    color_palettes = {
        'default': {'default': (255, 255, 255)},
        'test_theme': {
            'default': (255, 255, 255)
        }
    }
    generator = ThemedBackdropGenerator('test_theme', color_palettes)
    
    # Test color-jitter clamping at boundaries
    with patch('random.randint', side_effect=[30, -30, 0]):
        assert generator.generate_low_poly_backdrop('default') == (255, 255, 255)
        assert generator.generate_low_poly_backdrop('default') == (0, 0, 0)
        assert generator.generate_low_poly_backdrop('default') == (255, 255, 255)

def test_generate_all_backdrops():
    color_palettes = {
        'default': {'default': (255, 255, 255)},
        'test_theme': {
            'default': (255, 255, 255),
            'gym': (255, 255, 255),
            'forest': (255, 255, 255)
        }
    }
    generator = ThemedBackdropGenerator('test_theme', color_palettes)
    
    # Mock directory listing
    base_dir = Path('/mock/base/dir')
    with patch('pathlib.Path.exists', return_value=True), \
         patch('pathlib.Path.glob', side_effect=[
             [Path('gym/backdrop1.png'), Path('gym/backdrop2.png')],
             [Path('forest/backdrop1.png')]
         ]):
        assert generator.generate_all_backdrops(base_dir) == 3
    
    # Directory doesn't exist
    with patch('pathlib.Path.exists', return_value=False):
        assert generator.generate_all_backdrops(base_dir) == 0