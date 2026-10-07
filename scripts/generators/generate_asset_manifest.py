import json

def parse_asset_list():
    manifest = {
        'metadata': {
            'total_assets': 0,
            'size': {
                'width': 1024,
                'height': 1024
            }
        },
        'character_sprites': {
            'size': {
                'width': 512,
                'height': 512
            },
            'assets': []
        },
        'location_backgrounds': {
            'size': {
                'width': 1920,
                'height': 1080
            },
            'assets': []
        },
        'feature_icons': {
            'size': {
                'width': 64,
                'height': 64
            },
            'assets': []
        },
        'map_assets': {
            'size': {
                'width': 32,
                'height': 32
            },
            'assets': []
        },
        'vehicle_sprites': {
            'size': {
                'width': 256,
                'height': 256
            },
            'assets': []
        },
        'item_icons': {
            'size': {
                'width': 64,
                'height': 64
            },
            'assets': []
        },
        'chart_icons': {
            'size': {
                'width': 64,
                'height': 64
            },
            'assets': []
        },
        'ui_elements': {
            'size': {
                'width': 512,
                'height': 512
            },
            'assets': []
        },
        'particle_effects': {
            'size': {
                'width': 256,
                'height': 256
            },
            'assets': []
        },
        'dialogue_ui': {
            'size': {
                'width': 1024,
                'height': 512
            },
            'assets': []
        },
        'npc_portraits': {
            'size': {
                'width': 256,
                'height': 256
            },
            'assets': []
        },
        'screen_transitions': {
            'size': {
                'width': 1024,
                'height': 1024
            },
            'assets': []
        }
    }
    
    # Character Sprites (Items 01-33)
    character_assets = []
    emotions = ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral', 'Excited', 'Tired', 'Fearful']
    for i, emotion in enumerate(emotions, start=1):
        character_assets.append({
            'id': i,
            'name': f'Character sprite - {emotion} emotion',
            'search_terms': [f'{emotion.lower()} character sprite', f'{emotion.lower()} face sprite'],
            'sources': ['opengameart', 'itchio', 'craftpix'],
            'output_dir': 'characters/emotions'
        })
    
    # Add body language poses (77-86)
    poses = ['Standing', 'Sitting', 'Talking', 'Thinking', 'Working', 'Walking', 'Running', 'Resting', 'Celebrating', 'Disappointed']
    for i, pose in enumerate(poses, start=77):
        character_assets.append({
            'id': i,
            'name': f'Character body language - {pose} pose sprite',
            'search_terms': [f'{pose.lower()} character sprite', f'{pose.lower()} pose sprite'],
            'sources': ['opengameart', 'itchio', 'craftpix'],
            'output_dir': 'characters/poses'
        })
    
    manifest['character_sprites']['assets'] = character_assets
    
    # Location Backgrounds (Items 151-250)
    location_assets = []
    locations = [
        ('Home apartment', 'home', ['apartment interior background', 'home interior 2d']),
        ('Office', 'office', ['office interior background 2d', 'office background']),
        ('Coffee shop', 'coffee_shop', ['coffee shop cafe background 2d', 'cafe background']),
        ('University', 'university', ['university campus background', 'school background 2d']),
        ('Bank', 'bank', ['bank interior background 2d', 'bank background']),
        ('Library', 'library', ['library interior background', 'library background 2d']),
        ('Gym', 'gym', ['gym fitness center background', 'gym background 2d']),
    ]
    
    for i, (name, location_id, search_terms) in enumerate(locations, start=151):
        location_assets.append({
            'id': i,
            'name': f'{name} - Detailed interior background',
            'search_terms': search_terms,
            'sources': ['opengameart', 'itchio', 'craftpix'],
            'output_dir': f'backgrounds/locations/{location_id}'
        })
    
    manifest['location_backgrounds']['assets'] = location_assets
    
    # Feature Icons (Items 251-300)
    feature_icons = []
    features = [
        'Bed', 'Desk', 'Computer', 'Kitchen', 'Bathroom', 'Window', 'Bookshelf',
        'Closet', 'Refrigerator', 'TV', 'Plant', 'Mailbox', 'Roommate door',
        'Calendar', 'Phone', 'Workstation', 'Boss office', 'Break room',
        'Conference room', 'Printer', 'Filing cabinet', 'Whiteboard',
        'Coffee machine', 'Water cooler', 'Elevator', 'Reception',
        'Supply closet', 'Server room', 'Parking', 'Security'
    ]
    
    for i, feature in enumerate(features, start=251):
        feature_icons.append({
            'id': i,
            'name': f'Feature icon - {feature} (PNG version)',
            'search_terms': [f'{feature.lower()} icon', f'{feature.lower()} png'],
            'sources': ['game_icons', 'flaticon', 'kenney'],
            'output_dir': 'icons/features'
        })
    
    manifest['feature_icons']['assets'] = feature_icons
    
    # Map Assets (Items 401-500)
    map_assets = []
    # Trees
    for i in range(401, 411):
        map_assets.append({
            'id': i,
            'name': f'Map tree sprite - Variant {i-400}',
            'search_terms': ['tree sprite 2d', 'tree tile sprite'],
            'sources': ['opengameart', 'kenney', 'itchio'],
            'output_dir': 'map/trees'
        })
    
    # Roads
    for i in range(451, 461):
        map_assets.append({
            'id': i,
            'name': f'Map road sprite - Variant {i-450}',
            'search_terms': ['road tile sprite 2d', 'road sprite'],
            'sources': ['opengameart', 'kenney', 'itchio'],
            'output_dir': 'map/roads'
        })
    
    manifest['map_assets']['assets'] = map_assets
    
    # Vehicle Sprites (Items 651-700)
    vehicle_assets = []
    vehicles = ['Bicycle', 'Bus', 'Used car', 'Luxury car', 'Sports car', 'Motorcycle', 'Taxi', 'Truck', 'Van', 'Helicopter']
    
    for i, vehicle in enumerate(vehicles, start=651):
        vehicle_assets.append({
            'id': i,
            'name': f'{vehicle} idle sprite',
            'search_terms': [f'{vehicle.lower()} sprite 2d', f'{vehicle.lower()} icon'],
            'sources': ['opengameart', 'kenney', 'itchio'],
            'output_dir': 'vehicles'
        })
        vehicle_assets.append({
            'id': i+10,
            'name': f'{vehicle} animation sprite',
            'search_terms': [f'{vehicle.lower()} animation sprite', f'{vehicle.lower()} moving'],
            'sources': ['opengameart', 'kenney', 'itchio'],
            'output_dir': 'vehicles'
        })
    
    manifest['vehicle_sprites']['assets'] = vehicle_assets[:20]  # Limit for now
    
    # Item Icons (Items 701-780)
    item_icons = []
    items = [
        'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Notebook', 'Pen',
        'Calculator', 'Briefcase', 'Suit', 'Tie', 'Watch', 'Glasses',
        'Sunglasses', 'Wallet', 'Keys', 'ID card', 'Business card'
    ]
    
    for i, item in enumerate(items, start=701):
        item_icons.append({
            'id': i,
            'name': f'Item icon - {item}',
            'search_terms': [f'{item.lower()} icon', f'{item.lower()} png'],
            'sources': ['game_icons', 'flaticon', 'kenney'],
            'output_dir': 'icons/items'
        })
    
    manifest['item_icons']['assets'] = item_icons
    
    # Recompute total assets
    manifest['metadata']['total_assets'] = sum(len(cat['assets']) for cat in manifest.values() if 'assets' in cat)
    
    # Save the manifest to a JSON file
    with open('asset_manifest.json', 'w') as f:
        json.dump(manifest, f, indent=4)
    
    return manifest

if __name__ == "__main__":
    parse_asset_list()