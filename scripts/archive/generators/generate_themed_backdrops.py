#!/usr/bin/env python3
"""
Generate themed backdrops for every location
Creates Low-poly style backdrops matching game theme
"""

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ThemedBackdropGenerator:
    def __init__(self, output_dir="assets/backgrounds/locations", theme="low_poly"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.theme = theme
        
        # Theme color palettes
        self.color_palettes = {
            'low_poly': {
                'office': [(139, 92, 246), (167, 139, 250), (192, 132, 252), (217, 119, 6)],
                'home': [(139, 92, 246), (167, 139, 250), (236, 72, 153), (251, 191, 36)],
                'coffee_shop': [(139, 92, 246), (167, 139, 250), (245, 158, 11), (217, 119, 6)],
                'library': [(139, 92, 246), (167, 139, 250), (59, 130, 246), (99, 102, 241)],
                'gym': [(139, 92, 246), (167, 139, 250), (239, 68, 68), (16, 185, 129)],
                'park': [(139, 92, 246), (167, 139, 250), (16, 185, 129), (34, 197, 94)],
                'default': [(139, 92, 246), (167, 139, 250), (59, 130, 246), (99, 102, 241)]
            }
        }
        
        # Location definitions
        self.locations = [
            'office', 'home', 'apartment', 'coffee_shop', 'cafe', 'library',
            'gym', 'park', 'mall', 'university', 'tech_hub', 'downtown',
            'networking_bar', 'stock_exchange', 'luxury_district', 'bank',
            'city_hall', 'car_dealership', 'donut_shop', 'bagel_shop',
            'flower_store', 'real_estate', 'beach', 'mountain', 'forest',
            'suburb', 'restaurant', 'bar', 'club', 'hospital', 'school',
            'warehouse', 'factory', 'airport', 'train_station', 'hotel',
            'museum', 'theater', 'stadium', 'courthouse', 'police_station',
            'fire_station', 'post_office', 'grocery_store', 'pharmacy',
            'bookstore', 'electronics_store', 'clothing_store', 'jewelry_store'
        ]
    
    def generate_low_poly_backdrop(self, location, width=1920, height=1080, variations=10):
        """Generate Low-poly style backdrop"""
        palette = self.color_palettes[self.theme].get(location, self.color_palettes[self.theme]['default'])
        
        for variant in range(variations):
            img = Image.new('RGB', (width, height), palette[0])
            draw = ImageDraw.Draw(img)
            
            # Create Low-poly effect with triangles
            num_triangles = random.randint(50, 100)
            
            for _ in range(num_triangles):
                # Random triangle points
                x1 = random.randint(0, width)
                y1 = random.randint(0, height)
                x2 = random.randint(0, width)
                y2 = random.randint(0, height)
                x3 = random.randint(0, width)
                y3 = random.randint(0, height)
                
                # Random color from palette
                color = random.choice(palette)
                # Add some variation
                color = tuple(min(255, max(0, c + random.randint(-30, 30))) for c in color)
                
                # Draw triangle
                draw.polygon([(x1, y1), (x2, y2), (x3, y3)], fill=color, outline=None)
            
            # Add gradient overlay for depth
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            
            # Radial gradient from center
            center_x, center_y = width // 2, height // 2
            for i in range(200):
                alpha = int(30 * (1 - i / 200))
                radius = int(width * 0.6 * (i / 200))
                overlay_draw.ellipse(
                    [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
                    fill=(0, 0, 0, alpha), outline=None
                )
            
            img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
            
            # Apply slight blur for smooth Low-poly look
            img = img.filter(ImageFilter.GaussianBlur(radius=1))
            
            # Save
            output_path = self.output_dir / location / f"{location}_backdrop_{variant:02d}.png"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            img.save(output_path, 'PNG', optimize=True)
            
            logger.info(f"Generated: {output_path}")
    
    def generate_all_backdrops(self):
        """Generate themed backdrops for all locations"""
        logger.info(f"Generating {self.theme} themed backdrops for {len(self.locations)} locations...")
        
        for location in self.locations:
            logger.info(f"Generating backdrops for: {location}")
            self.generate_low_poly_backdrop(location, variations=10)
        
        logger.info("All backdrops generated!")
        
        # Create manifest
        manifest = {
            'theme': self.theme,
            'locations': {},
            'total_backdrops': 0
        }
        
        for location in self.locations:
            location_dir = self.output_dir / location
            if location_dir.exists():
                backdrops = list(location_dir.glob('*.png'))
                manifest['locations'][location] = {
                    'count': len(backdrops),
                    'files': [str(f.name) for f in backdrops]
                }
                manifest['total_backdrops'] += len(backdrops)
        
        with open(self.output_dir / 'backdrop_manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logger.info(f"Generated {manifest['total_backdrops']} total backdrops")
        logger.info(f"Manifest saved to {self.output_dir / 'backdrop_manifest.json'}")

def main():
    generator = ThemedBackdropGenerator(theme='low_poly')
    generator.generate_all_backdrops()

if __name__ == "__main__":
    main()

