import re
import shutil
from pathlib import Path

# Define constants
ASSET_MANIFEST = 'ASSET_MANIFEST.md'
PLACEHOLDER_PATH = 'PLACEHOLDER_IMAGE.png'
DESTINATION_DIR = 'workbench'
SOURCE_DIR = 'assets'

def parse_manifest_and_create_workbench():
    manifest_path = Path(ASSET_MANIFEST)
    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest file {ASSET_MANIFEST} not found.")
    
    destination = Path(DESTINATION_DIR)
    destination.mkdir(parents=True, exist_ok=True)
    
    category = None
    with manifest_path.open('r') as file:
        for line_number, line in enumerate(file, 1):
            line = line.strip()
            if not line:
                continue
            
            if line.startswith('# '):
                # Parse category header
                category_match = re.match(r'# ([^\n]+)', line)
                if category_match:
                    category = category_match.group(1).strip()
                    category_dir = destination / category
                    category_dir.mkdir(parents=True, exist_ok=True)
                    logger.info(f"Created category directory: {category_dir}")
                else:
                    logger.warning(f"Invalid category header at line {line_number}: {line}")
                continue
            
            row = line.split('|')
            if len(row) < 5:
                logger.warning(f"Skipping malformed row at line {line_number}: {line}")
                continue
            
            status = row[1].strip()
            source_path = row[2].strip()
            
            if not category:
                logger.warning(f"Asset row outside of a category at line {line_number}: {line}")
                continue
            
            asset_name = row[3].strip()
            destination_path = category_dir / asset_name
            
            if status == 'EXISTS':
                if (Path(SOURCE_DIR) / source_path).exists():
                    shutil.copy2(Path(SOURCE_DIR) / source_path, destination_path)
                    logger.info(f"Copied asset: {source_path} to {destination_path}")
                else:
                    logger.warning(f"MISSING FILE: {source_path} not found, using placeholder.")
                    shutil.copy2(PLACEHOLDER_PATH, destination_path)
            elif status == 'PENDING':
                if (Path(SOURCE_DIR) / source_path).exists():
                    shutil.copy2(Path(SOURCE_DIR) / source_path, destination_path)
                    logger.info(f"Copied pending asset: {source_path} to {destination_path}")
                else:
                    shutil.copy2(PLACEHOLDER_PATH, destination_path)
                    logger.warning(f"MISSING FILE: {source_path} not found, using placeholder.")
            elif status == 'MISSING':
                shutil.copy2(PLACEHOLDER_PATH, destination_path)
                logger.info(f"Using placeholder for missing asset: {asset_name}")
            else:
                logger.warning(f"Invalid status '{status}' for asset {asset_name} at line {line_number}")

# Test cases
def test_parse_manifest_and_create_workbench(tmp_path, monkeypatch):
    # Create synthetic manifest and files
    manifest_content = """
# Characters
| Status | Source Path | Asset Name | Description | Notes |
|--------|-------------|------------|-------------|-------|
| EXISTS | assets/char1.png | char1.png | Character 1 |       |
| PENDING | assets/char2.png | char2.png | Character 2 |       |
| MISSING | assets/char3.png | char3.png | Character 3 |       |
| INVALID | assets/char4.png | char4.png | Character 4 |       |
"""
    manifest_path = tmp_path / ASSET_MANIFEST
    manifest_path.write_text(manifest_content)
    
    source_dir = tmp_path / SOURCE_DIR
    source_dir.mkdir()
    (source_dir / 'char1.png').write_text('char1 content')
    
    placeholder_path = tmp_path / PLACEHOLDER_PATH
    placeholder_path.write_text('placeholder content')
    
    # Monkeypatch constants
    monkeypatch.setattr('tools.create_asset_workbench.ASSET_MANIFEST', str(manifest_path))
    monkeypatch.setattr('tools.create_asset_workbench.PLACEHOLDER_PATH', str(placeholder_path))
    monkeypatch.setattr('tools.create_asset_workbench.DESTINATION_DIR', str(tmp_path / DESTINATION_DIR))
    monkeypatch.setattr('tools.create_asset_workbench.SOURCE_DIR', str(source_dir))
    
    # Run the function
    parse_manifest_and_create_workbench()
    
    # Assert on the resulting directory tree
    destination_dir = tmp_path / DESTINATION_DIR
    assert destination_dir.exists()
    assert (destination_dir / 'Characters').exists()
    
    assert (destination_dir / 'Characters' / 'char1.png').exists()
    assert (destination_dir / 'Characters' / 'char1.png').read_text() == 'char1 content'
    
    assert (destination_dir / 'Characters' / 'char2.png').exists()
    assert (destination_dir / 'Characters' / 'char2.png').read_text() == 'placeholder content'
    
    assert (destination_dir / 'Characters' / 'char3.png').exists()
    assert (destination_dir / 'Characters' / 'char3.png').read_text() == 'placeholder content'
    
    assert not (destination_dir / 'Characters' / 'char4.png').exists()

if __name__ == "__main__":
    parse_manifest_and_create_workbench()