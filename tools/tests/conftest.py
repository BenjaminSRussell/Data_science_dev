import sys
import os

# Add the parent directory (tools/) to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Add the repo root to the Python path to allow importing from scripts/
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
sys.path.insert(0, repo_root)