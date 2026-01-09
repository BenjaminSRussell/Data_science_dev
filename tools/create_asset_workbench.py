import os
import re
import shutil

# Config
MANIFEST_PATH = 'ASSET_MANIFEST.md'
WORKBENCH_DIR = '_ASSET_WORKBENCH'
TODO_PLACEHOLDER_SOURCE = 'downloaded_assets/ui/elements/generated_low_poly_star_0279.png' # Using the star as "TODO"

def sanitize_filename(name):
    # dynamic filename generation: "Rachel Green" -> "rachel_green.png"
    # "Small Business" -> "small_business.png"
    # Remove emojis if any (simple regex for basic ascii names, might need more for emojis)
    name = re.sub(r'[^\w\s-]', '', name).strip().lower()
    name = re.sub(r'[-\s]+', '_', name)
    return f"{name}.png"

def parse_manifest_and_create_workbench():
    if os.path.exists(WORKBENCH_DIR):
        print(f"cleaning existing {WORKBENCH_DIR}...")
        shutil.rmtree(WORKBENCH_DIR)
    os.makedirs(WORKBENCH_DIR)
    
    current_category = "Uncategorized"
    
    with open(MANIFEST_PATH, 'r') as f:
        lines = f.readlines()
        
    print(f"Parsing {MANIFEST_PATH}...")
    
    # ensure todo source exists
    if not os.path.exists(TODO_PLACEHOLDER_SOURCE):
        print(f"Warning: TODO source {TODO_PLACEHOLDER_SOURCE} not found. Creating a blank one.")
        with open(TODO_PLACEHOLDER_SOURCE, 'wb') as f:
            f.write(b'') # blank file

    for line in lines:
        line = line.strip()
        
        # Check for Category Header
        header_match = re.match(r'^## \d+\. (.+) \(', line)
        if header_match:
            current_category = header_match.group(1).replace(' ', '_')
            print(f"Processing Category: {current_category}")
            os.makedirs(os.path.join(WORKBENCH_DIR, current_category), exist_ok=True)
            continue
            
        # Check for Table Row
        # Looking for rows with | ... | ... |
        if not line.startswith('|') or '---' in line or 'Preview' in line:
            continue
            
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 5:
            continue
            
        # Format: | Preview | Name | Path | Status | ...
        # parts[0] is empty string (before first |)
        # parts[1] is Preview
        # parts[2] is Name (Item/NPC Name)
        # parts[3] is Path
        # parts[4] is Status
        
        preview_col = parts[1]
        name_col = parts[2]
        path_col = parts[3]
        status_col = parts[4]

        # Extract name
        name = name_col.replace('**', '') # cleanup md bold if any
        
        # Extract path
        path_match = re.search(r'`([^`]+)`', path_col)
        source_path = path_match.group(1) if path_match else None
        
        # Determine filename
        filename = ""
        if source_path:
            filename = os.path.basename(source_path)
        else:
            filename = sanitize_filename(name)
            
        dest_path = os.path.join(WORKBENCH_DIR, current_category, filename)
        
        # Action based on status
        if "EXISTS" in status_col or "PENDING" in status_col:
            # Copy existing file
            if source_path and os.path.exists(source_path.lstrip('/')):
                # remove leading slash for local path
                real_source = source_path.lstrip('/')
                shutil.copy2(real_source, dest_path)
                # print(f"Copied {real_source} -> {dest_path}")
            else:
                print(f"MISSING FILE FOR EXISTING ENTRY: {source_path}")
                shutil.copy2(TODO_PLACEHOLDER_SOURCE, dest_path)
                
        elif "MISSING" in status_col:
            # Create TODO placeholder
            shutil.copy2(TODO_PLACEHOLDER_SOURCE, dest_path)
            # print(f"Created Placeholder -> {dest_path}")

    print(f"\nSuccess! Asset Workbench created at {WORKBENCH_DIR}")

if __name__ == "__main__":
    parse_manifest_and_create_workbench()
