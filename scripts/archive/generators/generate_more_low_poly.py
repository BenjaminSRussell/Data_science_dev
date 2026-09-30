#!/usr/bin/env python3
"""
Generate additional Low-poly assets programmatically
Creates Low-poly style assets when scrapers don't find enough
"""

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random
import logging
import math

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LowPolyGenerator:
    def __init__(self, output_dir="downloaded_assets"):
        self.output_dir = Path(output_dir)
        self.generated = []
        
        # Low-poly color palette
        self.palette = [
            (139, 92, 246),   # Purple
            (167, 139, 250),  # Light Purple
            (59, 130, 246),   # Blue
            (99, 102, 241),   # Indigo
            (16, 185, 129),   # Green
            (34, 197, 94),    # Light Green
            (245, 158, 11),   # Orange
            (217, 119, 6),    # Dark Orange
            (239, 68, 68),    # Red
            (236, 72, 153),   # Pink
        ]
    
    def generate_low_poly_character(self, output_path, size=(128, 128), variant=0):
        """Generate Low-poly character sprite"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Create Low-poly character shape
        center_x, center_y = size[0] // 2, size[1] // 2
        
        # Head (polygonal)
        head_points = []
        for i in range(6):
            angle = (i * 2 * math.pi / 6) + variant * 0.5
            radius = 20 + variant * 2
            x = center_x + radius * math.cos(angle)
            y = center_y - 30 + radius * math.sin(angle)
            head_points.append((x, y))
        
        head_color = random.choice(self.palette)
        draw.polygon(head_points, fill=head_color, outline=None)
        
        # Body (polygonal)
        body_points = [
            (center_x - 15, center_y - 10),
            (center_x + 15, center_y - 10),
            (center_x + 20, center_y + 30),
            (center_x - 20, center_y + 30)
        ]
        body_color = random.choice(self.palette)
        draw.polygon(body_points, fill=body_color, outline=None)
        
        # Apply gradient overlay
        overlay = Image.new('RGBA', size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        for i in range(50):
            alpha = int(20 * (1 - i / 50))
            radius = int(size[0] * 0.4 * (i / 50))
            overlay_draw.ellipse(
                [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
                fill=(255, 255, 255, alpha), outline=None
            )
        
        img = Image.alpha_composite(img, overlay)
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly_icon(self, output_path, icon_type, size=(64, 64)):
        """Generate Low-poly icon"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        center_x, center_y = size[0] // 2, size[1] // 2
        
        # Create Low-poly shape based on icon type
        if 'bed' in icon_type.lower():
            # Bed shape
            points = [
                (10, 30), (54, 30), (50, 50), (14, 50)
            ]
        elif 'desk' in icon_type.lower():
            # Desk shape
            points = [
                (10, 20), (54, 20), (54, 40), (10, 40)
            ]
        elif 'chair' in icon_type.lower():
            # Chair shape
            points = [
                (20, 15), (44, 15), (44, 35), (20, 35)
            ]
        else:
            # Generic polygonal shape
            points = []
            for i in range(6):
                angle = i * 2 * math.pi / 6
                radius = 20
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                points.append((x, y))
        
        color = random.choice(self.palette)
        draw.polygon(points, fill=color, outline=None)
        
        # Add gradient
        overlay = Image.new('RGBA', size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.ellipse(
            [center_x - 15, center_y - 15, center_x + 15, center_y + 15],
            fill=(255, 255, 255, 30), outline=None
        )
        
        img = Image.alpha_composite(img, overlay)
        img = img.filter(ImageFilter.GaussianBlur(radius=0.3))
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly_ui_element(self, output_path, element_type, size=(128, 128)):
        """Generate Low-poly UI element"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        center_x, center_y = size[0] // 2, size[1] // 2
        
        # Create Low-poly UI shape
        if 'button' in element_type.lower():
            # Button shape
            points = [
                (20, 20), (108, 20), (108, 108), (20, 108)
            ]
        elif 'panel' in element_type.lower():
            # Panel shape
            points = [
                (10, 10), (118, 10), (118, 118), (10, 118)
            ]
        else:
            # Generic polygonal
            points = []
            for i in range(8):
                angle = i * 2 * math.pi / 8
                radius = 40
                x = center_x + radius * math.cos(angle)
                y = center_y + radius * math.sin(angle)
                points.append((x, y))
        
        color = random.choice(self.palette)
        draw.polygon(points, fill=color, outline=None)
        
        # Gradient overlay
        overlay = Image.new('RGBA', size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.ellipse(
            [center_x - 30, center_y - 30, center_x + 30, center_y + 30],
            fill=(255, 255, 255, 40), outline=None
        )
        
        img = Image.alpha_composite(img, overlay)
        img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly_particle(self, output_path, particle_type, size=(32, 32)):
        """Generate Low-poly particle effect"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        center_x, center_y = size[0] // 2, size[1] // 2
        
        # Create Low-poly particle shape
        points = []
        num_points = 5 + random.randint(0, 3)
        for i in range(num_points):
            angle = i * 2 * math.pi / num_points
            radius = 10 + random.randint(-2, 2)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            points.append((x, y))
        
        color = random.choice(self.palette)
        draw.polygon(points, fill=color, outline=None)
        
        # Glow effect
        overlay = Image.new('RGBA', size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.ellipse(
            [center_x - 8, center_y - 8, center_x + 8, center_y + 8],
            fill=(*color[:3], 100), outline=None
        )
        
        img = Image.alpha_composite(img, overlay)
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def fill_category(self, category, target_count, current_count):
        """Fill a category with generated Low-poly assets"""
        needed = max(0, target_count - current_count)
        if needed == 0:
            return 0
        
        logger.info(f"Generating {needed} Low-poly assets for {category}")
        
        generated = 0
        category_path = self.output_dir / category
        category_path.mkdir(parents=True, exist_ok=True)
        
        if 'character' in category:
            for i in range(needed):
                output_path = category_path / f"generated_low_poly_character_{i:04d}.png"
                if self.generate_low_poly_character(output_path, variant=i):
                    generated += 1
                    self.generated.append({'category': category, 'path': str(output_path)})
        
        elif 'icon' in category:
            icon_types = ['bed', 'desk', 'chair', 'table', 'lamp', 'computer', 'phone']
            for i in range(needed):
                icon_type = icon_types[i % len(icon_types)]
                output_path = category_path / f"generated_low_poly_{icon_type}_{i:04d}.png"
                if self.generate_low_poly_icon(output_path, icon_type):
                    generated += 1
                    self.generated.append({'category': category, 'path': str(output_path)})
        
        elif 'ui' in category or 'element' in category:
            element_types = ['button', 'panel', 'frame', 'arrow', 'star']
            for i in range(needed):
                element_type = element_types[i % len(element_types)]
                output_path = category_path / f"generated_low_poly_{element_type}_{i:04d}.png"
                if self.generate_low_poly_ui_element(output_path, element_type):
                    generated += 1
                    self.generated.append({'category': category, 'path': str(output_path)})
        
        elif 'particle' in category or 'effect' in category:
            particle_types = ['sparkle', 'star', 'glow', 'magic', 'energy']
            for i in range(needed):
                particle_type = particle_types[i % len(particle_types)]
                output_path = category_path / f"generated_low_poly_{particle_type}_{i:04d}.png"
                if self.generate_low_poly_particle(output_path, particle_type):
                    generated += 1
                    self.generated.append({'category': category, 'path': str(output_path)})
        
        logger.info(f"Generated {generated} assets for {category}")
        return generated
    
    def run(self):
        """Generate Low-poly assets to fill gaps"""
        logger.info("Starting Low-poly asset generation...")
        
        # Target counts
        targets = {
            'characters/sprites': 1000,
            'icons/items': 250,
            'icons/features': 250,
            'ui/elements': 300,
            'effects/particles': 200
        }
        
        # Count current assets
        for category, target in targets.items():
            category_path = self.output_dir / category
            if category_path.exists():
                current = len(list(category_path.glob("*.png")))
            else:
                current = 0
            
            if current < target:
                self.fill_category(category, target, current)
        
        # Save manifest
        manifest = {
            'generated': self.generated,
            'total_generated': len(self.generated)
        }
        
        with open('generated_low_poly_manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logger.info(f"Generated {len(self.generated)} Low-poly assets")
        logger.info("Manifest saved to generated_low_poly_manifest.json")

if __name__ == "__main__":
    generator = LowPolyGenerator()
    generator.run()

