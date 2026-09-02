import os

def categorize_asset(asset_path):
    # Check for character assets
    if 'characters' in asset_path:
        return 'character'
    # Check for sprite assets
    elif 'sprites' in asset_path:
        return 'sprite'
    # Check for backdrop/background/location assets
    elif 'backdrops' in asset_path or 'backgrounds' in asset_path or 'locations' in asset_path:
        return 'backdrop'
    # Check for map assets
    elif 'maps' in asset_path:
        return 'map'
    # Check for icon+feature assets
    elif 'icons' in asset_path and 'features' in asset_path:
        return 'icon_feature'
    # Check for icon assets
    elif 'icons' in asset_path:
        return 'icon'
    # Check for vehicle assets
    elif 'vehicles' in asset_path:
        return 'vehicle'
    # Check for UI/element assets
    elif 'ui' in asset_path or 'elements' in asset_path:
        return 'ui'
    # Check for particle/effect assets
    elif 'particles' in asset_path or 'effects' in asset_path:
        return 'particle'
    # Fallback for other assets
    else:
        return 'other'

def determine_style(asset_path, analysis=None):
    if analysis is None:
        return 'unknown'
    # Check for lowpoly style
    if 'lowpoly' in analysis:
        return 'lowpoly'
    # Check for pixel style
    elif 'pixel' in analysis:
        return 'pixel'
    # Check for realistic style
    elif 'realistic' in analysis:
        return 'realistic'
    # Check for placeholder style
    elif 'placeholder' in analysis:
        return 'placeholder'
    # Fallback for other styles
    else:
        # Determine style based on size
        if 'width' in analysis and 'height' in analysis:
            width = int(analysis['width'])
            height = int(analysis['height'])
            if width < 256 or height < 256:
                return 'small'
            elif width > 512 or height > 512:
                return 'large'
            else:
                return 'medium'
        return 'unknown'

# Example usage
if __name__ == "__main__":
    # Test categorize_asset
    assert categorize_asset('assets/characters/player.png') == 'character'
    assert categorize_asset('assets/sprites/enemy.png') == 'sprite'
    assert categorize_asset('assets/backdrops/city.png') == 'backdrop'
    assert categorize_asset('assets/maps/level1.png') == 'map'
    assert categorize_asset('assets/icons/tools.png') == 'icon'
    assert categorize_asset('assets/icons/features/building.png') == 'icon_feature'
    assert categorize_asset('assets/vehicles/car.png') == 'vehicle'
    assert categorize_asset('assets/ui/buttons.png') == 'ui'
    assert categorize_asset('assets/particles/fire.png') == 'particle'
    assert categorize_asset('assets/other/misc.png') == 'other'
    assert categorize_asset('assets/icons/vehicles/car.png') == 'icon'  # Fallback to icon

    # Test determine_style
    assert determine_style(None) == 'unknown'
    assert determine_style('assets/characters/player.png', {'lowpoly': True}) == 'lowpoly'
    assert determine_style('assets/sprites/enemy.png', {'pixel': True}) == 'pixel'
    assert determine_style('assets/backdrops/city.png', {'realistic': True}) == 'realistic'
    assert determine_style('assets/maps/level1.png', {'placeholder': True}) == 'placeholder'
    assert determine_style('assets/icons/tools.png', {'width': 255, 'height': 255}) == 'small'
    assert determine_style('assets/icons/tools.png', {'width': 256, 'height': 256}) == 'medium'
    assert determine_style('assets/icons/tools.png', {'width': 512, 'height': 512}) == 'medium'
    assert determine_style('assets/icons/tools.png', {'width': 513, 'height': 513}) == 'large'