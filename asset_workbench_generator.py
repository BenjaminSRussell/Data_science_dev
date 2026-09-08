import os
import shutil

_ASSET_WORKBENCH = 'path/to/asset_workbench'
os.makedirs(_ASSET_WORKBENCH, exist_ok=True)

def generate_asset_workbench(manifest_path):
    with open(manifest_path, 'r') as file:
        lines = file.readlines()

    current_category = "Uncategorized"
    os.makedirs(os.path.join(_ASSET_WORKBENCH, current_category), exist_ok=True)

    for line in lines:
        if line.startswith('## '):
            match = re.match(r'## (\d+)\. Category \((.*?)\)', line)
            if match:
                current_category = match.group(2)
                os.makedirs(os.path.join(_ASSET_WORKBENCH, current_category), exist_ok=True)
        elif line.strip():
            file_name = line.strip()
            shutil.copy2(file_name, os.path.join(_ASSET_WORKBENCH, current_category, file_name))

if __name__ == "__main__":
    generate_asset_workbench('path/to/manifest.txt')