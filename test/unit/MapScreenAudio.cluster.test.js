import { describe, it, expect, vi, afterEach } from 'vitest';
import { AudioManager } from '../../src/js/audio/AudioManager.js';
import { ScreenManager } from '../../src/js/ui/ScreenManager.js';
import { updateMapLocationIcons } from '../../src/js/helpers/MapIconRenderer.js';

afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ''; });

describe('station switch crossfades (#1291)', () => {
    it('a playing track fades out before it is released', () => {
        vi.useFakeTimers();
        const am = Object.create(AudioManager.prototype);
        const audio = { paused: false, volume: 0.5, pause: vi.fn(), removeAttribute: vi.fn(), load: vi.fn() };
        am.currentMusic = audio;
        am.stopCurrentMusic({ fade: true });
        expect(am.currentMusic).toBeNull();
        expect(audio.pause).not.toHaveBeenCalled();
        vi.advanceTimersByTime(AudioManager.FADE_MS / 2);
        expect(audio.volume).toBeGreaterThan(0);
        expect(audio.volume).toBeLessThan(0.5);
        vi.advanceTimersByTime(AudioManager.FADE_MS);
        expect(audio.volume).toBe(0);
        expect(audio.pause).toHaveBeenCalled();
    });

    it('a paused track or a plain stop releases immediately', () => {
        const am = Object.create(AudioManager.prototype);
        const audio = { paused: true, volume: 0.5, pause: vi.fn(), removeAttribute: vi.fn(), load: vi.fn() };
        am.currentMusic = audio;
        am.stopCurrentMusic({ fade: true });
        expect(audio.pause).toHaveBeenCalled();
        const b = { paused: false, volume: 0.5, pause: vi.fn() };
        am.currentMusic = b;
        am.stopCurrentMusic();
        expect(b.pause).toHaveBeenCalled();
    });

    it('fadeVolume ramps up to the target and calls done', () => {
        vi.useFakeTimers();
        const am = Object.create(AudioManager.prototype);
        const audio = { volume: 0 };
        const done = vi.fn();
        am.fadeVolume(audio, 0.8, 200, done);
        vi.advanceTimersByTime(200);
        expect(audio.volume).toBeCloseTo(0.8);
        expect(done).toHaveBeenCalledTimes(1);
    });
});

describe('map refresh is skipped if the player already left the map (#1089)', () => {
    it('the delayed map refresh re-checks the current screen', () => {
        const src = ScreenManager.prototype.showScreen.toString();
        const i = src.indexOf("screenId === 'screen-map' && this.mainGame");
        const block = src.slice(i, src.indexOf('}, 100)', i));
        expect(block).toMatch(/setTimeout\(\(\) => \{[\s\S]*if \(this\.currentScreen !== 'screen-map'\) return;[\s\S]*updateMapScreen/);
    });
});

describe('failed location icons are removed and not retried (#2382)', () => {
    it('drops the broken img, shows a placeholder, and skips later refreshes', () => {
        document.body.innerHTML = '<div class="map-location" data-location="cafe"><span class="location-icon"></span></div>';
        const game = { worldMap: { getLocation: () => ({ name: 'Cafe', icon: '/nope.png' }) } };
        updateMapLocationIcons(game);
        const container = document.querySelector('.location-icon');
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        img.dispatchEvent(new Event('error'));
        img.onerror?.();
        expect(container.querySelector('img')).toBeNull();
        expect(container.dataset.iconFailed).toBe('true');
        expect(container.textContent).toBe('C');
        updateMapLocationIcons(game);
        expect(container.querySelector('img')).toBeNull();
    });
});
