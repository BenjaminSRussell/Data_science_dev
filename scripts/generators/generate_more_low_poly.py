import os
import random
import json
import math
from PIL import Image, ImageDraw, ImageFilter
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LowPolyGenerator:
    def __init__(self, output_dir='output'):
        self.output_dir = os.path.abspath(output_dir)
        self.palette = [
            (255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0),
            (0, 255, 255), (255, 0, 255), (128, 0, 0), (0, 128, 0),
            (0, 0, 128), (128, 128, 0), (0, 128, 128), (128, 0, 128),
            (192, 192, 192), (128, 128, 128), (64, 64, 64), (255, 165, 0),
            (255, 215, 0), (0, 128, 0), (144, 238, 144), (75, 0, 130),
            (127, 255, 0), (0, 0, 128), (135, 206, 235), (72, 209, 204),
            (218, 112, 214), (255, 99, 71), (210, 180, 140), (240, 128, 128),
            (220, 220, 220), (255, 255, 240), (255, 255, 224), (248, 248, 255),
            (255, 250, 240), (253, 245, 230), (250, 235, 215), (245, 242, 240),
            (240, 255, 240), (238, 232, 170), (255, 215, 0), (255, 255, 0),
            (255, 160, 122), (255, 127, 80), (244, 164, 96), (255, 140, 0),
            (255, 69, 0), (255, 0, 0), (139, 0, 0), (255, 105, 180),
            (216, 191, 216), (255, 182, 193), (255, 192, 203), (255, 228, 181),
            (255, 228, 181), (240, 255, 240), (245, 245, 220), (255, 255, 255)
        ]
        self.generated = []

    def generate_low_poly_character(self, output_path, variant=0):
        """Generate Low-poly character sprite"""
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Head
        head_color = random.choice(self.palette)
        draw.polygon([
            (20, 10), (44, 10), (60, 25), (60, 35), (44, 45), (20, 45)
        ], fill=head_color, outline=None)
        
        # Body
        body_color = random.choice(self.palette)
        draw.polygon([
            (15, 35), (40, 35), (40, 60), (15, 60)
        ], fill=body_color, outline=None)
        
        # Eyes
        draw.ellipse([
            (25, 20), (30, 25)
        ], fill=(0, 0, 0), outline=None)
        draw.ellipse([
            (38, 20), (43, 25)
        ], fill=(0, 0, 0), outline=None)
        
        # Mouth
        draw.polygon([
            (30, 30), (35, 35), (40, 30)
        ], fill=(0, 0, 0), outline=None)
        
        img.save(output_path, 'PNG', optimize=True)
        return True
    
    def generate_low_poly_icon(self, output_path, icon_type):
        """Generate Low-poly icon"""
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        color = random.choice(self.palette)
        
        if 'bed' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 50), (10, 50)
            ], fill=color, outline=None)
            draw.rectangle([
                (20, 40), (40, 50)
            ], fill=(0, 0, 0), outline=None)
        elif 'desk' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 40), (10, 40)
            ], fill=color, outline=None)
            draw.rectangle([
                (20, 30), (40, 40)
            ], fill=(0, 0, 0), outline=None)
        elif 'chair' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 50), (10, 50)
            ], fill=color, outline=None)
            draw.polygon([
                (30, 20), (40, 10), (50, 20)
            ], fill=(0, 0, 0), outline=None)
        elif 'table' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 40), (10, 40)
            ], fill=color, outline=None)
            draw.rectangle([
                (20, 30), (40, 40)
            ], fill=(0, 0, 0), outline=None)
        elif 'lamp' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 50), (10, 50)
            ], fill=color, outline=None)
            draw.ellipse([
                (20, 20), (40, 40)
            ], fill=(255, 255, 255), outline=None)
        elif 'computer' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 50), (10, 50)
            ], fill=color, outline=None)
            draw.polygon([
                (10, 10), (50, 10), (50, 30), (10, 30)
            ], fill=(0, 0, 0), outline=None)
        elif 'phone' in icon_type:
            draw.polygon([
                (10, 10), (50, 10), (50, 50), (10, 50)
            ], fill=color, outline=None)
            draw.ellipse([
                (20, 20), (40, 40)
            ], fill=(0, 0, 0), outline=None)
        
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
    
    def fill_directory(self, target_dir, shape, size=(64, 64), count=100):
        """Fill directory with Low-poly shapes"""
        for i in range(count):
            output_path = os.path.join(target_dir, f'{shape}_{i+1}.png')
            self.generate_low_poly(output_path, shape, size)
        logger.info(f'Filled directory {target_dir} with {count} {shape} shapes.')

    def fill_directory_with_icons(self, target_dir, icon_type, count=100):
        """Fill directory with Low-poly icons"""
        for i in range(count):
            output_path = os.path.join(target_dir, f'{icon_type}_{i+1}.png')
            self.generate_low_poly_icon(output_path, icon_type)
        logger.info(f'Filled directory {target_dir} with {count} {icon_type} icons.')

    def fill_directory_with_ui_elements(self, target_dir, element_type, size=(128, 128), count=100):
        """Fill directory with Low-poly UI elements"""
        for i in range(count):
            output_path = os.path.join(target_dir, f'{element_type}_{i+1}.png')
            self.generate_low_poly_ui_element(output_path, element_type, size)
        logger.info(f'Filled directory {target_dir} with {count} {element_type} UI elements.')

    def fill_directory_with_characters(self, target_dir, count=100):
        """Fill directory with Low-poly characters"""
        for i in range(count):
            output_path = os.path.join(target_dir, f'character_{i+1}.png')
            self.generate_low_poly_character(output_path, i % 10)
        logger.info(f'Filled directory {target_dir} with {count} Low-poly characters.')

if __name__ == '__main__':
    generator = LowPolyGenerator()
    
    # Example usage:
    # generator.fill_directory('shapes', 'triangle')
    # generator.fill_directory_with_icons('icons', 'bed')
    # generator.fill_directory_with_ui_elements('ui_elements', 'button')
    # generator.fill_directory_with_characters('characters')

    # Add your own directory and shape/icon/ui_element/character generation calls here