---
kind: task
id: T-create-atomic-components-barrel
title: Create atomic components barrel export
status: open
priority: low
prerequisites:
  - T-extract-agentpill-component-with
  - T-extract-themetoggle-component
  - T-extract-thinkingindicator
  - T-extract-button-variants-with
created: "2025-07-24T07:25:48.533737"
updated: "2025-07-24T07:25:48.533737"
schema_version: "1.1"
parent: F-atomic-ui-components
---

# Create Atomic Components Barrel Export

## Context

Create a clean barrel export file for all atomic UI components to enable easy importing throughout the application. This consolidates all component exports in a single index file.

## Implementation Requirements

### File Creation

- Create `apps/desktop/src/components/ui/atomic/index.ts`
- Export all atomic components from their respective files
- Follow consistent naming conventions
- Add TypeScript type exports for component props

### Export Structure

```typescript
// Component exports
export { AgentPill } from "./AgentPill";
export { ThemeToggle } from "./ThemeToggle";
export { ThinkingIndicator } from "./ThinkingIndicator";
export { Button } from "./Button";

// Type exports - all props interfaces should be in shared package
export type { AgentPillProps } from "@fishbowl-ai/shared/types/ui/components";
export type { ThemeToggleProps } from "@fishbowl-ai/shared/types/ui/components";
export type { ThinkingIndicatorProps } from "@fishbowl-ai/shared/types/ui/components";
export type { ButtonProps } from "@fishbowl-ai/shared/types/ui/components";
```

### Usage Verification

- Update ComponentShowcase to use barrel imports
- Verify all components import correctly
- Test that TypeScript intellisense works with exported types
- Ensure no circular dependencies

## Acceptance Criteria

- ✅ Barrel export file created at `apps/desktop/src/components/ui/atomic/index.ts`
- ✅ All atomic components exported with proper naming
- ✅ TypeScript type interfaces exported
- ✅ ComponentShowcase updated to use barrel imports
- ✅ No build errors or TypeScript issues
- ✅ Clean import statements throughout codebase

## Dependencies

- All atomic component extraction tasks must be completed first
- Components: AgentPill, ThemeToggle, ThinkingIndicator, Button

## File Locations

- **Target file**: `apps/desktop/src/components/ui/atomic/index.ts`
- **Update file**: `apps/desktop/src/pages/showcase/ComponentShowcase.tsx`

### Log
