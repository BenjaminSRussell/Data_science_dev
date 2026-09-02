# Button Assets Requirements Audit

## 1. Design Doc Specification Summary
The `button_assets_requirements.md` document specifies the following requirements for button assets and styling:

- **States:** Normal, Hover, Active, Disabled
- **Sizes:** Small, Medium, Large
- **Variants:** Primary, Secondary, Success, Danger
- **Asset Requirements:** Specific colors, fonts, and iconography for each state and variant

## 2. Variant Property Matching
The `Button.js` component supports the following variants: primary, secondary, success, and danger. These variants match the ones specified in the design doc. There are no discrepancies between the doc's specified variants and the component's existing variants.

## 3. Button Usage in Codebase
The codebase currently has two mechanisms for implementing buttons:
1. **Lit `<game-button>` Component:** This component is rarely used and seems to be essentially unused.
2. **Raw `.btn-*` Elements:** These are used extensively throughout the `main.js` file and other UI code.

The `.btn-*` elements do not follow the design doc's requirements. They use a different set of classes and styles that are not aligned with the specified states, sizes, and variants.

## 4. Recommendation
To bring the actually-used button styling in line with the documented requirements, the following changes should be made:

1. **Deprecate the Rarely Used `<game-button>` Component:** Since it is not being used, it should be deprecated and removed to avoid confusion.
2. **Refactor the Raw `.btn-*` Elements:** Update the existing `.btn-*` classes to match the design doc's specified states, sizes, and variants.
3. **Update Documentation:** Ensure that the `button_assets_requirements.md` document is updated to reflect the current implementation and any changes made.

By making these changes, the codebase will have a consistent and compliant button styling that adheres to the design document's requirements.