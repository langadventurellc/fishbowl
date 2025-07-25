---
kind: task
id: T-create-conversationitemdisplay
title: Create ConversationItemDisplay component with props interface
status: open
priority: normal
prerequisites:
  - T-create-conversationlistdisplay
created: "2025-07-24T19:50:31.693300"
updated: "2025-07-24T19:50:31.693300"
schema_version: "1.1"
parent: F-sidebar-display-components
---

Create the conversation item display component for individual conversation entries.

**Context:**
Extract the conversation item styling from `apps/desktop/src/pages/DesignPrototype.tsx` (lines 274-306) to create a pure display component showing individual conversation list items with visual states.

**Implementation Steps:**

1. **Update Props Interface:**
   - The `ConversationItemProps` interface already exists but includes interactive handlers
   - Create `ConversationItemDisplayProps` interface for the display-only version
   - Create `packages/shared/src/types/ui/components/ConversationItemDisplayProps.ts`
   - Define props: conversation data, active state, hover appearance, className
   - Remove interactive handlers (onSelect, onContextMenuAction, onOpenContextMenu)
   - Export from `packages/shared/src/types/ui/components/index.ts`
   - Run `pnpm build:libs` to rebuild shared package

2. **Create Component:**
   - Create `apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx`
   - Extract conversation item styles from DesignPrototype lines 274-306
   - Convert to use theme variables from `packages/ui-theme/src/claymorphism-theme.css`
   - Support active, inactive, unread, and hover visual states
   - Include timestamp and unread indicator display
   - Remove all interactive functionality (onClick handlers, state management)
   - Keep component under 120 lines

3. **Update Exports:**
   - Add ConversationItemDisplay to `apps/desktop/src/components/sidebar/index.ts`

4. **ComponentShowcase Integration:**
   - Add ConversationItemDisplay to ComponentShowcase immediately after creation
   - Show active conversation item state
   - Show inactive conversation item state
   - Demonstrate unread indicator appearance
   - Show hover appearance state (without actual hover behavior)
   - Test different conversation data (names, timestamps)
   - Test light and dark theme compatibility

**Acceptance Criteria:**

- Pure display component with no event handlers or state
- Props-based visual configuration using TypeScript interface from shared package
- Exact visual match with DesignPrototype conversation item appearance (lines 274-306)
- Support for active, inactive, unread, and hover visual states
- Proper timestamp and unread indicator display
- List item layout with proper padding and spacing
- Theme variable integration for consistent styling
- Added to barrel export in sidebar/index.ts
- Component added to ComponentShowcase with state demonstrations

**File Locations:**

- Props: `packages/shared/src/types/ui/components/ConversationItemDisplayProps.ts`
- Component: `apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx`
- Export: `apps/desktop/src/components/sidebar/index.ts` (update)

**Dependencies:**

- T-create-conversationlistdisplay (for component ordering)
- Access to Conversation type from `packages/shared/src/types/ui/core/Conversation.ts`
- Access to `packages/ui-theme/src/claymorphism-theme.css` theme variables

**Note:** This component will be enhanced with context menu integration in a separate task.

### Log
