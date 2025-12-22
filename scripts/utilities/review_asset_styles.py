#!/usr/bin/env python3
"""
Review all assets and make style decisions
Analyzes each asset category and determines best style
"""

import json
from pathlib import Path
from PIL import Image
import logging
from collections import defaultdict
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AssetStyleReviewer:
    def __init__(self, assets_dir="downloaded_assets"):
        self.assets_dir = Path(assets_dir)
        self.reviews = {}
        self.style_decisions = {}
        
    def analyze_image_style(self, image_path):
        """Analyze style characteristics of an image"""
        try:
            with Image.open(image_path) as img:
                width, height = img.size
                mode = img.mode
                has_alpha = mode == 'RGBA' or mode == 'LA'
                
                # Sample pixels to determine style
                pixels = list(img.getdata())[:1000] if img.size[0] * img.size[1] > 1000 else list(img.getdata())
                
                # Count unique colors
                if has_alpha:
                    unique_colors = len(set(p for p in pixels if len(p) >= 3 and (len(p) == 3 or p[3] > 0)))
                else:
                    unique_colors = len(set(pixels))
                
                # Determine complexity
                if unique_colors < 10:
                    complexity = 'minimal'
                elif unique_colors < 50:
                    complexity = 'simple'
                elif unique_colors < 200:
                    complexity = 'moderate'
                else:
                    complexity = 'complex'
                
                # Check if it's pixel art (low resolution with few colors)
                is_pixel_art = (width < 256 and height < 256 and unique_colors < 50)
                
                # Check if it's low-poly (smooth gradients, moderate colors)
                is_low_poly = (unique_colors > 20 and unique_colors < 200 and not is_pixel_art)
                
                # Check if it's realistic (many colors, high resolution)
                is_realistic = (unique_colors > 200 or (width > 512 and height > 512))
                
                return {
                    'size': f"{width}x{height}",
                    'mode': mode,
                    'has_alpha': has_alpha,
                    'unique_colors': unique_colors,
                    'complexity': complexity,
                    'is_pixel_art': is_pixel_art,
                    'is_low_poly': is_low_poly,
                    'is_realistic': is_realistic,
                    'file_size': os.path.getsize(image_path)
                }
        except Exception as e:
            logger.debug(f"Error analyzing {image_path}: {e}")
            return None
    
    def review_category(self, category_path, category_name):
        """Review all assets in a category"""
        logger.info(f"Reviewing category: {category_name}")
        
        category_path = Path(category_path)
        if not category_path.exists():
            logger.warning(f"Category path does not exist: {category_path}")
            return None
        
        assets = list(category_path.rglob("*.png")) + list(category_path.rglob("*.jpg")) + list(category_path.rglob("*.svg"))
        
        if not assets:
            logger.warning(f"No assets found in {category_path}")
            return None
        
        styles = defaultdict(int)
        sizes = defaultdict(int)
        complexities = defaultdict(int)
        pixel_art_count = 0
        low_poly_count = 0
        realistic_count = 0
        total_size = 0
        analyzed = 0
        
        for asset in assets[:100]:  # Sample up to 100 assets
            analysis = self.analyze_image_style(asset)
            if analysis:
                styles[analysis['complexity']] += 1
                sizes[analysis['size']] += 1
                complexities[analysis['complexity']] += 1
                total_size += analysis['file_size']
                analyzed += 1
                
                if analysis['is_pixel_art']:
                    pixel_art_count += 1
                elif analysis['is_low_poly']:
                    low_poly_count += 1
                elif analysis['is_realistic']:
                    realistic_count += 1
        
        review = {
            'category': category_name,
            'total_assets': len(assets),
            'analyzed': analyzed,
            'styles': {
                'pixel_art': pixel_art_count,
                'low_poly': low_poly_count,
                'realistic': realistic_count,
                'other': analyzed - pixel_art_count - low_poly_count - realistic_count
            },
            'complexity_distribution': dict(complexities),
            'size_distribution': dict(sizes),
            'average_file_size': total_size / analyzed if analyzed > 0 else 0
        }
        
        # Determine dominant style
        style_counts = review['styles']
        dominant_style = max(style_counts.items(), key=lambda x: x[1])[0] if style_counts else 'unknown'
        review['dominant_style'] = dominant_style
        
        return review
    
    def make_style_decision(self, review):
        """Make style decision based on review"""
        if not review:
            return None
        
        category = review['category']
        styles = review['styles']
        total = review['analyzed']
        
        # Calculate percentages
        pixel_art_pct = (styles['pixel_art'] / total * 100) if total > 0 else 0
        low_poly_pct = (styles['low_poly'] / total * 100) if total > 0 else 0
        realistic_pct = (styles['realistic'] / total * 100) if total > 0 else 0
        
        # Decision logic
        decision = {
            'category': category,
            'recommended_style': 'low_poly',  # Default
            'reasoning': '',
            'current_distribution': {
                'pixel_art': f"{pixel_art_pct:.1f}%",
                'low_poly': f"{low_poly_pct:.1f}%",
                'realistic': f"{realistic_pct:.1f}%"
            },
            'action_required': False
        }
        
        # Make decision based on what we have
        if low_poly_pct > 50:
            decision['recommended_style'] = 'low_poly'
            decision['reasoning'] = f"Low-poly is dominant ({low_poly_pct:.1f}%), matches game theme"
        elif pixel_art_pct > 50:
            decision['recommended_style'] = 'pixel_art'
            decision['reasoning'] = f"Pixel art is dominant ({pixel_art_pct:.1f}%), but should migrate to low-poly for consistency"
            decision['action_required'] = True
        elif realistic_pct > 50:
            decision['recommended_style'] = 'low_poly'
            decision['reasoning'] = f"Realistic assets found ({realistic_pct:.1f}%), but low-poly preferred for game theme"
            decision['action_required'] = True
        else:
            decision['recommended_style'] = 'low_poly'
            decision['reasoning'] = "Mixed styles, standardizing on low-poly for consistency"
            decision['action_required'] = True
        
        return decision
    
    def review_all_categories(self):
        """Review all asset categories"""
        logger.info("Starting comprehensive asset review...")
        
        categories = {
            'characters': 'downloaded_assets/characters/sprites',
            'backdrops': 'downloaded_assets/backgrounds/locations',
            'map_assets': 'downloaded_assets/map/assets',
            'icons_items': 'downloaded_assets/icons/items',
            'icons_features': 'downloaded_assets/icons/features',
            'vehicles': 'downloaded_assets/vehicles/sprites',
            'ui_elements': 'downloaded_assets/ui/elements',
            'particles': 'downloaded_assets/effects/particles'
        }
        
        for category_name, category_path in categories.items():
            review = self.review_category(category_path, category_name)
            if review:
                self.reviews[category_name] = review
                decision = self.make_style_decision(review)
                if decision:
                    self.style_decisions[category_name] = decision
        
        return self.reviews, self.style_decisions
    
    def save_review(self, output_file='asset_style_review.json'):
        """Save review results"""
        results = {
            'reviews': self.reviews,
            'style_decisions': self.style_decisions,
            'summary': {
                'total_categories': len(self.reviews),
                'categories_reviewed': list(self.reviews.keys())
            }
        }
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Review saved to {output_file}")
        return results

def main():
    reviewer = AssetStyleReviewer()
    reviews, decisions = reviewer.review_all_categories()
    results = reviewer.save_review()
    
    # Print summary
    print("\n" + "="*60)
    print("ASSET STYLE REVIEW SUMMARY")
    print("="*60)
    
    for category, decision in decisions.items():
        print(f"\n{category.upper()}:")
        print(f"  Recommended Style: {decision['recommended_style']}")
        print(f"  Reasoning: {decision['reasoning']}")
        print(f"  Current Distribution: {decision['current_distribution']}")
        if decision['action_required']:
            print(f"  ⚠️  Action Required: Yes")
        else:
            print(f"  ✅ Action Required: No")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()

