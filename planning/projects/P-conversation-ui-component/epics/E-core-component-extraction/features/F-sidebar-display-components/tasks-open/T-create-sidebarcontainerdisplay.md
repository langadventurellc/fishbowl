---
kind: task
id: T-create-sidebarcontainerdisplay
title: Create SidebarContainerDisplay component with props interface
status: open
priority: high
prerequisites: []
created: "2025-07-24T19:49:41.644432"
updated: "2025-07-24T19:49:41.644432"
schema_version: "1.1"
parent: F-sidebar-display-components
---

Create the main sidebar layout wrapper component that handles collapsed/expanded visual states.

**Context:**
Extract the sidebar container styling from `apps/desktop/src/pages/DesignPrototype.tsx` to create a pure display component showing the visual layout of the sidebar wrapper.

**Implementation Steps:**

1. **Create Props Interface:**
   - Create `packages/shared/src/types/ui/components/SidebarContainerDisplayProps.ts`
   - Define interface with props: collapsed state, width variant, border visibility, className
   - Export from `packages/shared/src/types/ui/components/index.ts`
   - Run `pnpm build:libs` to rebuild shared package

2. **Create Component:**
   - Create `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`
   - Extract sidebar container styles from DesignPrototype
   - Convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
   - Support collapsed/expanded width states visually
   - Remove all interactive functionality (onClick handlers, state management)
   - Keep component under 120 lines

3. **Directory Setup:**
   - Create `apps/desktop/src/components/sidebar/` directory if it doesn't exist
   - Create `apps/desktop/src/components/sidebar/index.ts` barrel export

4. **ComponentShowcase Integration:**
   - Add SidebarContainerDisplay to ComponentShowcase immediately after creation
   - Show both collapsed and expanded states
   - Demonstrate different width variants
   - Test light and dark theme compatibility

**Acceptance Criteria:**

- Pure display component with no event handlers or state
- Props-based visual configuration using TypeScript interface from shared package
- Exact visual match with DesignPrototype sidebar container appearance
- Smooth transition styling between collapsed/expanded states
- Theme variable integration for consistent styling
- Barrel export in sidebar/index.ts
- Component added to ComponentShowcase with state demonstrations

**File Locations:**

- Props: `packages/shared/src/types/ui/components/SidebarContainerDisplayProps.ts`
- Component: `apps/desktop/src/components/sidebar/SidebarContainerDisplay.tsx`
- Export: `apps/desktop/src/components/sidebar/index.ts`

**Dependencies:**

- F-atomic-ui-components (prerequisite)
- Access to `packages/ui-theme/src/claymorphism-theme.css` theme variables

### Log
