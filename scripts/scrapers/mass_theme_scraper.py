===FILE: scripts/scrapers/mass_theme_scraper.py===
```python
import os
import random
import time
import json
import requests
from datetime import datetime
from pathlib import Path
from PIL import Image
from io import BytesIO
from requests.exceptions import RequestException

# Configure logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MassThemeScraper:
    def __init__(self, theme='low_poly'):
        self.theme = theme
        self.output_dir = Path(f'assets/{theme}')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.downloaded = []
        self.failed = []
        self.stats = {'total_attempted': 0, 'total_downloaded': 0, 'total_failed': 0, 'by_category': {}}
        
        # Theme-specific configurations
        self.locations = [
            'forest', 'city', 'desert', 'mountain', 'beach', 'cave', 'farm', 'castle', 'tundra', 'ocean'
        ]
        self.items = [
            'sword', 'shield', 'axe', 'bow', 'potion', 'key', 'coin', 'map', 'book', 'scroll'
        ]
        self.npcs = [
            'warrior', 'mage', 'thief', 'priest', 'merchant', 'guard', 'bandit', 'ninja', 'dwarf', 'elf'
        ]
        self.ui_elements = [
            'button', 'checkbox', 'radio', 'slider', 'progress', 'spinner', 'dialog', 'tooltip', 'menu', 'bar'
        ]
        self.particles = [
            'fire', 'water', 'smoke', 'magic', 'energy', 'lightning', 'spark', 'dust', 'bubble', 'confetti'
        ]
        self.features = [
            'bed', 'desk', 'lamp', 'chair', 'table', 'door', 'window', 'shelf', 'bookshelf', 'mirror'
        ]

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def generate_mass_asset_list(self, target_count=5000):
        assets = []

        # Location-backdrops (100 assets)
        for location in self.locations:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{location}_backdrop_{i}",
                    'search_terms': [f"{self.theme} {location} backdrop", f"{self.theme} {location} background"],
                    'sources': ['opengameart'],
                    'output_dir': 'backdrops',
                    'size': {'width': 1024, 'height': 768, 'transparency': True, 'exact': True},
                    'category': 'backdrop'
                })

        # Items (1000 assets)
        for item in self.items:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{item}_item_{i}",
                    'search_terms': [f"{self.theme} {item}", f"{self.theme} {item} icon"],
                    'sources': ['opengameart'],
                    'output_dir': 'items',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'item'
                })

        # NPCs (500 assets)
        for npc in self.npcs:
            for i in range(10):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{npc}_npc_{i}",
                    'search_terms': [f"{self.theme} {npc}", f"{self.theme} {npc} character"],
                    'sources': ['opengameart'],
                    'output_dir': 'npcs',
                    'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': True},
                    'category': 'npc'
                })

        # UI elements (300 assets)
        ui_elements = [
            'button', 'checkbox', 'radio', 'slider', 'progress', 'spinner', 'dialog', 'tooltip', 'menu', 'bar'
        ]
        for ui in ui_elements:
            for i in range(3):
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
        particles = [
            'fire', 'water', 'smoke', 'magic', 'energy', 'lightning', 'spark', 'dust', 'bubble', 'confetti'
        ]
        for particle in particles:
            for i in range(2):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{particle}_effect_{i}",
                    'search_terms': [f"{self.theme} {particle} effect", f"{self.theme} {particle} particle"],
                    'sources': ['opengameart'],
                    'output_dir': 'effects/particles',
                    'size': {'width': 64, 'height': 64, 'transparency': True, 'exact': True},
                    'category': 'particle'
                })

        # Features (500 assets)
        for feature in self.features:
            for i in range(5):
                assets.append({
                    'id': len(assets) + 1,
                    'name': f"{feature}_feature_{i}",
                    'search_terms': [f"{self.theme} {feature}", f"{self.theme} {feature} element"],
                    'sources': ['opengameart'],
                    'output_dir': 'features',
                    'size': {'width': 128, 'height': 128, 'transparency': True, 'exact': True},
                    'category': 'feature'
                })

        return assets[:target_count]

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': api_key}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Unsplash API request failed: {e}")
            return 0

    def scrape_opengameart_theme(self, search_term, output_subdir, size_config, max_results=10):
        url = f"https://opengameart.org/api/search.json?q={search_term}&limit={max_results}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('file')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"OpenGameArt API request failed: {e}")
            return 0

    def scrape_pexels_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('PEXELS_API_KEY')
        if not api_key:
            logger.error("Pexels API key not found in environment variables")
            return 0

        url = f"https://api.pexels.com/v1/search"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('photos', [])
            for result in results:
                img_url = result.get('src', {}).get('original')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Image.ANTIALIAS)
                output_path = self.output_dir / output_subdir / f"{search_term}_{result['id']}.png"
                output_path.parent.mkdir(parents=True, exist_ok=True)
                img.save(output_path)
                self.downloaded.append(output_path)
                logger.info(f"Downloaded {output_path}")
            return len(results)
        except RequestException as e:
            logger.error(f"Pexels API request failed: {e}")
            return 0

    def scrape_unsplash_api(self, search_term, output_subdir, size_config, max_results=10):
        api_key = os.getenv('UNSPLASH_API_KEY')
        if not api_key:
            logger.error("Unsplash API key not found in environment variables")
            return 0

        url = f"https://api.unsplash.com/search/photos"
        params = {
            'query': search_term,
            'per_page': max_results,
            'orientation': 'landscape'
        }
        headers = {'Authorization': f'Client-ID {api_key}'}
        try:
            response = requests.get(url, params=params, headers=headers)
            response.raise_for_status()
            results = response.json().get('results', [])
            for result in results:
                img_url = result.get('urls', {}).get('raw')
                if not img_url:
                    continue
                img_data = requests.get(img_url).content
                img = Image.open(BytesIO(img_data))
                img = img.resize((size_config['width'], size_config['height']), Path