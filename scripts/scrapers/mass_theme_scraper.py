#!/usr/bin/env python3
"""
Mass Theme Scraper - Scrapes thousands of assets with consistent Low-poly theme
Gets themed backdrops for every location
"""

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

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mass_scraping.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MassThemeScraper:
    def __init__(self, output_dir="downloaded_assets", theme="low_poly"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        self.theme = theme
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.downloaded = []
        self.failed = []
        self.stats = {
            'total_attempted': 0,
            'total_downloaded': 0,
            'by_category': {},
            'by_source': {}
        }
        
        # Theme-specific search terms
        self.theme_terms = {
            'low_poly': [
                'low poly', 'lowpoly', '3d low poly', 'polygonal',
                'low poly game', 'isometric low poly', 'low poly asset'
            ],
            'pixel_art': [
                'pixel art', 'pixelart', '8bit', '16bit', 'retro pixel'
            ],
            'cartoon': [
                'cartoon', 'toon', 'stylized', 'hand drawn'
            ]
        }
        
        # Location backdrops needed
        self.locations = [
            'office', 'home', 'apartment', 'coffee_shop', 'cafe', 'library',
            'gym', 'park', 'mall', 'university', 'tech_hub', 'downtown',
            'networking_bar', 'stock_exchange', 'luxury_district', 'bank',
            'city_hall', 'car_dealership', 'donut_shop', 'bagel_shop',
            'flower_store', 'real_estate', 'beach', 'mountain', 'forest',
            'suburb', 'restaurant', 'bar', 'club', 'hospital', 'school',
            'warehouse', 'factory', 'airport', 'train_station', 'hotel',
            'museum', 'theater', 'stadium', 'courthouse', 'police_station',
            'fire_station', 'post_office', 'grocery_store', 'pharmacy',
            'bookstore', 'electronics_store', 'clothing_store', 'jewelry_store'
        ]
    
    def resize_image(self, image_path, target_size, output_path=None):
        """Resize image maintaining aspect ratio"""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGBA' and target_size.get('transparency', False):
                    img = img.convert('RGBA')
                
                if target_size.get('exact', False):
                    img = img.resize((target_size['width'], target_size['height']), Image.Resampling.LANCZOS)
                else:
                    img.thumbnail((target_size['width'], target_size['height']), Image.Resampling.LANCZOS)
                
                output = output_path or image_path
                img.save(output, format='PNG', optimize=True)
                return True
        except Exception as e:
            logger.error(f"Error resizing {image_path}: {e}")
            return False
    
    def download_from_url(self, url, output_path, resize_config=None):
        """Download file from URL"""
        try:
            response = self.session.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            if resize_config:
                self.resize_image(output_path, resize_config, output_path)
            
            return True
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return False
    
    def scrape_pexels_api(self, query, output_subdir, size_config, max_results=10):
        """Scrape from Pexels using their free API"""
        # Pexels free API - 200 requests/hour
        api_key = os.getenv('PEXELS_API_KEY', '')
        if not api_key:
            logger.warning("PEXELS_API_KEY not set, skipping Pexels")
            return 0
        
        base_url = "https://api.pexels.com/v1/search"
        headers = {'Authorization': api_key}
        
        try:
            response = self.session.get(base_url, headers=headers, params={
                'query': query,
                'per_page': min(max_results, 15),
                'orientation': 'landscape' if size_config['width'] > size_config['height'] else 'portrait'
            }, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                downloaded = 0
                
                for photo in data.get('photos', [])[:max_results]:
                    try:
                        # Get large size
                        photo_url = photo['src']['large'] or photo['src']['original']
                        filename = f"pexels_{photo['id']}.jpg"
                        output_path = self.output_dir / output_subdir / filename
                        
                        if self.download_from_url(photo_url, output_path, size_config):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'Pexels',
                                'url': photo_url,
                                'path': str(output_path),
                                'license': 'Free to use (Pexels License)',
                                'query': query
                            })
                            self.stats['by_source']['Pexels'] = self.stats['by_source'].get('Pexels', 0) + 1
                    except Exception as e:
                        logger.error(f"Error downloading Pexels photo: {e}")
                
                return downloaded
        except Exception as e:
            logger.error(f"Error with Pexels API: {e}")
        
        return 0
    
    def scrape_unsplash_api(self, query, output_subdir, size_config, max_results=10):
        """Scrape from Unsplash using their free API"""
        api_key = os.getenv('UNSPLASH_API_KEY', '')
        if not api_key:
            logger.warning("UNSPLASH_API_KEY not set, skipping Unsplash")
            return 0
        
        base_url = "https://api.unsplash.com/search/photos"
        headers = {'Authorization': f'Client-ID {api_key}'}
        
        try:
            response = self.session.get(base_url, headers=headers, params={
                'query': query,
                'per_page': min(max_results, 10),
                'orientation': 'landscape' if size_config['width'] > size_config['height'] else 'portrait'
            }, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                downloaded = 0
                
                for photo in data.get('results', [])[:max_results]:
                    try:
                        photo_url = photo['urls']['regular']
                        filename = f"unsplash_{photo['id']}.jpg"
                        output_path = self.output_dir / output_subdir / filename
                        
                        if self.download_from_url(photo_url, output_path, size_config):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'Unsplash',
                                'url': photo_url,
                                'path': str(output_path),
                                'license': 'Unsplash License (free)',
                                'query': query
                            })
                            self.stats['by_source']['Unsplash'] = self.stats['by_source'].get('Unsplash', 0) + 1
                    except Exception as e:
                        logger.error(f"Error downloading Unsplash photo: {e}")
                
                return downloaded
        except Exception as e:
            logger.error(f"Error with Unsplash API: {e}")
        
        return 0
    
    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=20):
        """Scrape OpenGameArt with theme-specific search"""
        base_url = "https://opengameart.org"
        # Add theme to search
        theme_term = self.theme_terms.get(self.theme, [''])[0]
        full_search = f"{search_term} {theme_term}".strip()
        search_url = f"{base_url}/art-search-advanced?keys={full_search.replace(' ', '+')}"
        
        logger.info(f"Searching OpenGameArt for: {full_search}")
        downloaded_count = 0
        
        try:
            response = self.session.get(search_url, timeout=30)
            if response.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                
                results = (soup.find_all('div', class_='node') or 
                          soup.find_all('article') or 
                          soup.find_all('div', class_='content'))
                
                for result in results[:max_results]:
                    try:
                        title_link = result.find('a', href=lambda x: x and '/content/' in x)
                        if not title_link:
                            continue
                        
                        asset_url = urljoin(base_url, title_link.get('href', ''))
                        asset_response = self.session.get(asset_url, timeout=30)
                        asset_soup = BeautifulSoup(asset_response.text, 'html.parser')
                        
                        download_link = (asset_soup.find('a', href=lambda x: x and '/download' in x) or
                                       asset_soup.find('a', class_='download'))
                        
                        if download_link:
                            file_url = urljoin(base_url, download_link.get('href', ''))
                            filename = title_link.text.strip().replace(' ', '_')[:50] + '.png'
                            filename = ''.join(c for c in filename if c.isalnum() or c in ('_', '-', '.'))
                            output_path = self.output_dir / output_subdir / filename
                            
                            if self.download_from_url(file_url, output_path, size_config):
                                downloaded_count += 1
                                self.downloaded.append({
                                    'source': 'OpenGameArt',
                                    'url': file_url,
                                    'path': str(output_path),
                                    'license': 'CC0 or CC-BY',
                                    'theme': self.theme
                                })
                                self.stats['by_source']['OpenGameArt'] = self.stats['by_source'].get('OpenGameArt', 0) + 1
                        
                        time.sleep(random.uniform(1, 2))
                    except Exception as e:
                        logger.debug(f"Error processing result: {e}")
                        continue
        except Exception as e:
            logger.error(f"Error scraping OpenGameArt: {e}")
        
        return downloaded_count
    
    def generate_mass_asset_list(self, target_count=5000):
        """Generate list of thousands of assets to scrape"""
        assets = []
        
        # Location backdrops (50 locations × 10 variations = 500)
        for location in self.locations:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{location}_backdrop_{i}",
                    'search_terms': [f"{location} {self.theme}", f"{location} interior {self.theme}", f"{location} background {self.theme}"],
                    'sources': ['pexels', 'unsplash', 'opengameart'],
                    'output_dir': f'backgrounds/locations/{location}',
                    'size': {'width': 1920, 'height': 1080, 'transparency': False, 'exact': True},
                    'category': 'background'
                })
        
        # Character sprites (1000 assets)
        character_variants = ['idle', 'walk', 'run', 'work', 'think', 'celebrate', 'sad', 'angry', 'happy', 'tired', 'excited', 'confused', 'confident', 'stressed']
        character_types = ['player', 'npc', 'boss', 'colleague', 'friend', 'enemy', 'mentor', 'student', 'customer', 'vendor']
        for char_type in character_types:
            for variant in character_variants:
                for i in range(7):
                    assets.append({
                        'id': len(assets) + 1,
                        'name': f"{char_type}_{variant}_{i}",
                        'search_terms': [f"{self.theme} {char_type} {variant}", f"{self.theme} character sprite"],
                        'sources': ['opengameart'],
                        'output_dir': 'characters/sprites',
                        'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': False},
                        'category': 'character'
                    })
        
        # Map assets (500 assets)
        map_items = ['tree', 'building', 'house', 'road', 'path', 'grass', 'water', 'rock', 'fence', 'gate', 'bench', 'streetlight', 'sign', 'mailbox', 'car', 'bike', 'bus', 'truck', 'lamp_post', 'fountain', 'statue', 'garden', 'hedge', 'wall']
        for item in map_items:
            for i in range(20):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{item}_map_{i}",
                    'search_terms': [f"{self.theme} {item}", f"{self.theme} {item} asset", f"{self.theme} {item} sprite"],
                    'sources': ['opengameart'],
                    'output_dir': 'map/assets',
                    'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': True},
                    'category': 'map'
                })
        
        # Icons (500 assets)
        icons = ['bed', 'desk', 'chair', 'table', 'lamp', 'computer', 'phone', 'book', 'coffee', 'food', 'bag', 'wallet', 'keys', 'glasses', 'watch', 'hat', 'shirt', 'pants', 'shoes', 'jacket', 'laptop', 'tablet', 'notebook', 'pen', 'pencil', 'drink', 'cup', 'plate', 'fork', 'knife']
        for icon in icons:
            for i in range(16):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{icon}_icon_{i}",
                    'search_terms': [f"{icon} icon {self.theme}", f"{self.theme} {icon}"],
                    'sources': ['opengameart'],
                    'output_dir': 'icons/items',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'icon'
                })
        
        # Vehicles (300 assets)
        vehicles = ['car', 'bike', 'motorcycle', 'bus', 'truck', 'taxi', 'scooter', 'van', 'suv', 'sedan', 'coupe', 'convertible', 'pickup', 'delivery_truck', 'ambulance']
        for vehicle in vehicles:
            for i in range(20):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{vehicle}_sprite_{i}",
                    'search_terms': [f"{self.theme} {vehicle}", f"{self.theme} {vehicle} sprite"],
                    'sources': ['opengameart'],
                    'output_dir': 'vehicles/sprites',
                    'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': True},
                    'category': 'vehicle'
                })
        
        # UI elements (300 assets)
        ui_elements = ['button', 'panel', 'frame', 'border', 'arrow', 'checkmark', 'x', 'plus', 'minus', 'star', 'heart', 'shield', 'sword', 'coin', 'gem', 'key', 'lock', 'unlock', 'settings', 'menu', 'close', 'maximize', 'minimize', 'refresh', 'download', 'upload', 'save', 'load', 'delete', 'edit']
        for ui in ui_elements:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{ui}_ui_{i}",
                    'search_terms': [f"{self.theme} {ui} ui", f"{self.theme} {ui} element"],
                    'sources': ['opengameart'],
                    'output_dir': 'ui/elements',
                    'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': True},
                    'category': 'ui'
                })
        
        # Particle effects (200 assets)
        particles = ['sparkle', 'star', 'glow', 'smoke', 'fire', 'water', 'bubble', 'dust', 'magic', 'energy', 'lightning', 'explosion', 'confetti', 'snow', 'rain', 'leaf']
        for particle in particles:
            for i in range(12):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{particle}_effect_{i}",
                    'search_terms': [f"{self.theme} {particle} effect", f"{self.theme} {particle} particle"],
                    'sources': ['opengameart'],
                    'output_dir': 'effects/particles',
                    'size': {'width': 32, 'height': 32, 'transparency': True, 'exact': True},
                    'category': 'effect'
                })
        
        # Feature icons (500 assets)
        features = ['bed', 'desk', 'computer', 'chair', 'table', 'lamp', 'window', 'door', 'shelf', 'plant', 'kitchen', 'bathroom', 'shower', 'toilet', 'sink', 'refrigerator', 'stove', 'microwave', 'tv', 'sofa', 'bookshelf', 'dresser', 'mirror', 'clock', 'calendar', 'phone', 'printer', 'scanner', 'monitor', 'keyboard']
        for feature in features:
            for i in range(16):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{feature}_feature_{i}",
                    'search_terms': [f"{self.theme} {feature}", f"{self.theme} {feature} icon"],
                    'sources': ['opengameart'],
                    'output_dir': 'icons/features',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'icon'
                })
        
        return assets[:target_count]
    
    def scrape_asset(self, asset):
        """Scrape a single asset"""
        asset_id = asset.get('id')
        asset_name = asset.get('name')
        search_terms = asset.get('search_terms', [asset_name])
        sources = asset.get('sources', ['opengameart'])
        output_subdir = asset.get('output_dir', 'misc')
        size_config = asset.get('size', {'width': 64, 'height': 64, 'transparency': True, 'exact': True})
        category = asset.get('category', 'other')
        
        logger.info(f"Scraping asset {asset_id}: {asset_name} ({category})")
        self.stats['total_attempted'] += 1
        self.stats['by_category'][category] = self.stats['by_category'].get(category, 0) + 1
        
        success = False
        for source in sources:
            try:
                if source == 'pexels':
                    count = self.scrape_pexels_api(search_terms[0], output_subdir, size_config, max_results=3)
                    if count > 0:
                        success = True
                        self.stats['total_downloaded'] += count
                        break
                
                elif source == 'unsplash':
                    count = self.scrape_unsplash_api(search_terms[0], output_subdir, size_config, max_results=3)
                    if count > 0:
                        success = True
                        self.stats['total_downloaded'] += count
                        break
                
                elif source == 'opengameart':
                    count = self.scrape_opengameart_theme(search_terms[0], output_subdir, size_config, max_results=5)
                    if count > 0:
                        success = True
                        self.stats['total_downloaded'] += count
                        break
                
                time.sleep(random.uniform(0.5, 1.5))
                
            except Exception as e:
                logger.error(f"Error with source {source} for {asset_name}: {e}")
                continue
        
        if not success:
            self.stats['total_failed'] = self.stats.get('total_failed', 0) + 1
            self.failed.append({
                'asset_id': asset_id,
                'asset_name': asset_name,
                'category': category,
                'search_terms': search_terms
            })
        
        return success
    
    def save_manifest(self):
        """Save download manifest"""
        manifest = {
            'theme': self.theme,
            'downloaded': self.downloaded,
            'failed': self.failed,
            'stats': self.stats,
            'timestamp': time.time()
        }
        
        manifest_path = self.output_dir / f'manifest_{self.theme}_mass.json'
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        logger.info(f"Manifest saved to {manifest_path}")
    
    def run_mass_scraping(self, target_count=5000):
        """Run mass scraping"""
        logger.info("=" * 60)
        logger.info(f"Starting MASS Theme Scraping")
        logger.info(f"Theme: {self.theme}")
        logger.info(f"Target: {target_count} assets")
        logger.info("=" * 60)
        
        # Generate asset list
        logger.info("Generating asset list...")
        assets = self.generate_mass_asset_list(target_count)
        logger.info(f"Generated {len(assets)} assets to scrape")
        
        # Scrape assets
        logger.info("Starting scraping process...")
        for i, asset in enumerate(assets, 1):
            self.scrape_asset(asset)
            
            # Save progress every 100 assets
            if i % 100 == 0:
                logger.info(f"Progress: {i}/{len(assets)} assets processed")
                logger.info(f"Downloaded: {self.stats['total_downloaded']}, Failed: {self.stats.get('total_failed', 0)}")
                self.save_manifest()
            
            # Be polite
            time.sleep(random.uniform(0.5, 1.5))
        
        # Final save
        self.save_manifest()
        
        logger.info("=" * 60)
        logger.info(f"Scraping complete!")
        logger.info(f"Total downloaded: {self.stats['total_downloaded']}")
        logger.info(f"Total failed: {self.stats.get('total_failed', 0)}")
        logger.info("=" * 60)

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Mass theme scraper')
    parser.add_argument('--theme', default='low_poly', choices=['low_poly', 'pixel_art', 'cartoon'],
                       help='Theme to scrape')
    parser.add_argument('--count', type=int, default=5000, help='Target number of assets')
    args = parser.parse_args()
    
    scraper = MassThemeScraper(theme=args.theme)
    scraper.run_mass_scraping(target_count=args.count)

if __name__ == "__main__":
    main()

