---
kind: task
id: T-extract-agentpill-component-with
title: Extract AgentPill component with showcase integration
status: open
priority: high
prerequisites: []
created: "2025-07-24T07:24:52.956703"
updated: "2025-07-24T07:24:52.956703"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Extract AgentPill Component

## Context

Extract the AgentPill component from `apps/desktop/src/pages/DesignPrototype.tsx` (lines 322-331) into a reusable atomic component. This component displays agent name, role, and color with optional thinking indicator.

## Implementation Requirements

### Component Creation

- Create `apps/desktop/src/components/ui/atomic/AgentPill.tsx`
- Extract styling from DesignPrototype lines 322-331 (agentPill style object)
- Convert hardcoded styles to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
- Import `AgentPillProps` interface from `@fishbowl-ai/shared/types/ui/components`
- Import `Agent` interface from `@fishbowl-ai/shared/types/ui/core`

### Styling Requirements

- Rounded pill design with agent color background
- White text color for readability
- 6px 12px padding
- 20px border radius
- 12px font size with 500 weight
- Use `agent.isThinking` to show/hide thinking indicator
- Thinking indicator should use ThinkingIndicator component when available

### ComponentShowcase Integration (CRITICAL)

- **Immediately add to ComponentShowcase** as soon as component is created
- Create sample agent data with different colors (blue, green, red, purple)
- Show all size variants (small, medium, large)
- Demonstrate thinking state (on/off)
- Test both light and dark theme switching
- Verify pixel-perfect match with DesignPrototype appearance

## Acceptance Criteria

- ✅ Component renders in separate file under `apps/desktop/src/components/ui/atomic/`
- ✅ Props-based rendering with no internal state
- ✅ Theme-aware styling using CSS custom properties
- ✅ All variants displayed in ComponentShowcase with sample data
- ✅ Visual verification completed in both light/dark themes
- ✅ TypeScript strict mode compliance
- ✅ Component under 100 lines
- ✅ Thinking indicator animation works correctly
- ✅ Export added to `apps/desktop/src/components/ui/atomic/index.ts`

## File Locations

- **Source extraction**: `apps/desktop/src/pages/DesignPrototype.tsx:322-331`
- **Component file**: `apps/desktop/src/components/ui/atomic/AgentPill.tsx`
- **Showcase integration**: `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`
- **Theme reference**: `packages/ui-theme/src/claymorphism-theme.css`

### Log
