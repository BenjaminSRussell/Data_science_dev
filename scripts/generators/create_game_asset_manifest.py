import os
import json
from pathlib import Path
from PIL import Image
import logging
import pytest
from unittest.mock import mock_open, patch

logger = logging.getLogger(__name__)

class GameAssetManifestCreator:
    def __init__(self, assets_dir='assets', generated_dir='generated'):
        self.assets_dir = Path(assets_dir)
        self.generated_dir = Path(generated_dir)
        self.manifest = {
            'characters': {},
            'backdrops': {},
            'map_assets': {},
            'icons': {'items': {}, 'features': {}},
            'vehicles': {},
            'ui_elements': {},
            'particles': {}
        }
    
    def get_asset_info(self, asset):
        try:
            with Image.open(asset) as img:
                width, height = img.size
                mode = img.mode
                has_alpha = mode in ('RGBA', 'LA')
                return {
                    'width': width,
                    'height': height,
                    'has_alpha': has_alpha
                }
        except OSError:
            logger.error(f"Failed to open asset: {asset}")
            return None
    
    def scan_characters(self):
        character_dir = self.assets_dir / 'characters' / 'sprites'
        if not character_dir.exists():
            return
        
        assets = list(character_dir.glob("generated_low_poly_*.png")) + \
                 [a for a in character_dir.glob("*.png") if 'lowpoly' in a.name.lower() or 'low_poly' in a.name.lower()]
        
        assets = assets[:1000]
        
        for i, asset in enumerate(assets):
            info = self.get_asset_info(asset)
            if info:
                self.manifest['characters'][f'character_{i:04d}'] = {
                    'path': f'/downloaded_assets/characters/sprites/{asset.name}',
                    'width': info['width'],
                    'height': info['height'],
                    'has_alpha': info['has_alpha']
                }
        
        logger.info(f"Added {len(assets)} character sprites")
    
    def scan_backdrops(self):
        backdrop_dir = self.generated_dir / 'backgrounds' / 'locations'
        if not backdrop_dir.exists():
            return
        
        locations = {}
        for location_dir in backdrop_dir.iterdir():
            if location_dir.is_dir():
                location_name = location_dir.name
                backdrops = list(location_dir.glob("*.png"))
                
                locations[location_name] = []
                for backdrop in backdrops:
                    info = self.get_asset_info(backdrop)
                    if info:
                        locations[location_name].append({
                            'path': f'/assets/backgrounds/locations/{location_name}/{backdrop.name}',
                            'width': info['width'],
                            'height': info['height']
                        })
        
        self.manifest['backdrops'] = locations
        logger.info(f"Added backdrops for {len(locations)} locations")
    
    def scan_map_assets(self):
        map_dir = self.assets_dir / 'map' / 'assets'
        if not map_dir.exists():
            return
        
        assets = list(map_dir.glob("*.png"))[:500]
        
        for i, asset in enumerate(assets):
            info = self.get_asset_info(asset)
            if info:
                asset_name = asset.stem
                self.manifest['map_assets'][asset_name] = {
                    'path': f'/downloaded_assets/map/assets/{asset.name}',
                    'width': info['width'],
                    'height': info['height'],
                    'has_alpha': info['has_alpha']
                }
        
        logger.info(f"Added {len(assets)} map assets")
    
    def scan_icons(self):
        items_dir = self.assets_dir / 'icons' / 'items'
        if items_dir.exists():
            assets = list(items_dir.glob("*.png")) + list(items_dir.glob("*.svg"))
            for i, asset in enumerate(assets[:250]):
                info = self.get_asset_info(asset) if asset.suffix == '.png' else {'width': 64, 'height': 64}
                self.manifest['icons']['items'][f'item_{i:04d}'] = {
                    'path': f'/downloaded_assets/icons/items/{asset.name}',
                    'width': info.get('width', 64),
                    'height': info.get('height', 64)
                }
        
        features_dir = self.assets_dir / 'icons' / 'features'
        if features_dir.exists():
            assets = list(features_dir.glob("*.png")) + list(features_dir.glob("*.svg"))
            for i, asset in enumerate(assets[:250]):
                info = self.get_asset_info(asset) if asset.suffix == '.png' else {'width': 64, 'height': 64}
                self.manifest['icons']['features'][f'feature_{i:04d}'] = {
                    'path': f'/downloaded_assets/icons/features/{asset.name}',
                    'width': info.get('width', 64),
                    'height': info.get('height', 64)
                }
        
        logger.info(f"Added {len(self.manifest['icons']['items'])} item icons and {len(self.manifest['icons']['features'])} feature icons")
    
    def scan_vehicles(self):
        vehicle_dir = self.assets_dir / 'vehicles' / 'sprites'
        if not vehicle_dir.exists():
            return
        
        assets = list(vehicle_dir.glob("*.png"))[:300]
        for i, asset in enumerate(assets):
            info = self.get_asset_info(asset)
            if info:
                self.manifest['vehicles'][f'vehicle_{i:04d}'] = {
                    'path': f'/downloaded_assets/vehicles/sprites/{asset.name}',
                    'width': info['width'],
                    'height': info['height'],
                    'has_alpha': info['has_alpha']
                }
        
        logger.info(f"Added {len(assets)} vehicles")
    
    def scan_ui_elements(self):
        ui_dir = self.assets_dir / 'ui' / 'elements'
        if not ui_dir.exists():
            return
        
        assets = list(ui_dir.glob("generated_low_poly_*.png")) + \
                 [a for a in ui_dir.glob("*.png") if 'lowpoly' in a.name.lower()]
        assets = assets[:300]
        
        for i, asset in enumerate(assets):
            info = self.get_asset_info(asset)
            if info:
                self.manifest['ui_elements'][f'ui_{i:04d}'] = {
                    'path': f'/downloaded_assets/ui/elements/{asset.name}',
                    'width': info['width'],
                    'height': info['height'],
                    'has_alpha': info['has_alpha']
                }
        
        logger.info(f"Added {len(assets)} UI elements")
    
    def scan_particles(self):
        particle_dir = self.assets_dir / 'effects' / 'particles'
        if not particle_dir.exists():
            return
        
        assets = list(particle_dir.glob("generated_low_poly_*.png")) + \
                 [a for a in particle_dir.glob("*.png") if 'lowpoly' in a.name.lower()]
        assets = assets[:200]
        
        for i, asset in enumerate(assets):
            info = self.get_asset_info(asset)
            if info:
                self.manifest['particles'][f'particle_{i:04d}'] = {
                    'path': f'/downloaded_assets/effects/particles/{asset.name}',
                    'width': info['width'],
                    'height': info['height'],
                    'has_alpha': info['has_alpha']
                }
        
        logger.info(f"Added {len(assets)} particles")
    
    def generate(self):
        logger.info("Generating game asset manifest...")
        
        self.scan_characters()
        self.scan_backdrops()
        self.scan_map_assets()
        self.scan_icons()
        self.scan_vehicles()
        self.scan_ui_elements()
        self.scan_particles()
        
        totals = {
            'characters': len(self.manifest['characters']),
            'backdrops': sum(len(v) for v in self.manifest['backdrops'].values()),
            'map_assets': len(self.manifest['map_assets']),
            'icons_items': len(self.manifest['icons']['items']),
            'icons_features': len(self.manifest['icons']['features']),
            'vehicles': len(self.manifest['vehicles']),
            'ui_elements': len(self.manifest['ui_elements']),
            'particles': len(self.manifest['particles'])
        }
        
        self.manifest['_meta'] = {
            'version': '1.0',
            'total_assets': sum(totals.values()),
            'totals': totals
        }
        
        output_file = 'game_asset_manifest.json'
        with open(output_file, 'w') as f:
            json.dump(self.manifest, f, indent=2)
        
        logger.info(f"\nGame manifest saved to {output_file}")
        logger.info(f"Total assets: {sum(totals.values())}")
        for category, count in totals.items():
            logger.info(f"  {category}: {count}")
        
        return self.manifest

if __name__ == "__main__":
    creator = GameAssetManifestCreator()
    creator.generate()

# ===TESTS===

@pytest.fixture
def mock_image_open(monkeypatch):
    def mock_open_func(*args, **kwargs):
        class MockImage:
            def __init__(self, size, mode):
                self.size = size
                self.mode = mode
            
            def __enter__(self):
                return self
            
            def __exit__(self, *args):
                pass
        
        return MockImage
    
    monkeypatch.setattr(Image, 'open', mock_open_func)

def test_get_asset_info(mock_image_open):
    creator = GameAssetManifestCreator()
    
    # Test with RGBA mode
    with patch.object(Image, 'open', return_value=mock_open(size=(100, 200), mode='RGBA')):
        info = creator.get_asset_info('test.png')
        assert info == {'width': 100, 'height': 200, 'has_alpha': True}
    
    # Test with LA mode
    with patch.object(Image, 'open', return_value=mock_open(size=(150, 300), mode='LA')):
        info = creator.get_asset_info('test.png')
        assert info == {'width': 150, 'height': 300, 'has_alpha': True}
    
    # Test with RGB mode
    with patch.object(Image, 'open', return_value=mock_open(size=(200, 400), mode='RGB')):
        info = creator.get_asset_info('test.png')
        assert info == {'width': 200, 'height': 400, 'has_alpha': False}
    
    # Test with OSError
    with patch.object(Image, 'open', side_effect=OSError):
        info = creator.get_asset_info('test.png')
        assert info is None