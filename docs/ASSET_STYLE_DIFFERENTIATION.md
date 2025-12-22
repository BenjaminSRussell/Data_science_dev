# Asset Style Differentiation Plan

## Identified Styles

Based on analysis of 3,418 assets, we have identified **4 distinct styles**:

### 1. Placeholder Style (946 assets)
- **Characteristics**: Simple colored squares
- **Complexity**: Minimal
- **Use Case**: Temporary visual placeholders
- **Priority**: Replace with real assets
- **Categories**: All categories have placeholders

### 2. Sprite Style (from Universal LPC)
- **Characteristics**: Pixel art, modular components
- **Complexity**: Moderate to complex
- **Use Case**: Character assembly
- **Priority**: High (real assets)
- **Categories**: Characters

### 3. Icon Style (from Game-Icons)
- **Characteristics**: SVG format, scalable vectors
- **Complexity**: Simple
- **Use Case**: UI elements, features
- **Priority**: High (real assets)
- **Categories**: Icons, UI elements

### 4. Low-Poly Style (existing backgrounds)
- **Characteristics**: 3D-rendered look, smooth gradients
- **Complexity**: Moderate
- **Use Case**: Backgrounds, environments
- **Priority**: High (real assets)
- **Categories**: Backgrounds

## Style Consistency Requirements

### By Category

#### Character Sprites
- **Current**: Mix of pixel art (Universal LPC) and placeholders
- **Target Style**: Choose ONE style (recommend: Low-poly to match backgrounds)
- **Action**: Replace placeholders with low-poly character sprites
- **Size**: 128x128px
- **Format**: PNG with transparency

#### Icons
- **Current**: Mix of SVG (Game-Icons) and PNG placeholders
- **Target Style**: SVG with consistent stroke width (2px)
- **Action**: Convert all to SVG or ensure PNG icons match SVG style
- **Size**: 64x64px
- **Format**: SVG preferred, PNG fallback

#### Map Assets
- **Current**: Placeholders
- **Target Style**: Low-poly tile-based style
- **Action**: Create/acquire low-poly map tiles
- **Size**: 128x128px
- **Format**: PNG with transparency

#### Vehicles
- **Current**: Placeholders
- **Target Style**: Low-poly (match map assets)
- **Action**: Create/acquire low-poly vehicle sprites
- **Size**: 128x128px
- **Format**: PNG with transparency

#### UI Elements
- **Current**: Mix of real assets (GDQuest) and placeholders
- **Target Style**: Match icon style (SVG or consistent PNG)
- **Action**: Standardize on icon style
- **Size**: 128x128px
- **Format**: SVG preferred

#### Particle Effects
- **Current**: Placeholders
- **Target Style**: Simple geometric shapes (match game aesthetic)
- **Action**: Create simple particle sprites
- **Size**: 32x32px
- **Format**: PNG with transparency

#### Backgrounds
- **Current**: Low-poly style (good!)
- **Target Style**: Maintain low-poly aesthetic
- **Action**: Keep existing style, add more variations
- **Size**: 1920x1080px
- **Format**: PNG or JPG

## Style Differentiation Rules

### Visual Consistency
1. **Color Palette**: Use consistent color scheme across all assets
   - Primary: Purple (#8b5cf6)
   - Secondary: Blue (#3b82f6)
   - Accent: Green (#10b981)
   - Neutral: Grays

2. **Line Style**: 
   - Icons: 2px stroke width
   - Sprites: Soft edges (anti-aliased)
   - No hard pixel edges (unless intentional pixel art)

3. **Shading**:
   - Low-poly: Soft gradients
   - Icons: Flat colors with subtle shadows
   - Sprites: Consistent lighting direction

### Technical Consistency
1. **Aspect Ratios**: Maintain consistent aspect ratios within categories
2. **Transparency**: Use alpha channel consistently
3. **File Formats**: Prefer SVG for icons, PNG for sprites
4. **Optimization**: All assets optimized for web

## Implementation Plan

### Phase 1: Style Audit (Complete)
- ✅ Identified all styles
- ✅ Categorized assets
- ✅ Created differentiation plan

### Phase 2: Style Standardization
1. Choose primary style (Low-poly recommended)
2. Create style guide document
3. Update placeholders to match chosen style
4. Replace placeholders with real assets in chosen style

### Phase 3: Asset Replacement
1. Prioritize high-visibility assets (characters, icons)
2. Replace placeholders category by category
3. Maintain style consistency during replacement
4. Verify all replacements match style guide

### Phase 4: Quality Assurance
1. Review all assets for style consistency
2. Test assets in-game
3. Adjust as needed
4. Document final style standards

## Style Guide Reference

### Low-Poly Style (Recommended Primary)
- **Characteristics**: 
  - Soft gradients
  - Rounded edges
  - 3D-rendered appearance
  - Smooth color transitions
- **Use For**: Characters, map assets, vehicles, backgrounds
- **Examples**: Existing location backgrounds

### Icon Style
- **Characteristics**:
  - Flat colors
  - 2px stroke width
  - Simple geometric shapes
  - Clear silhouettes
- **Use For**: UI elements, feature icons, item icons
- **Examples**: Game-Icons.net assets

## Notes

- Placeholders are correctly sized and can be systematically replaced
- Style consistency is critical for professional appearance
- Low-poly style matches existing backgrounds best
- SVG icons provide scalability and consistency

