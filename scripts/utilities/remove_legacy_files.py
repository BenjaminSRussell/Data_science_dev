#!/usr/bin/env python3
"""
Remove all legacy files - old scrapers, unused scripts, obsolete files
"""

import os
import shutil
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LegacyFileRemover:
    def __init__(self, root_dir="."):
        self.root_dir = Path(root_dir)
        self.stats = {
            'files_deleted': 0,
            'directories_removed': 0
        }
        
    def remove_old_scrapers(self):
        """Remove old scraper files from scripts root"""
        logger.info("Removing old scraper files...")
        
        old_scrapers = [
            'scrape_1000_assets.py',
            'scrape_1000_assets_improved.py',
            'scrape_all_assets.py',
            'scrape_assets.py',
            'active_scraper.py',
            'continue_scraping.py',
            'direct_scraper.py',
            'real_scraper.py',
            'working_scraper.py',
            'mass_theme_scraper.py',
            'scraper_characters.py',
            'scraper_backdrops.py',
            'scraper_map_assets.py',
            'scraper_icons.py',
            'scraper_vehicles.py',
            'scraper_ui_elements.py',
            'scraper_particles.py',
            'run_all_scrapers.py'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        for scraper in old_scrapers:
            file_path = scripts_dir / scraper
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {scraper}")
                except Exception as e:
                    logger.error(f"Error deleting {scraper}: {e}")
    
    def remove_old_generators(self):
        """Remove old generator files"""
        logger.info("Removing old generator files...")
        
        old_generators = [
            'generate_themed_backdrops.py',
            'generate_more_low_poly.py',
            'generate_master_manifest.py',
            'create_game_asset_manifest.py',
            'create_town_map.py',
            'generate_asset_manifest.py'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        for generator in old_generators:
            file_path = scripts_dir / generator
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {generator}")
                except Exception as e:
                    logger.error(f"Error deleting {generator}: {e}")
    
    def remove_old_utilities(self):
        """Remove old utility files"""
        logger.info("Removing old utility files...")
        
        old_utilities = [
            'analyze_asset_styles.py',
            'review_asset_styles.py',
            'verify_low_poly_style.py',
            'replace_non_compliant_assets.py',
            'cleanup_and_analyze_assets.py',
            'cleanup_and_consolidate.py'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        for utility in old_utilities:
            file_path = scripts_dir / utility
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {utility}")
                except Exception as e:
                    logger.error(f"Error deleting {utility}: {e}")
    
    def remove_old_js_files(self):
        """Remove old JavaScript utility files"""
        logger.info("Removing old JS files...")
        
        old_js = [
            'check_game_assets.js',
            'fetch_all_assets.js',
            'fetch_icons_from_web.js',
            'find_missing_assets.js',
            'verify_asset_loading.js'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        for js_file in old_js:
            file_path = scripts_dir / js_file
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {js_file}")
                except Exception as e:
                    logger.error(f"Error deleting {js_file}: {e}")
    
    def remove_old_test_files(self):
        """Remove old test files"""
        logger.info("Removing old test files...")
        
        old_tests = [
            'test_asset_access.py',
            'test_scraper.py',
            'integrate_downloaded_assets.py'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        for test_file in old_tests:
            file_path = scripts_dir / test_file
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {test_file}")
                except Exception as e:
                    logger.error(f"Error deleting {test_file}: {e}")
    
    def remove_old_shell_scripts(self):
        """Remove old shell scripts"""
        logger.info("Removing old shell scripts...")
        
        old_shell = [
            'run_1000_scraper.sh',
            'QUICK_START_NEXT_STEPS.sh'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        root_dir = self.root_dir
        
        for shell_script in old_shell:
            # Check in scripts and root
            for dir_path in [scripts_dir, root_dir]:
                file_path = dir_path / shell_script
                if file_path.exists():
                    try:
                        file_path.unlink()
                        self.stats['files_deleted'] += 1
                        logger.info(f"Deleted: {shell_script}")
                    except Exception as e:
                        logger.error(f"Error deleting {shell_script}: {e}")
    
    def remove_old_manifests(self):
        """Remove old manifest files"""
        logger.info("Removing old manifest files...")
        
        old_manifests = [
            'manifest_1000_improved.json',
            'asset_manifest.json',
            'asset_style_review.json',
            'low_poly_verification_report.json',
            'asset_replacement_report.json',
            'generated_low_poly_manifest.json',
            'cleanup_summary.json'
        ]
        
        for manifest in old_manifests:
            file_path = self.root_dir / manifest
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {manifest}")
                except Exception as e:
                    logger.error(f"Error deleting {manifest}: {e}")
    
    def remove_old_docs(self):
        """Remove old documentation files"""
        logger.info("Removing old documentation files...")
        
        old_docs = [
            'README_SCRAPING.md',
            'ASSET_GENERATION_COMPLETE.md',
            'ASSET_LOADING_VERIFICATION.md',
            'MISSING_ASSETS_AND_PROBLEMS.md'
        ]
        
        docs_dir = self.root_dir / 'docs'
        root_dir = self.root_dir
        
        for doc in old_docs:
            for dir_path in [docs_dir, root_dir]:
                file_path = dir_path / doc
                if file_path.exists():
                    try:
                        file_path.unlink()
                        self.stats['files_deleted'] += 1
                        logger.info(f"Deleted: {doc}")
                    except Exception as e:
                        logger.error(f"Error deleting {doc}: {e}")
    
    def remove_old_python_files(self):
        """Remove other old Python files"""
        logger.info("Removing other old Python files...")
        
        old_python = [
            'map_design_criteria.py'
        ]
        
        scripts_dir = self.root_dir / 'scripts'
        for py_file in old_python:
            file_path = scripts_dir / py_file
            if file_path.exists():
                try:
                    file_path.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {py_file}")
                except Exception as e:
                    logger.error(f"Error deleting {py_file}: {e}")
    
    def remove_empty_directories(self):
        """Remove empty directories"""
        logger.info("Removing empty directories...")
        
        for root, dirs, files in os.walk(self.root_dir):
            root_path = Path(root)
            
            # Skip certain directories
            if any(skip in str(root_path) for skip in ['.git', 'node_modules', 'dist', 'public', 'downloaded_assets', 'assets']):
                continue
            
            # Check if directory is empty
            try:
                if not any(root_path.iterdir()):
                    root_path.rmdir()
                    self.stats['directories_removed'] += 1
                    logger.debug(f"Removed empty directory: {root_path}")
            except Exception as e:
                pass
    
    def run(self):
        """Run all cleanup tasks"""
        logger.info("=" * 60)
        logger.info("REMOVING LEGACY FILES")
        logger.info("=" * 60)
        
        self.remove_old_scrapers()
        self.remove_old_generators()
        self.remove_old_utilities()
        self.remove_old_js_files()
        self.remove_old_test_files()
        self.remove_old_shell_scripts()
        self.remove_old_manifests()
        self.remove_old_docs()
        self.remove_old_python_files()
        self.remove_empty_directories()
        
        logger.info("=" * 60)
        logger.info("LEGACY CLEANUP COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Files deleted: {self.stats['files_deleted']}")
        logger.info(f"Directories removed: {self.stats['directories_removed']}")
        logger.info("=" * 60)

if __name__ == "__main__":
    remover = LegacyFileRemover()
    remover.run()


