# Test Coverage Roadmap

## Directory-by-Directory Breakdown of `src/js/`

### game/
- **Coverage:** Well-covered
- **Tests:** `test/game/testMoney.js`, `test/game/testSave.js`, `test/game/testBoss.js`
- **Reasoning:** Contains critical money and save logic, which is thoroughly tested.

### ui/
- **Coverage:** Partially covered
- **Tests:** `test/ui/testButton.js`, `test/ui/testDialog.js`
- **Reasoning:** UI components are tested, but more comprehensive testing for other UI elements is needed.

### helpers/
- **Coverage:** Essentially untested
- **Tests:** `test/helpers/testUtil.js`
- **Reasoning:** Contains utility functions that are not thoroughly tested yet.

### utils/
- **Coverage:** Partially covered
- **Tests:** `test/utils/testDate.js`, `test/utils/testMath.js`
- **Reasoning:** Some utility functions are tested, but others are not.

### data/
- **Coverage:** Partially covered
- **Tests:** `test/data/testAsset.js`
- **Reasoning:** Data handling functions are partially tested, but more thorough testing is needed.

### assets/
- **Coverage:** Partially covered
- **Tests:** `test/assets/testAssetFinder.js`
- **Reasoning:** Asset management functions are partially tested, but more comprehensive testing is needed.

### dev/
- **Coverage:** Essentially untested
- **Tests:** None
- **Reasoning:** Development tools and scripts are not tested yet.

### save/
- **Coverage:** Well-covered
- **Tests:** `test/save/testSaveGame.js`
- **Reasoning:** Save game logic is thoroughly tested, which is critical for game data integrity.

### store/
- **Coverage:** Partially covered
- **Tests:** `test/store/testInventory.js`
- **Reasoning:** Inventory management functions are partially tested, but more thorough testing is needed.

### systems/
- **Coverage:** Partially covered
- **Tests:** `test/systems/testCombat.js`
- **Reasoning:** Game systems are partially tested, but more comprehensive testing is needed.

### charts/
- **Coverage:** Essentially untested
- **Tests:** None
- **Reasoning:** Chart rendering and data visualization functions are not tested yet.

### audio/
- **Coverage:** Partially covered
- **Tests:** `test/audio/testSound.js`
- **Reasoning:** Audio management functions are partially tested, but more thorough testing is needed.

### interaction/
- **Coverage:** Partially covered
- **Tests:** `test/interaction/testInput.js`
- **Reasoning:** Interaction handling functions are partially tested, but more comprehensive testing is needed.

### performance/
- **Coverage:** Essentially untested
- **Tests:** None
- **Reasoning:** Performance monitoring and optimization functions are not tested yet.

## Highest Risk Untested Files/Subdirectories

1. **dev/**: Development tools and scripts are not tested, which could lead to bugs that affect the development workflow.
2. **charts/**: Chart rendering and data visualization functions are not tested, which could lead to visual errors or performance issues.
3. **performance/**: Performance monitoring and optimization functions are not tested, which could lead to performance bottlenecks.

## Proposed Order of Operations for Test Writing

1. **dev/**: Ensure that development tools and scripts are tested to avoid workflow issues.
2. **charts/**: Implement comprehensive testing for chart rendering and data visualization to ensure accuracy and performance.
3. **performance/**: Develop tests for performance monitoring and optimization functions to identify and fix bottlenecks.
4. **helpers/**: Write tests for utility functions to ensure they behave as expected.
5. **assets/**: Enhance testing for asset management functions to ensure assets are correctly loaded and managed.
6. **ui/**: Expand testing for UI components to cover all UI elements.
7. **utils/**: Continue testing utility functions that are not yet covered.
8. **data/**: Add more thorough testing for data handling functions.
9. **store/**: Enhance testing for inventory management functions.
10. **systems/**: Expand testing for game systems to ensure they function correctly under various conditions.