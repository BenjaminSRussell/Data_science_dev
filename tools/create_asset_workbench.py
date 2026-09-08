import os
import shutil
import markdown

# Constants
ASSET_MANIFEST_PATH = "_ASSET_WORKBENCH/ASSET_MANIFEST.md"
WORKBENCH_DIR = "_ASSET_WORKBENCH/NPC_Images"

def sanitize_filename(filename):
    """Sanitize the filename to make it safe for file system use."""
    return "".join(char if char.isalnum() or char in ('.', '_') else '_' for char in filename)

def parse_manifest_and_create_workbench():
    with open(ASSET_MANIFEST_PATH, 'r', encoding='utf-8') as file:
        md_content = file.read()

    # Parse the markdown table
    html = markdown.markdown(md_content)
    table_start = html.find('<table')
    table_end = html.find('</table') + len('</table')
    table_html = html[table_start:table_end]
    
    # Extract rows
    rows = table_html.split('<tr>')
    rows = [row for row in rows if '<td>' in row]  # Filter out header rows

    # Create workbench directory if it doesn't exist
    if not os.path.exists(WORKBENCH_DIR):
        os.makedirs(WORKBENCH_DIR)

    # Process each row
    for row in rows:
        cols = row.split('<td>')
        cols = [col.strip() for col in cols if col.strip()]

        if len(cols) < 5:
            continue  # Skip rows that don't have enough columns

        name = cols[0]
        npc_name = cols[1]
        source_path = cols[3]

        # Sanitize and create destination path
        if source_path.startswith('/'):
            source_path = source_path[1:]
        
        # Check if source_path is a placeholder
        if source_path == 'assets/characters/bosses/anderson.png' or \
           source_path == 'assets/characters/bosses/chen.png' or \
           source_path == 'assets/characters/bosses/johnson.png' or \
           source_path == 'assets/characters/bosses/kim.png' or \
           source_path == 'assets/characters/bosses/martinez.png' or \
           source_path == 'assets/characters/bosses/williams.png':
            # Incorporate the sanitized name into the filename
            filename = f"{sanitize_filename(npc_name)}_{os.path.basename(source_path)}"
        else:
            filename = os.path.basename(source_path)
        
        dest_path = os.path.join(WORKBENCH_DIR, filename)
        
        # Copy the file
        real_source = os.path.join(os.path.dirname(ASSET_MANIFEST_PATH), source_path)
        shutil.copy2(real_source, dest_path)

if __name__ == "__main__":
    parse_manifest_and_create_workbench()