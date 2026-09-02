import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def scan_directory(directory):
    assets = list(directory.rglob("*.png")) + list(directory.rglob("*.jpg")) + list(directory.rglob("*.jpeg")) + list(directory.rglob("*.svg"))
    return assets

def analyze_asset(asset):
    try:
        # Analyze the asset here
        pass
    except Exception as e:
        logger.debug(f"Error analyzing asset {asset}: {e}")

# Example usage
if __name__ == "__main__":
    directory = Path("path/to/assets")
    assets = scan_directory(directory)
    for asset in assets:
        analyze_asset(asset)