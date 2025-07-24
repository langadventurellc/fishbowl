---
kind: task
id: T-create-agentpill-component-with
title: Create AgentPill component with props interface and styling
status: open
priority: high
prerequisites: []
created: "2025-07-24T06:52:02.568740"
updated: "2025-07-24T06:52:02.568740"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Create AgentPill Component

## Context

Extract the AgentPill component from DesignPrototype.tsx (lines 322-331, 917-930) as a reusable atomic UI component. This component displays agent name, role, and color with optional thinking indicator.

## Location in DesignPrototype

- **Styling**: Lines 322-331 (`agentPill` and `thinkingDot` styles)
- **Usage**: Lines 917-930 (rendered in agent labels bar)

## Implementation Requirements

### 1. File Creation

Create `apps/desktop/src/components/ui/atomic/AgentPill.tsx` with:

```typescript
import { AgentPillProps } from "@fishbowl-ai/shared/types/ui";

// Component implementation using existing AgentPillProps interface
// from packages/shared/src/types/ui/components/AgentPillProps.ts
```

### 2. Component Implementation

- Extract styling from DesignPrototype lines 322-331 and 332-339
- Use CSS custom properties from theme system (`var(--font-sans)`, etc.)
- Implement pure rendering function with no internal state
- Include ThinkingIndicator dot when `agent.isThinking` is true
- Use existing `AgentPillProps` interface with `Agent` type from shared package
- Note: Existing interface includes `onClick` handler and `className` props

### 3. Styling Requirements

- Convert inline styles to CSS-in-JS using theme variables
- Maintain pill shape with borderRadius: "20px"
- Use agent.color for backgroundColor
- White text color for contrast
- Thinking dot with pulse animation matching DesignPrototype

### 4. Showcase Integration (CRITICAL)

**Immediately after creating the component:**

- Add AgentPill to ComponentShowcase page with sample data
- Test multiple agent variations (different colors, roles, thinking states)
- Verify both light and dark theme compatibility
- Include size variant demonstrations

### Sample Data for Showcase:

```typescript
const sampleAgents = [
  {
    name: "Technical Advisor",
    role: "Technical Advisor",
    color: "#3b82f6",
    isThinking: false,
  },
  {
    name: "Project Manager",
    role: "Project Manager",
    color: "#22c55e",
    isThinking: true,
  },
  {
    name: "Creative Director",
    role: "Creative Director",
    color: "#a855f7",
    isThinking: false,
  },
];
```

## Acceptance Criteria

- ✅ Component renders pill with agent name, role, and color
- ✅ Thinking indicator appears when `agent.isThinking` is true
- ✅ Size variants work correctly (small, medium, large)
- ✅ CSS uses theme variables for consistent theming
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

- Basic rendering with required props
- Thinking indicator visibility based on isThinking prop
- Size variant styling application
- Theme variable usage

### Log
