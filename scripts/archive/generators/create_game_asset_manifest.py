#!/usr/bin/env python3
"""
Create game-ready asset manifest
Organizes assets for game integration with proper paths and sizes
"""

import json
from pathlib import Path
from PIL import Image
import logging
import os
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GameAssetManifestCreator:
    def __init__(self, assets_dir="downloaded_assets", generated_dir="assets"):
        self.assets_dir = Path(assets_dir)
        self.generated_dir = Path(generated_dir)
        self.manifest = {
            'characters': {},
            'backdrops': {},
            'map_assets': {},
            'icons': {
                'items': {},
                'features': {}
            },
            'vehicles': {},
            'ui_elements': {},
            'particles': {}
        }
        
    def get_asset_info(self, asset_path):
        """Get asset information"""
        try:
            with Image.open(asset_path) as img:
                return {
                    'width': img.size[0],
                    'height': img.size[1],
                    'mode': img.mode,
                    'has_alpha': img.mode in ('RGBA', 'LA')
                }
        except:
            return None
    
    def scan_characters(self):
        """Scan character sprites"""
        char_dir = self.assets_dir / 'characters' / 'sprites'
        if not char_dir.exists():
            return
        
        # Get Low-poly characters (prioritize generated ones)
        assets = list(char_dir.glob("generated_low_poly_*.png")) + \
                 [a for a in char_dir.glob("*.png") if 'lowpoly' in a.name.lower() or 'low_poly' in a.name.lower()]
        
        # Limit to 1000 best assets
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
        """Scan location backdrops"""
        # Use generated backdrops
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
        """Scan map assets"""
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
        """Scan icons"""
        # Items
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
        
        # Features
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
        """Scan vehicles"""
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
        """Scan UI elements"""
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
        """Scan particles"""
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
        """Generate game asset manifest"""
        logger.info("Generating game asset manifest...")
        
        self.scan_characters()
        self.scan_backdrops()
        self.scan_map_assets()
        self.scan_icons()
        self.scan_vehicles()
        self.scan_ui_elements()
        self.scan_particles()
        
        # Calculate totals
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
        
        # Save manifest
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

