"""
Test coverage for parse_manifest_and_create_workbench().

Approach chosen: Black-box/integration testing using tmp_path and monkeypatch.
This approach tests the full parsing and file-I/O flow end-to-end without
extracting parsing logic into separate functions. It exercises the real
category-header regex, table-row filter, column-count guard, backtick
path-extraction regex, and status branching logic (EXISTS/PENDING/MISSING).
"""

import os
import shutil
import tempfile
from pathlib import Path
import pytest
import create_asset_workbench as module


@pytest.fixture
def temp_workspace(tmp_path, monkeypatch):
    """
    Set up a temporary workspace with a manifest file and asset sources.
    Monkeypatch the module-level constants to use temp paths.
    """
    manifest_path = tmp_path / "ASSET_MANIFEST.md"
    workbench_dir = tmp_path / "_ASSET_WORKBENCH"
    asset_dir = tmp_path / "assets"
    asset_dir.mkdir()

    # Create a placeholder source file (simulating the star icon)
    placeholder_path = asset_dir / "placeholder.png"
    placeholder_path.write_bytes(b"PLACEHOLDER_CONTENT")

    # Monkeypatch module constants
    monkeypatch.setattr(module, "MANIFEST_PATH", str(manifest_path))
    monkeypatch.setattr(module, "WORKBENCH_DIR", str(workbench_dir))
    monkeypatch.setattr(
        module, "TODO_PLACEHOLDER_SOURCE", str(placeholder_path)
    )

    # Change to the temporary directory so relative paths work correctly
    monkeypatch.chdir(tmp_path)

    return {
        "tmp_path": tmp_path,
        "manifest_path": manifest_path,
        "workbench_dir": workbench_dir,
        "asset_dir": asset_dir,
        "placeholder_path": placeholder_path,
    }


def test_category_header_creates_directory(temp_workspace):
    """
    Test that a properly formatted category header (## N. CategoryName ()
    creates a corresponding directory in the workbench.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]

    # Write a manifest with a single category header and no rows
    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Assert that the category directory was created
    category_dir = workbench / "Characters"
    assert category_dir.exists(), "Characters directory should exist"
    assert category_dir.is_dir(), "Characters should be a directory"


def test_exists_status_with_valid_source(temp_workspace):
    """
    Test that a row with status EXISTS and a valid existing source file
    results in the source being copied to the workbench via shutil.copy2.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]
    asset_dir = temp_workspace["asset_dir"]

    # Create a real source file
    source_file = asset_dir / "character_model.png"
    source_file.write_bytes(b"CHARACTER_PNG_DATA")

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        f"| | **Alice** | `assets/character_model.png` | EXISTS |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Assert that the file was copied to the destination
    dest_file = workbench / "Characters" / "character_model.png"
    assert dest_file.exists(), "Destination file should exist"
    assert (
        dest_file.read_bytes() == b"CHARACTER_PNG_DATA"
    ), "File content should match source"


def test_exists_status_with_missing_source(temp_workspace, capsys):
    """
    Test that a row with status EXISTS/PENDING but a nonexistent source file
    falls through to the placeholder-copy branch and logs a "MISSING FILE" warning.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]
    placeholder_path = temp_workspace["placeholder_path"]

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        f"| | **Bob** | `nonexistent/path/file.png` | EXISTS |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Capture stdout to verify the warning was logged
    captured = capsys.readouterr()
    assert (
        "MISSING FILE FOR EXISTING ENTRY" in captured.out
    ), "Should log MISSING FILE warning"

    # Assert that the placeholder was copied instead
    dest_file = workbench / "Characters" / "file.png"
    assert dest_file.exists(), "Destination file should exist with placeholder"
    assert (
        dest_file.read_bytes() == b"PLACEHOLDER_CONTENT"
    ), "Should contain placeholder content"


def test_pending_status_with_missing_source(temp_workspace, capsys):
    """
    Test that status PENDING with a missing source also triggers placeholder copy.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Items (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        "| | **Sword** | `missing/sword.png` | PENDING |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Capture stdout to verify the warning
    captured = capsys.readouterr()
    assert "MISSING FILE FOR EXISTING ENTRY" in captured.out

    # Assert placeholder was created
    dest_file = workbench / "Items" / "sword.png"
    assert dest_file.exists()
    assert dest_file.read_bytes() == b"PLACEHOLDER_CONTENT"


def test_missing_status_uses_placeholder(temp_workspace):
    """
    Test that a row with status MISSING uses the placeholder unconditionally,
    even without a source path.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Items (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        "| | **Shield** | `path/to/shield.png` | MISSING |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Assert that the placeholder was created
    dest_file = workbench / "Items" / "shield.png"
    assert dest_file.exists(), "Should create placeholder for MISSING status"
    assert (
        dest_file.read_bytes() == b"PLACEHOLDER_CONTENT"
    ), "Should contain placeholder content"


def test_malformed_row_skipped(temp_workspace):
    """
    Test that a malformed row with fewer than 5 columns is skipped
    without raising an exception.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        "| | **Alice** | Missing Status |\n"  # Only 4 columns (missing Status)
        "| | **Bob** | `bob.png` | EXISTS |\n"  # Valid row (5 columns)
    )

    # Run the function - should not raise
    module.parse_manifest_and_create_workbench()

    # Assert that only the valid row was processed
    alice_file = workbench / "Characters" / "alice.png"
    bob_file = workbench / "Characters" / "bob.png"

    assert (
        not alice_file.exists()
    ), "Malformed row should be skipped, alice file should not exist"
    # Bob requires bob.png to exist as a source or it uses placeholder
    # Since bob.png doesn't exist, placeholder will be copied
    assert bob_file.exists(), "Valid row should be processed"


def test_multiple_categories(temp_workspace):
    """
    Test that multiple category headers are properly recognized and their
    directories created, with rows correctly assigned to categories.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]
    asset_dir = temp_workspace["asset_dir"]

    # Create source files for each category
    char_file = asset_dir / "char.png"
    char_file.write_bytes(b"CHARACTER")
    item_file = asset_dir / "item.png"
    item_file.write_bytes(b"ITEM")

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        f"| | **Hero** | `assets/char.png` | EXISTS |\n"
        "\n"
        "## 2. Items (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        f"| | **Potion** | `assets/item.png` | EXISTS |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Assert that both category directories exist
    char_dir = workbench / "Characters"
    item_dir = workbench / "Items"
    assert char_dir.exists()
    assert item_dir.exists()

    # Assert that files are in the correct directories
    char_dest = char_dir / "char.png"
    item_dest = item_dir / "item.png"
    assert char_dest.exists()
    assert item_dest.exists()
    assert char_dest.read_bytes() == b"CHARACTER"
    assert item_dest.read_bytes() == b"ITEM"


def test_path_extraction_with_backticks(temp_workspace):
    """
    Test that the backtick path-extraction regex correctly extracts paths
    like `path/to/file.png` from markdown table cells.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]
    asset_dir = temp_workspace["asset_dir"]

    # Create source file
    source_file = asset_dir / "extracted.png"
    source_file.write_bytes(b"EXTRACTED_CONTENT")

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Items (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        f"| | **Item** | Some markdown stuff `assets/extracted.png` more text | EXISTS |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Assert that the path was correctly extracted from backticks
    dest_file = workbench / "Items" / "extracted.png"
    assert dest_file.exists()
    assert dest_file.read_bytes() == b"EXTRACTED_CONTENT"


def test_skips_separator_and_header_rows(temp_workspace):
    """
    Test that table separator rows (---) and header rows (with 'Preview')
    are correctly skipped and don't cause parsing errors.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        "| | **Alice** | `placeholder.png` | MISSING |\n"
    )

    # Should not raise on separator or header rows
    module.parse_manifest_and_create_workbench()

    # Assert that the valid row was processed
    alice_file = workbench / "Characters" / "placeholder.png"
    assert alice_file.exists()


def test_sanitize_filename_fallback(temp_workspace):
    """
    Test that when no path is extracted from backticks, the filename
    is generated from the name column using sanitize_filename.
    """
    manifest = temp_workspace["manifest_path"]
    workbench = temp_workspace["workbench_dir"]

    manifest.write_text(
        "# Asset Manifest\n"
        "\n"
        "## 1. Characters (\n"
        "| Preview | Name | Path | Status |\n"
        "|---------|------|------|--------|\n"
        "| | **Rachel Green** | No backtick path here | MISSING |\n"
    )

    # Run the function
    module.parse_manifest_and_create_workbench()

    # Assert that sanitized filename was used
    expected_file = workbench / "Characters" / "rachel_green.png"
    assert expected_file.exists(), "Should use sanitized filename when no backtick path"
    assert expected_file.read_bytes() == b"PLACEHOLDER_CONTENT"
