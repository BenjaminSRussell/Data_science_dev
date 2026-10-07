import sys
import os
import subprocess
import logging
from unittest.mock import Mock, patch, call

# Add scripts/scrapers to path so we can import run_all_scrapers
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../scripts/scrapers')))

from run_all_scrapers import run_scraper, main, SCRAPERS


class TestRunScraper:
    """Tests for run_scraper function (issue requirements 1-4)"""

    def test_run_scraper_success_returncode_0(self):
        """Issue #1: run_scraper returns True when subprocess.run returns returncode=0"""
        scraper_info = SCRAPERS[0]

        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "Success output"
        mock_result.stderr = ""

        with patch('run_all_scrapers.subprocess.run', return_value=mock_result):
            result = run_scraper(scraper_info)

        assert result is True, "run_scraper should return True for returncode=0"

    def test_run_scraper_failure_returncode_1(self):
        """Issue #2: run_scraper returns False when subprocess.run returns returncode=1"""
        scraper_info = SCRAPERS[0]

        mock_result = Mock()
        mock_result.returncode = 1
        mock_result.stdout = ""
        mock_result.stderr = "Error output"

        with patch('run_all_scrapers.subprocess.run', return_value=mock_result):
            result = run_scraper(scraper_info)

        assert result is False, "run_scraper should return False for returncode=1"

    def test_run_scraper_timeout_exception(self):
        """Issue #3: run_scraper catches TimeoutExpired exception and returns False"""
        scraper_info = SCRAPERS[0]

        with patch('run_all_scrapers.subprocess.run',
                  side_effect=subprocess.TimeoutExpired(cmd='test', timeout=3600)):
            result = run_scraper(scraper_info)

        assert result is False, "run_scraper should catch TimeoutExpired and return False"

    def test_run_scraper_generic_exception(self):
        """Issue #4: run_scraper catches generic Exception and returns False"""
        scraper_info = SCRAPERS[0]

        with patch('run_all_scrapers.subprocess.run',
                  side_effect=Exception("Some generic error")):
            result = run_scraper(scraper_info)

        assert result is False, "run_scraper should catch generic Exception and return False"


class TestMainResultsMapping:
    """Test main() results aggregation (issue requirement 5)"""

    def test_main_processes_all_scrapers_alternating_results(self, caplog):
        """Issue #5: main() processes all 7 scrapers and correctly maps outcomes

        This test verifies:
        - All 7 scrapers are processed
        - Results dict correctly maps scraper name to boolean outcome
        - Summary counts successful vs total are correct (4/7 in this case)
        """
        caplog.set_level(logging.INFO)

        mock_result = Mock()
        mock_result.stdout = "output"
        mock_result.stderr = ""

        # Alternating success/failure: True, False, True, False, True, False, True (4 successes)
        return_codes = [0, 1, 0, 1, 0, 1, 0]
        call_count = [0]

        def mock_run_side_effect(*args, **kwargs):
            result_code = return_codes[call_count[0]]
            call_count[0] += 1
            mock_result.returncode = result_code
            return mock_result

        # Verify main() runs without errors with alternating results
        with patch('run_all_scrapers.subprocess.run', side_effect=mock_run_side_effect):
            with patch('run_all_scrapers.time.sleep'):
                main()

        # Verify all 7 scrapers were processed
        assert call_count[0] == 7, f"Expected 7 scraper calls, got {call_count[0]}"

        # Verify results dict correctly maps each scraper name to the right boolean outcome
        # Expected: Character Sprites (TRUE), Location Backdrops (FALSE), Map Assets (TRUE),
        #           Icons (FALSE), Vehicles (TRUE), UI Elements (FALSE), Particle Effects (TRUE)
        log_output = caplog.text

        # Check that each scraper's result is logged with the correct status
        assert "Character Sprites: ✅ SUCCESS" in log_output, \
            "Character Sprites should be SUCCESS (returncode=0)"
        assert "Location Backdrops: ❌ FAILED" in log_output, \
            "Location Backdrops should be FAILED (returncode=1)"
        assert "Map Assets: ✅ SUCCESS" in log_output, \
            "Map Assets should be SUCCESS (returncode=0)"
        assert "Icons: ❌ FAILED" in log_output, \
            "Icons should be FAILED (returncode=1)"
        assert "Vehicles: ✅ SUCCESS" in log_output, \
            "Vehicles should be SUCCESS (returncode=0)"
        assert "UI Elements: ❌ FAILED" in log_output, \
            "UI Elements should be FAILED (returncode=1)"
        assert "Particle Effects: ✅ SUCCESS" in log_output, \
            "Particle Effects should be SUCCESS (returncode=0)"

        # Verify the final successful/total summary matches the mocked outcomes
        assert "Total: 4/7 scrapers completed successfully" in log_output, \
            "Summary should show 4/7 successful (4 successes, 3 failures)"

    def test_main_all_success_scenario(self, caplog):
        """Test main() when all scrapers succeed (7/7)

        Verifies:
        - All 7 scrapers are processed
        - Results dict correctly maps all scraper names to True
        - Summary shows 7/7 successful
        """
        caplog.set_level(logging.INFO)

        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "output"
        mock_result.stderr = ""

        call_count = [0]

        def mock_run_side_effect(*args, **kwargs):
            call_count[0] += 1
            return mock_result

        with patch('run_all_scrapers.subprocess.run', side_effect=mock_run_side_effect):
            with patch('run_all_scrapers.time.sleep'):
                main()

        # Verify all 7 scrapers were processed
        assert call_count[0] == 7, f"Expected 7 scraper calls, got {call_count[0]}"

        log_output = caplog.text

        # Verify all scrapers are logged as SUCCESS
        for scraper in SCRAPERS:
            assert f"{scraper['name']}: ✅ SUCCESS" in log_output, \
                f"{scraper['name']} should be mapped to SUCCESS"

        # Verify the final summary shows all successful
        assert "Total: 7/7 scrapers completed successfully" in log_output, \
            "Summary should show 7/7 successful"

    def test_main_all_failure_scenario(self, caplog):
        """Test main() when all scrapers fail (0/7)

        Verifies:
        - All 7 scrapers are processed
        - Results dict correctly maps all scraper names to False
        - Summary shows 0/7 successful
        """
        caplog.set_level(logging.INFO)

        mock_result = Mock()
        mock_result.returncode = 1
        mock_result.stdout = ""
        mock_result.stderr = "error"

        call_count = [0]

        def mock_run_side_effect(*args, **kwargs):
            call_count[0] += 1
            return mock_result

        with patch('run_all_scrapers.subprocess.run', side_effect=mock_run_side_effect):
            with patch('run_all_scrapers.time.sleep'):
                main()

        # Verify all 7 scrapers were processed despite failures
        assert call_count[0] == 7, f"Expected 7 scraper calls, got {call_count[0]}"

        log_output = caplog.text

        # Verify all scrapers are logged as FAILED
        for scraper in SCRAPERS:
            assert f"{scraper['name']}: ❌ FAILED" in log_output, \
                f"{scraper['name']} should be mapped to FAILED"

        # Verify the final summary shows no successful
        assert "Total: 0/7 scrapers completed successfully" in log_output, \
            "Summary should show 0/7 successful"


class TestMainSleepBehavior:
    """Test main() sleep behavior (issue requirement 6)"""

    def test_main_no_sleep_after_final_scraper(self):
        """Issue #6: time.sleep(5) is NOT called after the final scraper

        Verifies the guard 'if scraper != SCRAPERS[-1]' prevents sleep after last scraper.
        With 7 scrapers, sleep should be called 6 times (between scrapers, not after last).
        """
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "output"
        mock_result.stderr = ""

        with patch('run_all_scrapers.subprocess.run', return_value=mock_result):
            with patch('run_all_scrapers.time.sleep') as mock_sleep:
                main()

        # We have 7 scrapers, so time.sleep should be called 6 times
        # (between each pair, not after the last one)
        assert mock_sleep.call_count == 6, \
            f"time.sleep should be called 6 times (between 7 scrapers), but was called {mock_sleep.call_count} times"

        # Verify all sleep calls were with 5 seconds
        for call_obj in mock_sleep.call_args_list:
            assert call_obj == call(5), "All sleep calls should be with 5 seconds"

    def test_main_sleep_count_with_alternating_results(self):
        """Test that sleep is called 6 times regardless of success/failure pattern"""
        mock_result = Mock()
        mock_result.stdout = "output"
        mock_result.stderr = ""

        # Alternating pattern should not affect sleep count
        return_codes = [0, 1, 0, 1, 0, 1, 0]
        call_count = [0]

        def mock_run_side_effect(*args, **kwargs):
            result_code = return_codes[call_count[0]]
            call_count[0] += 1
            mock_result.returncode = result_code
            return mock_result

        with patch('run_all_scrapers.subprocess.run', side_effect=mock_run_side_effect):
            with patch('run_all_scrapers.time.sleep') as mock_sleep:
                main()

        # Still 6 calls (between the 7 scrapers) regardless of outcome
        assert mock_sleep.call_count == 6, \
            f"time.sleep should be called 6 times, but was called {mock_sleep.call_count} times"

    def test_main_sleep_with_exceptions(self):
        """Test that sleep is still called even when scrapers raise exceptions"""
        # First scraper succeeds, second times out, third has generic exception
        effects = [
            Mock(returncode=0, stdout="output", stderr=""),
            subprocess.TimeoutExpired(cmd='test', timeout=3600),
            Exception("Generic error"),
            Mock(returncode=0, stdout="output", stderr=""),
            Mock(returncode=1, stdout="", stderr="error"),
            Mock(returncode=0, stdout="output", stderr=""),
            Mock(returncode=0, stdout="output", stderr=""),
        ]

        with patch('run_all_scrapers.subprocess.run', side_effect=effects):
            with patch('run_all_scrapers.time.sleep') as mock_sleep:
                main()

        # Still 6 calls regardless of exceptions
        assert mock_sleep.call_count == 6, \
            f"time.sleep should be called 6 times even with exceptions, but was called {mock_sleep.call_count} times"
