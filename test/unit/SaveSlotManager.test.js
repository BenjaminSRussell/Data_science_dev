const SaveSlotManager = require('../../src/js/ui/SaveSlotManager');
const sinon = require('sinon');

describe('SaveSlotManager', () => {
    let saveManager;
    let onSlotSelectedSpy;
    let showErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        saveManager = {
            getAllSlotsInfo: sinon.stub(),
            hasSave: sinon.stub()
        };
        onSlotSelectedSpy = sinon.spy();
        showErrorSpy = sinon.spy(SaveSlotManager.prototype, 'showError');
        consoleWarnSpy = sinon.spy(console, 'warn');
    });

    afterEach(() => {
        showErrorSpy.restore();
        consoleWarnSpy.restore();
    });

    describe('handleNewGame', () => {
        it('should select an empty slot when all slots are empty', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: true },
                { isEmpty: true },
                { isEmpty: true },
                { isEmpty: true },
                { isEmpty: true }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.handleNewGame();

            sinon.assert.calledOnceWithExactly(onSlotSelectedSpy, 0);
        });

        it('should select an empty slot when a specific slot is empty mid-list', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: false },
                { isEmpty: true },
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.handleNewGame();

            sinon.assert.calledOnceWithExactly(onSlotSelectedSpy, 1);
        });

        it('should select slot 0 when all slots are full', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.handleNewGame();

            sinon.assert.calledOnceWithExactly(onSlotSelectedSpy, 0);
        });
    });

    describe('duplicateSlot', () => {
        it('should duplicate to the first available slot when all slots are empty', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: true },
                { isEmpty: true },
                { isEmpty: true },
                { isEmpty: true },
                { isEmpty: true }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.duplicateSlot(0);

            sinon.assert.calledOnceWithExactly(onSlotSelectedSpy, 0);
        });

        it('should duplicate to an empty slot when a specific slot is empty mid-list', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: false },
                { isEmpty: true },
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.duplicateSlot(0);

            sinon.assert.calledOnceWithExactly(onSlotSelectedSpy, 1);
        });

        it('should show error when all slots are full', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: false }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.duplicateSlot(0);

            sinon.assert.calledOnceWithExactly(showErrorSpy, 'No empty slot available to duplicate.');
        });

        it('should skip its own slotIndex when duplicating', () => {
            saveManager.getAllSlotsInfo.returns([
                { isEmpty: false },
                { isEmpty: false },
                { isEmpty: true },
                { isEmpty: false },
                { isEmpty: false }
            ]);

            const saveSlotManager = new SaveSlotManager(saveManager, onSlotSelectedSpy);

            saveSlotManager.duplicateSlot(2);

            sinon.assert.calledOnceWithExactly(onSlotSelectedSpy, 2);
        });
    });
});