class AssetFinder {
  getSearchRecommendations(type) {
    const recommendations = {
      characters: ['hero', 'villain', 'sidekick'],
      backgrounds: ['forest', 'city', 'space'],
      icons: ['heart', 'star', 'gear']
    };
    return recommendations[type] || {};
  }

  generateChecklist() {
    return {
      characters: { status: 'pending' },
      backgrounds: { status: 'pending' },
      icons: { status: 'pending' },
      ui: { status: 'pending' }
    };
  }

  validateAsset(file, type) {
    const validationRules = {
      character: { requiredFields: ['name', 'image'], optionalFields: ['description'] },
      background: { requiredFields: ['name', 'image'], optionalFields: ['location'] },
      icon: { requiredFields: ['name', 'image'], optionalFields: ['usage'] }
    };
    return validationRules[type] || {};
  }

  getIntegrationSteps() {
    return [
      '1. Install dependencies',
      '2. Configure settings',
      '3. Set up database',
      '4. Create user roles',
      '5. Implement API endpoints',
      '6. Develop front-end interface',
      '7. Test application'
    ];
  }
}

// Test cases
const assetFinder = new AssetFinder();

// Test getSearchRecommendations
console.assert(JSON.stringify(assetFinder.getSearchRecommendations('characters')) === JSON.stringify(['hero', 'villain', 'sidekick']), 'Test failed for getSearchRecommendations with type "characters"');
console.assert(JSON.stringify(assetFinder.getSearchRecommendations('backgrounds')) === JSON.stringify(['forest', 'city', 'space']), 'Test failed for getSearchRecommendations with type "backgrounds"');
console.assert(JSON.stringify(assetFinder.getSearchRecommendations('icons')) === JSON.stringify(['heart', 'star', 'gear']), 'Test failed for getSearchRecommendations with type "icons"');
console.assert(JSON.stringify(assetFinder.getSearchRecommendations('unknown')) === JSON.stringify({}), 'Test failed for getSearchRecommendations with unknown type');

// Test generateChecklist
console.assert(JSON.stringify(assetFinder.generateChecklist()) === JSON.stringify({
  characters: { status: 'pending' },
  backgrounds: { status: 'pending' },
  icons: { status: 'pending' },
  ui: { status: 'pending' }
}), 'Test failed for generateChecklist');

// Test validateAsset
console.assert(JSON.stringify(assetFinder.validateAsset('file', 'character')) === JSON.stringify({
  requiredFields: ['name', 'image'],
  optionalFields: ['description']
}), 'Test failed for validateAsset with type "character"');
console.assert(JSON.stringify(assetFinder.validateAsset('file', 'background')) === JSON.stringify({
  requiredFields: ['name', 'image'],
  optionalFields: ['location']
}), 'Test failed for validateAsset with type "background"');
console.assert(JSON.stringify(assetFinder.validateAsset('file', 'icon')) === JSON.stringify({
  requiredFields: ['name', 'image'],
  optionalFields: ['usage']
}), 'Test failed for validateAsset with type "icon"');
console.assert(JSON.stringify(assetFinder.validateAsset('file', 'unknown')) === JSON.stringify({}), 'Test failed for validateAsset with unknown type');

// Test getIntegrationSteps
console.assert(JSON.stringify(assetFinder.getIntegrationSteps()) === JSON.stringify([
  '1. Install dependencies',
  '2. Configure settings',
  '3. Set up database',
  '4. Create user roles',
  '5. Implement API endpoints',
  '6. Develop front-end interface',
  '7. Test application'
]), 'Test failed for getIntegrationSteps');