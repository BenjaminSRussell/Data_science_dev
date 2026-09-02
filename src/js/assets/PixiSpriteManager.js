// ... (rest of the file remains unchanged)

// Mocking dependencies
jest.mock('pixi.js', () => ({
  Sprite: jest.fn().mockImplementation(() => ({
    texture: null,
  })),
  AnimatedSprite: jest.fn().mockImplementation(() => ({
    textures: [],
  })),
}));

// Mocking PIXI.Loader.shared.add and PIXI.Loader.shared.load
const mockLoader = {
  add: jest.fn(),
  load: jest.fn(),
};
jest.mock('pixi.js', () => ({
  Loader: {
    shared: mockLoader,
  },
}));

describe('PixiSpriteManager', () => {
  let spriteManager;

  beforeEach(() => {
    spriteManager = new PixiSpriteManager();
    spriteManager.spriteSheets = {
      sheet1: { textures: { walk_0: 'texture1' } },
      sheet2: { animations: { walk: ['texture1', 'texture2'] } },
    };
  });

  describe('createSprite', () => {
    it('returns null when sheetId not in spriteSheets', () => {
      expect(spriteManager.createSprite('sheet3', 'walk_0')).toBeNull();
    });

    it('returns null when sheet exists but frameName not a key in sheet.textures', () => {
      expect(spriteManager.createSprite('sheet2', 'walk_0')).toBeNull();
    });

    it('returns a real Sprite instance when both sheet and frame exist', () => {
      const sprite = spriteManager.createSprite('sheet1', 'walk_0');
      expect(sprite).toBeInstanceOf(Sprite);
    });
  });

  describe('createAnimatedSprite', () => {
    it('returns null for missing sheet', () => {
      expect(spriteManager.createAnimatedSprite('sheet3', 'walk')).toBeNull();
    });

    it('returns null when sheet.animations doesn\'t have the name', () => {
      expect(spriteManager.createAnimatedSprite('sheet1', 'walk')).toBeNull();
    });

    it('returns a real AnimatedSprite instance with fake sheet', () => {
      const animatedSprite = spriteManager.createAnimatedSprite('sheet2', 'walk');
      expect(animatedSprite).toBeInstanceOf(AnimatedSprite);
    });
  });

  describe('getSpriteSheet', () => {
    it('returns null for not-found paths', () => {
      expect(spriteManager.getSpriteSheet('sheet3')).toBeNull();
    });

    it('returns exactly what was registered for found paths', () => {
      expect(spriteManager.getSpriteSheet('sheet1')).toBe(spriteManager.spriteSheets.sheet1);
    });
  });

  describe('getAnimationFrames', () => {
    it('returns null for not-found paths', () => {
      expect(spriteManager.getAnimationFrames('sheet3', 'walk')).toBeNull();
    });

    it('returns exactly what was registered for found paths', () => {
      expect(spriteManager.getAnimationFrames('sheet2', 'walk')).toBe(spriteManager.spriteSheets.sheet2.animations.walk);
    });
  });
});

// ... (rest of the file remains unchanged)