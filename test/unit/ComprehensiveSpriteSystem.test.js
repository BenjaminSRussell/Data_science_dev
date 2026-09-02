const ComprehensiveSpriteSystem = require('src/js/assets/ComprehensiveSpriteSystem');

describe('ComprehensiveSpriteSystem', () => {
  let spriteSystem;

  beforeEach(() => {
    spriteSystem = new ComprehensiveSpriteSystem();
  });

  describe('getSprite(key)', () => {
    it('returns sprite if key is loaded', () => {
      const key = 'sprite1';
      const sprite = { img: {} };
      spriteSystem.loadedSprites.set(key, sprite);
      expect(spriteSystem.getSprite(key)).toBe(sprite);
    });

    it('returns null if key is not loaded', () => {
      expect(spriteSystem.getSprite('nonExistentSprite')).toBeNull();
    });
  });

  describe('getEmotionSprite(emotion)', () => {
    it('returns sprite if emotion is loaded', () => {
      const emotion = 'happy';
      const sprite = { img: {} };
      spriteSystem.loadedSprites.set(emotion, sprite);
      expect(spriteSystem.getEmotionSprite(emotion)).toBe(sprite);
    });

    it('returns null if emotion is not loaded', () => {
      expect(spriteSystem.getEmotionSprite('nonExistentEmotion')).toBeNull();
    });
  });

  describe('getBodyLanguageSprite(pose)', () => {
    it('returns sprite if pose is loaded', () => {
      const pose = 'standing';
      const sprite = { img: {} };
      spriteSystem.loadedSprites.set(pose, sprite);
      expect(spriteSystem.getBodyLanguageSprite(pose)).toBe(sprite);
    });

    it('returns null if pose is not loaded', () => {
      expect(spriteSystem.getBodyLanguageSprite('nonExistentPose')).toBeNull();
    });
  });

  describe('isSpriteLoaded(key)', () => {
    it('returns true if key is loaded', () => {
      const key = 'sprite1';
      spriteSystem.loadedSprites.set(key, { img: {} });
      expect(spriteSystem.isSpriteLoaded(key)).toBe(true);
    });

    it('returns false if key is not loaded', () => {
      expect(spriteSystem.isSpriteLoaded('nonExistentSprite')).toBe(false);
    });
  });

  describe('getAllEmotions()', () => {
    it('returns fixed emotions', () => {
      const expectedEmotions = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
      expect(spriteSystem.getAllEmotions()).toEqual(expectedEmotions);
    });
  });

  describe('getAllPoses()', () => {
    it('returns fixed poses', () => {
      const expectedPoses = ['standing', 'sitting', 'lying'];
      expect(spriteSystem.getAllPoses()).toEqual(expectedPoses);
    });
  });

  describe('getLoadProgress()', () => {
    it('returns 0 when no sprites are loaded', () => {
      expect(spriteSystem.getLoadProgress()).toBe(0);
    });

    it('returns correct progress when some sprites are loaded', () => {
      spriteSystem.loadedSprites.set('sprite1', { img: {} });
      spriteSystem.loadedSprites.set('sprite2', { img: {} });
      expect(spriteSystem.getLoadProgress()).toBe(25);
    });
  });

  describe('getCombinedSprite(emotion, pose)', () => {
    it('returns null if emotion sprite is not loaded', () => {
      expect(spriteSystem.getCombinedSprite('nonExistentEmotion', 'standing')).toBeNull();
    });

    it('returns null if pose sprite is not loaded', () => {
      expect(spriteSystem.getCombinedSprite('happy', 'nonExistentPose')).toBeNull();
    });

    it('combines sprites and caches result', () => {
      const emotion = 'happy';
      const pose = 'standing';
      const emotionSprite = { img: {} };
      const poseSprite = { img: {} };
      spriteSystem.loadedSprites.set(emotion, emotionSprite);
      spriteSystem.loadedSprites.set(pose, poseSprite);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      jest.spyOn(ctx, 'drawImage');

      const combinedSprite = spriteSystem.getCombinedSprite(emotion, pose);
      expect(ctx.drawImage).toHaveBeenCalledTimes(2);
      expect(combinedSprite).toBe(spriteSystem.spriteCache.get(`${emotion}-${pose}`));
    });
  });

  describe('initialize()', () => {
    it('resolves without throwing', async () => {
      await expect(spriteSystem.initialize()).resolves.not.toThrow();
    });
  });
});