import os
import shutil

MANIFEST_PATH = '_ASSET_WORKBENCH/ASSET_MANIFEST.md'
WORKBENCH_DIR = '_ASSET_WORKBENCH'

# Read the manifest before performing any destructive operations
if not os.path.exists(MANIFEST_PATH):
    raise FileNotFoundError(f"Manifest file {MANIFEST_PATH} does not exist")

with open(MANIFEST_PATH, 'r') as f:
    lines = f.readlines()

if os.path.exists(WORKBENCH_DIR):
    print(f"cleaning existing {WORKBENCH_DIR}...")
    shutil.rmtree(WORKBENCH_DIR)
os.makedirs(WORKBENCH_DIR)

# Continue with the rest of the script, assuming the manifest is safely read
with open(os.path.join(WORKBENCH_DIR, 'ASSET_MANIFEST.md'), 'w') as f:
    f.writelines(lines)

# ... rest of the script ...