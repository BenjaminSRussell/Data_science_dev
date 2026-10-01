#!/usr/bin/env python3
"""
Generate Asset Manifest from MISSING_ASSETS_AND_PROBLEMS.md
Creates structured JSON manifest for scraping
"""

import json
import re
from pathlib import Path

def parse_asset_list():
    """Parse the missing assets list and create manifest"""
    
    manifest = {
        'metadata': {
            'total_assets': 950,
            'generated_from': 'MISSING_ASSETS_AND_PROBLEMS.md',
            'version': '1.0'
        },
        'character_sprites': {
            'size': {'width': 128, 'height': 128, 'transparency': True},
            'assets': []
        },
        'location_backgrounds': {
            'size': {'width': 1920, 'height': 1080, 'transparency': False},
            'assets': []
        },
        'feature_icons': {
            'size': {'width': 64, 'height': 64, 'transparency': True},
            'assets': []
        },
        'map_assets': {
            'size': {'width': 128, 'height': 128, 'transparency': True},
            'assets': []
        },
        'vehicle_sprites': {
            'size': {'width': 128, 'height': 128, 'transparency': True},
            'assets': []
        },
        'item_icons': {
            'size': {'width': 64, 'height': 64, 'transparency': True},
            'assets': []
        },
        'chart_icons': {
            'size': {'width': 64, 'height': 64, 'transparency': True},
            'assets': []
        },
        'ui_elements': {
            'size': {'width': 128, 'height': 128, 'transparency': True},
            'assets': []
        },
        'particle_effects': {
            'size': {'width': 32, 'height': 32, 'transparency': True},
            'assets': []
        },
        'dialogue_ui': {
            'size': {'width': 256, 'height': 256, 'transparency': True},
            'assets': []
        },
        'npc_portraits': {
            'size': {'width': 256, 'height': 256, 'transparency': True},
            'assets': []
        },
        'screen_transitions': {
            'size': {'width': 1920, 'height': 1080, 'transparency': False},
            'assets': []
        }
    }
    
    # Character Sprites (Items 51-150)
    character_assets = [
        {'id': 51, 'name': 'Player character idle animation sprite sheet', 'search_terms': ['character idle animation sprite sheet', 'idle sprite sheet'], 'sources': ['opengameart', 'kenney', 'itchio'], 'output_dir': 'characters/sprites'},
        {'id': 52, 'name': 'Player character walking animation sprite sheet', 'search_terms': ['character walk cycle sprite sheet', 'walking animation sprite'], 'sources': ['opengameart', 'kenney', 'itchio'], 'output_dir': 'characters/sprites'},
        {'id': 53, 'name': 'Player character working animation sprite sheet', 'search_terms': ['character working typing animation', 'working animation sprite'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/sprites'},
        {'id': 54, 'name': 'Player character thinking animation sprite sheet', 'search_terms': ['character thinking pose animation', 'thinking animation sprite'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/sprites'},
        {'id': 55, 'name': 'Player character celebrating animation sprite sheet', 'search_terms': ['character celebration victory animation', 'celebration animation sprite'], 'sources': ['opengameart', 'kenney', 'itchio'], 'output_dir': 'characters/sprites'},
        {'id': 56, 'name': 'Player character stressed animation sprite sheet', 'search_terms': ['character stressed worried animation', 'stressed character sprite'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/sprites'},
        {'id': 57, 'name': 'Player character - Young/Messy variant sprite', 'search_terms': ['young messy character sprite', 'young character sprite'], 'sources': ['opengameart', 'kenney', 'itchio'], 'output_dir': 'characters/variants'},
        {'id': 58, 'name': 'Player character - Clean cut/Junior analyst variant sprite', 'search_terms': ['professional character sprite', 'business character sprite'], 'sources': ['opengameart', 'kenney', 'itchio'], 'output_dir': 'characters/variants'},
        {'id': 59, 'name': 'Player character - CEO style variant sprite', 'search_terms': ['executive CEO character sprite', 'executive character sprite'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/variants'},
        {'id': 60, 'name': 'Player character - Evil/Mid variant sprite', 'search_terms': ['flashy character sprite gold', 'flashy character sprite'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/variants'},
        {'id': 61, 'name': 'Player character - Evil/Late variant sprite', 'search_terms': ['aggressive character sprite', 'wolf wall street character'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/variants'},
        {'id': 62, 'name': 'Player character - Good/Mid variant sprite', 'search_terms': ['good character sprite', 'professional good character'], 'sources': ['opengameart', 'kenney', 'itchio'], 'output_dir': 'characters/variants'},
        {'id': 63, 'name': 'Player character - Good/Late variant sprite', 'search_terms': ['glowing character sprite', 'glowing aura character'], 'sources': ['opengameart', 'itchio', 'craftpix'], 'output_dir': 'characters/variants'},
    ]
    
    # Add emotion animations (67-76)
    emotions = ['Happy', 'Sad', 'Angry', 'Neutral', 'Excited', 'Thinking', 'Surprised', 'Confused', 'Tired', 'Confident']
    for i, emotion in enumerate(emotions, start=67):
        character_assets.append({
            'id': i,
            'name': f'Character emotion - {emotion} animation frames',
            'search_terms': [f'{emotion.lower()} character face sprite', f'{emotion.lower()} emotion sprite'],
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
    
    # Save manifest
    with open('asset_manifest.json', 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Generated asset manifest with {sum(len(cat['assets']) for cat in manifest.values() if 'assets' in cat)} assets")
    return manifest

if __name__ == "__main__":
    manifest = parse_asset_list()
    print("Asset manifest generated: asset_manifest.json")

