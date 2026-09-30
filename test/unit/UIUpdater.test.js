import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('UIUpdater', () => {
    let container;
    let mockGame;
    let mockGameState;
    let UIUpdater;

    beforeEach(async () => {
        // Import UIUpdater
        const module = await import('../../src/js/ui/UIUpdater.js');
        UIUpdater = module.UIUpdater;

        // Create a mock DOM for career screen
        container = document.createElement('div');
        container.innerHTML = `
            <div class="career-content ascii-box">
                <div id="active-project-container" class="ascii-box hidden">
                    <div class="project-header">
                        <h3 id="active-project-title" style="margin: 0;">Project Title</h3>
                        <span class="badge" id="active-project-stage">Stage 1/3</span>
                    </div>
                    <div class="stage-info">
                        <h4 id="current-stage-name">Stage Name</h4>
                        <p id="current-stage-desc">Description</p>
                    </div>
                    <div class="text-progress-bar">
                        <div class="text-progress-filled" id="project-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="project-actions">
                        <button class="btn-manual-action" id="btn-work-project">[ WORK ON PROJECT ]</button>
                    </div>
                </div>

                <h3 id="available-contracts-header">AVAILABLE CONTRACTS</h3>
                <div class="contracts-grid" id="contracts-grid" style="display: grid; gap: 1rem;"></div>
            </div>
        `;
        document.body.appendChild(container);

        // Create mock gameState with project system
        mockGameState = {
            projectSystem: {
                activeProject: null,
                availableContracts: [],
                stages: []
            }
        };

        // Create mock game object
        mockGame = {
            gameState: mockGameState,
            handleWorkOnProject: vi.fn()
        };
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should hide available contracts header and show active project when activeProject exists', () => {
        // Setup: Create an active project
        mockGameState.projectSystem.activeProject = {
            title: 'Test Project',
            currentStageIndex: 0,
            stages: [
                {
                    name: 'Stage 1',
                    description: 'First stage',
                    maxProgress: 100
                }
            ],
            stageProgress: 50
        };

        // Create UIUpdater instance
        const uiUpdater = new UIUpdater(mockGame);

        // Call updateCareerScreen
        uiUpdater.updateCareerScreen();

        // Verify active project container is visible
        const activeContainer = document.getElementById('active-project-container');
        expect(activeContainer.classList.contains('hidden')).toBe(false);

        // Verify available contracts header is hidden
        const contractsHeader = document.getElementById('available-contracts-header');
        expect(contractsHeader.classList.contains('hidden')).toBe(true);

        // Verify contracts grid is hidden
        const contractsGrid = document.getElementById('contracts-grid');
        expect(contractsGrid.classList.contains('hidden')).toBe(true);

        // Verify active project title is visible (not hidden)
        const activeProjectTitle = document.getElementById('active-project-title');
        expect(activeProjectTitle.classList.contains('hidden')).toBe(false);
    });

    it('should show available contracts header and hide active project when no activeProject', () => {
        // Setup: Ensure no active project
        mockGameState.projectSystem.activeProject = null;

        // Create UIUpdater instance
        const uiUpdater = new UIUpdater(mockGame);

        // Call updateCareerScreen
        uiUpdater.updateCareerScreen();

        // Verify active project container is hidden
        const activeContainer = document.getElementById('active-project-container');
        expect(activeContainer.classList.contains('hidden')).toBe(true);

        // Verify available contracts header is visible (not hidden)
        const contractsHeader = document.getElementById('available-contracts-header');
        expect(contractsHeader.classList.contains('hidden')).toBe(false);

        // Verify contracts grid is visible (not hidden)
        const contractsGrid = document.getElementById('contracts-grid');
        expect(contractsGrid.classList.contains('hidden')).toBe(false);
    });

    it('should correctly target the AVAILABLE CONTRACTS header, not the active project title', () => {
        // Setup: Create an active project
        mockGameState.projectSystem.activeProject = {
            title: 'Test Project',
            currentStageIndex: 0,
            stages: [
                {
                    name: 'Stage 1',
                    description: 'First stage',
                    maxProgress: 100
                }
            ],
            stageProgress: 50
        };

        // Create UIUpdater instance
        const uiUpdater = new UIUpdater(mockGame);

        // Call updateCareerScreen
        uiUpdater.updateCareerScreen();

        // This is the key test: verify that we're hiding the CORRECT h3
        // The active-project-title should NOT be hidden
        const activeProjectTitle = document.getElementById('active-project-title');
        const contractsHeader = document.getElementById('available-contracts-header');

        expect(activeProjectTitle.classList.contains('hidden')).toBe(false);
        expect(contractsHeader.classList.contains('hidden')).toBe(true);
    });
});
