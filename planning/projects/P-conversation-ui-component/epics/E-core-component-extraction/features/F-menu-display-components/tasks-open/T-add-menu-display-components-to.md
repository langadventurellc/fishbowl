---
kind: task
id: T-add-menu-display-components-to
title: Add menu display components to MessageItem following prototype pattern
status: open
priority: normal
prerequisites:
  - T-create-menu-component-barrel
created: "2025-07-24T16:18:55.710944"
updated: "2025-07-24T16:18:55.710944"
schema_version: "1.1"
parent: F-menu-display-components
---

# Add Menu Display Components to MessageItem

## Overview

Integrate the newly created menu display components into the MessageItem component, following the same pattern as the DesignPrototype implementation.

## Implementation Details

### Target File

Update `apps/desktop/src/components/chat/MessageItem.tsx`

### Integration Pattern

Following the DesignPrototype pattern from lines 1003-1225:

1. Import menu display components from barrel export
2. Replace inline styling with component usage
3. Maintain visual consistency with prototype
4. Keep all existing prop interfaces and functionality

### Component Integration

```typescript
import {
  ContextMenuDisplay,
  MenuItemDisplay,
  MenuTriggerDisplay,
} from "@/components/menu";
```

### Implementation Strategy

1. **MenuTriggerDisplay Integration**:
   - Replace ellipsis button JSX with MenuTriggerDisplay component
   - Maintain existing click handlers and state management
   - Use variant prop to show active/hover states

2. **ContextMenuDisplay Integration**:
   - Replace context menu div with ContextMenuDisplay component
   - Map existing menu items to MenuItemDisplay components
   - Preserve positioning logic (above/below)

3. **MenuItemDisplay Usage**:
   - Replace button elements with MenuItemDisplay components
   - Maintain existing action handlers
   - Preserve visual states and styling

### Visual Consistency Requirements

- Exact visual match with current MessageItem appearance
- All existing functionality preserved (click handlers, state management)
- No breaking changes to MessageItem props interface
- Maintain theme integration and responsive behavior

### Code Structure

The integration should follow this pattern:

```typescript
// Replace ellipsis button
<MenuTriggerDisplay
  variant={contextMenuOpen === message.id ? 'active' : 'normal'}
  onClick={handleMenuToggle}
/>

// Replace context menu
{contextMenuOpen === message.id && (
  <ContextMenuDisplay
    isOpen={true}
    position={shouldShowMenuAbove(message.id) ? 'above' : 'below'}
    items={menuItems}
  >
    <MenuItemDisplay label="Copy" onClick={handleCopy} />
    <MenuItemDisplay label="Delete" onClick={handleDelete} />
    {canRegenerate && (
      <MenuItemDisplay label="Regenerate" onClick={handleRegenerate} />
    )}
  </ContextMenuDisplay>
)}
```

## Acceptance Criteria

✅ **Component Integration**

- Menu display components imported and used correctly
- Existing MessageItem functionality preserved completely
- No breaking changes to props interface
- Visual appearance matches current implementation exactly

✅ **Functionality Preservation**

- All click handlers working correctly
- Context menu open/close behavior preserved
- Menu positioning logic (above/below) maintained
- Message-specific menu actions functioning

✅ **Code Quality**

- Clean component usage replacing inline JSX
- Proper import statements from barrel export
- No duplicate styling or redundant code
- TypeScript types preserved and working

✅ **Visual Verification**

- MessageItem appearance unchanged in ComponentShowcase
- Menu interactions working identically to before
- Positioning and styling consistent with prototype
- Theme integration functioning correctly

## Dependencies

- Requires menu component barrel export (prerequisite)
- Uses existing MessageItem component
- Integrates with current theme system
- Maintains existing prop interfaces

## Testing Requirements

- Visual verification in ComponentShowcase
- Functional testing of menu interactions
- No regression in existing MessageItem behavior

## Implementation Notes

- This is primarily a refactoring task using new components
- Focus on maintaining exact existing behavior and appearance
- Use the new components as replacements for inline JSX
- Preserve all existing event handlers and state management
- Ensure no performance regression from component usage

### Log
