import pytest
from tools.create_asset_workbench import sanitize_filename

def test_sanitize_filename():
    # Test documented examples
    assert sanitize_filename("Rachel Green") == "rachel_green.png"
    assert sanitize_filename("Small Business") == "small_business.png"
    
    # Test multiple consecutive spaces/hyphens collapsing to one underscore
    assert sanitize_filename("Multiple   Spaces") == "multiple_spaces.png"
    assert sanitize_filename("Multiple---Hyphens") == "multiple_hyphens.png"
    
    # Test leading/trailing whitespace stripped
    assert sanitize_filename("  Leading and trailing  ") == "leading_and_trailing.png"
    
    # Test punctuation-heavy names
    assert sanitize_filename("Name, with. & punctuation!") == "name_with_ampersand_punctuation.png"
    assert sanitize_filename("O'Reilly & Co.") == "o_reilly_co.png"
    
    # Test empty or entirely punctuation name
    assert sanitize_filename("") == ".png"
    assert sanitize_filename("!!!") == ".png"
    
    # Test mixed-case input confirming lowercasing
    assert sanitize_filename("MiXeD CaSe") == "mixed_case.png"
    
    # Test digits surviving the \w class
    assert sanitize_filename("Number 123") == "number_123.png"
    
    # Test emoji or non-ASCII character handling
    assert sanitize_filename("CafÃ©") == "cafe.png"
    assert sanitize_filename("ðŸ˜Š") == ".png"