---
id: T-create-deletepersonalitydialog
title: Create DeletePersonalityDialog confirmation modal
status: open
priority: high
parent: F-implement-user-interactions
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T18:47:38.643Z
updated: 2025-08-17T18:47:38.643Z
---

# Create DeletePersonalityDialog Component

## Context

Implement a confirmation dialog for personality deletion that prevents accidental deletions and provides clear feedback about the consequences. This follows the AlertDialog pattern specified in the feature requirements.

## Implementation Requirements

### Dialog Structure

- Use shadcn/ui AlertDialog components (AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction)
- Display personality name being deleted for confirmation
- Show clear consequences warning
- Provide Cancel and Delete action buttons
- Handle loading state during deletion

### Component API

```tsx
interface DeletePersonalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personality?: PersonalityViewModel;
  onConfirm: (personality: PersonalityViewModel) => Promise<void>;
  isDeleting?: boolean;
}
```

### Dialog Content

- Title: "Delete Personality"
- Description: "Are you sure you want to delete '[personality name]'? This action cannot be undone."
- Cancel button: "Cancel" (closes dialog)
- Delete button: "Delete" or "Deleting..." based on loading state
- Delete button disabled during deletion operation

## Technical Approach

1. Create `DeletePersonalityDialog.tsx` component
2. Use AlertDialog structure from feature specification:
   ```tsx
   <AlertDialog open={open} onOpenChange={onOpenChange}>
     <AlertDialogContent>
       <AlertDialogHeader>
         <AlertDialogTitle>Delete Personality</AlertDialogTitle>
         <AlertDialogDescription>
           Are you sure you want to delete "{personality?.name}"? This action
           cannot be undone.
         </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter>
         <AlertDialogCancel>Cancel</AlertDialogCancel>
         <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
           {isDeleting ? "Deleting..." : "Delete"}
         </AlertDialogAction>
       </AlertDialogFooter>
     </AlertDialogContent>
   </AlertDialog>
   ```
3. Handle confirmation by calling onConfirm with personality
4. Show loading state with disabled button and "Deleting..." text

## Acceptance Criteria

- [ ] Dialog shows personality name being deleted
- [ ] Clear warning about irreversible action
- [ ] Cancel button closes dialog without action
- [ ] Delete button calls onConfirm with personality
- [ ] Delete button shows loading state during operation
- [ ] Delete button disabled during deletion
- [ ] Dialog closes automatically after successful deletion
- [ ] ESC key and backdrop click work for cancellation
- [ ] Component properly typed with TypeScript
- [ ] Unit tests verify confirmation behavior

## Testing Requirements

- Test dialog displays correct personality name
- Test cancel behavior closes dialog
- Test confirm calls onConfirm with correct personality
- Test loading state disables button and changes text
- Test keyboard navigation
- Test backdrop/ESC cancellation

## Security Considerations

- Sanitize personality name display to prevent XSS
- Validate personality object exists before deletion
- Prevent double-deletion through disabled state

## Dependencies

- shadcn/ui AlertDialog components
- PersonalityViewModel type
- Loading state management

## Files to Create/Modify

- Create: `apps/desktop/src/renderer/components/personalities/DeletePersonalityDialog.tsx`
- Add unit tests as needed
