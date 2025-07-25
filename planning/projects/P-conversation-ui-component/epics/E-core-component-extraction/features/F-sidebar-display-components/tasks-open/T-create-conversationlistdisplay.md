---
kind: task
id: T-create-conversationlistdisplay
title: Create ConversationListDisplay component with props interface
status: open
priority: normal
prerequisites:
  - T-create-sidebartoggledisplay
created: "2025-07-24T19:50:18.842388"
updated: "2025-07-24T19:50:18.842388"
schema_version: "1.1"
parent: F-sidebar-display-components
---

Create the conversation list container component that holds conversation items.

**Context:**
Create a container component for the conversation list that handles the scrollable area and proper spacing for conversation items, based on the layout from `apps/desktop/src/pages/DesignPrototype.tsx`.

**Implementation Steps:**

1. **Create Props Interface:**
   - Create `packages/shared/src/types/ui/components/ConversationListDisplayProps.ts`
   - Define interface with props: conversations array, active conversation, scroll state, className
   - Import Conversation type from core types
   - Export from `packages/shared/src/types/ui/components/index.ts`
   - Run `pnpm build:libs` to rebuild shared package

2. **Create Component:**
   - Create `apps/desktop/src/components/sidebar/ConversationListDisplay.tsx`
   - Extract conversation list container styles from DesignPrototype
   - Convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
   - Support empty, populated, and scrolled visual states
   - Create scrollable container with proper spacing and borders
   - Remove all interactive functionality (onClick handlers, state management)
   - Keep component under 120 lines

3. **Update Exports:**
   - Add ConversationListDisplay to `apps/desktop/src/components/sidebar/index.ts`

4. **ComponentShowcase Integration:**
   - Add ConversationListDisplay to ComponentShowcase immediately after creation
   - Show empty state appearance
   - Demonstrate populated list with sample conversation data
   - Show scrolled state appearance
   - Test different conversation counts and layouts
   - Test light and dark theme compatibility

**Acceptance Criteria:**

- Pure display component with no event handlers or state
- Props-based visual configuration using TypeScript interface from shared package
- Proper scrollable container layout matching DesignPrototype
- Support for empty, populated, and scrolled visual states
- Consistent spacing between conversation items area
- Theme variable integration for consistent styling
- Added to barrel export in sidebar/index.ts
- Component added to ComponentShowcase with state demonstrations

**File Locations:**

- Props: `packages/shared/src/types/ui/components/ConversationListDisplayProps.ts`
- Component: `apps/desktop/src/components/sidebar/ConversationListDisplay.tsx`
- Export: `apps/desktop/src/components/sidebar/index.ts` (update)

**Dependencies:**

- T-create-sidebartoggledisplay (for component ordering)
- Access to Conversation type from `packages/shared/src/types/ui/core/Conversation.ts`
- Access to `packages/ui-theme/src/claymorphism-theme.css` theme variables

### Log
