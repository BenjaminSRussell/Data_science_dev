import os
from PIL import Image

def load_image_safe(path):
    if not os.path.exists(path):
        return None
    try:
        return Image.open(path)
    except Exception as e:
        print(f"Could not load {path}: {e}")
        return None

def create_character_sprite(body_path, hair_path=None, output_path=None):
    body = load_image_safe(body_path)
    if body is None:
        print("Could not load body")
        return None

    body = body.convert("RGBA")
    
    if hair_path is not None:
        hair = load_image_safe(hair_path)
        if hair is not None:
            hair = hair.convert("RGBA")
            character = Image.alpha_composite(body, hair)
        else:
            character = body
    else:
        character = body

    if output_path is not None:
        character.save(output_path)
    
    return character