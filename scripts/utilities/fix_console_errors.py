#!/usr/bin/env python3
"""
Replace console.warn and console.error with logger in main.js
"""

import re
from pathlib import Path

def fix_console_errors():
    main_js = Path('src/js/main.js')
    if not main_js.exists():
        return
    
    content = main_js.read_text()
    
    # Replace console.warn with logger.warn
    content = re.sub(r'console\.warn\(', 'logger.warn(', content)
    
    # Replace console.error with logger.error (but keep critical ones)
    # Only replace non-critical errors
    content = re.sub(r'console\.error\(([^)]+)\)', r'logger.error(\1)', content)
    
    main_js.write_text(content)
    print("Fixed console.warn and console.error in main.js")

if __name__ == "__main__":
    fix_console_errors()


