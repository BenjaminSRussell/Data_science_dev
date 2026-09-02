import logging
import os
import time
import json
from urllib.parse import urljoin
from pathlib import Path
from bs4 import BeautifulSoup
from requests import Session
from PIL import Image

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IconScraper:
    def __init__(self):
        self.session = Session()
        self.session.headers.update({'User-Agent': 'CustomIconScraper/1.0'})
        
        self.output_dir = Path('output/icons')
        self.items_dir = self.output_dir / 'items'
        self.features_dir = self.output_dir / 'features'
        
        self.items_dir.mkdir(parents=True, exist_ok=True)
        self.features_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {'total': 0, 'downloaded': 0}
        
        self.items = [
            'laptop', 'phone', 'tablet', 'book', 'notebook', 'pen', 'pencil',
            'coffee', 'food', 'drink', 'bag', 'wallet', 'keys', 'glasses',
            'watch', 'hat', 'shirt', 'pants', 'shoes', 'jacket'
        ]
        
        self.features = [
            'bed', 'desk', 'computer', 'chair', 'table', 'lamp', 'window',
            'door', 'shelf', 'plant', 'kitchen', 'bathroom', 'shower',
            'toilet', 'sink', 'refrigerator', 'stove', 'microwave', 'tv',
            'sofa', 'bookshelf', 'dresser', 'mirror', 'clock', 'calendar'
        ]
    
    def resize_image(self, image_path, target_size=(64, 64)):
        """Resize icon to target size"""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                img = img.resize(target_size, Image.Resampling.LANCZOS)
                img.save(image_path, 'PNG', optimize=True)
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
            
            self.resize_image(output_path)
            return True
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return False
    
    def scrape_game_icons(self, icon_name, category='items'):
        """Scrape from Game-Icons.net"""
        base_url = "https://game-icons.net"
        icon_slug = icon_name.replace('_', '-').lower()
        
        try:
            icon_page_url = f"{base_url}/icons/{icon_slug}.html"
            response = self.session.get(icon_page_url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                svg_links = soup.find_all('a', href=lambda x: x and '.svg' in x)
                for svg_link in svg_links:
                    if '?size=128' in svg_link.get('href', ''):
                        icon_url = urljoin(base_url, svg_link.get('href', ''))
                        output_dir = self.items_dir if category == 'items' else self.features_dir
                        output_path = output_dir / f"{icon_name}.svg"
                        
                        svg_response = self.session.get(icon_url, timeout=30)
                        if svg_response.status_code == 200:
                            with open(output_path, 'wb') as f:
                                f.write(svg_response.content)
                            
                            self.downloaded.append({
                                'source': 'Game-Icons',
                                'icon': icon_name,
                                'category': category,
                                'url': icon_url,
                                'path': str(output_path),
                                'license': 'CC-BY 3.0'
                            })
                            return 1
                else:
                    logger.warning(f"No 128px SVG found for {icon_name} on Game-Icons.net")
        except Exception as e:
            logger.debug(f"Error downloading icon {icon_name}: {e}")
        
        return 0
    
    def scrape_opengameart_icons(self, icon_name, category='items', max_results=10):
        """Scrape icons from OpenGameArt"""
        base_url = "https://opengameart.org"
        searches = [
            f"low poly {icon_name} icon",
            f"lowpoly {icon_name}",
            f"3d {icon_name} icon"
        ]
        
        downloaded = 0
        output_dir = self.items_dir if category == 'items' else self.features_dir
        
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
                        filename = f"{icon_name}_{len(self.downloaded)}.png"
                        output_path = output_dir / filename
                        
                        if not output_path.exists() and self.download_file(file_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'OpenGameArt',
                                'icon': icon_name,
                                'category': category,
                                'url': file_url,
                                'path': str(output_path),
                                'license': 'CC0 or CC-BY'
                            })
                    
                    time.sleep(1)
            except Exception as e:
                logger.error(f"Error scraping {icon_name}: {e}")
        
        return downloaded
    
    def run(self, target_count=500):
        """Run icon scraping"""
        logger.info(f"Starting icon scraping (target: {target_count})")
        
        # Scrape items
        logger.info("Scraping item icons...")
        for item in self.items:
            if self.stats['downloaded'] >= target_count:
                break
            
            # Try Game-Icons first (SVG)
            count = self.scrape_game_icons(item, 'items')
            if count == 0:
                # Fallback to OpenGameArt
                count = self.scrape_opengameart_icons(item, 'items', max_results=5)
            
            self.stats['downloaded'] += count
            self.stats['total'] += count
            time.sleep(1)
        
        # Scrape features
        logger.info("Scraping feature icons...")
        for feature in self.features:
            if self.stats['downloaded'] >= target_count:
                break
            
            count = self.scrape_game_icons(feature, 'features')
            if count == 0:
                count = self.scrape_opengameart_icons(feature, 'features', max_results=5)
            
            self.stats['downloaded'] += count
            self.stats['total'] += count
            time.sleep(1)
        
        self.save_manifest()
        logger.info(f"Icon scraping complete: {self.stats['downloaded']} downloaded")
    
    def save_manifest(self):
        """Save manifest"""
        manifest = {
            'type': 'icons',
            'downloaded': self.downloaded,
            'stats': self.stats,
            'timestamp': time.time()
        }
        with open(self.output_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    scraper = IconScraper()
    scraper.run(target_count=500)