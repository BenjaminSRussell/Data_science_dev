import logging
import json
from pathlib import Path
from PIL import Image, ImageDraw

logger = logging.getLogger(__name__)

class TownMapGenerator:
    def __init__(self, map_config=None, zones=None, output_dir=None):
        self.map_config = map_config or {
            'rows': 30,
            'cols': 30,
            'tile_size': 32
        }
        self.zones = zones or {
            'residential': {'color': (200, 230, 200), 'buildings': 'house'},
            'commercial': {'color': (230, 220, 170), 'buildings': 'store'},
            'education': {'color': (200, 200, 255), 'buildings': 'school'},
            'park': {'color': (150, 200, 150), 'buildings': 'none'},
            'finance': {'color': (255, 200, 150), 'buildings': 'bank'},
            'government': {'color': (200, 180, 200), 'buildings': 'government'},
        }
        self.output_dir = Path(output_dir or 'maps') / 'town'
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_map_data(self):
        roads = self._generate_roads()
        zones = self._generate_zones(roads)
        buildings = self._place_buildings(roads, zones)
        decorations = self._add_decorations(roads, zones)
        return {
            'roads': roads,
            'zones': zones,
            'buildings': buildings,
            'decorations': decorations
        }

    def _generate_roads(self):
        """Generate a road network with intersections and edge markers"""
        roads = [None] * (self.map_config['rows'] * self.map_config['cols'])
        
        # Generate horizontal roads
        for row in range(self.map_config['rows']):
            if row % 6 == 0:
                for col in range(self.map_config['cols']):
                    idx = row * self.map_config['cols'] + col
                    if col == 0:
                        roads[idx] = 'road_end_h'
                    elif col == self.map_config['cols'] - 1:
                        roads[idx] = 'road_end_h'
                    else:
                        roads[idx] = 'road_h'
        
        # Generate vertical roads
        for col in range(self.map_config['cols']):
            if col % 6 == 0:
                for row in range(self.map_config['rows']):
                    idx = row * self.map_config['cols'] + col
                    if row == 0:
                        roads[idx] = 'road_end_v'
                    elif row == self.map_config['rows'] - 1:
                        roads[idx] = 'road_end_v'
                    else:
                        roads[idx] = 'road_v'
        
        # Generate secondary roads
        for row in range(self.map_config['rows']):
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
            if decoration:
                row = idx // self.map_config['cols']
                col = idx % self.map_config['cols']
                x = col * self.map_config['tile_size']
                y = row * self.map_config['tile_size']
                # Draw simple rectangle for now (would be replaced with actual asset)
                draw.rectangle([x + 2, y + 2, x + self.map_config['tile_size'] - 2, y + self.map_config['tile_size'] - 2], 
                             fill=tree_color, outline=(100, 80, 60))
        
        return img
    
    def save_map(self, map_data, asset_paths, filename):
        img = self.render_map(map_data, asset_paths)
        img.save(self.output_dir / filename)
        logger.info(f"Map saved to {self.output_dir / filename}")

def main():
    logging.basicConfig(level=logging.INFO)
    generator = TownMapGenerator()
    map_data = generator.generate_map_data()
    generator.save_map(map_data, {}, 'town_map.png')

if __name__ == '__main__':
    main()