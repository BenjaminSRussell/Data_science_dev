import { handleArrest, handleServeJailTime, handleBribeGuard } from '../../src/js/helpers/StockMarketHelpers';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`
  <div id="toast-container"></div>
  <div id="game-screen"></div>
`);
global.document = dom.window.document;

describe('StockMarketHelpers', () => {
  let game;

  beforeEach(() => {
    game = {
      gameState: {
        jailSentence: 0,
        reputation: 0,
        money: 0
      },
      characterStats: {
        modifyEthics: jest.fn()
      },
      switchScreen: jest.fn(),
      showSnackbar: jest.fn(),
      handleTimeAdvance: jest.fn()
    };
  });

  describe('handleArrest', () => {
    it('should set jailSentence to 30, halve reputation, and decrease money by 5000', () => {
      game.gameState.reputation = 7;
      game.gameState.money = 10000;

      handleArrest(game, 'reason');

      expect(game.gameState.jailSentence).toBe(30);
      expect(game.gameState.reputation).toBe(3);
      expect(game.gameState.money).toBe(5000);
    });

    it('should handle money below 5000 correctly', () => {
      game.gameState.reputation = 7;
      game.gameState.money = 4000;

      handleArrest(game, 'reason');

      expect(game.gameState.jailSentence).toBe(30);
      expect(game.gameState.reputation).toBe(3);
      expect(game.gameState.money).toBe(-1000);
    });
  });

  describe('handleServeJailTime', () => {
    it('should free player immediately if jailSentence is 0', () => {
      game.gameState.jailSentence = 0;

      handleServeJailTime(game);

      expect(game.gameState.jailSentence).toBe(0);
      expect(game.switchScreen).toHaveBeenCalledWith('main-menu');
      expect(game.showSnackbar).toHaveBeenCalledWith('You are free to go!');
      expect(game.handleTimeAdvance).not.toHaveBeenCalled();
    });

    it('should decrement jailSentence by 1 and show served time message if jailSentence is 1', () => {
      game.gameState.jailSentence = 1;

      handleServeJailTime(game);

      expect(game.gameState.jailSentence).toBe(0);
      expect(game.showSnackbar).toHaveBeenCalledWith('You have served your time!');
      expect(game.handleTimeAdvance).toHaveBeenCalled();
    });

    it('should decrement jailSentence by 1 and not show completion message if jailSentence is greater than 1', () => {
      game.gameState.jailSentence = 5;

      handleServeJailTime(game);

      expect(game.gameState.jailSentence).toBe(4);
      expect(game.showSnackbar).not.toHaveBeenCalled();
      expect(game.handleTimeAdvance).toHaveBeenCalled();
    });
  });

  describe('handleBribeGuard', () => {
    it('should show error message if money is less than 5000', () => {
      game.gameState.money = 4000;

      handleBribeGuard(game);

      expect(game.showSnackbar).toHaveBeenCalledWith('You do not have enough money to bribe the guard!');
      expect(game.gameState.jailSentence).toBe(0);
      expect(game.gameState.money).toBe(4000);
      expect(game.characterStats.modifyEthics).not.toHaveBeenCalled();
    });

    it('should successfully bribe guard and reset jailSentence', () => {
      game.gameState.money = 10000;
      jest.spyOn(Math, 'random').mockReturnValue(0.3);

      handleBribeGuard(game);

      expect(game.gameState.jailSentence).toBe(0);
      expect(game.gameState.money).toBe(5000);
      expect(game.characterStats.modifyEthics).toHaveBeenCalledWith(-10);
    });

    it('should fail to bribe guard and increase jailSentence by 7', () => {
      game.gameState.money = 10000;
      jest.spyOn(Math, 'random').mockReturnValue(0.7);

      handleBribeGuard(game);

      expect(game.gameState.jailSentence).toBe(7);
      expect(game.gameState.money).toBe(5000);
      expect(game.characterStats.modifyEthics).not.toHaveBeenCalled();
    });
  });
});