#!/usr/bin/env python3
"""
Specialized Character Sprite Scraper
Scrapes Low-poly character sprites from multiple sources
"""

import json
import os
import sys
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

def sanitize_filename(name: str) -> str:
    """Sanitize filename to be safe for filesystem use"""
    name = name.strip().replace('\\', '_').replace('/', '_')
    name = ''.join(c for c in name if c.isalnum() or c in ('_', '-', '.'))
    return name[:30] + '.png'

class CharacterSpriteScraper:
    def __init__(self, output_dir="downloaded_assets/characters/sprites"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.downloaded = []
        self.failed = []
        self.stats = {'total': 0, 'downloaded': 0, 'failed': 0}
        
    def resize_image(self, image_path, target_size=(128, 128)):
        """Resize character sprite to target size"""
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
        """Download file from URL"""
        try:
            response = self.session.get(url, timeout=30, stream=True)
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Resize to 128x128
            self.resize_image(output_path)
            return True
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return False
    
    def scrape_opengameart_characters(self, search_term, max_results=20):
        """Scrape character sprites from OpenGameArt"""
        base_url = "https://opengameart.org"
        search_url = f"{base_url}/art-search-advanced?keys={search_term.replace(' ', '+')}"
        
        logger.info(f"Searching OpenGameArt for: {search_term}")
        downloaded = 0
        
        try:
            response = self.session.get(search_url, timeout=30)
            soup = BeautifulSoup(response.text, 'html.parser')
            results = soup.find_all('div', class_='node') or soup.find_all('article')
            
            for result in results[:max_results]:
                try:
                    title_link = result.find('a', href=lambda x: x and '/content/' in x)
                    if not title_link:
                        continue
                    
                    asset_url = urljoin(base_url, title_link.get('href', ''))
                    asset_response = self.session.get(asset_url, timeout=30)
                    asset_soup = BeautifulSoup(asset_response.text, 'html.parser')
                    
                    download_link = asset_soup.find('a', href=lambda x: x and '/download' in x)
                    if download_link:
                        file_url = urljoin(base_url, download_link.get('href', ''))
                        filename = sanitize_filename(f"character_{len(self.downloaded)}_{title_link.text.strip()}")
                        output_path = self.output_dir / filename
                        
                        if self.download_file(file_url, output_path):
                            downloaded += 1
                            self.downloaded.append({
                                'source': 'OpenGameArt',
                                'url': file_url,
                                'path': str(output_path),
                                'license': 'CC0 or CC-BY'
                            })
                    
                    time.sleep(random.uniform(1, 2))
                except Exception as e:
                    logger.debug(f"Error processing result: {e}")
                    continue
        except Exception as e:
            logger.error(f"Error scraping OpenGameArt: {e}")
        
        return downloaded
    
    def scrape_github_characters(self):
        """Clone character assets from GitHub repos"""
        repos = [
            'https://github.com/jrconway3/Universal-LPC-spritesheet.git',
            'https://github.com/GDQuest/game-sprites.git'
        ]
        
        downloaded = 0
        for repo_url in repos:
            try:
                repo_name = repo_url.split('/')[-1].replace('.git', '')
                temp_dir = self.output_dir.parent / 'temp' / repo_name
                temp_dir.mkdir(parents=True, exist_ok=True)
                
                import subprocess
                result = subprocess.run(['git', 'clone', '--depth', '1', repo_url, str(temp_dir)],
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    for img_file in temp_dir.rglob('*.png'):
                        if 'character' in str(img_file).lower() or 'sprite' in str(img_file).lower():
                            filename = f"{repo_name}_{img_file.name}"
                            output_path = self.output_dir / filename
                            if not output_path.exists():
                                import shutil
                                shutil.copy2(img_file, output_path)
                                self.resize_image(output_path)
                                downloaded += 1
                                self.downloaded.append({
                                    'source': 'GitHub',
                                    'repo': repo_url,
                                    'path': str(output_path)
                                })
                
                import shutil
                if temp_dir.exists():
                    shutil.rmtree(temp_dir)
            except Exception as e:
                logger.error(f"Error with GitHub repo {repo_url}: {e}")
        
        return downloaded
    
    def run(self, target_count=1000):
        """Run character sprite scraping"""
        logger.info(f"Starting character sprite scraping (target: {target_count})")
        
        searches = [
            'low poly character sprite',
            'low poly character',
            'lowpoly character',
            '3d character sprite',
            'polygonal character',
            'character sprite sheet',
            'game character sprite',
            'isometric character'
        ]
        
        for search in searches:
            if self.stats['downloaded'] >= target_count:
                break
            
            count = self.scrape_opengameart_characters(search, max_results=30)
            self.stats['downloaded'] += count
            self.stats['total'] += count
            logger.info(f"Downloaded {count} characters, total: {self.stats['downloaded']}")
            time.sleep(2)
        
        # Also get from GitHub
        github_count = self.scrape_github_characters()
        self.stats['downloaded'] += github_count
        
        self.save_manifest()
        logger.info(f"Character scraping complete: {self.stats['downloaded']} downloaded")
    
    def save_manifest(self):
        """Save manifest"""
        manifest = {
            'type': 'characters',
            'downloaded': self.downloaded,
            'stats': self.stats,
            'timestamp': time.time()
        }
        with open(self.output_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)

if __name__ == "__main__":
    scraper = CharacterSpriteScraper()
    scraper.run(target_count=1000)