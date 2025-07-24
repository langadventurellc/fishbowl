---
kind: task
id: T-create-messageavatar-component
title: Create MessageAvatar component with showcase integration
status: open
priority: high
prerequisites: []
created: "2025-07-24T14:10:05.805737"
updated: "2025-07-24T14:10:05.805737"
schema_version: "1.1"
parent: F-message-display-components
---

# Create MessageAvatar Component

## Context

Extract the agent color indicator from DesignPrototype.tsx (~lines 362-639) to create a pure display component for message sender identification.

## Implementation Requirements

- **Location**: `apps/desktop/src/components/chat/MessageAvatar.tsx`
- **Props Interface**: Use existing types from `packages/shared/src/types/ui/components/`
- **Pure Component**: No state, event handlers, or side effects
- **Visual Elements**: Colored circle/pill matching agent theme colors
- **Styling**: Use theme variables from `packages/ui-theme/src/claymorphism-theme.css`

## Technical Approach

1. Extract avatar/color indicator logic from DesignPrototype.tsx lines 362-639
2. Create props interface with agent color, role, and size variant
3. Use CSS-in-JS with theme variable integration
4. Support different sizes (small, medium, large) for flexibility
5. Include TypeScript strict mode compliance
6. Write comprehensive unit tests for color rendering and size variants

## Showcase Integration (CRITICAL)

**IMMEDIATELY** after creating the component:

1. Add MessageAvatar to ComponentShowcase.tsx with multiple examples:
   - Different agent colors (#3b82f6 blue, #22c55e green, #ef4444 red, #a855f7 purple)
   - Different size variants (small, medium, large)
   - Both light and dark theme variants
2. Verify visual appearance matches DesignPrototype styling
3. Test theme switching works correctly

## Acceptance Criteria

- ✅ Component renders colored circles/pills for different agents
- ✅ Supports multiple size variants with consistent proportions
- ✅ Uses theme variables for consistent styling
- ✅ Theme switching (light/dark) works properly
- ✅ Added to ComponentShowcase with comprehensive examples
- ✅ Unit tests cover color rendering and size functionality
- ✅ TypeScript strict mode compliance
- ✅ Component under 150 lines of code

### Log
