import os
import re
import shutil
import markdown

# Constants
ASSET_MANIFEST_PATH = "_ASSET_WORKBENCH/ASSET_MANIFEST.md"
WORKBENCH_DIR = "_ASSET_WORKBENCH/NPC_Images"

def sanitize_filename(filename):
    """Sanitize a name into a safe, predictable file-name stem.

    Lowercased; anything other than letters, digits, '.' and '_' becomes '_';
    runs of separators collapse to one '_'; leading/trailing '_' and '.' are
    stripped so the result can't be a hidden dotfile or a '..' component.
    Empty or all-punctuation input falls back to 'unnamed'. (#544)
    """
    text = "".join(ch if (ch.isalnum() and ch.isascii()) or ch in ('.', '_') else '_' for ch in str(filename or '').lower())
    text = re.sub(r'_+', '_', text)
    text = re.sub(r'\.{2,}', '.', text)
    text = text.strip('._')
    return text or 'unnamed'

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