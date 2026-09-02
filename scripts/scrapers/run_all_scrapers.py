#!/usr/bin/env python3

import subprocess
import unittest
from unittest.mock import patch, call

SCRAPERS = [
    {"name": "map_assets", "script": "./scraper_map_assets.py"},
    {"name": "character_designs", "script": "./scraper_character_designs.py"},
    {"name": "environment_scenes", "script": "./scraper_environment_scenes.py"},
    {"name": "ui_elements", "script": "./scraper_ui_elements.py"},
    {"name": "sound_effects", "script": "./scraper_sound_effects.py"},
    {"name": "music_tracks", "script": "./scraper_music_tracks.py"},
    {"name": "game_models", "script": "./scraper_game_models.py"}
]

def run_scraper(scraper_info):
    try:
        result = subprocess.run(
            ['python3', scraper_info['script']],
            check=True,
            capture_output=True,
            text=True,
            timeout=3600
        )
        print(f"Scraper {scraper_info['name']} completed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Scraper {scraper_info['name']} failed with error: {e.stderr}")
        return False
    except subprocess.TimeoutExpired as e:
        print(f"Scraper {scraper_info['name']} timed out after {e.timeout} seconds.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred while running {scraper_info['name']}: {e}")
        return False

def main():
    results = {}
    for scraper in SCRAPERS:
        success = run_scraper(scraper)
        results[scraper['name']] = success
        if not success:
            print(f"At least one scraper failed. Stopping early.")
            break
        if scraper != SCRAPERS[-1]:
            time.sleep(5)
    
    successful_scrapers = sum(results.values())
    total_scrapers = len(results)
    print(f"Scraping complete: {successful_scrapers}/{total_scrapers} successful.")
    return results

class TestRunAllScrapers(unittest.TestCase):
    @patch('subprocess.run')
    def test_run_scraper_success(self, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(returncode=0, stdout="", stderr="")
        result = run_scraper(SCRAPERS[0])
        self.assertTrue(result)
        mock_run.assert_called_once_with(['python3', SCRAPERS[0]['script']], check=True, capture_output=True, text=True, timeout=3600)

    @patch('subprocess.run')
    def test_run_scraper_failure(self, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(returncode=1, stdout="", stderr="Error message")
        result = run_scraper(SCRAPERS[0])
        self.assertFalse(result)
        mock_run.assert_called_once_with(['python3', SCRAPERS[0]['script']], check=True, capture_output=True, text=True, timeout=3600)

    @patch('subprocess.run')
    def test_run_scraper_timeout(self, mock_run):
        mock_run.side_effect = subprocess.TimeoutExpired(cmd=SCRAPERS[0]['script'], timeout=3600)
        result = run_scraper(SCRAPERS[0])
        self.assertFalse(result)
        mock_run.assert_called_once_with(['python3', SCRAPERS[0]['script']], check=True, capture_output=True, text=True, timeout=3600)

    @patch('subprocess.run')
    def test_run_scraper_exception(self, mock_run):
        mock_run.side_effect = Exception("Unexpected error")
        result = run_scraper(SCRAPERS[0])
        self.assertFalse(result)
        mock_run.assert_called_once_with(['python3', SCRAPERS[0]['script']], check=True, capture_output=True, text=True, timeout=3600)

    @patch('subprocess.run')
    @patch('time.sleep')
    def test_main_alternating_success(self, mock_sleep, mock_run):
        mock_run.side_effect = [
            subprocess.CompletedProcess(returncode=0, stdout="", stderr=""),
            subprocess.CompletedProcess(returncode=1, stdout="", stderr=""),
            subprocess.CompletedProcess(returncode=0, stdout="", stderr=""),
            subprocess.CompletedProcess(returncode=1, stdout="", stderr=""),
            subprocess.CompletedProcess(returncode=0, stdout="", stderr=""),
            subprocess.CompletedProcess(returncode=1, stdout="", stderr=""),
            subprocess.CompletedProcess(returncode=0, stdout="", stderr="")
        ]
        results = main()
        expected_results = {
            "map_assets": True,
            "character_designs": False,
            "environment_scenes": True,
            "ui_elements": False,
            "sound_effects": True,
            "music_tracks": False,
            "game_models": True
        }
        self.assertEqual(results, expected_results)
        self.assertEqual(mock_sleep.call_count, 6)

    @patch('subprocess.run')
    @patch('time.sleep')
    def test_main_all_success(self, mock_sleep, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(returncode=0, stdout="", stderr="")
        results = main()
        expected_results = {
            "map_assets": True,
            "character_designs": True,
            "environment_scenes": True,
            "ui_elements": True,
            "sound_effects": True,
            "music_tracks": True,
            "game_models": True
        }
        self.assertEqual(results, expected_results)
        self.assertEqual(mock_sleep.call_count, 6)

    @patch('subprocess.run')
    @patch('time.sleep')
    def test_main_all_failure(self, mock_sleep, mock_run):
        mock_run.return_value = subprocess.CompletedProcess(returncode=1, stdout="", stderr="")
        results = main()
        expected_results = {
            "map_assets": False,
            "character_designs": False,
            "environment_scenes": False,
            "ui_elements": False,
            "sound_effects": False,
            "music_tracks": False,
            "game_models": False
        }
        self.assertEqual(results, expected_results)
        self.assertEqual(mock_sleep.call_count, 0)

if __name__ == '__main__':
    unittest.main()