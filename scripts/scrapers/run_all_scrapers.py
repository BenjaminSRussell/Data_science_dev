#!/usr/bin/env python3
"""
Master Scraper - Runs all specialized scrapers
Downloads all asset types with proper organization
"""

import subprocess
import sys
import time
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SCRAPERS = [
    {
        'name': 'Character Sprites',
        'script': 'scraper_characters.py',
        'target': 1000,
        'description': 'Low-poly character sprites (128x128px)'
    },
    {
        'name': 'Location Backdrops',
        'script': 'scraper_backdrops.py',
        'target': 'all_locations',
        'description': 'Low-poly location backdrops (1920x1080px)'
    },
    {
        'name': 'Map Assets',
        'script': 'scraper_map_assets.py',
        'target': 500,
        'description': 'Low-poly map elements (128x128px)'
    },
    {
        'name': 'Icons',
        'script': 'scraper_icons.py',
        'target': 500,
        'description': 'Low-poly icons (64x64px)'
    },
    {
        'name': 'Vehicles',
        'script': 'scraper_vehicles.py',
        'target': 300,
        'description': 'Low-poly vehicle sprites (128x128px)'
    },
    {
        'name': 'UI Elements',
        'script': 'scraper_ui_elements.py',
        'target': 300,
        'description': 'Low-poly UI elements (128x128px)'
    },
    {
        'name': 'Particle Effects',
        'script': 'scraper_particles.py',
        'target': 200,
        'description': 'Low-poly particle effects (32x32px)'
    }
]

def run_scraper(scraper_info):
    """Run a single scraper"""
    script_path = Path(__file__).parent / scraper_info['script']
    
    logger.info("=" * 60)
    logger.info(f"Starting: {scraper_info['name']}")
    logger.info(f"Description: {scraper_info['description']}")
    logger.info("=" * 60)
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour max per scraper
        )
        
        if result.returncode == 0:
            logger.info(f"✅ {scraper_info['name']} completed successfully")
            logger.info(result.stdout[-500:])  # Last 500 chars
        else:
            logger.error(f"❌ {scraper_info['name']} failed")
            logger.error(result.stderr[-500:])
        
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        logger.error(f"⏱️ {scraper_info['name']} timed out")
        return False
    except Exception as e:
        logger.error(f"❌ Error running {scraper_info['name']}: {e}")
        return False

def main():
    """Run all scrapers"""
    logger.info("=" * 60)
    logger.info("MASTER SCRAPER - Running All Specialized Scrapers")
    logger.info("=" * 60)
    
    results = {}
    
    for scraper in SCRAPERS:
        success = run_scraper(scraper)
        results[scraper['name']] = success
        
        # Brief pause between scrapers
        if scraper != SCRAPERS[-1]:
            logger.info("Waiting 5 seconds before next scraper...")
            time.sleep(5)
    
    # Summary
    logger.info("=" * 60)
    logger.info("SCRAPING SUMMARY")
    logger.info("=" * 60)
    
    for name, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        logger.info(f"{name}: {status}")
    
    successful = sum(1 for s in results.values() if s)
    total = len(results)
    
    logger.info(f"\nTotal: {successful}/{total} scrapers completed successfully")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()

