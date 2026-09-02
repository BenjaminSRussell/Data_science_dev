import json
import os
import sys
from pathlib import Path
import time
import logging
import requests
from PIL import Image
import io
import random
import subprocess
import shutil
from urllib.parse import urljoin  # Added this import

class MassThemeScraper:
    def __init__(self, theme='low_poly'):
        self.theme = theme
        self.output_dir = Path(f'assets/{theme}')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.downloaded = []
        self.failed = []
        self.stats = {
            'total_attempted': 0,
            'total_downloaded': 0,
            'total_failed': 0,
            'by_category': {}
        }
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
    
    def scrape_pexels_api(self, query, output_subdir, size_config, max_results=5):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            self.logger.error("PEXELS_API_KEY environment variable is not set")
            return 0
        
        params = {
            'query': query,
            'per_page': max_results,
            'size': size_config.get('width'),
            'orientation': 'portrait' if size_config.get('height') > size_config.get('width') else 'landscape'
        }
        url = 'https://api.pexels.com/v1/search'
        headers = {'Authorization': api_key}
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            self.logger.error(f"Pexels API request failed with status code {response.status_code}")
            return 0
        
        data = response.json()
        count = 0
        for entry in data.get('photos', []):
            img_url = entry['src']['original']
            self.download_image(img_url, output_subdir, size_config)
            count += 1
            if count >= max_results:
                break
        
        return count
    
    def scrape_unsplash_api(self, query, output_subdir, size_config, max_results=5):
        api_key = os.getenv('UNSPLASH_ACCESS_KEY')
        if not api_key:
            self.logger.error("UNSPLASH_ACCESS_KEY environment variable is not set")
            return 0
        
        url = f'https://api.unsplash.com/search/photos'
        params = {
            'query': query,
            'per_page': max_results,
            'orientation': 'portrait' if size_config.get('height') > size_config.get('width') else 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            self.logger.error(f"Unsplash API request failed with status code {response.status_code}")
            return 0
        
        data = response.json()
        count = 0
        for entry in data.get('results', []):
            img_url = entry['urls']['full']
            self.download_image(img_url, output_subdir, size_config)
            count += 1
            if count >= max_results:
                break
        
        return count
    
    def scrape_opengameart_theme(self, query, output_subdir, size_config, max_results=5):
        base_url = 'https://opengameart.org'
        search_url = f'{base_url}/search/node/{query}'
        
        response = requests.get(search_url)
        if response.status_code != 200:
            self.logger.error(f"OpenGameArt search request failed with status code {response.status_code}")
            return 0
        
        soup = BeautifulSoup(response.content, 'html.parser')
        results = soup.find_all('a', class_='content-title')
        count = 0
        for result in results[:max_results]:
            asset_url = urljoin(base_url, result.get('href', ''))
            
            response = requests.get(asset_url)
            if response.status_code != 200:
                self.logger.error(f"OpenGameArt asset page request failed with status code {response.status_code}")
                continue
            
            soup = BeautifulSoup(response.content, 'html.parser')
            download_link = soup.find('a', {'data-dropdown': 'files-dropdown'})
            if download_link:
                file_url = urljoin(base_url, download_link.get('href', ''))
                
                try:
                    response = requests.get(file_url)
                    if response.status_code != 200:
                        raise Exception(f"Download failed with status code {response.status_code}")
                    
                    img = Image.open(io.BytesIO(response.content))
                    if img.width == size_config.get('width') and img.height == size_config.get('height'):
                        output_path = self.output_dir / output_subdir / f"{result.text.strip()}.png"
                        output_path.parent.mkdir(parents=True, exist_ok=True)
                        img.save(output_path)
                        self.downloaded.append(str(output_path))
                        count += 1
                        self.logger.info(f"Downloaded {output_path}")
                    else:
                        self.logger.warning(f"Size mismatch: {result.text.strip()} ({img.width}x{img.height})")
                except Exception as e:
                    self.logger.debug(f"Error processing result: {e}")
                    continue
        
        return count
    
    def download_image(self, img_url, output_subdir, size_config):
        response = requests.get(img_url)
        if response.status_code != 200:
            self.logger.error(f"Failed to download image from {img_url} with status code {response.status_code}")
            return
        
        img = Image.open(io.BytesIO(response.content))
        if size_config.get('exact'):
            if img.width == size_config.get('width') and img.height == size_config.get('height'):
                output_path = self.output_dir / output_subdir / f"{Path(img_url).stem}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(str(output_path))
                self.logger.info(f"Downloaded {output_path}")
            else:
                self.logger.warning(f"Size mismatch: {Path(img_url).stem} ({img.width}x{img.height})")
        else:
            img = img.resize((size_config.get('width'), size_config.get('height')), Image.ANTIALIAS)
            output_path = self.output_dir / output_subdir / f"{Path(img_url).stem}.png"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            img.save(output_path)
            self.downloaded.append(str(output_path))
            self.logger.info(f"Downloaded {output_path}")
    
    def generate_mass_asset_list(self, target_count=5000):
        assets = []
        
        # Character avatars (4000 assets)
        characters = ['female', 'male', 'character', 'hero', 'villain', 'monster', 'npc', 'avatar', 'character_model', 'character_design', 'character_sprite', 'character_icon', 'character_portrait']
        for character in characters:
            for i in range(48):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{character}_avatar_{i}",
                    'search_terms': [f"{self.theme} {character} avatar", f"{self.theme} {character} character"],
                    'sources': ['opengameart', 'pexels', 'unsplash'],
                    'output_dir': 'characters',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'avatar'
                })
        
        # Map assets (400 assets)
        maps = ['forest', 'mountain', 'cave', 'desert', 'beach', 'city', 'village', 'town', 'castle', 'ruins', 'space', 'underwater', 'wilderness', 'ocean', 'jungle', 'ice', 'volcano', 'lake', 'river', 'plain']
        for map_type in maps:
            for i in range(12):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{map_type}_map_{i}",
                    'search_terms': [f"{self.theme} {map_type} map", f"{self.theme} {map_type} environment"],
                    'sources': ['opengameart'],
                    'output_dir': 'maps',
                    'size': {'width': 512, 'height': 512, 'transparency': True, 'exact': True},
                    'category': 'map'
                })
        
        # Feature icons (500 assets)
        features = ['bed', 'desk', 'computer', 'chair', 'table', 'lamp', 'window', 'door', 'shelf', 'plant', 'kitchen', 'bathroom', 'shower', 'toilet', 'sink', 'refrigerator', 'stove', 'microwave', 'tv', 'sofa', 'bookshelf', 'dresser', 'mirror', 'clock', 'calendar', 'phone', 'printer', 'scanner', 'monitor', 'keyboard']
        for feature in features:
            for i in range(16):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{feature}_feature_{i}",
                    'search_terms': [f"{self.theme} {feature}", f"{self.theme} {feature} icon"],
                    'sources': ['opengameart', 'pexels', 'unsplash'],
                    'output_dir': 'icons',
                    'size': {'width': 32, 'height': 32, 'transparency': True, 'exact': True},
                    'category': 'icon'
                })
        
        # Vehicle assets (200 assets)
        vehicles = ['car', 'truck', 'motorcycle', 'bicycle', 'airplane', 'helicopter', 'boat', 'ship', 'train', 'tank', 'bus', 'scooter', 'jet', 'suv', 'convertible']
        for vehicle in vehicles:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{vehicle}_vehicle_{i}",
                    'search_terms': [f"{self.theme} {vehicle} vehicle", f"{self.theme} {vehicle} transportation"],
                    'sources': ['opengameart'],
                    'output_dir': 'vehicles',
                    'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': True},
                    'category': 'vehicle'
                })
        
        # Weapon assets (200 assets)
        weapons = ['sword', 'axe', 'gun', 'bow', 'rifle', 'pistol', 'knife', 'mace', 'staff', 'dart', 'crossbow', 'spear', 'hammer', 'blade', 'gun']
        for weapon in weapons:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{weapon}_weapon_{i}",
                    'search_terms': [f"{self.theme} {weapon} weapon", f"{self.theme} {weapon} tool"],
                    'sources': ['opengameart'],
                    'output_dir': 'weapons',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'weapon'
                })
        
        # UI elements (200 assets)
        ui_elements = ['button', 'slider', 'checkbox', 'radio', 'dropdown', 'dialog', 'tooltip', 'progress', 'bar', 'menu', 'tab', 'icon', 'panel', 'header', 'footer']
        for ui_element in ui_elements:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{ui_element}_ui_{i}",
                    'search_terms': [f"{self.theme} {ui_element} ui", f"{self.theme} {ui_element} graphic"],
                    'sources': ['opengameart'],
                    'output_dir': 'ui',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'ui'
                })
        
        # Particle effects (200 assets)
        particle_effects = ['explosion', 'fire', 'smoke', 'spark', 'dust', 'water', 'blood', 'light', 'star', 'cloud', 'trail', 'flash', 'wave', 'ripple', 'shockwave']
        for particle_effect in particle_effects:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{particle_effect}_particle_{i}",
                    'search_terms': [f"{self.theme} {particle_effect} particle", f"{self.theme} {particle_effect} effect"],
                    'sources': ['opengameart'],
                    'output_dir': 'particles',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'particle'
                })
        
        # Environmental assets (200 assets)
        environmental_assets = ['tree', 'rock', 'flower', 'grass', 'plant', 'mushroom', 'fungus', 'lichen', 'bush', 'cactus', 'fern', 'vine', 'bush', 'shrub', 'bush']
        for environmental_asset in environmental_assets:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{environmental_asset}_environment_{i}",
                    'search_terms': [f"{self.theme} {environmental_asset} environment", f"{self.theme} {environmental_asset} nature"],
                    'sources': ['opengameart'],
                    'output_dir': 'environment',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'environment'
                })
        
        # Miscellaneous assets (200 assets)
        miscellaneous_assets = ['coin', 'gem', 'key', 'lock', 'note', 'book', 'scroll', 'ticket', 'badge', 'coin', 'token', 'sticker', 'ribbon', 'medal', 'trophy']
        for miscellaneous_asset in miscellaneous_assets:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{miscellaneous_asset}_misc_{i}",
                    'search_terms': [f"{self.theme} {miscellaneous_asset} misc", f"{self.theme} {miscellaneous_asset} item"],
                    'sources': ['opengameart'],
                    'output_dir': 'misc',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'misc'
                })
        
        return assets[:target_count]
    
    def scrape_assets(self):
        asset_list = self.generate_mass_asset_list()
        for asset in asset_list:
            for source in asset['sources']:
                if source == 'opengameart':
                    self.scrape_opengameart_theme(asset['search_terms'][0], asset['output_dir'], asset['size'])
                elif source == 'pexels':
                    self.scrape_pexels_api(asset['search_terms'][0], asset['output_dir'], asset['size'])
                elif source == 'unsplash':
                    self.scrape_unsplash_api(asset['search_terms'][0], asset['output_dir'], asset['size'])
    
    def save_downloaded_list(self):
        with open(self.output_dir / 'downloaded_assets.txt', 'w') as f:
            for path in self.downloaded:
                f.write(f"{path}\n")
    
    def save_failed_list(self):
        with open(self.output_dir / 'failed_assets.txt', 'w') as f:
            for item in self.failed:
                f.write(f"{item}\n")

if __name__ == '__main__':
    scraper = MassThemeScraper()
    scraper.scrape_assets()
    scraper.save_downloaded_list()
    scraper.save_failed_list()