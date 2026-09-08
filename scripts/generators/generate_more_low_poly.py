import os
import json
import logging
import random
import math
from PIL import Image, ImageDraw, ImageFilter

logger = logging.getLogger(__name__)

class LowPolyGenerator:
    def __init__(self, output_dir='output'):
        self.output_dir = os.path.expanduser(output_dir)
        self.generated = []
        self.palette = [
            (231, 76, 60), (39, 174, 96), (241, 196, 15), (142, 68, 173),
            (52, 152, 219), (91, 183, 227), (46, 204, 113), (155, 89, 182),
            (192, 57, 43), (76, 175, 80), (230, 126, 34), (117, 112, 183),
            (52, 143, 235), (142, 136, 177), (39, 174, 96), (243, 156, 18)
        ]
    
    def generate_low_poly_character(self, output_path, variant=0):
        """Generate Low-poly character"""
        img = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Define character shape
        points = [
            (32, 64), (64, 32), (96, 64), (64, 96)
        ]
        
        color = random.choice(self.palette)
        
        # Add eyes and mouth
        draw.ellipse((48, 48, 64, 64), fill=(255, 255, 255), outline=None)
        draw.ellipse((72, 48, 88, 64), fill=(255, 255, 255), outline=None)
        draw.line((64, 64, 64, 80), fill=(0, 0, 0), width=2)
        
        # Glow effect
        overlay = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.ellipse(
            [56, 56, 72, 72],
            fill=(*color[:3], 100), outline=None
        )
        
        img = Image.alpha_composite(img, overlay)
        img = img.filter(ImageFilter.GaussianBlur(radius=0.3))
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly_icon(self, output_path, icon_type):
        """Generate Low-poly icon"""
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        center_x, center_y = 32, 32
        
        # Define icon shape based on type
        if icon_type == 'bed':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        elif icon_type == 'desk':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        elif icon_type == 'chair':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        elif icon_type == 'table':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        elif icon_type == 'lamp':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        elif icon_type == 'computer':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        elif icon_type == 'phone':
            points = [
                (16, 16), (48, 16), (48, 48), (16, 48)
            ]
        else:
            return False
        
        color = random.choice(self.palette)
        draw.polygon(points, fill=color, outline=None)
        
        # Glow effect
        overlay = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.ellipse(
            [24, 24, 40, 40],
            fill=(*color[:3], 100), outline=None
        )
        
        img = Image.alpha_composite(img, overlay)
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly_ui_element(self, output_path, element_type, size=(128, 128)):
        """Generate Low-poly UI element"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        center_x, center_y = size[0] // 2, size[1] // 2
        
        if 'button' in element_type:
            draw.polygon([
                (center_x - 50, center_y - 20), (center_x + 50, center_y - 20),
                (center_x + 50, center_y + 20), (center_x - 50, center_y + 20)
            ], fill=random.choice(self.palette), outline=None)
        elif 'slider' in element_type:
            draw.polygon([
                (center_x - 50, center_y - 20), (center_x + 50, center_y - 20),
                (center_x + 50, center_y + 20), (center_x - 50, center_y + 20)
            ], fill=random.choice(self.palette), outline=None)
            draw.ellipse([
                (center_x - 20, center_y - 10), (center_x + 20, center_y + 10)
            ], fill=(255, 255, 255), outline=None)
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly(self, output_path, shape, size=(64, 64)):
        """Generate Low-poly shape"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        if 'triangle' in shape:
            draw.polygon([
                (size[0] // 2, 10), (10, size[1] - 10), (size[0] - 10, size[1] - 10)
            ], fill=random.choice(self.palette), outline=None)
        elif 'square' in shape:
            draw.polygon([
                (10, 10), (size[0] - 10, 10), (size[0] - 10, size[1] - 10), (10, size[1] - 10)
            ], fill=random.choice(self.palette), outline=None)
        elif 'circle' in shape:
            draw.ellipse([
                (10, 10), (size[0] - 10, size[1] - 10)
            ], fill=random.choice(self.palette), outline=None)
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def fill_category(self, category, target_count, current_count):
        """Fill a category with generated Low-poly assets"""
        needed = target_count - current_count
        if needed <= 0:
            return 0
        
        generated_count = 0
        
        if 'character' in category:
            for _ in range(needed):
                output_path = os.path.join(self.output_dir, f'character_{generated_count}.png')
                if self.generate_low_poly_character(output_path):
                    self.generated.append(output_path)
                    generated_count += 1
        elif 'icon' in category:
            icon_types = ['bed', 'desk', 'chair', 'table', 'lamp', 'computer', 'phone']
            for icon_type in icon_types:
                for _ in range(needed // len(icon_types)):
                    output_path = os.path.join(self.output_dir, f'icon_{icon_type}_{generated_count}.png')
                    if self.generate_low_poly_icon(output_path, icon_type):
                        self.generated.append(output_path)
                        generated_count += 1
        elif 'ui' in category:
            ui_types = ['button', 'panel']
            for ui_type in ui_types:
                for _ in range(needed // len(ui_types)):
                    output_path = os.path.join(self.output_dir, f'ui_{ui_type}_{generated_count}.png')
                    if self.generate_low_poly_ui_element(output_path, ui_type):
                        self.generated.append(output_path)
                        generated_count += 1
        elif 'particle' in category:
            for _ in range(needed):
                output_path = os.path.join(self.output_dir, f'particle_{generated_count}.png')
                if self.generate_low_poly_particle(output_path):
                    self.generated.append(output_path)
                    generated_count += 1
        else:
            logger.warning(f'Unknown category: {category}')
        
        return generated_count
    
    def run(self):
        """Run the asset generation process"""
        targets = {
            'characters': 10,
            'icons': 7,
            'ui_elements': 5,
            'particles': 20
        }
        
        for category, target_count in targets.items():
            current_count = len(os.listdir(os.path.join(self.output_dir, category)))
            generated_count = self.fill_category(category, target_count, current_count)
            logger.info(f'Generated {generated_count} {category}')
        
        with open(os.path.join(self.output_dir, 'generated_assets.json'), 'w') as f:
            json.dump(self.generated, f)
        
        logger.info('Asset generation complete')

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    generator = LowPolyGenerator(output_dir='output')
    generator.run()