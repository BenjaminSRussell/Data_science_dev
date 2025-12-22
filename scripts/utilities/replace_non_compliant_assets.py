#!/usr/bin/env python3
"""
Replace non-compliant assets with Low-poly versions
Moves pixel art and placeholders to archive, prioritizes Low-poly assets
"""

import json
import shutil
from pathlib import Path
import logging
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AssetReplacer:
    def __init__(self, assets_dir="downloaded_assets", archive_dir="archived_assets"):
        self.assets_dir = Path(assets_dir)
        self.archive_dir = Path(archive_dir)
        self.archive_dir.mkdir(exist_ok=True)
        self.replaced = []
        self.stats = defaultdict(int)
        
    def load_verification_report(self, report_file='low_poly_verification_report.json'):
        """Load verification report"""
        try:
            with open(report_file, 'r') as f:
                report = json.load(f)
            return report.get('results', {}).get('non_compliant', [])
        except Exception as e:
            logger.error(f"Error loading report: {e}")
            return []
    
    def archive_asset(self, asset_path, reason):
        """Move non-compliant asset to archive"""
        asset_path = Path(asset_path)
        if not asset_path.exists():
            return False
        
        # Create archive structure
        relative_path = asset_path.relative_to(self.assets_dir)
        archive_path = self.archive_dir / relative_path
        archive_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            shutil.move(str(asset_path), str(archive_path))
            logger.info(f"Archived: {asset_path} -> {archive_path} ({reason})")
            return True
        except Exception as e:
            logger.error(f"Error archiving {asset_path}: {e}")
            return False
    
    def prioritize_low_poly(self, category_path):
        """Prioritize Low-poly assets in a category"""
        category_path = Path(category_path)
        if not category_path.exists():
            return
        
        # Find all assets
        assets = list(category_path.rglob("*.png")) + list(category_path.rglob("*.jpg"))
        
        # Separate by style (simple heuristic)
        low_poly_assets = []
        other_assets = []
        
        for asset in assets:
            # Check filename for Low-poly indicators
            name_lower = asset.name.lower()
            if any(term in name_lower for term in ['lowpoly', 'low_poly', 'low-poly', '3d', 'polygonal']):
                low_poly_assets.append(asset)
            else:
                other_assets.append(asset)
        
        # Keep Low-poly assets, archive others if we have Low-poly replacements
        if low_poly_assets:
            logger.info(f"Found {len(low_poly_assets)} Low-poly assets in {category_path}")
            for asset in other_assets:
                if 'placeholder' in asset.name.lower():
                    self.archive_asset(asset, 'placeholder')
                    self.stats['archived_placeholders'] += 1
                else:
                    # Archive non-Low-poly if we have Low-poly versions
                    self.archive_asset(asset, 'non_low_poly')
                    self.stats['archived_non_low_poly'] += 1
    
    def replace_placeholders(self):
        """Replace placeholder assets"""
        placeholder_patterns = ['placeholder', 'temp', 'dummy', 'test']
        
        categories = {
            'ui_elements': 'downloaded_assets/ui/elements',
            'particles': 'downloaded_assets/effects/particles',
            'backdrops': 'downloaded_assets/backgrounds/locations'
        }
        
        for category, path in categories.items():
            category_path = Path(path)
            if not category_path.exists():
                continue
            
            assets = list(category_path.rglob("*.png")) + list(category_path.rglob("*.jpg"))
            
            for asset in assets:
                name_lower = asset.name.lower()
                if any(pattern in name_lower for pattern in placeholder_patterns):
                    self.archive_asset(asset, 'placeholder')
                    self.stats['archived_placeholders'] += 1
                    logger.info(f"Archived placeholder: {asset}")
    
    def process_verification_report(self):
        """Process verification report and archive non-compliant assets"""
        non_compliant = self.load_verification_report()
        
        logger.info(f"Found {len(non_compliant)} non-compliant assets to archive")
        
        for asset_info in non_compliant:
            asset_path = Path(asset_info['path'])
            reason = asset_info.get('reason', 'non_compliant')
            
            if asset_path.exists():
                self.archive_asset(asset_path, reason)
                self.replaced.append({
                    'original': str(asset_path),
                    'reason': reason,
                    'category': asset_info.get('category', 'unknown')
                })
                self.stats['archived'] += 1
    
    def run(self):
        """Run asset replacement"""
        logger.info("Starting asset replacement process...")
        
        # 1. Process verification report
        self.process_verification_report()
        
        # 2. Replace placeholders
        self.replace_placeholders()
        
        # 3. Prioritize Low-poly in each category
        categories = [
            'downloaded_assets/characters/sprites',
            'downloaded_assets/ui/elements',
            'downloaded_assets/effects/particles'
        ]
        
        for category_path in categories:
            self.prioritize_low_poly(category_path)
        
        # Save report
        report = {
            'replaced': self.replaced,
            'stats': dict(self.stats),
            'total_archived': len(self.replaced)
        }
        
        with open('asset_replacement_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"\nReplacement complete:")
        logger.info(f"  Archived: {len(self.replaced)} assets")
        logger.info(f"  Placeholders: {self.stats['archived_placeholders']}")
        logger.info(f"  Non-Low-poly: {self.stats['archived_non_low_poly']}")
        logger.info(f"  Report saved to asset_replacement_report.json")

if __name__ == "__main__":
    replacer = AssetReplacer()
    replacer.run()

