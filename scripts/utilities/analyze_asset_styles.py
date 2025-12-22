#!/usr/bin/env python3
"""
Analyze assets to identify and differentiate styles
"""

import json
from pathlib import Path
from collections import defaultdict
from PIL import Image
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StyleAnalyzer:
    def __init__(self, assets_dir="downloaded_assets"):
        self.assets_dir = Path(assets_dir)
        self.styles = defaultdict(list)
        
    def analyze_style(self, filepath):
        """Analyze individual asset style"""
        style_features = {
            'name': filepath.name,
            'path': str(filepath),
            'category': self._get_category(filepath),
            'is_placeholder': 'placeholder' in filepath.name.lower(),
            'color_count': 0,
            'has_transparency': False,
            'complexity': 'simple'
        }
        
        try:
            if filepath.suffix.lower() == '.png':
                with Image.open(filepath) as img:
                    width, height = img.size
                    style_features['size'] = f"{width}x{height}"
                    style_features['aspect_ratio'] = width / height if height > 0 else 1
                    
                    if img.mode == 'RGBA':
                        style_features['has_transparency'] = True
                        # Count unique colors (sample)
                        pixels = list(img.getdata())[:1000]
                        unique_colors = len(set(p for p in pixels if len(p) == 4 and p[3] > 0))
                        style_features['color_count'] = unique_colors
                    else:
                        pixels = list(img.getdata())[:1000]
                        unique_colors = len(set(pixels))
                        style_features['color_count'] = unique_colors
                    
                    # Determine complexity
                    if style_features['color_count'] < 5:
                        style_features['complexity'] = 'minimal'
                    elif style_features['color_count'] < 20:
                        style_features['complexity'] = 'simple'
                    elif style_features['color_count'] < 100:
                        style_features['complexity'] = 'moderate'
                    else:
                        style_features['complexity'] = 'complex'
        except Exception as e:
            logger.debug(f"Error analyzing {filepath}: {e}")
        
        return style_features
    
    def _get_category(self, filepath):
        """Get asset category from path"""
        path_str = str(filepath)
        if 'character' in path_str:
            return 'character'
        elif 'icon' in path_str:
            return 'icon'
        elif 'map' in path_str:
            return 'map'
        elif 'vehicle' in path_str:
            return 'vehicle'
        elif 'ui' in path_str:
            return 'ui'
        elif 'effect' in path_str or 'particle' in path_str:
            return 'effect'
        elif 'background' in path_str:
            return 'background'
        else:
            return 'other'
    
    def identify_styles(self):
        """Identify different styles in asset collection"""
        logger.info("Analyzing asset styles...")
        
        all_styles = []
        style_groups = defaultdict(list)
        
        for filepath in self.assets_dir.rglob("*.png"):
            if filepath.is_file():
                style = self.analyze_style(filepath)
                all_styles.append(style)
                
                # Group by style characteristics
                style_key = f"{style['category']}_{style['complexity']}_{style['is_placeholder']}"
                style_groups[style_key].append(style)
        
        # Identify distinct styles
        distinct_styles = {}
        for key, assets in style_groups.items():
            if len(assets) > 10:  # Only consider styles with significant presence
                distinct_styles[key] = {
                    'count': len(assets),
                    'sample': assets[0],
                    'characteristics': {
                        'category': assets[0]['category'],
                        'complexity': assets[0]['complexity'],
                        'is_placeholder': assets[0]['is_placeholder']
                    }
                }
        
        return {
            'total_assets': len(all_styles),
            'distinct_styles': distinct_styles,
            'style_groups': dict(style_groups)
        }
    
    def create_style_differentiation_plan(self, style_analysis):
        """Create plan to differentiate styles"""
        plan = {
            'recommendations': [],
            'style_mapping': {}
        }
        
        # Analyze what we have
        placeholders = sum(1 for s in style_analysis['distinct_styles'].values() 
                          if s['characteristics']['is_placeholder'])
        real_assets = style_analysis['total_assets'] - placeholders
        
        plan['recommendations'].append(
            f"Found {real_assets} real assets and {placeholders} placeholders"
        )
        
        # Recommend style consistency
        categories = set(s['characteristics']['category'] 
                        for s in style_analysis['distinct_styles'].values())
        
        for category in categories:
            plan['recommendations'].append(
                f"Category '{category}' needs consistent style across all assets"
            )
        
        # Create style mapping for game use
        for style_key, style_data in style_analysis['distinct_styles'].items():
            plan['style_mapping'][style_key] = {
                'use_for': style_data['characteristics']['category'],
                'priority': 'high' if not style_data['characteristics']['is_placeholder'] else 'low',
                'needs_replacement': style_data['characteristics']['is_placeholder']
            }
        
        return plan

def main():
    analyzer = StyleAnalyzer()
    analysis = analyzer.identify_styles()
    plan = analyzer.create_style_differentiation_plan(analysis)
    
    results = {
        'style_analysis': analysis,
        'differentiation_plan': plan
    }
    
    with open('asset_style_analysis.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Found {len(analysis['distinct_styles'])} distinct styles")
    logger.info("Style analysis saved to asset_style_analysis.json")
    
    return results

if __name__ == "__main__":
    main()

