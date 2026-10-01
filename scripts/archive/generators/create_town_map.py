#!/usr/bin/env python3
"""
Create town map with roads, zones, and layered assets
Follows 50 design criteria
"""

import json
from pathlib import Path
from PIL import Image, ImageDraw
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TownMapGenerator:
    def __init__(self, output_dir="assets/map"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Map configuration
        self.map_config = {
            'cols': 30,
            'rows': 30,
            'tile_size': 20,  # 20px per tile = 600x600px map
            'road_width': 1,   # 1 tile wide roads
        }
        
        # Zone definitions
        self.zones = {
            'residential': {'color': (200, 220, 240), 'buildings': 'houses'},
            'commercial': {'color': (240, 220, 200), 'buildings': 'shops'},
            'education': {'color': (220, 240, 220), 'buildings': 'schools'},
            'finance': {'color': (240, 240, 200), 'buildings': 'offices'},
            'government': {'color': (220, 200, 240), 'buildings': 'public'},
            'park': {'color': (200, 240, 200), 'buildings': 'none'}
        }
    
    def generate_map_data(self):
        """Generate map data structure"""
        logger.info("Generating map data...")
        
        map_data = {
            'terrain': [],  # Base layer
            'roads': [],    # Road layer
            'zones': [],    # Zone layer
            'buildings': [], # Building layer
            'decorations': [] # Trees, etc.
        }
        
        total_tiles = self.map_config['cols'] * self.map_config['rows']
        
        # Initialize terrain (all grass)
        map_data['terrain'] = ['grass'] * total_tiles
        
        # Generate road network
        map_data['roads'] = self._generate_roads()
        
        # Generate zones
        map_data['zones'] = self._generate_zones(map_data['roads'])
        
        # Place buildings on roads
        map_data['buildings'] = self._place_buildings(map_data['roads'], map_data['zones'])
        
        # Add decorations
        map_data['decorations'] = self._add_decorations(map_data['roads'], map_data['zones'])
        
        return map_data
    
    def _generate_roads(self):
        """Generate road network"""
        roads = [None] * (self.map_config['cols'] * self.map_config['rows'])
        
        # Main horizontal roads (every 6 rows)
        for row in range(6, self.map_config['rows'], 6):
            for col in range(self.map_config['cols']):
                idx = row * self.map_config['cols'] + col
                if col == 0 or col == self.map_config['cols'] - 1:
                    roads[idx] = 'road_end_h'
                elif col % 6 == 0:
                    roads[idx] = 'road_intersection'
                else:
                    roads[idx] = 'road_main_h'
        
        # Main vertical roads (every 6 columns)
        for col in range(6, self.map_config['cols'], 6):
            for row in range(self.map_config['rows']):
                idx = row * self.map_config['cols'] + col
                if row == 0 or row == self.map_config['rows'] - 1:
                    if roads[idx] is None:
                        roads[idx] = 'road_end_v'
                elif row % 6 == 0:
                    roads[idx] = 'road_intersection'
                elif roads[idx] is None:
                    roads[idx] = 'road_main_v'
        
        # Secondary roads (connect main roads)
        for row in range(3, self.map_config['rows'], 6):
            if row % 6 != 0:
                for col in range(self.map_config['cols']):
                    idx = row * self.map_config['cols'] + col
                    if roads[idx] is None and col % 6 == 0:
                        roads[idx] = 'road_secondary_h'
        
        for col in range(3, self.map_config['cols'], 6):
            if col % 6 != 0:
                for row in range(self.map_config['rows']):
                    idx = row * self.map_config['cols'] + col
                    if roads[idx] is None and row % 6 == 0:
                        roads[idx] = 'road_secondary_v'
        
        return roads
    
    def _generate_zones(self, roads):
        """Generate zones based on road network"""
        zones = [None] * len(roads)
        
        # Define zone areas
        zone_map = {
            (0, 0, 12, 12): 'residential',
            (12, 0, 18, 12): 'commercial',
            (18, 0, 30, 12): 'education',
            (0, 12, 12, 18): 'park',
            (12, 12, 24, 18): 'finance',
            (24, 12, 30, 18): 'government',
            (0, 18, 18, 30): 'residential',
            (18, 18, 30, 30): 'commercial'
        }
        
        for (x1, y1, x2, y2), zone_type in zone_map.items():
            for row in range(y1, y2):
                for col in range(x1, x2):
                    idx = row * self.map_config['cols'] + col
                    if roads[idx] is None:  # Don't zone roads
                        zones[idx] = zone_type
        
        return zones
    
    def _place_buildings(self, roads, zones):
        """Place buildings along roads in zones"""
        buildings = [None] * len(roads)
        
        for idx, zone in enumerate(zones):
            if zone and roads[idx] is None:
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                
                # Check if adjacent to road
                adjacent_to_road = False
                for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                    new_row, new_col = row + dr, col + dc
                    if 0 <= new_row < self.map_config['rows'] and 0 <= new_col < self.map_config['cols']:
                        road_idx = new_row * self.map_config['cols'] + new_col
                        if roads[road_idx] is not None:
                            adjacent_to_road = True
                            break
                
                # Place building if adjacent to road and in valid zone
                if adjacent_to_road and (row + col) % 3 == 0:  # Sparse placement
                    building_type = self.zones[zone]['buildings']
                    if building_type != 'none':
                        buildings[idx] = f"{building_type}_{(row * col) % 3}"  # Variant
        
        return buildings
    
    def _add_decorations(self, roads, zones):
        """Add trees and decorations"""
        decorations = [None] * len(roads)
        
        for idx, zone in enumerate(zones):
            if zone == 'park' and roads[idx] is None:
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                if (row + col) % 4 == 0:  # Sparse tree placement
                    decorations[idx] = 'tree'
        
        return decorations
    
    def render_map(self, map_data, asset_paths):
        """Render map with layered assets"""
        logger.info("Rendering map...")
        
        width = self.map_config['cols'] * self.map_config['tile_size']
        height = self.map_config['rows'] * self.map_config['tile_size']
        
        # Create base image
        img = Image.new('RGB', (width, height), (180, 200, 180))  # Light green grass
        draw = ImageDraw.Draw(img)
        
        # Draw zones
        for idx, zone in enumerate(map_data['zones']):
            if zone:
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                x = col * self.map_config['tile_size']
                y = row * self.map_config['tile_size']
                color = self.zones[zone]['color']
                draw.rectangle([x, y, x + self.map_config['tile_size'], y + self.map_config['tile_size']], 
                             fill=color, outline=None)
        
        # Draw roads
        road_color = (100, 100, 100)
        for idx, road in enumerate(map_data['roads']):
            if road:
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                x = col * self.map_config['tile_size']
                y = row * self.map_config['tile_size']
                draw.rectangle([x, y, x + self.map_config['tile_size'], y + self.map_config['tile_size']], 
                             fill=road_color, outline=None)
        
        # Draw buildings (would use actual asset images)
        building_color = (150, 120, 100)
        for idx, building in enumerate(map_data['buildings']):
            if building:
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                x = col * self.map_config['tile_size']
                y = row * self.map_config['tile_size']
                # Draw simple rectangle for now (would be replaced with actual asset)
                draw.rectangle([x + 2, y + 2, x + self.map_config['tile_size'] - 2, y + self.map_config['tile_size'] - 2], 
                             fill=building_color, outline=(100, 80, 60))
        
        # Draw decorations
        tree_color = (50, 150, 50)
        for idx, decoration in enumerate(map_data['decorations']):
            if decoration == 'tree':
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                x = col * self.map_config['tile_size'] + self.map_config['tile_size'] // 2
                y = row * self.map_config['tile_size'] + self.map_config['tile_size'] // 2
                # Draw simple circle for tree (would be replaced with actual asset)
                radius = self.map_config['tile_size'] // 3
                draw.ellipse([x - radius, y - radius, x + radius, y + radius], 
                           fill=tree_color, outline=(30, 100, 30))
        
        return img
    
    def save_map(self, map_data, img):
        """Save map data and image"""
        # Save map data as JSON
        map_json = {
            'config': self.map_config,
            'data': {
                'roads': map_data['roads'],
                'zones': map_data['zones'],
                'buildings': map_data['buildings'],
                'decorations': map_data['decorations']
            }
        }
        
        with open(self.output_dir / 'town_map_data.json', 'w') as f:
            json.dump(map_json, f, indent=2)
        
        # Save map image
        img.save(self.output_dir / 'town_map_base.png')
        
        logger.info(f"Map saved to {self.output_dir}")
        return map_json

def main():
    generator = TownMapGenerator()
    map_data = generator.generate_map_data()
    img = generator.render_map(map_data, {})
    generator.save_map(map_data, img)
    logger.info("Town map generated successfully!")

if __name__ == "__main__":
    main()

