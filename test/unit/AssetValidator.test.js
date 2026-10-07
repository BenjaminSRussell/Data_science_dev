const AssetValidator = require('src/js/dev/AssetValidator');
const { expect } = require('chai');
const sinon = require('sinon');
const vi = require('vitest');

describe('AssetValidator', () => {
  let mockGame;
  let assetValidator;

  beforeEach(() => {
    mockGame = {
      assetManager: {
        getAssetManifest: sinon.stub(),
      },
    };
    assetValidator = new AssetValidator(mockGame);
  });

  describe('getSpritePaths', () => {
    it('returns hardcoded paths when no manifest is present', () => {
      const paths = assetValidator.getSpritePaths();
      expect(paths).to.have.lengthOf(2);
      expect(paths).to.include('path/to/sprite1.png');
      expect(paths).to.include('path/to/sprite2.png');
    });

    it('returns unique paths when manifest contains spriteSheets', () => {
      mockGame.assetManager.getAssetManifest.returns({
        characters: {
          spriteSheets: ['path/to/sprite1.png', 'path/to/sprite2.png'],
        },
      });
      const paths = assetValidator.getSpritePaths();
      expect(paths).to.have.lengthOf(2);
      expect(paths).to.include('path/to/sprite1.png');
      expect(paths).to.include('path/to/sprite2.png');
    });
  });

  describe('getImagePaths', () => {
    it('returns truncated paths when more than 20 backgrounds are present', () => {
      const manifest = {
        backgrounds: Array(25).fill('background_url'),
      };
      mockGame.assetManager.getAssetManifest.returns(manifest);
      const paths = assetValidator.getImagePaths();
      expect(paths).to.have.lengthOf(20);
      paths.forEach(path => expect(path).to.equal('background_url'));
    });

    it('returns paths from backgrounds objects', () => {
      const manifest = {
        backgrounds: [{ url: 'background_url_1' }, { url: 'background_url_2' }],
      };
      mockGame.assetManager.getAssetManifest.returns(manifest);
      const paths = assetValidator.getImagePaths();
      expect(paths).to.have.lengthOf(2);
      expect(paths).to.include('background_url_1');
      expect(paths).to.include('background_url_2');
    });
  });

  describe('getAudioPaths', () => {
    it('returns empty array when audioManager is undefined', () => {
      expect(assetValidator.getAudioPaths()).to.be.an('array').that.is.empty;
    });

    it('returns urls from audioManager sounds', () => {
      mockGame.audioManager = {
        sounds: [{ url: 'sound_url_1' }, { url: 'sound_url_2' }],
      };
      const paths = assetValidator.getAudioPaths();
      expect(paths).to.have.lengthOf(2);
      expect(paths).to.include('sound_url_1');
      expect(paths).to.include('sound_url_2');
    });
  });

  describe('validateAll', () => {
    it('validates sprites, images, and audio and sums results', () => {
      const validateSpritesSpy = sinon.spy(assetValidator, 'validateSprites');
      const validateImagesSpy = sinon.spy(assetValidator, 'validateImages');
      const validateAudioSpy = sinon.spy(assetValidator, 'validateAudio');

      validateSpritesSpy.returns({ total: 10, loaded: 8, failed: 2 });
      validateImagesSpy.returns({ total: 5, loaded: 3, failed: 2 });
      validateAudioSpy.returns({ total: 7, loaded: 5, failed: 2 });

      const results = assetValidator.validateAll();
      expect(results.total).to.equal(22);
      expect(results.loaded).to.equal(16);
      expect(results.failed).to.equal(6);

      expect(validateSpritesSpy.calledOnce).to.be.true;
      expect(validateImagesSpy.calledOnce).to.be.true;
      expect(validateAudioSpy.calledOnce).to.be.true;
    });
  });

  describe('validateImage', () => {
    let image;
    let onLoadSpy;
    let onErrorSpy;

    beforeEach(() => {
      image = {
        loaded: false,
        width: 0,
        height: 0,
        onload: null,
        onerror: null,
      };
      onLoadSpy = sinon.spy();
      onErrorSpy = sinon.spy();
    });

    it('resolves with loaded=true, width, and height on successful load', () => {
      image.onload = onLoadSpy;
      image.width = 100;
      image.height = 200;

      const validatePromise = assetValidator.validateImage(image);
      vi.runAllTimers();

      expect(validatePromise).to.be.fulfilled;
      expect(validatePromise).to.eventually.deep.equal({ loaded: true, width: 100, height: 200 });
      expect(onLoadSpy.calledOnce).to.be.true;
      expect(onErrorSpy.notCalled).to.be.true;
    });

    it('resolves with loaded=false and error on load failure', () => {
      image.onerror = onErrorSpy;
      image.width = 0;
      image.height = 0;

      const validatePromise = assetValidator.validateImage(image);
      vi.runAllTimers();

      expect(validatePromise).to.be.fulfilled;
      expect(validatePromise).to.eventually.deep.equal({ loaded: false, error: 'Load failed' });
      expect(onLoadSpy.notCalled).to.be.true;
      expect(onErrorSpy.calledOnce).to.be.true;
    });

    it('resolves with loaded=false and error on timeout', () => {
      const validatePromise = assetValidator.validateImage(image);
      vi.advanceTimersByTime(5000);

      expect(validatePromise).to.be.fulfilled;
      expect(validatePromise).to.eventually.deep.equal({ loaded: false, error: 'Timeout' });
      expect(onLoadSpy.notCalled).to.be.true;
      expect(onErrorSpy.notCalled).to.be.true;
    });
  });
});