#!/usr/bin/env python3
"""
Cleanup duplicates, analyze theme, create scaling plan, and verify assets
"""

import os
import json
import hashlib
from pathlib import Path
from collections import defaultdict
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AssetAnalyzer:
    def __init__(self, assets_dir="downloaded_assets"):
        self.assets_dir = Path(assets_dir)
        self.duplicates = []
        self.asset_stats = defaultdict(list)
        self.theme_analysis = {}
        
    def get_file_hash(self, filepath):
        """Get MD5 hash of file"""
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def find_duplicates(self):
        """Find duplicate files"""
        logger.info("Finding duplicates...")
        file_hashes = {}
        duplicates = []
        
        for file_path in self.assets_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.png', '.jpg', '.svg']:
                try:
                    file_hash = self.get_file_hash(file_path)
                    if file_hash in file_hashes:
                        duplicates.append({
                            'original': file_hashes[file_hash],
                            'duplicate': str(file_path),
                            'hash': file_hash
                        })
                    else:
                        file_hashes[file_hash] = str(file_path)
                except Exception as e:
                    logger.error(f"Error hashing {file_path}: {e}")
        
        self.duplicates = duplicates
        logger.info(f"Found {len(duplicates)} duplicates")
        return duplicates
    
    def delete_duplicates(self):
        """Delete duplicate files"""
        deleted = 0
        for dup in self.duplicates:
            try:
                Path(dup['duplicate']).unlink()
                deleted += 1
            except Exception as e:
                logger.error(f"Error deleting {dup['duplicate']}: {e}")
        logger.info(f"Deleted {deleted} duplicate files")
        return deleted
    
    def analyze_asset_theme(self):
        """Analyze assets to identify theme"""
        logger.info("Analyzing asset theme...")
        
        color_palette = defaultdict(int)
        styles = defaultdict(int)
        sizes = defaultdict(int)
        
        for file_path in self.assets_dir.rglob("*.png"):
            if file_path.is_file():
                try:
                    with Image.open(file_path) as img:
                        # Get dominant colors
                        if img.mode == 'RGBA':
                            # Count non-transparent pixels
                            pixels = list(img.getdata())
                            for pixel in pixels[:1000]:  # Sample
                                if len(pixel) == 4 and pixel[3] > 0:
                                    color_palette[pixel[:3]] += 1
                        
                        # Analyze style
                        width, height = img.size
                        sizes[f"{width}x{height}"] += 1
                        
                        # Check if placeholder
                        if 'placeholder' in file_path.name.lower():
                            styles['placeholder'] += 1
                        elif 'sprite' in file_path.name.lower():
                            styles['sprite'] += 1
                        elif 'icon' in file_path.name.lower():
                            styles['icon'] += 1
                        else:
                            styles['other'] += 1
                            
                except Exception as e:
                    logger.debug(f"Error analyzing {file_path}: {e}")
        
        # Find dominant colors
        top_colors = sorted(color_palette.items(), key=lambda x: x[1], reverse=True)[:10]
        
        self.theme_analysis = {
            'dominant_colors': top_colors,
            'styles': dict(styles),
            'sizes': dict(sizes),
            'theme': self._determine_theme(top_colors, styles)
        }
        
        logger.info(f"Theme identified: {self.theme_analysis['theme']}")
        return self.theme_analysis
    
    def _determine_theme(self, colors, styles):
        """Determine theme from analysis"""
        # Check for low-poly style indicators
        if 'placeholder' in styles and styles['placeholder'] > 500:
            return "Low-poly placeholder (needs real assets)"
        
        # Check color palette
        color_names = []
        for color, count in colors[:5]:
            r, g, b = color
            if r > 200 and g > 200 and b > 200:
                color_names.append("light")
            elif r < 50 and g < 50 and b < 50:
                color_names.append("dark")
            elif r > g and r > b:
                color_names.append("warm")
            elif b > r and b > g:
                color_names.append("cool")
        
        if 'sprite' in styles and styles['sprite'] > 100:
            return "Sprite-based game assets"
        elif 'icon' in styles and styles['icon'] > 100:
            return "Icon-based UI assets"
        else:
            return "Mixed asset collection"
    
    def verify_assets(self, target_count=1000):
        """Verify we have the target number of usable assets"""
        logger.info(f"Verifying {target_count} assets...")
        
        valid_assets = []
        invalid_assets = []
        
        for file_path in self.assets_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in ['.png', '.jpg', '.svg']:
                try:
                    if file_path.suffix.lower() == '.svg':
                        valid_assets.append(str(file_path))
                    else:
                        with Image.open(file_path) as img:
                            width, height = img.size
                            # Check if valid image
                            if width > 0 and height > 0:
                                valid_assets.append(str(file_path))
                            else:
                                invalid_assets.append(str(file_path))
                except Exception as e:
                    invalid_assets.append(str(file_path))
                    logger.debug(f"Invalid asset {file_path}: {e}")
        
        result = {
            'total': len(valid_assets),
            'valid': len(valid_assets),
            'invalid': len(invalid_assets),
            'target': target_count,
            'meets_target': len(valid_assets) >= target_count
        }
        
        logger.info(f"Valid assets: {result['valid']}/{result['target']}")
        return result
    
    def create_scaling_plan(self):
        """Create plan for scaling assets without distortion"""
        logger.info("Creating scaling plan...")
        
        scaling_rules = {
            'characters': {
                'target_size': (128, 128),
                'method': 'contain',  # Maintain aspect ratio
                'background': 'transparent',
                'position': 'center bottom'
            },
            'icons': {
                'target_size': (64, 64),
                'method': 'contain',
                'background': 'transparent',
                'position': 'center center'
            },
            'map_assets': {
                'target_size': (128, 128),
                'method': 'cover',  # Fill space, may crop
                'background': 'transparent',
                'position': 'center center'
            },
            'vehicles': {
                'target_size': (128, 128),
                'method': 'contain',
                'background': 'transparent',
                'position': 'center bottom'
            },
            'ui_elements': {
                'target_size': (128, 128),
                'method': 'contain',
                'background': 'transparent',
                'position': 'center center'
            },
            'particles': {
                'target_size': (32, 32),
                'method': 'contain',
                'background': 'transparent',
                'position': 'center center'
            },
            'backgrounds': {
                'target_size': (1920, 1080),
                'method': 'cover',
                'background': 'solid',
                'position': 'center center'
            }
        }
        
        return scaling_rules

def main():
    analyzer = AssetAnalyzer()
    
    # Step 1: Find and delete duplicates
    duplicates = analyzer.find_duplicates()
    if duplicates:
        deleted = analyzer.delete_duplicates()
        logger.info(f"Deleted {deleted} duplicates")
    
    # Step 2: Analyze theme
    theme = analyzer.analyze_asset_theme()
    
    # Step 3: Verify assets
    verification = analyzer.verify_assets(1000)
    
    # Step 4: Create scaling plan
    scaling_plan = analyzer.create_scaling_plan()
    
    # Save results
    results = {
        'duplicates_found': len(duplicates),
        'duplicates_deleted': len(duplicates),
        'theme_analysis': theme,
        'verification': verification,
        'scaling_plan': scaling_plan
    }
    
    with open('asset_analysis_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info("Analysis complete! Results saved to asset_analysis_results.json")
    return results

if __name__ == "__main__":
    main()

