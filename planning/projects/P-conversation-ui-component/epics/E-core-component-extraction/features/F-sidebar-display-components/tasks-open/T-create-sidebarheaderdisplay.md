---
kind: task
id: T-create-sidebarheaderdisplay
title: Create SidebarHeaderDisplay component with props interface
status: open
priority: normal
prerequisites:
  - T-create-sidebarcontainerdisplay
created: "2025-07-24T19:49:52.116418"
updated: "2025-07-24T19:49:52.116418"
schema_version: "1.1"
parent: F-sidebar-display-components
---

Create the sidebar header component that displays the top section with title and controls.

**Context:**
Extract the sidebar header styling from `apps/desktop/src/pages/DesignPrototype.tsx` to create a pure display component showing the visual layout of the sidebar header area.

**Implementation Steps:**

1. **Create Props Interface:**
   - Create `packages/shared/src/types/ui/components/SidebarHeaderDisplayProps.ts`
   - Define interface with props: title text, show controls, collapsed state, className
   - Export from `packages/shared/src/types/ui/components/index.ts`
   - Run `pnpm build:libs` to rebuild shared package

2. **Create Component:**
   - Create `apps/desktop/src/components/sidebar/SidebarHeaderDisplay.tsx`
   - Extract sidebar header styles from DesignPrototype
   - Convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
   - Support title text display and control visibility states
   - Remove all interactive functionality (onClick handlers, state management)
   - Keep component under 120 lines

3. **Update Exports:**
   - Add SidebarHeaderDisplay to `apps/desktop/src/components/sidebar/index.ts`

4. **ComponentShowcase Integration:**
   - Add SidebarHeaderDisplay to ComponentShowcase immediately after creation
   - Show different title text configurations
   - Demonstrate show/hide controls states
   - Test collapsed state appearance
   - Test light and dark theme compatibility

**Acceptance Criteria:**

- Pure display component with no event handlers or state
- Props-based visual configuration using TypeScript interface from shared package
- Exact visual match with DesignPrototype sidebar header appearance
- Proper typography and spacing from design system
- Theme variable integration for consistent styling
- Added to barrel export in sidebar/index.ts
- Component added to ComponentShowcase with configuration demonstrations

**File Locations:**

- Props: `packages/shared/src/types/ui/components/SidebarHeaderDisplayProps.ts`
- Component: `apps/desktop/src/components/sidebar/SidebarHeaderDisplay.tsx`
- Export: `apps/desktop/src/components/sidebar/index.ts` (update)

**Dependencies:**

- T-create-sidebarcontainerdisplay (for directory structure)
- Access to `packages/ui-theme/src/claymorphism-theme.css` theme variables

### Log
