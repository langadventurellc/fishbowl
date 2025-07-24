---
kind: task
id: T-create-themetoggle-component
title: Create ThemeToggle component with icon-based toggle
status: open
priority: high
prerequisites: []
created: "2025-07-24T06:52:17.533044"
updated: "2025-07-24T06:52:17.533044"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Create ThemeToggle Component

## Context

Extract the ThemeToggle component from DesignPrototype.tsx (lines 246-257, 934-940) as a reusable atomic UI component. This component provides a visual toggle button for light/dark theme switching with smooth transitions.

## Location in DesignPrototype

- **Styling**: Lines 246-257 (`themeToggle` style)
- **Usage**: Lines 934-940 (rendered in agent labels bar)

## Implementation Requirements

### 1. File Creation

Create `apps/desktop/src/components/ui/atomic/ThemeToggle.tsx` with:

```typescript
import { ThemeToggleProps } from "@fishbowl-ai/shared/types/ui";

// Component implementation using existing ThemeToggleProps interface
// from packages/shared/src/types/ui/components/ThemeToggleProps.ts
// Note: Interface uses ThemeMode type and provides newTheme parameter to onToggle
```

### 2. Component Implementation

- Extract styling from DesignPrototype lines 246-257
- Use CSS custom properties from theme system
- Implement pure rendering function with no internal state
- Icon-based toggle (☀️ for light, 🌙 for dark)
- Smooth transition animation on hover/press
- Use existing `ThemeToggleProps` interface with `ThemeMode` type from shared package
- Note: Existing interface includes `className` prop and `onToggle` passes new theme

### 3. Styling Requirements

- Convert inline styles to CSS-in-JS using theme variables
- Background: `var(--secondary)` for theme-aware styling
- Border: none, cursor: pointer
- Padding: "6px 10px", borderRadius: "6px"
- Font size: "14px", margin-left: "auto"
- Transition: "background-color 0.15s"
- Hover state with slight opacity change

### 4. Showcase Integration (CRITICAL)

**Immediately after creating the component:**

- Add ThemeToggle to ComponentShowcase page
- Test both theme states (light/dark icons)
- Verify theme-aware background styling
- Include disabled state demonstration
- Test size variants

### Sample Data for Showcase:

```typescript
// Demo with both states and interactive toggle
import { ThemeMode } from "@fishbowl-ai/shared/types/ui";
const [demoTheme, setDemoTheme] = useState<ThemeMode>("light");
```

## Acceptance Criteria

- ✅ Component renders appropriate icon based on currentTheme
- ✅ Click handler called on button press
- ✅ Disabled state prevents interaction and shows visual feedback
- ✅ Size variants work correctly (small, medium, large)
- ✅ CSS uses theme variables for consistent styling
- ✅ Smooth transition animations on interaction
- ✅ Component under 100 lines of code
- ✅ TypeScript interfaces defined with JSDoc comments
- ✅ **Added to ComponentShowcase with visual verification**
- ✅ Both light and dark themes work correctly
- ✅ No console errors or TypeScript warnings
- ✅ Pixel-perfect match with DesignPrototype appearance

## Dependencies

- F-foundation-typescript-interfaces (shared types already exist in packages/shared/src/types/ui)

## Testing Requirements

Include unit tests for:

- Icon rendering based on currentTheme prop
- Click handler execution
- Disabled state behavior
- Size variant styling
- Theme variable usage

### Log
