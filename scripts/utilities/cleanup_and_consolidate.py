#!/usr/bin/env python3
"""
Comprehensive cleanup and consolidation script
Removes duplicates, organizes files, cleans up temporary files
"""

import json
import shutil
from pathlib import Path
import logging
from collections import defaultdict
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CleanupAndConsolidate:
    def __init__(self, root_dir="."):
        self.root_dir = Path(root_dir)
        self.stats = {
            'files_deleted': 0,
            'files_moved': 0,
            'directories_removed': 0,
            'duplicates_found': 0
        }
        
    def remove_duplicate_manifests(self):
        """Remove duplicate manifest files, keep only the best ones"""
        logger.info("Removing duplicate manifests...")
        
        manifests = list(self.root_dir.glob("*manifest*.json"))
        manifests.extend(list(self.root_dir.glob("*_manifest*.json")))
        
        # Keep only essential manifests
        keep = {
            'game_asset_manifest.json',
            'master_asset_manifest.json'
        }
        
        for manifest in manifests:
            if manifest.name not in keep:
                try:
                    manifest.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {manifest.name}")
                except Exception as e:
                    logger.error(f"Error deleting {manifest}: {e}")
    
    def remove_old_reports(self):
        """Remove old report files"""
        logger.info("Removing old reports...")
        
        reports = list(self.root_dir.glob("*report*.txt"))
        reports.extend(list(self.root_dir.glob("*report*.json")))
        reports.extend(list(self.root_dir.glob("*_report*.txt")))
        reports.extend(list(self.root_dir.glob("*_report*.json")))
        
        # Keep only recent/important reports
        keep = set()
        
        for report in reports:
            if report.name not in keep:
                try:
                    report.unlink()
                    self.stats['files_deleted'] += 1
                    logger.info(f"Deleted: {report.name}")
                except Exception as e:
                    logger.error(f"Error deleting {report}: {e}")
    
    def consolidate_documentation(self):
        """Consolidate documentation files"""
        logger.info("Consolidating documentation...")
        
        docs_dir = self.root_dir / 'docs'
        docs_dir.mkdir(exist_ok=True)
        
        # Move all markdown docs to docs folder
        md_files = list(self.root_dir.glob("*.md"))
        
        # Keep essential docs in root
        keep_in_root = {
            'README.md',
            'CONTRIBUTING.md',
            'LICENSE.md'
        }
        
        for md_file in md_files:
            if md_file.name not in keep_in_root:
                try:
                    dest = docs_dir / md_file.name
                    if not dest.exists():
                        shutil.move(str(md_file), str(dest))
                        self.stats['files_moved'] += 1
                        logger.info(f"Moved: {md_file.name} -> docs/")
                    else:
                        md_file.unlink()
                        self.stats['files_deleted'] += 1
                        logger.info(f"Deleted duplicate: {md_file.name}")
                except Exception as e:
                    logger.error(f"Error moving {md_file}: {e}")
    
    def clean_archived_assets(self):
        """Remove archived assets directory if it exists"""
        logger.info("Cleaning archived assets...")
        
        archived_dir = self.root_dir / 'archived_assets'
        if archived_dir.exists():
            try:
                shutil.rmtree(archived_dir)
                self.stats['directories_removed'] += 1
                logger.info("Removed archived_assets directory")
            except Exception as e:
                logger.error(f"Error removing archived_assets: {e}")
    
    def clean_temp_directories(self):
        """Remove temporary directories"""
        logger.info("Cleaning temp directories...")
        
        temp_dirs = [
            self.root_dir / 'downloaded_assets' / 'temp',
            self.root_dir / 'temp',
            self.root_dir / '.temp'
        ]
        
        for temp_dir in temp_dirs:
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                    self.stats['directories_removed'] += 1
                    logger.info(f"Removed: {temp_dir}")
                except Exception as e:
                    logger.error(f"Error removing {temp_dir}: {e}")
    
    def remove_old_scraping_logs(self):
        """Remove old scraping log files"""
        logger.info("Removing old scraping logs...")
        
        log_files = list(self.root_dir.glob("*.log"))
        log_files.extend(list(self.root_dir.glob("*scraping*.log")))
        log_files.extend(list(self.root_dir.glob("scraping_*.log")))
        
        for log_file in log_files:
            try:
                log_file.unlink()
                self.stats['files_deleted'] += 1
                logger.info(f"Deleted: {log_file.name}")
            except Exception as e:
                logger.error(f"Error deleting {log_file}: {e}")
    
    def consolidate_scripts(self):
        """Organize scripts into subdirectories"""
        logger.info("Consolidating scripts...")
        
        scripts_dir = self.root_dir / 'scripts'
        if not scripts_dir.exists():
            return
        
        # Create subdirectories
        subdirs = {
            'scrapers': ['scraper_', 'mass_theme_scraper', 'run_all_scrapers'],
            'generators': ['generate_', 'create_'],
            'utilities': ['review_', 'verify_', 'replace_', 'cleanup_', 'analyze_']
        }
        
        for subdir_name, prefixes in subdirs.items():
            subdir = scripts_dir / subdir_name
            subdir.mkdir(exist_ok=True)
            
            for script in scripts_dir.glob("*.py"):
                if any(script.name.startswith(prefix) for prefix in prefixes):
                    try:
                        dest = subdir / script.name
                        if not dest.exists():
                            shutil.move(str(script), str(dest))
                            self.stats['files_moved'] += 1
                            logger.info(f"Moved: {script.name} -> scripts/{subdir_name}/")
                    except Exception as e:
                        logger.error(f"Error moving {script}: {e}")
    
    def remove_duplicate_assets(self):
        """Remove duplicate assets by content hash"""
        logger.info("Finding duplicate assets...")
        
        assets_dir = self.root_dir / 'downloaded_assets'
        if not assets_dir.exists():
            return
        
        import hashlib
        
        file_hashes = defaultdict(list)
        
        # Hash all image files
        for img_file in assets_dir.rglob("*.png"):
            try:
                with open(img_file, 'rb') as f:
                    file_hash = hashlib.md5(f.read()).hexdigest()
                    file_hashes[file_hash].append(img_file)
            except Exception as e:
                logger.debug(f"Error hashing {img_file}: {e}")
        
        # Remove duplicates (keep first occurrence)
        for file_hash, files in file_hashes.items():
            if len(files) > 1:
                # Keep the first, delete the rest
                for duplicate in files[1:]:
                    try:
                        duplicate.unlink()
                        self.stats['files_deleted'] += 1
                        self.stats['duplicates_found'] += 1
                        logger.debug(f"Deleted duplicate: {duplicate.name}")
                    except Exception as e:
                        logger.error(f"Error deleting duplicate {duplicate}: {e}")
    
    def clean_empty_directories(self):
        """Remove empty directories"""
        logger.info("Cleaning empty directories...")
        
        for root, dirs, files in os.walk(self.root_dir):
            root_path = Path(root)
            
            # Skip certain directories
            if any(skip in str(root_path) for skip in ['.git', 'node_modules', 'dist', 'public']):
                continue
            
            # Check if directory is empty
            if not any(root_path.iterdir()):
                try:
                    root_path.rmdir()
                    self.stats['directories_removed'] += 1
                    logger.debug(f"Removed empty directory: {root_path}")
                except Exception as e:
                    logger.debug(f"Could not remove {root_path}: {e}")
    
    def create_cleanup_summary(self):
        """Create summary of cleanup"""
        summary = {
            'cleanup_date': str(Path.cwd()),
            'stats': self.stats,
            'remaining_assets': {
                'characters': len(list((self.root_dir / 'downloaded_assets' / 'characters' / 'sprites').glob("*.png"))) if (self.root_dir / 'downloaded_assets' / 'characters' / 'sprites').exists() else 0,
                'backdrops': len(list((self.root_dir / 'assets' / 'backgrounds' / 'locations').rglob("*.png"))) if (self.root_dir / 'assets' / 'backgrounds' / 'locations').exists() else 0,
                'icons': len(list((self.root_dir / 'downloaded_assets' / 'icons').rglob("*.png"))) if (self.root_dir / 'downloaded_assets' / 'icons').exists() else 0,
                'ui_elements': len(list((self.root_dir / 'downloaded_assets' / 'ui' / 'elements').glob("*.png"))) if (self.root_dir / 'downloaded_assets' / 'ui' / 'elements').exists() else 0,
                'particles': len(list((self.root_dir / 'downloaded_assets' / 'effects' / 'particles').glob("*.png"))) if (self.root_dir / 'downloaded_assets' / 'effects' / 'particles').exists() else 0
            }
        }
        
        with open(self.root_dir / 'cleanup_summary.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Cleanup summary saved to cleanup_summary.json")
        return summary
    
    def run(self):
        """Run all cleanup tasks"""
        logger.info("=" * 60)
        logger.info("STARTING CLEANUP AND CONSOLIDATION")
        logger.info("=" * 60)
        
        self.remove_duplicate_manifests()
        self.remove_old_reports()
        self.consolidate_documentation()
        self.clean_archived_assets()
        self.clean_temp_directories()
        self.remove_old_scraping_logs()
        self.consolidate_scripts()
        # self.remove_duplicate_assets()  # Commented out - takes time
        self.clean_empty_directories()
        
        summary = self.create_cleanup_summary()
        
        logger.info("=" * 60)
        logger.info("CLEANUP COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Files deleted: {self.stats['files_deleted']}")
        logger.info(f"Files moved: {self.stats['files_moved']}")
        logger.info(f"Directories removed: {self.stats['directories_removed']}")
        logger.info(f"Duplicates found: {self.stats['duplicates_found']}")
        logger.info("=" * 60)
        
        return summary

if __name__ == "__main__":
    cleaner = CleanupAndConsolidate()
    cleaner.run()

