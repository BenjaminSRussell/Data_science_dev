#!/usr/bin/env python3
"""
Specialized Location Backdrop Scraper
Scrapes Low-poly location backdrops from multiple sources
"""

import json
import os
from pathlib import Path
import time
import logging
import requests
from PIL import Image
import random
from urllib.parse import urljoin
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BackdropScraper:
    def __init__(self, output_dir="downloaded_assets/backgrounds/locations"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.downloaded = []
        self.failed = []
        self.stats = {'total': 0, 'downloaded': 0, 'failed': 0}
        
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
    
    def resize_image(self, image_path, target_size=(1920, 1080)):
        """Resize backdrop to target size"""
        try:
            with Image.open(image_path) as img:
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                img = img.resize(target_size, Image.Resampling.LANCZOS)
                img.save(image_path, 'JPEG', quality=85, optimize=True)
                return True
        except Exception as e:
            logger.error(f"Error resizing {image_path}: {e}")
            return False
    
    def download_file(self, url, output_path):
        """Download file from URL"""
        try:
            response = self.session.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Resize to 1920x1080
            self.resize_image(output_path)
            return True
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return False
    
    def scrape_pexels_backdrop(self, location, max_results=10):
        """Scrape backdrops from Pexels"""
        api_key = os.getenv('PEXELS_API_KEY', '')
        if not api_key:
            return 0
        
        base_url = "https://api.pexels.com/v1/search"
        headers = {'Authorization': api_key}
        
        queries = [
            f"{location} interior low poly",
            f"{location} background",
            f"{location} scene"
        ]
        
        downloaded = 0
        location_dir = self.output_dir / location
        location_dir.mkdir(parents=True, exist_ok=True)
        
        for query in queries:
            try:
                response = self.session.get(base_url, headers=headers, params={
                    'query': query,
                    'per_page': min(max_results, 15),
                    'orientation': 'landscape'
                }, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    for photo in data.get('photos', [])[:max_results]:
                        photo_url = photo['src']['large']
                        filename = f"pexels_{location}_{photo['id']}.jpg"
                        output_path = location_dir / filename
                        
                        if not output_path.exists() and self.download_file(photo_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'Pexels',
                                'location': location,
                                'url': photo_url,
                                'path': str(output_path),
                                'license': 'Pexels License'
                            })
            except Exception as e:
                logger.error(f"Error with Pexels for {location}: {e}")
        
        return downloaded
    
    def scrape_unsplash_backdrop(self, location, max_results=10):
        """Scrape backdrops from Unsplash"""
        api_key = os.getenv('UNSPLASH_API_KEY', '')
        if not api_key:
            return 0
        
        base_url = "https://api.unsplash.com/search/photos"
        headers = {'Authorization': f'Client-ID {api_key}'}
        
        queries = [
            f"{location} interior",
            f"{location} background",
            f"{location} low poly"
        ]
        
        downloaded = 0
        location_dir = self.output_dir / location
        location_dir.mkdir(parents=True, exist_ok=True)
        
        for query in queries:
            try:
                response = self.session.get(base_url, headers=headers, params={
                    'query': query,
                    'per_page': min(max_results, 10),
                    'orientation': 'landscape'
                }, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    for photo in data.get('results', [])[:max_results]:
                        photo_url = photo['urls']['regular']
                        filename = f"unsplash_{location}_{photo['id']}.jpg"
                        output_path = location_dir / filename
                        
                        if not output_path.exists() and self.download_file(photo_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'Unsplash',
                                'location': location,
                                'url': photo_url,
                                'path': str(output_path),
                                'license': 'Unsplash License'
                            })
            except Exception as e:
                logger.error(f"Error with Unsplash for {location}: {e}")
        
        return downloaded
    
    def scrape_opengameart_backdrop(self, location, max_results=5):
        """Scrape backdrops from OpenGameArt"""
        base_url = "https://opengameart.org"
        search_terms = [
            f"{location} low poly background",
            f"{location} interior low poly",
            f"{location} scene low poly"
        ]
        
        downloaded = 0
        location_dir = self.output_dir / location
        location_dir.mkdir(parents=True, exist_ok=True)
        
        for search_term in search_terms:
            try:
                search_url = f"{base_url}/art-search-advanced?keys={search_term.replace(' ', '+')}"
                response = self.session.get(search_url, timeout=30)
                soup = BeautifulSoup(response.text, 'html.parser')
                results = soup.find_all('div', class_='node') or soup.find_all('article')
                
                for result in results[:max_results]:
                    title_link = result.find('a', href=lambda x: x and '/content/' in x)
                    if not title_link:
                        continue
                    
                    asset_url = urljoin(base_url, title_link.get('href', ''))
                    asset_response = self.session.get(asset_url, timeout=30)
                    asset_soup = BeautifulSoup(asset_response.text, 'html.parser')
                    download_link = asset_soup.find('a', href=lambda x: x and '/download' in x)
                    
                    if download_link:
                        file_url = urljoin(base_url, download_link.get('href', ''))
                        filename = f"oga_{location}_{len(self.downloaded)}.png"
                        output_path = location_dir / filename
                        
                        if not output_path.exists() and self.download_file(file_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'OpenGameArt',
                                'location': location,
                                'url': file_url,
                                'path': str(output_path),
                                'license': 'CC0 or CC-BY'
                            })
                    
                    time.sleep(1)
            except Exception as e:
                logger.error(f"Error scraping OpenGameArt for {location}: {e}")
        
        return downloaded
    
    def run(self):
        """Run backdrop scraping for all locations"""
        logger.info(f"Starting backdrop scraping for {len(self.locations)} locations")
        
        for location in self.locations:
            logger.info(f"Scraping backdrops for: {location}")
            
            # Try all sources
            pexels_count = self.scrape_pexels_backdrop(location, max_results=5)
            unsplash_count = self.scrape_unsplash_backdrop(location, max_results=5)
            oga_count = self.scrape_opengameart_backdrop(location, max_results=3)
            
            total = pexels_count + unsplash_count + oga_count
            self.stats['downloaded'] += total
            self.stats['total'] += total
            
            logger.info(f"{location}: {total} backdrops downloaded")
            time.sleep(2)
        
        self.save_manifest()
        logger.info(f"Backdrop scraping complete: {self.stats['downloaded']} total")
    
    def save_manifest(self):
        """Save manifest"""
        manifest = {
            'type': 'backdrops',
            'downloaded': self.downloaded,
            'stats': self.stats,
            'timestamp': time.time()
        }
        with open(self.output_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    scraper = BackdropScraper()
    scraper.run()

