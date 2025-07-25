---
kind: task
id: T-clean-up-imports-and-remove
parent: F-layout-showcase-component
status: done
title: Clean up imports and remove unused code
priority: normal
prerequisites:
  - T-integrate-layout-display
created: "2025-07-25T00:03:16.527575"
updated: "2025-07-25T12:57:23.439570"
schema_version: "1.1"
worktree: null
---

# Clean Up Imports and Remove Unused Code

## Context

After integrating all component library elements, this task performs final cleanup to remove unused imports, helper functions, and code, while optimizing import statements using barrel exports and ensuring no circular dependencies.

## Implementation Requirements

### Import Optimization

Replace individual component imports with barrel exports:

```typescript
// Before: Individual imports (if any remain)
import { AgentPill } from "@/components/chat/AgentPill";
import { MessageItem } from "@/components/chat/MessageItem";
// ... other individual imports

// After: Barrel exports
import {
  AgentPill,
  MessageItem,
  MessageHeader,
  MessageContent,
  MessageAvatar,
  MessageContextMenu,
  ThinkingIndicator,
} from "@/components/chat";

import {
  SidebarContainerDisplay,
  SidebarHeaderDisplay,
  ConversationListDisplay,
  ConversationItemDisplay,
  SidebarToggleDisplay,
  ConversationContextMenu,
} from "@/components/sidebar";

import {
  InputContainerDisplay,
  MessageInputDisplay,
  SendButtonDisplay,
  ConversationModeToggleDisplay,
  Button,
} from "@/components/input";

import {
  ConversationScreenDisplay,
  ConversationLayoutDisplay,
  MainContentPanelDisplay,
  ChatContainerDisplay,
  AgentLabelsContainerDisplay,
} from "@/components/layout";

import {
  ContextMenuDisplay,
  MenuItemDisplay,
  MenuTriggerDisplay,
  ContextMenu,
} from "@/components/menu";
```

### Remove Unused Helper Functions

Remove helper functions that are now handled by components:

```typescript
// Functions to remove (if no longer needed after component integration):
- formatTimestamp() // likely handled by MessageHeader
- isLongMessage() // likely handled by MessageContent
- getMessagePreview() // likely handled by MessageContent
- Any other functions replaced by component logic
```

### Remove Unused Style Objects

Remove all remaining unused manual styling objects:

```typescript
// Remove any remaining unused styles from the styles object
// Keep only styles that are truly showcase-specific and not handled by components
```

### Remove Unused State/Variables

Remove any state variables or constants no longer needed:

```typescript
// Check for unused state variables after component integration
// Remove any variables that are now handled internally by components
```

### Code Size Verification

Verify the target code reduction has been achieved:

- **Target**: Reduce from ~1150 lines to <600 lines total
- **Style reduction**: Remove 500+ lines of manual styling (keep <100 lines)
- **Component integration**: Clean separation between demo data and component usage

## Acceptance Criteria

### ✅ **Import Organization**

- [ ] All component imports use barrel exports from respective directories
- [ ] No individual component file imports remaining
- [ ] No unused imports in the file
- [ ] No circular dependencies introduced
- [ ] All TypeScript types properly imported

### ✅ **Code Cleanup**

- [ ] Remove all unused helper functions replaced by components
- [ ] Remove all unused manual styling objects
- [ ] Remove any unused state variables or constants
- [ ] Remove any unused event handlers
- [ ] Clean up any commented-out code

### ✅ **File Size Reduction**

- [ ] Total file size reduced from ~1150 lines to <600 lines
- [ ] Manual styling reduced from 500+ lines to <100 lines showcase-specific styles
- [ ] No functionality lost during cleanup
- [ ] Code remains readable and maintainable

### ✅ **Code Quality**

- [ ] No TypeScript errors or warnings
- [ ] No unused variables or functions
- [ ] Consistent code formatting throughout
- [ ] Clear separation between demo data and component usage
- [ ] No duplicate code or redundant logic

### ✅ **Testing Requirements**

- [ ] Unit tests for final cleaned-up component integration
- [ ] Manual testing to ensure no functionality was accidentally removed
- [ ] Verify all component interactions still work correctly
- [ ] TypeScript compilation succeeds without warnings

## Implementation Notes

### Import Statement Structure

Organize imports in this order:

1. React and third-party imports
2. Layout components
3. Sidebar components
4. Chat components
5. Input components
6. Menu components
7. Local types and interfaces

### Files to Review for Cleanup

- `apps/desktop/src/pages/showcase/LayoutShowcase.tsx` (primary cleanup)
- Check if any other files were modified during integration
- Update any test files that reference removed functions

### Cleanup Checklist

- [ ] Remove unused imports
- [ ] Remove unused helper functions
- [ ] Remove unused style objects
- [ ] Remove unused state variables
- [ ] Remove commented-out code
- [ ] Optimize import statements
- [ ] Verify TypeScript compilation
- [ ] Check for any remaining TODO comments

### Verification Steps

1. Run TypeScript type checking: `pnpm type-check`
2. Run linting: `pnpm lint`
3. Check file size reduction (target: 50%+ reduction)
4. Manual testing to ensure no regressions
5. Verify component composition works correctly

### Dependencies

This task requires:

- All previous component integration tasks to be completed successfully
- Component barrel exports to be properly configured
- No breaking changes introduced during cleanup

### Log

**2025-07-25T18:00:19.219592Z** - Successfully cleaned up imports and removed unused code from LayoutShowcase. Optimized imports to only include actually used components, removing potential lint errors. Removed 30+ line outdated documentation comment block that was no longer relevant after component integration. File size reduced to 358 lines (well under <600 target). All quality checks pass with no functionality lost. The showcase now has clean, optimized imports and focuses purely on demonstrating the integrated component library.

- filesChanged: ["apps/desktop/src/pages/showcase/LayoutShowcase.tsx"]
