#!/usr/bin/env python3
"""
Standalone test runner for test_create_asset_workbench.py
This allows running tests without pytest being installed.
"""

import sys
import os
import tempfile
import shutil
import re
from pathlib import Path
from io import StringIO

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import create_asset_workbench as module


class TempWorkspace:
    def __init__(self):
        self.tmp_path = Path(tempfile.mkdtemp())
        self.manifest_path = self.tmp_path / "ASSET_MANIFEST.md"
        self.workbench_dir = self.tmp_path / "_ASSET_WORKBENCH"
        self.asset_dir = self.tmp_path / "assets"
        self.asset_dir.mkdir()

        # Create placeholder source file
        self.placeholder_path = self.asset_dir / "placeholder.png"
        self.placeholder_path.write_bytes(b"PLACEHOLDER_CONTENT")

        # Store original values
        self.orig_manifest = module.MANIFEST_PATH
        self.orig_workbench = module.WORKBENCH_DIR
        self.orig_placeholder = module.TODO_PLACEHOLDER_SOURCE

        # Patch module constants
        module.MANIFEST_PATH = str(self.manifest_path)
        module.WORKBENCH_DIR = str(self.workbench_dir)
        module.TODO_PLACEHOLDER_SOURCE = str(self.placeholder_path)

    def cleanup(self):
        """Restore original module constants and clean up temp directory."""
        module.MANIFEST_PATH = self.orig_manifest
        module.WORKBENCH_DIR = self.orig_workbench
        module.TODO_PLACEHOLDER_SOURCE = self.orig_placeholder
        shutil.rmtree(self.tmp_path, ignore_errors=True)


def test_category_header_creates_directory():
    """Test that a properly formatted category header creates a directory."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Characters (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
        )

        module.parse_manifest_and_create_workbench()

        category_dir = ws.workbench_dir / "Characters"
        assert category_dir.exists(), "Characters directory should exist"
        assert category_dir.is_dir(), "Characters should be a directory"
        print("✓ test_category_header_creates_directory PASSED")
    finally:
        ws.cleanup()


def test_exists_status_with_valid_source():
    """Test that EXISTS status with valid source copies the file."""
    ws = TempWorkspace()
    orig_cwd = os.getcwd()
    try:
        # Change to temp directory so relative paths work
        os.chdir(ws.tmp_path)

        # Create source file at relative path
        source_file = Path("assets") / "character_model.png"
        source_file.parent.mkdir(parents=True, exist_ok=True)
        source_file.write_bytes(b"CHARACTER_PNG_DATA")

        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Characters (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            f"| | **Alice** | `assets/character_model.png` | EXISTS |\n"
        )

        module.parse_manifest_and_create_workbench()

        dest_file = ws.workbench_dir / "Characters" / "character_model.png"
        assert dest_file.exists(), "Destination file should exist"
        assert dest_file.read_bytes() == b"CHARACTER_PNG_DATA", "File content should match"
        print("✓ test_exists_status_with_valid_source PASSED")
    finally:
        os.chdir(orig_cwd)
        ws.cleanup()


def test_exists_status_with_missing_source():
    """Test that EXISTS status with missing source uses placeholder and logs warning."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Characters (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            "| | **Bob** | `nonexistent/path/file.png` | EXISTS |\n"
        )

        # Capture stdout
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        try:
            module.parse_manifest_and_create_workbench()
            output = sys.stdout.getvalue()
        finally:
            sys.stdout = old_stdout

        assert "MISSING FILE FOR EXISTING ENTRY" in output, "Should log MISSING FILE warning"

        dest_file = ws.workbench_dir / "Characters" / "file.png"
        assert dest_file.exists(), "Destination file should exist"
        assert dest_file.read_bytes() == b"PLACEHOLDER_CONTENT", "Should use placeholder"
        print("✓ test_exists_status_with_missing_source PASSED")
    finally:
        ws.cleanup()


def test_pending_status_with_missing_source():
    """Test that PENDING status with missing source also uses placeholder."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Items (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            "| | **Sword** | `missing/sword.png` | PENDING |\n"
        )

        # Capture stdout to verify warning
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        try:
            module.parse_manifest_and_create_workbench()
            output = sys.stdout.getvalue()
        finally:
            sys.stdout = old_stdout

        assert "MISSING FILE FOR EXISTING ENTRY" in output

        dest_file = ws.workbench_dir / "Items" / "sword.png"
        assert dest_file.exists()
        assert dest_file.read_bytes() == b"PLACEHOLDER_CONTENT"
        print("✓ test_pending_status_with_missing_source PASSED")
    finally:
        ws.cleanup()


def test_missing_status_uses_placeholder():
    """Test that MISSING status uses placeholder unconditionally."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Items (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            "| | **Shield** | `path/to/shield.png` | MISSING |\n"
        )

        module.parse_manifest_and_create_workbench()

        dest_file = ws.workbench_dir / "Items" / "shield.png"
        assert dest_file.exists(), "Should create placeholder for MISSING status"
        assert dest_file.read_bytes() == b"PLACEHOLDER_CONTENT"
        print("✓ test_missing_status_uses_placeholder PASSED")
    finally:
        ws.cleanup()


def test_malformed_row_skipped():
    """Test that malformed rows with fewer than 5 columns are skipped."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Characters (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            "| | **Alice** | Missing Status |\n"  # Only 4 columns
            "| | **Bob** | `bob.png` | EXISTS |\n"  # Valid row
        )

        module.parse_manifest_and_create_workbench()

        alice_file = ws.workbench_dir / "Characters" / "alice.png"
        bob_file = ws.workbench_dir / "Characters" / "bob.png"

        assert not alice_file.exists(), "Malformed row should be skipped"
        assert bob_file.exists(), "Valid row should be processed"
        print("✓ test_malformed_row_skipped PASSED")
    finally:
        ws.cleanup()


def test_multiple_categories():
    """Test that multiple categories are properly handled."""
    ws = TempWorkspace()
    orig_cwd = os.getcwd()
    try:
        # Change to temp directory so relative paths work
        os.chdir(ws.tmp_path)

        # Create source files at relative paths
        (Path("assets") / "char.png").parent.mkdir(parents=True, exist_ok=True)
        Path("assets/char.png").write_bytes(b"CHARACTER")
        Path("assets/item.png").write_bytes(b"ITEM")

        ws.manifest_path.write_text(
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

        module.parse_manifest_and_create_workbench()

        char_dir = ws.workbench_dir / "Characters"
        item_dir = ws.workbench_dir / "Items"
        assert char_dir.exists()
        assert item_dir.exists()

        char_dest = char_dir / "char.png"
        item_dest = item_dir / "item.png"
        assert char_dest.exists()
        assert item_dest.exists()
        assert char_dest.read_bytes() == b"CHARACTER"
        assert item_dest.read_bytes() == b"ITEM"
        print("✓ test_multiple_categories PASSED")
    finally:
        os.chdir(orig_cwd)
        ws.cleanup()


def test_path_extraction_with_backticks():
    """Test that backtick path extraction works correctly."""
    ws = TempWorkspace()
    orig_cwd = os.getcwd()
    try:
        # Change to temp directory so relative paths work
        os.chdir(ws.tmp_path)

        # Create source file at relative path
        Path("assets").mkdir(parents=True, exist_ok=True)
        Path("assets/extracted.png").write_bytes(b"EXTRACTED_CONTENT")

        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Items (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            f"| | **Item** | Some markdown stuff `assets/extracted.png` more text | EXISTS |\n"
        )

        module.parse_manifest_and_create_workbench()

        dest_file = ws.workbench_dir / "Items" / "extracted.png"
        assert dest_file.exists()
        assert dest_file.read_bytes() == b"EXTRACTED_CONTENT"
        print("✓ test_path_extraction_with_backticks PASSED")
    finally:
        os.chdir(orig_cwd)
        ws.cleanup()


def test_skips_separator_and_header_rows():
    """Test that separator and header rows are skipped."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Characters (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            "| | **Alice** | `placeholder.png` | MISSING |\n"
        )

        module.parse_manifest_and_create_workbench()

        alice_file = ws.workbench_dir / "Characters" / "placeholder.png"
        assert alice_file.exists()
        print("✓ test_skips_separator_and_header_rows PASSED")
    finally:
        ws.cleanup()


def test_sanitize_filename_fallback():
    """Test that sanitize_filename is used when no backtick path exists."""
    ws = TempWorkspace()
    try:
        ws.manifest_path.write_text(
            "# Asset Manifest\n"
            "\n"
            "## 1. Characters (\n"
            "| Preview | Name | Path | Status |\n"
            "|---------|------|------|--------|\n"
            "| | **Rachel Green** | No backtick path here | MISSING |\n"
        )

        module.parse_manifest_and_create_workbench()

        expected_file = ws.workbench_dir / "Characters" / "rachel_green.png"
        assert expected_file.exists(), "Should use sanitized filename"
        assert expected_file.read_bytes() == b"PLACEHOLDER_CONTENT"
        print("✓ test_sanitize_filename_fallback PASSED")
    finally:
        ws.cleanup()


if __name__ == "__main__":
    tests = [
        test_category_header_creates_directory,
        test_exists_status_with_valid_source,
        test_exists_status_with_missing_source,
        test_pending_status_with_missing_source,
        test_missing_status_uses_placeholder,
        test_malformed_row_skipped,
        test_multiple_categories,
        test_path_extraction_with_backticks,
        test_skips_separator_and_header_rows,
        test_sanitize_filename_fallback,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"✗ {test.__name__} FAILED: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ {test.__name__} ERROR: {e}")
            failed += 1

    print(f"\n{passed} passed, {failed} failed")
    sys.exit(0 if failed == 0 else 1)
