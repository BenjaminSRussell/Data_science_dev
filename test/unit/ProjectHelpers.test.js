import { handleStartProject, handleWorkOnProject, startWorkingSession, finishWorkingSession, simulateWorkTick } from '../../src/js/helpers/ProjectHelpers';
import { game } from '../../src/js/Game';
import { jsdom } from 'jsdom';
import { characterStats } from '../../src/js/CharacterStats';

const { window } = jsdom(`
  <div id="working-overlay">
    <button id="btn-stop-work">Stop Work</button>
    <div id="work-progress-fill"></div>
    <div id="work-progress-text"></div>
    <div id="work-time-passed"></div>
  </div>
`);

global.window = window;
global.document = window.document;
global.Math.random = jest.fn();

describe('ProjectHelpers', () => {
  let showToast, showError, handleTimeAdvance, audioManager, projectSystem, timeManager, uiUpdater;

  beforeEach(() => {
    showToast = jest.fn();
    showError = jest.fn();
    handleTimeAdvance = jest.fn();
    audioManager = { play: jest.fn() };
    projectSystem = {
      startProject: jest.fn(),
      activeProject: { name: 'Test Project' },
      workOnProject: jest.fn(),
      checkProgress: jest.fn()
    };
    timeManager = {
      hasEnergy: jest.fn(),
      useEnergy: jest.fn()
    };
    uiUpdater = {
      updateCareerScreen: jest.fn(),
      updateAllUI: jest.fn()
    };
    characterStats.getStat = jest.fn().mockReturnValue(10);

    game.projectSystem = projectSystem;
    game.timeManager = timeManager;
    game.uiUpdater = uiUpdater;
    game.audioManager = audioManager;
    game.showToast = showToast;
    game.showError = showError;
    game.handleTimeAdvance = handleTimeAdvance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleStartProject', () => {
    it('should show success toast and update career screen on success', () => {
      projectSystem.startProject.mockResolvedValue(true);

      return handleStartProject().then(() => {
        expect(showToast).toHaveBeenCalledWith('Test Project', 'success');
        expect(uiUpdater.updateCareerScreen).toHaveBeenCalled();
      });
    });

    it('should show error on failure', () => {
      projectSystem.startProject.mockResolvedValue(false);

      return handleStartProject().catch(() => {
        expect(showError).toHaveBeenCalled();
        expect(uiUpdater.updateCareerScreen).not.toHaveBeenCalled();
      });
    });
  });

  describe('handleWorkOnProject', () => {
    it('should show error if not enough energy', () => {
      timeManager.hasEnergy.mockReturnValue(false);

      return handleWorkOnProject().catch(() => {
        expect(showError).toHaveBeenCalled();
        expect(timeManager.useEnergy).not.toHaveBeenCalled();
      });
    });

    it('should use energy and start session if enough energy', () => {
      timeManager.hasEnergy.mockReturnValue(true);

      return handleWorkOnProject().then(() => {
        expect(timeManager.useEnergy).toHaveBeenCalledWith(15);
        expect(game.workSession.active).toBe(true);
        expect(game.workSession.totalTicks).toBe(30);
      });
    });
  });

  describe('simulateWorkTick', () => {
    it('should call workOnProject with intelligence boost', () => {
      simulateWorkTick();
      expect(projectSystem.workOnProject).toHaveBeenCalledWith(1.0);
    });

    it('should call workOnProject without intelligence boost if no stats', () => {
      characterStats.getStat.mockReturnValue(undefined);
      simulateWorkTick();
      expect(projectSystem.workOnProject).toHaveBeenCalledWith(0.5);
    });
  });

  describe('startWorkingSession', () => {
    it('should create advance button if it does not exist', () => {
      document.getElementById('btn-advance-work').remove();

      startWorkingSession();
      const btnAdvanceWork = document.getElementById('btn-advance-work');
      expect(btnAdvanceWork).toBeInTheDocument();
    });

    it('should not create advance button if it already exists', () => {
      startWorkingSession();
      const btnAdvanceWork = document.getElementById('btn-advance-work');
      expect(btnAdvanceWork).toBeInTheDocument();
    });
  });

  describe('advance button click handler', () => {
    it('should increment currentTick, advance time, and update progress', () => {
      startWorkingSession();
      const btnAdvanceWork = document.getElementById('btn-advance-work');
      btnAdvanceWork.click();

      expect(game.workSession.currentTick).toBe(1);
      expect(handleTimeAdvance).toHaveBeenCalledWith(0.1);
      expect(document.getElementById('work-progress-fill').style.width).toBe('3.3333333333333335%');
    });

    it('should finish session after enough clicks', () => {
      startWorkingSession();
      const btnAdvanceWork = document.getElementById('btn-advance-work');
      for (let i = 0; i < 30; i++) {
        btnAdvanceWork.click();
      }

      expect(finishWorkingSession).toHaveBeenCalledWith(game, 30, 30);
    });
  });

  describe('finishWorkingSession', () => {
    it('should show success toast and play kaching sound on project complete', () => {
      projectSystem.checkProgress.mockResolvedValue({ status: 'project_complete', reward: 500 });

      finishWorkingSession(game, 30, 30);
      expect(showToast).toHaveBeenCalledWith('Congratulations!', 'You completed Test Project and earned $500!');
      expect(audioManager.play).toHaveBeenCalledWith('kaching');
    });

    it('should show info toast on stage complete', () => {
      projectSystem.checkProgress.mockResolvedValue({ status: 'stage_complete', nextStage: { name: 'Next Stage' } });

      finishWorkingSession(game, 30, 30);
      expect(showToast).toHaveBeenCalledWith('Next Stage Unlocked!', 'Congratulations on completing the current stage!');
    });
  });
});