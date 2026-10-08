#!/usr/bin/env python3
"""
Generate character sprites based on provided templates and body/hair images
"""

import os
from PIL import Image
import json

def load_image_safe(path):
    if not path:
        return None
    try:
        if os.path.exists(path):
            with Image.open(path) as img:
                return img.convert('RGBA')  # file handle closed after conversion
    except Exception as e:
        print(f"Error loading {path}: {e}")
    return None

def create_character_sprite(body_path, hair_path=None, output_path=None, sprite_config=None):
    """Composite hair over a body sprite.

    The body is required; hair is optional (a missing or unreadable hair
    image yields a body-only sprite instead of no sprite). The result is
    saved only when output_path is given, and returned either way. (#598)
    """
    sprite_config = sprite_config or {}
    body = load_image_safe(body_path)
    if body is None:
        print(f"Could not load body: {body_path}")
        return None

    hair = load_image_safe(hair_path) if hair_path else None
    if hair_path and hair is None:
        print(f"Could not load hair: {hair_path}; using body only")

    # Apply transformations based on sprite configuration
    if sprite_config.get('rotate_body'):
        body = body.rotate(sprite_config['rotate_body'])
    if hair is not None and sprite_config.get('rotate_hair'):
        hair = hair.rotate(sprite_config['rotate_hair'])

    # Composite hair on body (alpha-aware)
    character = body
    if hair is not None:
        if getattr(hair, 'size', None) != getattr(body, 'size', None):
            # alpha_composite needs equal sizes; pin the hair top-left
            layer = Image.new('RGBA', body.size, (0, 0, 0, 0))
            layer.paste(hair, (0, 0))
            hair = layer
        character = Image.alpha_composite(body, hair)

    if output_path:
        character.save(output_path, 'PNG')
        print(f"Sprite saved to {output_path}")
    return character

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