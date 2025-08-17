---
id: T-implement-personalityformmodal
title: Implement PersonalityFormModal with dialog structure
status: open
priority: high
parent: F-implement-user-interactions
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-17T18:47:21.159Z
updated: 2025-08-17T18:47:21.159Z
---

# Implement PersonalityFormModal Component

## Context

Create a modal dialog that wraps the existing PersonalityForm component for create and edit operations. This modal provides the proper dialog structure with backdrop, animations, and keyboard navigation following the implementation guidance from F-implement-user-interactions.

## Implementation Requirements

### Modal Structure

- Use shadcn/ui Dialog components (Dialog, DialogContent, DialogHeader, DialogTitle)
- Accept `open`, `onOpenChange`, `mode`, `personality`, `onSave`, `onCancel`, and `isSaving` props
- Modal title changes based on mode: "Create Personality" vs "Edit Personality"
- Render PersonalityForm inside DialogContent
- Handle backdrop clicks and ESC key to close modal

### Component API

```tsx
interface PersonalityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  personality?: PersonalityViewModel;
  onSave: (data: PersonalityFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}
```

### Features to Implement

- Modal backdrop prevents background scrolling
- ESC key closes modal (built into Dialog component)
- Clicking backdrop closes modal
- Dialog animates smoothly on open/close
- Focus is trapped within modal when open
- Modal closes on successful save
- Modal stays open on save errors (handled by form)

## Technical Approach

1. Create `PersonalityFormModal.tsx` in appropriate directory
2. Import Dialog components from shadcn/ui
3. Import PersonalityForm component (already refactored)
4. Structure according to pattern in feature description:
   ```tsx
   <Dialog open={open} onOpenChange={onOpenChange}>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>
           {mode === "create" ? "Create Personality" : "Edit Personality"}
         </DialogTitle>
       </DialogHeader>
       <PersonalityForm
         mode={mode}
         personality={personality}
         onSave={onSave}
         onCancel={onCancel}
         isSaving={isSaving}
       />
     </DialogContent>
   </Dialog>
   ```

## Acceptance Criteria

- [ ] Modal renders PersonalityForm with correct props
- [ ] Modal title updates based on create/edit mode
- [ ] ESC key closes modal properly
- [ ] Backdrop click closes modal
- [ ] Modal prevents background scrolling when open
- [ ] Focus is trapped within modal
- [ ] Animation works smoothly
- [ ] onCancel handler properly closes modal
- [ ] Component properly typed with TypeScript
- [ ] Unit tests verify modal behavior and prop passing

## Testing Requirements

- Test modal opens and closes properly
- Test title changes based on mode
- Test PersonalityForm receives correct props
- Test keyboard navigation (ESC key)
- Test backdrop click behavior
- Test focus management

## Dependencies

- PersonalityForm component (available from F-refactor-unified-personalityfo)
- shadcn/ui Dialog components
- PersonalityViewModel and PersonalityFormData types

## Files to Create/Modify

- Create: `apps/desktop/src/renderer/components/personalities/PersonalityFormModal.tsx`
- Add unit tests as needed
