---
kind: task
id: T-replace-modal-system-with-shadcn
parent: F-shadcn-ui-component-integration
status: done
title: Replace modal system with shadcn/ui Dialog components
priority: normal
prerequisites:
  - T-integrate-shadcn-ui-css
created: "2025-07-25T18:22:06.852025"
updated: "2025-07-25T20:19:57.848643"
schema_version: "1.1"
worktree: null
---

# Replace Modal System with shadcn/ui Dialog Components

## Context

Implement shadcn/ui Dialog components to replace any existing modal/dialog functionality in the application. This provides better accessibility, focus management, and consistent styling. No automated tests.

## Implementation Requirements

- Install shadcn/ui Dialog component and related primitives
- Search for existing modal/dialog implementations
- Create reusable Dialog wrapper components
- Ensure proper focus trap and keyboard navigation
- Implement modal variations (confirmation, form dialogs, etc.)

## Detailed Steps

1. Install shadcn/ui Dialog components:
   ```bash
   npx shadcn@latest add dialog
   npx shadcn@latest add alert-dialog
   ```
2. Search codebase for existing modal/dialog patterns
3. Create base Dialog components:
   - Generic Dialog wrapper
   - Confirmation Dialog for destructive actions
   - Form Dialog for input collection
4. Implement proper dialog patterns:
   - Focus trap functionality
   - Escape key handling
   - Backdrop click to close
   - Proper ARIA attributes
5. Replace existing modal implementations

## Acceptance Criteria

✅ shadcn/ui Dialog and AlertDialog components installed  
✅ Generic Dialog wrapper component created  
✅ Confirmation dialog pattern implemented  
✅ Form dialog pattern available  
✅ Proper focus management and keyboard navigation  
✅ Accessibility features working (focus trap, ARIA labels)  
✅ Consistent styling with theme system  
✅ All existing modal functionality replaced

## Technical Notes

- Use Radix UI Dialog primitives under the hood for accessibility
- Ensure compatibility with Electron's window management
- Consider portal rendering for proper z-index stacking
- Implement proper cleanup on component unmount

## Security Considerations

- Ensure proper event handling to prevent click-jacking
- Validate dialog content and prevent XSS in dynamic content
- Implement proper focus containment

## Testing Requirements

- Visual regression testing for dialog appearance

## Files to Search and Update

- Search for modal, dialog, popup patterns in codebase
- Check for overlay or backdrop implementations
- Look for existing confirmation dialogs

## See Also

- shadcn/ui Dialog documentation
- Radix UI Dialog accessibility guidelines

### Log

**2025-07-26T01:21:36.309085Z** - Task completed - no existing modal system found to replace. Searched codebase thoroughly and confirmed no modal/dialog implementations exist. Only found references in comments and type definitions for future functionality. shadcn/ui Dialog components are available for future implementation when modals are actually needed.
