---
kind: task
id: T-enhance-context-menus-with
title: Enhance context menus with shadcn/ui ContextMenu component
status: open
priority: normal
prerequisites:
  - T-integrate-shadcn-ui-css
created: "2025-07-25T18:22:21.616453"
updated: "2025-07-25T18:22:21.616453"
schema_version: "1.1"
parent: F-shadcn-ui-component-integration
---

# Enhance Context Menus with shadcn/ui ContextMenu Component

## Context

Enhance existing context menu functionality (MessageContextMenu, ConversationContextMenu) with shadcn/ui ContextMenu component while preserving all existing functionality. Current context menus likely use custom implementations that could benefit from improved accessibility and styling.

## Implementation Requirements

- Install shadcn/ui ContextMenu component
- Preserve existing context menu functionality
- Enhance MessageContextMenu with shadcn/ui primitives
- Enhance ConversationContextMenu with shadcn/ui primitives
- Maintain all existing menu items and actions
- Improve accessibility and keyboard navigation

## Detailed Steps

1. Install shadcn/ui ContextMenu: `npx shadcn@latest add context-menu`
2. Analyze existing context menu implementations:
   - `apps/desktop/src/components/sidebar/ConversationContextMenu.tsx`
   - `apps/desktop/src/components/chat/MessageContextMenu.tsx`
   - `apps/desktop/src/components/menu/ContextMenu.tsx`
3. Create enhanced context menu wrapper using shadcn/ui primitives
4. Update MessageContextMenu to use shadcn/ui ContextMenu:
   - Preserve copy, delete, regenerate functionality
   - Maintain proper positioning and trigger behavior
5. Update ConversationContextMenu to use shadcn/ui ContextMenu:
   - Preserve delete and duplicate functionality
   - Maintain proper menu item styling
6. Test context menu functionality:
   - Right-click triggers
   - Keyboard navigation
   - Menu item actions
   - Proper positioning
7. Write unit tests for enhanced context menus

## Acceptance Criteria

✅ shadcn/ui ContextMenu component installed  
✅ MessageContextMenu enhanced with shadcn/ui primitives  
✅ ConversationContextMenu enhanced with shadcn/ui primitives  
✅ All existing menu items and actions preserved  
✅ Improved keyboard navigation and accessibility  
✅ Proper menu positioning and trigger behavior  
✅ Consistent styling with theme system  
✅ Unit tests pass for context menu functionality  
✅ Visual appearance maintains or improves current design

## Technical Notes

- Use Radix UI ContextMenu primitives for accessibility
- Preserve existing event handlers and action callbacks
- Ensure proper portal rendering for menu positioning
- Maintain compatibility with existing menu trigger patterns

## Testing Requirements

- Unit tests for context menu trigger and actions
- Integration tests with message and conversation interactions
- Accessibility testing for keyboard navigation
- Visual regression testing for menu appearance and positioning

## Files to Update

- `apps/desktop/src/components/sidebar/ConversationContextMenu.tsx`
- `apps/desktop/src/components/chat/MessageContextMenu.tsx`
- `apps/desktop/src/components/menu/ContextMenu.tsx`
- Any components that use these context menus

## See Also

- Current context menu implementations in `/components/menu/` and `/components/sidebar/`
- shadcn/ui ContextMenu documentation
- Existing menu trigger patterns in the codebase

### Log
