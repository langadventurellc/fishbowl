---
kind: task
id: T-create-sidebartoggledisplay
title: Create SidebarToggleDisplay component with props interface
status: open
priority: normal
prerequisites:
  - T-create-sidebarheaderdisplay
created: "2025-07-24T19:50:04.111981"
updated: "2025-07-24T19:50:04.111981"
schema_version: "1.1"
parent: F-sidebar-display-components
---

Create the sidebar toggle button component for collapse/expand visual indication.

**Context:**
Extract the sidebar toggle button styling from `apps/desktop/src/pages/DesignPrototype.tsx` (lines 615-638) to create a pure display component showing the visual appearance of the collapse/expand button.

**Implementation Steps:**

1. **Update Props Interface:**
   - The `SidebarToggleProps` interface already exists at `packages/shared/src/types/ui/components/SidebarToggleProps.ts`
   - Create `SidebarToggleDisplayProps` interface for the display-only version
   - Remove interactive handlers (onToggle) and keep only visual props: isCollapsed, className
   - Export from `packages/shared/src/types/ui/components/index.ts`
   - Run `pnpm build:libs` to rebuild shared package

2. **Create Component:**
   - Create `apps/desktop/src/components/sidebar/SidebarToggleDisplay.tsx`
   - Extract sidebar toggle styles from DesignPrototype lines 615-638
   - Convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
   - Support collapsed/expanded visual states with rotation animation styling
   - Show hover appearance (without actual hover behavior)
   - Remove all interactive functionality (onClick handlers, state management)
   - Keep component under 120 lines

3. **Update Exports:**
   - Add SidebarToggleDisplay to `apps/desktop/src/components/sidebar/index.ts`

4. **ComponentShowcase Integration:**
   - Add SidebarToggleDisplay to ComponentShowcase immediately after creation
   - Show both collapsed and expanded visual states
   - Demonstrate hover appearance state
   - Test different positioning scenarios
   - Test light and dark theme compatibility

**Acceptance Criteria:**

- Pure display component with no event handlers or state
- Props-based visual configuration using TypeScript interface from shared package
- Exact visual match with DesignPrototype toggle button appearance (lines 615-638)
- Icon rotation animation styling preserved
- Proper positioning and shadow styling maintained
- Theme variable integration for consistent styling
- Added to barrel export in sidebar/index.ts
- Component added to ComponentShowcase with state demonstrations

**File Locations:**

- Props: `packages/shared/src/types/ui/components/SidebarToggleDisplayProps.ts`
- Component: `apps/desktop/src/components/sidebar/SidebarToggleDisplay.tsx`
- Export: `apps/desktop/src/components/sidebar/index.ts` (update)

**Dependencies:**

- T-create-sidebarheaderdisplay (for component ordering)
- Access to `packages/ui-theme/src/claymorphism-theme.css` theme variables

### Log
