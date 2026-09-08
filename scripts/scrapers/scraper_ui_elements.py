import json
import logging
import os
import requests
import time
import yaml
from bs4 import BeautifulSoup
from collections import defaultdict
from pathlib import Path
from urllib.parse import urljoin

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UIElementScraper:
    def __init__(self, config_path='config.yaml', output_dir='downloaded_ui_elements'):
        self.config = self.load_config(config_path)
        self.ui_elements = self.config.get('ui_elements', [])
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.downloaded = []
        self.stats = {
            'downloaded': 0,
            'total': 0,
            'timestamp': time.time()
        }

    def load_config(self, config_path):
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)

    def download_file(self, file_url, output_path):
        try:
            response = requests.get(file_url, stream=True)
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                logger.info(f"Downloaded {file_url} to {output_path}")
                return True
            else:
                logger.error(f"Failed to download {file_url}, status code: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"Error downloading {file_url}: {e}")
            return False

    def search_terms(self, element):
        return [
            f"low poly {element} ui",
            f"lowpoly {element}",
            f"3d {element} icon",
            f"polygonal {element}"
        ]

    def scrape_opengameart_ui(self, element, max_results=5):
        base_url = "https://opengameart.org"
        downloaded = 0
        
        for term in self.search_terms(element):
            search_url = f"{base_url}/search?keys={term}&sort=created&order=desc"
            response = requests.get(search_url)
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch search results for {term}, status code: {response.status_code}")
                continue
            
            soup = BeautifulSoup(response.content, 'html.parser')
            items = soup.find_all('a', class_='content-list__link', limit=max_results)
            
            for item in items:
                try:
                    item_url = urljoin(base_url, item.get('href', ''))
                    item_response = requests.get(item_url)
                    item_soup = BeautifulSoup(item_response.content, 'html.parser')
                    
                    download_link = item_soup.find('a', href=lambda x: x and '/download' in x)
                    
                    if download_link:
                        file_url = urljoin(base_url, download_link.get('href', ''))
                        filename = f"{element}_{len(self.downloaded)}.png"
                        output_path = self.output_dir / filename
                        
                        if not output_path.exists() and self.download_file(file_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'OpenGameArt',
                                'element': element,
                                'url': file_url,
                                'path': str(output_path),
                                'license': 'CC0 or CC-BY'
                            })
                    
                    time.sleep(1)
                except Exception as e:
                    logger.error(f"Error scraping {element}: {e}")
        
        return downloaded
    
    def run(self, target_count=300):
        """Run UI element scraping"""
        logger.info(f"Starting UI element scraping (target: {target_count})")
        
        for element in self.ui_elements:
            if self.stats['downloaded'] >= target_count:
                break
            
            logger.info(f"Scraping {element}...")
            count = self.scrape_opengameart_ui(element, max_results=10)
            self.stats['downloaded'] += count
            self.stats['total'] += count
            logger.info(f"Downloaded {count} {element} elements, total: {self.stats['downloaded']}")
            time.sleep(2)
        
        self.save_manifest()
        logger.info(f"UI element scraping complete: {self.stats['downloaded']} downloaded")
    
    def save_manifest(self):
        """Save manifest"""
        manifest = {
            'type': 'ui_elements',
            'downloaded': self.downloaded,
            'stats': self.stats,
            'timestamp': time.time()
        }
        with open(self.output_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    scraper = UIElementScraper()
    scraper.run(target_count=300)