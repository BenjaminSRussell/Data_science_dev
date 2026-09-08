const SpriteDownloader = require('../SpriteDownloader');

describe('SpriteDownloader', () => {
  let spriteDownloader;

  beforeEach(() => {
    spriteDownloader = new SpriteDownloader();
  });

  describe('getDownloadInstructions', () => {
    it('should return first matching source for character type', () => {
      const result = spriteDownloader.getDownloadInstructions('character');
      expect(result).toEqual({
        source: 'Universal LPC Spritesheet',
        targetDirectory: 'assets/characters/sprites/',
      });
    });

    it('should return null for character type with no source', () => {
      const result = spriteDownloader.getDownloadInstructions('unknown');
      expect(result).toBeNull();
    });
  });

  describe('validateSprite', () => {
    it('should return character object for character type', () => {
      const result = spriteDownloader.validateSprite('character');
      expect(result).toEqual({
        type: 'character',
      });
    });

    it('should return background object for background type', () => {
      const result = spriteDownloader.validateSprite('background');
      expect(result).toEqual({
        type: 'background',
      });
    });

    it('should return empty object for unrecognized type', () => {
      const result = spriteDownloader.validateSprite('unknown');
      expect(result).toEqual({});
    });
  });

  describe('getSpriteStructure', () => {
    it('should return correct sprite structure', () => {
      const result = spriteDownloader.getSpriteStructure();
      expect(result).toEqual({
        characters: {
          files: [
            'assets/characters/sprites/character1.png',
            'assets/characters/sprites/character2.png',
            'assets/characters/sprites/character3.png',
            'assets/characters/sprites/character4.png',
            'assets/characters/sprites/character5.png',
            'assets/characters/sprites/character6.png',
          ],
        },
        backgrounds: {
          files: [
            'assets/backgrounds/background1.png',
            'assets/backgrounds/background2.png',
            'assets/backgrounds/background3.png',
            'assets/backgrounds/background4.png',
            'assets/backgrounds/background5.png',
            'assets/backgrounds/background6.png',
          ],
        },
      });
    });
  });
});