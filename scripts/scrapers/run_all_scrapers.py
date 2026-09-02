import subprocess
import sys
import os
import logging

logger = logging.getLogger(__name__)

def run_scraper(script_path):
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=True, text=True, timeout=3600,  # 1 hour max per scraper
            start_new_session=True  # Start the child in its own process group
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        logger.error(f"timed out")
        # Kill the whole process group
        os.killpg(os.getpgid(result.pid), signal.SIGTERM)
        return False
    except Exception as e:
        logger.error(f"Error running scraper: {e}")
        return False

# Example usage
if __name__ == "__main__":
    scripts = [
        "scraper_characters.py",
        "scraper_items.py",
        # Add other scraper scripts here
    ]

    for script in scripts:
        script_path = os.path.join(os.path.dirname(__file__), script)
        if not run_scraper(script_path):
            logger.error(f"Failed to run {script}")
            break