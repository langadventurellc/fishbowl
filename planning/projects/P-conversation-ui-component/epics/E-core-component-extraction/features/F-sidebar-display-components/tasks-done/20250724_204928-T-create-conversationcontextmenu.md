---
kind: task
id: T-create-conversationcontextmenu
parent: F-sidebar-display-components
status: done
title: Create ConversationContextMenu component for conversation item integration
priority: low
prerequisites:
  - T-create-conversationitemdisplay
created: "2025-07-24T19:50:50.554392"
updated: "2025-07-24T20:41:07.258895"
schema_version: "1.1"
worktree: null
---

Create a conversation-specific context menu component and integrate it with ConversationItemDisplay.

**Context:**
Following the pattern used for MessageContextMenu, create a ConversationContextMenu component that wraps the generic ContextMenu component with conversation-specific menu items. Then integrate this with the ConversationItemDisplay component using an ellipses trigger that appears on hover.

**Implementation Steps:**

1. **Study MessageContextMenu Pattern:**
   - Examine `apps/desktop/src/components/chat/MessageContextMenu.tsx` to understand the integration pattern
   - Review how MessageContextMenu uses the generic ContextMenu component
   - Understand the props interface and menu item structure

2. **Create Props Interface:**
   - Create `packages/shared/src/types/ui/components/ConversationContextMenuProps.ts`
   - Define interface with props: conversation data, onAction handler, className
   - Include common conversation actions: "rename", "duplicate", "delete"
   - Export from `packages/shared/src/types/ui/components/index.ts`
   - Run `pnpm build:libs` to rebuild shared package

3. **Create ConversationContextMenu Component:**
   - Create `apps/desktop/src/components/sidebar/ConversationContextMenu.tsx`
   - Use the existing ContextMenu component from `apps/desktop/src/components/menu/ContextMenu.tsx`
   - Import MenuItemDisplay for menu options
   - Define conversation-specific menu items (rename, duplicate, delete)
   - Use ellipses trigger (MenuTriggerDisplay) that appears on hover
   - Keep component under 120 lines

4. **Update ConversationItemDisplay Integration:**
   - Modify `apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx`
   - Add ConversationContextMenu integration with ellipses trigger on hover
   - Position ellipses in the top-right area of conversation item (similar to DesignPrototype)
   - Ensure ellipses appears on hover and clicking opens the context menu
   - Maintain all existing visual states and styling

5. **Update Exports:**
   - Add ConversationContextMenu to `apps/desktop/src/components/sidebar/index.ts`

6. **ComponentShowcase Integration:**
   - Update ComponentShowcase to demonstrate ConversationItemDisplay with context menu
   - Show ellipses trigger on hover state
   - Demonstrate context menu opening (visual state)
   - Test light and dark theme compatibility

**Acceptance Criteria:**

- ConversationContextMenu component follows MessageContextMenu pattern
- Uses existing ContextMenu component with conversation-specific menu items
- Ellipses trigger appears on hover and clicking opens context menu
- Context menu positioned correctly relative to conversation item
- Integration maintains all existing ConversationItemDisplay visual states
- Menu items include rename, duplicate, and delete options
- Props-based configuration using TypeScript interface from shared package
- Added to barrel export in sidebar/index.ts
- ComponentShowcase updated to demonstrate context menu functionality

**File Locations:**

- Props: `packages/shared/src/types/ui/components/ConversationContextMenuProps.ts`
- Component: `apps/desktop/src/components/sidebar/ConversationContextMenu.tsx`
- Updated: `apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx`
- Export: `apps/desktop/src/components/sidebar/index.ts` (update)

**Dependencies:**

- T-create-conversationitemdisplay (component to integrate with)
- Access to existing ContextMenu, MenuItemDisplay, MenuTriggerDisplay components
- Study of MessageContextMenu pattern for implementation guidance

### Log

**2025-07-25T01:49:28.997370Z** - Created ConversationContextMenu component following MessageContextMenu pattern with conversation-specific menu items (rename, duplicate, delete). Integrated ellipses trigger with ConversationItemDisplay that appears on hover and opens context menu when clicked. Added comprehensive TypeScript interfaces and updated ComponentShowcase to demonstrate functionality. Fixed z-index layering to ensure proper display above conversation text.

- filesChanged: ["packages/shared/src/types/ui/components/ConversationContextMenuProps.ts", "packages/shared/src/types/ui/components/index.ts", "apps/desktop/src/components/sidebar/ConversationContextMenu.tsx", "apps/desktop/src/components/sidebar/ConversationItemDisplay.tsx", "apps/desktop/src/components/sidebar/index.ts", "apps/desktop/src/pages/showcase/ComponentShowcase.tsx"]
