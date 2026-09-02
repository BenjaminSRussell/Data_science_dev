#!/usr/bin/env python3
"""
Generate character sprites based on provided templates and body/hair images
"""

import os
from PIL import Image
import json

def load_image_safe(path):
    try:
        if os.path.exists(path):
            with Image.open(path) as img:
                return img.convert('RGBA')  # file handle closed after conversion
    except Exception as e:
        print(f"Error loading {path}: {e}")
    return None

def create_character_sprite(body_path, hair_path, output_path, sprite_config):
    body = load_image_safe(body_path)
    hair = load_image_safe(hair_path)
    
    if not body or not hair:
        print("Failed to load either body or hair image.")
        return
    
    # Apply transformations based on sprite configuration
    if sprite_config.get('rotate_body'):
        body = body.rotate(sprite_config['rotate_body'])
    if sprite_config.get('rotate_hair'):
        hair = hair.rotate(sprite_config['rotate_hair'])
    
    # Composite hair on body
    body.paste(hair, (0, 0), hair)
    
    # Save the resulting sprite
    body.save(output_path, 'PNG')
    print(f"Sprite saved to {output_path}")

if __name__ == "__main__":
    # Example usage
    body_path = "assets/body.png"
    hair_path = "assets/hair.png"
    output_path = "output/sprite.png"
    sprite_config = {
        'rotate_body': 10,
        'rotate_hair': 5
    }
    
    create_character_sprite(body_path, hair_path, output_path, sprite_config)