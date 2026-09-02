import { describe, it, expect, vi } from 'vitest';
import { PixiAssetManager } from '../../src/js/assets/PixiAssetManager.js';

describe('PixiAssetManager', () => {
  let assetManager;
  let Assets;

  beforeEach(() => {
    Assets = {
      get: vi.fn(),
      load: vi.fn(),
    };
    assetManager = new PixiAssetManager(Assets);
  });

  describe('convertManifestToAssets', () => {
    it('flattens manifest object to asset array', () => {
      const manifest = {
        characters: {
          base: 'a.png',
          emotions: {
            happy: 'h.png',
          },
        },
      };
      const result = assetManager.convertManifestToAssets(manifest, 'path/to/manifest.json');
      expect(result).toEqual([
        { alias: 'characters.base', src: 'a.png' },
        { alias: 'characters.emotions.happy', src: 'h.png' },
      ]);
    });
  });

  describe('getAsset', () => {
    it('returns asset if alias exists', () => {
      Assets.get.mockReturnValue('asset');
      expect(assetManager.getAsset('characters.base')).toBe('asset');
    });

    it('returns null if alias does not exist', () => {
      Assets.get.mockReturnValue(null);
      expect(assetManager.getAsset('unknown.alias')).toBe(null);
    });

    it('catches and returns null if Assets.get throws', () => {
      Assets.get.mockImplementation(() => {
        throw new Error('Asset not found');
      });
      expect(assetManager.getAsset('characters.base')).toBe(null);
    });
  });

  describe('getCharacterEmotion', () => {
    it('delegates to getAsset with expected alias', () => {
      Assets.get.mockReturnValue('emotionAsset');
      expect(assetManager.getCharacterEmotion('character', 'happy')).toBe('emotionAsset');
      expect(Assets.get).toHaveBeenCalledWith('characters.character.emotions.happy');
    });
  });

  describe('getCharacterBodyLanguage', () => {
    it('delegates to getAsset with expected alias', () => {
      Assets.get.mockReturnValue('bodyLanguageAsset');
      expect(assetManager.getCharacterBodyLanguage('character', 'wave')).toBe('bodyLanguageAsset');
      expect(Assets.get).toHaveBeenCalledWith('characters.character.bodyLanguages.wave');
    });
  });

  describe('getLocationBackground', () => {
    it('delegates to getAsset with expected alias', () => {
      Assets.get.mockReturnValue('backgroundAsset');
      expect(assetManager.getLocationBackground('location')).toBe('backgroundAsset');
      expect(Assets.get).toHaveBeenCalledWith('locations.location.background');
    });
  });

  describe('loadAsset', () => {
    it('loads asset and returns texture on resolve', async () => {
      const texture = { baseTexture: { url: 'texture.png' } };
      Assets.load.mockResolvedValue(texture);
      const result = await assetManager.loadAsset('src/a.png');
      expect(result).toBe(texture);
    });

    it('returns null on reject', async () => {
      Assets.load.mockRejectedValue(new Error('Failed to load asset'));
      const result = await assetManager.loadAsset('src/a.png');
      expect(result).toBe(null);
    });
  });

  describe('loadAssets', () => {
    it('loads multiple assets and returns resolved textures', async () => {
      const textures = [
        { baseTexture: { url: 'texture1.png' } },
        { baseTexture: { url: 'texture2.png' } },
      ];
      Assets.load.mockResolvedValueOnce(textures[0]).mockResolvedValueOnce(textures[1]);
      const result = await assetManager.loadAssets(['src/a.png', 'src/b.png']);
      expect(result).toEqual(textures);
    });

    it('returns empty object on any reject', async () => {
      Assets.load.mockRejectedValue(new Error('Failed to load asset'));
      const result = await assetManager.loadAssets(['src/a.png', 'src/b.png']);
      expect(result).toEqual({});
    });
  });

  describe('getProgress', () => {
    it('returns 100 when loaded is true', () => {
      assetManager.loaded = true;
      expect(assetManager.getProgress()).toBe(100);
    });

    it('returns 0 when loaded is false', () => {
      assetManager.loaded = false;
      expect(assetManager.getProgress()).toBe(0);
    });
  });
});