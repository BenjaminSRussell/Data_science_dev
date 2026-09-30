#!/usr/bin/env python3
"""
Generate master asset manifest
Comprehensive inventory of all assets with metadata
"""

import json
from pathlib import Path
from PIL import Image
import logging
import os
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MasterManifestGenerator:
    def __init__(self, assets_dir="downloaded_assets", generated_dir="assets"):
        self.assets_dir = Path(assets_dir)
        self.generated_dir = Path(generated_dir)
        self.manifest = {
            'version': '1.0',
            'total_assets': 0,
            'by_category': {},
            'by_style': defaultdict(int),
            'assets': []
        }
        
    def analyze_asset(self, asset_path):
        """Analyze single asset"""
        try:
            with Image.open(asset_path) as img:
                width, height = img.size
                mode = img.mode
                has_alpha = mode == 'RGBA' or mode == 'LA'
                file_size = os.path.getsize(asset_path)
                
                return {
                    'size': f"{width}x{height}",
                    'width': width,
                    'height': height,
                    'mode': mode,
                    'has_alpha': has_alpha,
                    'file_size': file_size,
                    'file_size_kb': round(file_size / 1024, 2)
                }
        except Exception as e:
            logger.debug(f"Error analyzing {asset_path}: {e}")
            return None
    
    def categorize_asset(self, asset_path):
        """Determine asset category"""
        path_str = str(asset_path).lower()
        
        if 'character' in path_str or 'sprite' in path_str:
            return 'characters'
        elif 'backdrop' in path_str or 'background' in path_str or 'location' in path_str:
            return 'backdrops'
        elif 'map' in path_str:
            return 'map_assets'
        elif 'icon' in path_str:
            if 'feature' in path_str:
                return 'icons_features'
            else:
                return 'icons_items'
        elif 'vehicle' in path_str:
            return 'vehicles'
        elif 'ui' in path_str or 'element' in path_str:
            return 'ui_elements'
        elif 'particle' in path_str or 'effect' in path_str:
            return 'particles'
        else:
            return 'other'
    
    def determine_style(self, asset_path, analysis):
        """Determine asset style"""
        if not analysis:
            return 'unknown'
        
        name_lower = asset_path.name.lower()
        
        # Check filename
        if any(term in name_lower for term in ['lowpoly', 'low_poly', 'low-poly', 'generated_low_poly']):
            return 'low_poly'
        elif any(term in name_lower for term in ['pixel', '8bit', '16bit']):
            return 'pixel_art'
        elif any(term in name_lower for term in ['realistic', 'photo']):
            return 'realistic'
        elif 'placeholder' in name_lower:
            return 'placeholder'
        else:
            # Heuristic based on analysis
            if analysis['width'] < 256 and analysis['height'] < 256:
                return 'pixel_art'
            elif analysis['width'] > 512 or analysis['height'] > 512:
                return 'realistic'
            else:
                return 'low_poly'
    
    def scan_directory(self, directory):
        """Scan directory for assets"""
        directory = Path(directory)
        if not directory.exists():
            return
        
        assets = list(directory.rglob("*.png")) + list(directory.rglob("*.jpg")) + list(directory.rglob("*.svg"))
        
        logger.info(f"Scanning {directory}: {len(assets)} assets found")
        
        for asset in assets:
            analysis = self.analyze_asset(asset)
            if not analysis:
                continue
            
            category = self.categorize_asset(asset)
            style = self.determine_style(asset, analysis)
            
            asset_info = {
                'path': str(asset),
                'name': asset.name,
                'category': category,
                'style': style,
                'size': analysis['size'],
                'width': analysis['width'],
                'height': analysis['height'],
                'has_alpha': analysis['has_alpha'],
                'file_size_kb': analysis['file_size_kb']
            }
            
            self.manifest['assets'].append(asset_info)
            self.manifest['by_category'][category] = self.manifest['by_category'].get(category, 0) + 1
            self.manifest['by_style'][style] += 1
            self.manifest['total_assets'] += 1
    
    def generate(self):
        """Generate master manifest"""
        logger.info("Generating master asset manifest...")
        
        # Scan downloaded assets
        self.scan_directory(self.assets_dir)
        
        # Scan generated assets (backdrops)
        if self.generated_dir.exists():
            self.scan_directory(self.generated_dir / 'backgrounds')
        
        # Calculate statistics
        self.manifest['statistics'] = {
            'total_assets': self.manifest['total_assets'],
            'categories': len(self.manifest['by_category']),
            'styles': dict(self.manifest['by_style']),
            'average_file_size_kb': sum(a['file_size_kb'] for a in self.manifest['assets']) / len(self.manifest['assets']) if self.manifest['assets'] else 0
        }
        
        # Save manifest
        output_file = 'master_asset_manifest.json'
        with open(output_file, 'w') as f:
            json.dump(self.manifest, f, indent=2)
        
        logger.info(f"Master manifest saved to {output_file}")
        logger.info(f"Total assets: {self.manifest['total_assets']}")
        logger.info(f"Categories: {len(self.manifest['by_category'])}")
        
        # Print summary
        print("\n" + "="*60)
        print("MASTER MANIFEST SUMMARY")
        print("="*60)
        print(f"Total Assets: {self.manifest['total_assets']}")
        print(f"\nBy Category:")
        for category, count in sorted(self.manifest['by_category'].items()):
            print(f"  {category}: {count}")
        print(f"\nBy Style:")
        for style, count in sorted(self.manifest['by_style'].items()):
            print(f"  {style}: {count}")
        print("="*60)
        
        return self.manifest

if __name__ == "__main__":
    generator = MasterManifestGenerator()
    generator.generate()

