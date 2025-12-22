#!/usr/bin/env python3
"""
Verify all assets match Low-poly style
Identifies non-compliant assets for replacement
"""

import json
from pathlib import Path
from PIL import Image
import logging
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LowPolyStyleVerifier:
    def __init__(self, assets_dir="downloaded_assets"):
        self.assets_dir = Path(assets_dir)
        self.compliant = []
        self.non_compliant = []
        self.stats = defaultdict(int)
        
    def is_low_poly(self, image_path):
        """Check if image matches Low-poly style"""
        try:
            with Image.open(image_path) as img:
                width, height = img.size
                pixels = list(img.getdata())[:1000] if img.size[0] * img.size[1] > 1000 else list(img.getdata())
                
                # Count unique colors
                if img.mode == 'RGBA':
                    unique_colors = len(set(p for p in pixels if len(p) >= 3 and (len(p) == 3 or p[3] > 0)))
                else:
                    unique_colors = len(set(pixels))
                
                # Low-poly characteristics:
                # - Moderate color count (20-200)
                # - Not pixel art (not too few colors, not too small)
                # - Not realistic (not too many colors)
                # - Smooth gradients (moderate complexity)
                
                is_pixel_art = (width < 256 and height < 256 and unique_colors < 50)
                is_realistic = (unique_colors > 200 or (width > 512 and height > 512))
                is_low_poly = (20 <= unique_colors <= 200 and not is_pixel_art and not is_realistic)
                
                return {
                    'is_low_poly': is_low_poly,
                    'is_pixel_art': is_pixel_art,
                    'is_realistic': is_realistic,
                    'unique_colors': unique_colors,
                    'size': f"{width}x{height}",
                    'reason': self._get_reason(is_low_poly, is_pixel_art, is_realistic, unique_colors)
                }
        except Exception as e:
            logger.debug(f"Error analyzing {image_path}: {e}")
            return {
                'is_low_poly': False,
                'reason': f'Error: {str(e)}'
            }
    
    def _get_reason(self, is_low_poly, is_pixel_art, is_realistic, unique_colors):
        """Get reason for compliance/non-compliance"""
        if is_low_poly:
            return "Low-poly style"
        elif is_pixel_art:
            return f"Pixel art (too few colors: {unique_colors})"
        elif is_realistic:
            return f"Realistic (too many colors: {unique_colors})"
        else:
            return f"Does not match Low-poly criteria (colors: {unique_colors})"
    
    def verify_category(self, category_path, category_name):
        """Verify all assets in a category"""
        logger.info(f"Verifying category: {category_name}")
        
        category_path = Path(category_path)
        if not category_path.exists():
            logger.warning(f"Category path does not exist: {category_path}")
            return
        
        assets = list(category_path.rglob("*.png")) + list(category_path.rglob("*.jpg"))
        
        for asset in assets:
            result = self.is_low_poly(asset)
            
            if result['is_low_poly']:
                self.compliant.append({
                    'category': category_name,
                    'path': str(asset),
                    'size': result.get('size', 'unknown'),
                    'colors': result.get('unique_colors', 0)
                })
                self.stats[f'{category_name}_compliant'] += 1
            else:
                self.non_compliant.append({
                    'category': category_name,
                    'path': str(asset),
                    'reason': result.get('reason', 'Unknown'),
                    'size': result.get('size', 'unknown'),
                    'colors': result.get('unique_colors', 0)
                })
                self.stats[f'{category_name}_non_compliant'] += 1
        
        logger.info(f"{category_name}: {self.stats[f'{category_name}_compliant']} compliant, {self.stats[f'{category_name}_non_compliant']} non-compliant")
    
    def verify_all(self):
        """Verify all asset categories"""
        logger.info("Starting Low-poly style verification...")
        
        categories = {
            'characters': 'downloaded_assets/characters/sprites',
            'backdrops': 'downloaded_assets/backgrounds/locations',
            'map_assets': 'downloaded_assets/map/assets',
            'icons_items': 'downloaded_assets/icons/items',
            'icons_features': 'downloaded_assets/icons/features',
            'vehicles': 'downloaded_assets/vehicles/sprites',
            'ui_elements': 'downloaded_assets/ui/elements',
            'particles': 'downloaded_assets/effects/particles'
        }
        
        for category_name, category_path in categories.items():
            self.verify_category(category_path, category_name)
        
        total_compliant = len(self.compliant)
        total_non_compliant = len(self.non_compliant)
        total = total_compliant + total_non_compliant
        compliance_rate = (total_compliant / total * 100) if total > 0 else 0
        
        logger.info(f"\nVerification complete:")
        logger.info(f"  Compliant: {total_compliant} ({compliance_rate:.1f}%)")
        logger.info(f"  Non-compliant: {total_non_compliant} ({100-compliance_rate:.1f}%)")
        logger.info(f"  Total: {total}")
        
        return {
            'compliant': self.compliant,
            'non_compliant': self.non_compliant,
            'stats': dict(self.stats),
            'compliance_rate': compliance_rate
        }
    
    def save_report(self, results, output_file='low_poly_verification_report.json'):
        """Save verification report"""
        report = {
            'verification_date': str(Path.cwd()),
            'results': results,
            'summary': {
                'total_compliant': len(self.compliant),
                'total_non_compliant': len(self.non_compliant),
                'compliance_rate': results['compliance_rate']
            }
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved to {output_file}")
        
        # Also create a simple text report
        text_report = f"""Low-Poly Style Verification Report
========================================

Total Assets: {len(self.compliant) + len(self.non_compliant)}
Compliant: {len(self.compliant)} ({results['compliance_rate']:.1f}%)
Non-Compliant: {len(self.non_compliant)} ({100-results['compliance_rate']:.1f}%)

Non-Compliant Assets:
"""
        for asset in self.non_compliant[:50]:  # First 50
            text_report += f"  - {asset['path']}: {asset['reason']}\n"
        
        if len(self.non_compliant) > 50:
            text_report += f"  ... and {len(self.non_compliant) - 50} more\n"
        
        with open('low_poly_verification_report.txt', 'w') as f:
            f.write(text_report)
        
        logger.info("Text report saved to low_poly_verification_report.txt")

def main():
    verifier = LowPolyStyleVerifier()
    results = verifier.verify_all()
    verifier.save_report(results)
    
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    print(f"Compliant: {len(verifier.compliant)}")
    print(f"Non-Compliant: {len(verifier.non_compliant)}")
    print(f"Compliance Rate: {results['compliance_rate']:.1f}%")
    print("="*60)
    
    if verifier.non_compliant:
        print(f"\n⚠️  {len(verifier.non_compliant)} assets need replacement")
        print("See low_poly_verification_report.txt for details")
    else:
        print("\n✅ All assets are Low-poly compliant!")

if __name__ == "__main__":
    main()

