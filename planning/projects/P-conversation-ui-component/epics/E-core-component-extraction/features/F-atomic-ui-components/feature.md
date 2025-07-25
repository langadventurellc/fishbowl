---
kind: feature
id: F-atomic-ui-components
title: Atomic UI Components
status: done
priority: high
prerequisites:
  - F-foundation-typescript-interfaces
created: "2025-07-23T19:07:13.269530"
updated: "2025-07-23T19:07:13.269530"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Atomic UI Components

## Purpose

Extract the smallest, most reusable UI components from DesignPrototype - components that are self-contained with no internal state or complex interactions. These are pure display components that render consistently based on props.

## Source References

- **Primary Source**: `apps/desktop/src/pages/DesignPrototype.tsx` (~1326 lines)
- **Theme System**: `packages/ui-theme/src/claymorphism-theme.css`

## Target Components

### AgentPill Component

- **Location in DesignPrototype**: Lines 322-331
- **Purpose**: Display agent name, role, and color with optional thinking indicator
- **Props**: agent object, size variant, show thinking state
- **Styling**: Rounded pill with agent color, role text, thinking animation

### ThemeToggle Component

- **Location in DesignPrototype**: Lines 246-257
- **Purpose**: Visual toggle button for light/dark theme switching
- **Props**: current theme mode, disabled state, size variant
- **Styling**: Icon-based toggle with smooth transition animation

### Button Variants

- **Send Button**: Primary action button for message sending
- **Context Menu Item**: Individual menu action items
- **Mode Toggle**: Manual/Auto mode switching button
- **Sidebar Toggle**: Expand/collapse sidebar control

### ThinkingIndicator Component

- **Purpose**: Animated pulsing dot to show agent thinking state
- **Props**: color, size, animation speed
- **Styling**: CSS animations with theme-aware colors

## Acceptance Criteria

✅ **Component Structure**

- Each component in separate file in `apps/desktop/src/components/atomic/`
- Proper TypeScript prop interfaces from shared package
- Clean CSS-in-JS styling using existing theme variables
- No internal state management (all props-based)

✅ **Visual Fidelity**

- Pixel-perfect match with DesignPrototype appearance
- All color variants and size options preserved
- Hover states and animations maintained
- Theme switching (light/dark) works correctly

✅ **Showcase Integration** (CRITICAL - Done as components are created)

- Each component added to ComponentShowcase page as it's created
- Multiple prop variations demonstrated in showcase
- Both light and dark theme tested immediately in showcase
- Visual verification completed in showcase before component considered done
- Sample data created for realistic component previews

✅ **Code Quality**

- Components under 100 lines each
- No business logic or data processing
- Pure rendering based on props only
- TypeScript strict mode compliance

✅ **Reusability**

- Props interfaces support different use cases
- No hardcoded values or dependencies
- Consistent styling patterns across components
- Clear component boundaries and responsibilities

## Implementation Guidance

**Extraction Process:**

1. Identify component boundaries in `apps/desktop/src/pages/DesignPrototype.tsx`
2. Create TypeScript interface for props
3. Extract styling objects from DesignPrototype and convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
4. Remove all state management and event handling
5. Create pure render function with props
6. **Immediately add to ComponentShowcase** with sample data for visual verification

**Styling Approach:**

- Use existing CSS custom properties (`var(--background)`, `var(--primary)`, etc.)
- Extract style objects from DesignPrototype
- Ensure theme-aware color handling
- Maintain existing animations and transitions

**File Organization:**

```
apps/desktop/src/components/atomic/
├── index.ts (barrel export)
├── AgentPill.tsx
├── ThemeToggle.tsx
├── Button.tsx (with variants)
└── ThinkingIndicator.tsx
```

## Testing Requirements

- Visual verification in component showcase
- Props variations render correctly
- Theme switching works for all components
- No console errors or warnings
- TypeScript compilation passes

## Dependencies

- F-foundation-typescript-interfaces (for prop type definitions)

### Log
