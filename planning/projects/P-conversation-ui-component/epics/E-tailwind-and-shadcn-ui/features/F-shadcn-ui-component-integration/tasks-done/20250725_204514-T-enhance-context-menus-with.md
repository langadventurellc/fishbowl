---
kind: task
id: T-enhance-context-menus-with
parent: F-shadcn-ui-component-integration
status: done
title: Enhance context menus with shadcn/ui ContextMenu component
priority: normal
prerequisites:
  - T-integrate-shadcn-ui-css
created: "2025-07-25T18:22:21.616453"
updated: "2025-07-25T20:23:40.970929"
schema_version: "1.1"
worktree: null
---

# Enhance Context Menus with shadcn/ui ContextMenu Component

## Context

Enhance existing context menu functionality (MessageContextMenu, ConversationContextMenu) with shadcn/ui ContextMenu component while preserving all existing functionality. Current context menus likely use custom implementations that could benefit from improved accessibility and styling. No automated tests.

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

## Acceptance Criteria

✅ shadcn/ui ContextMenu component installed  
✅ MessageContextMenu enhanced with shadcn/ui primitives  
✅ ConversationContextMenu enhanced with shadcn/ui primitives  
✅ All existing menu items and actions preserved  
✅ Improved keyboard navigation and accessibility  
✅ Proper menu positioning and trigger behavior  
✅ Consistent styling with theme system  
✅ Visual appearance maintains or improves current design

## Technical Notes

- Use Radix UI ContextMenu primitives for accessibility
- Preserve existing event handlers and action callbacks
- Ensure proper portal rendering for menu positioning
- Maintain compatibility with existing menu trigger patterns

## Testing Requirements

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

**2025-07-26T01:45:14.567826Z** - Enhanced context menus with shadcn/ui DropdownMenu component while preserving all existing functionality. Implemented hybrid wrapper approach that maintains click-trigger behavior while adding Radix UI accessibility benefits. Updated MessageContextMenu and ConversationContextMenu to use DropdownMenuItem with destructive variant for delete actions. All existing props interfaces and behavior preserved with enhanced keyboard navigation, ARIA support, and consistent theming.

- filesChanged: ["apps/desktop/src/components/menu/ContextMenu.tsx", "apps/desktop/src/components/chat/MessageContextMenu.tsx", "apps/desktop/src/components/sidebar/ConversationContextMenu.tsx", "apps/desktop/package.json"]
