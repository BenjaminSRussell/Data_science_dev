#!/usr/bin/env python3
"""
Specialized Vehicle Sprite Scraper
Scrapes Low-poly vehicle sprites
"""

import json
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

class VehicleScraper:
    def __init__(self, output_dir="downloaded_assets/vehicles/sprites"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.downloaded = []
        self.stats = {'total': 0, 'downloaded': 0}
        
        self.vehicles = [
            'car', 'bike', 'motorcycle', 'bus', 'truck', 'taxi', 'scooter',
            'van', 'suv', 'sedan', 'coupe', 'convertible', 'pickup',
            'delivery_truck', 'ambulance'
        ]
    
    def resize_image(self, image_path, target_size=(128, 128)):
        """Resize vehicle sprite"""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                img.thumbnail(target_size, Image.Resampling.LANCZOS)
                img.save(image_path, 'PNG', optimize=True)
                return True
        except Exception as e:
            logger.error(f"Error resizing {image_path}: {e}")
            return False
    
    def download_file(self, url, output_path):
        """Download file"""
        try:
            response = self.session.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            self.resize_image(output_path)
            return True
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return False
    
    def scrape_opengameart_vehicle(self, vehicle, max_results=20):
        """Scrape vehicles from OpenGameArt"""
        base_url = "https://opengameart.org"
        searches = [
            f"low poly {vehicle}",
            f"lowpoly {vehicle}",
            f"3d {vehicle} sprite",
            f"polygonal {vehicle}"
        ]
        
        downloaded = 0
        
        for search_term in searches:
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
                        filename = f"{vehicle}_{len(self.downloaded)}.png"
                        output_path = self.output_dir / filename
                        
                        if not output_path.exists() and self.download_file(file_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'OpenGameArt',
                                'vehicle': vehicle,
                                'url': file_url,
                                'path': str(output_path),
                                'license': 'CC0 or CC-BY'
                            })
                    
                    time.sleep(1)
            except Exception as e:
                logger.error(f"Error scraping {vehicle}: {e}")
        
        return downloaded
    
    def run(self, target_count=300):
        """Run vehicle scraping"""
        logger.info(f"Starting vehicle scraping (target: {target_count})")
        
        for vehicle in self.vehicles:
            if self.stats['downloaded'] >= target_count:
                break
            
            logger.info(f"Scraping {vehicle}...")
            count = self.scrape_opengameart_vehicle(vehicle, max_results=20)
            self.stats['downloaded'] += count
            self.stats['total'] += count
            logger.info(f"Downloaded {count} {vehicle} sprites, total: {self.stats['downloaded']}")
            time.sleep(2)
        
        self.save_manifest()
        logger.info(f"Vehicle scraping complete: {self.stats['downloaded']} downloaded")
    
    def save_manifest(self):
        """Save manifest"""
        manifest = {
            'type': 'vehicles',
            'downloaded': self.downloaded,
            'stats': self.stats,
            'timestamp': time.time()
        }
        with open(self.output_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    scraper = VehicleScraper()
    scraper.run(target_count=300)