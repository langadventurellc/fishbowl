---
id: T-remove-draft-saving-logic-and
title: Remove draft saving logic and components
status: open
priority: medium
parent: F-legacy-code-cleanup-and
prerequisites:
  - T-remove-localstorage-usage
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-15T18:09:48.814Z
updated: 2025-08-15T18:09:48.814Z
---

# Remove Draft Saving Logic and Components

## Context

Remove all draft personality saving mechanisms, unsaved changes tracking, and related UI components that are no longer needed with the new file-based persistence approach.

## Implementation Requirements

### Components to Remove/Update

1. **Draft Saving Components**:
   - Remove draft saving UI elements from personality forms
   - Remove draft recovery prompts and dialogs
   - Remove "Save Draft" buttons and functionality

2. **Unsaved Changes Tracking**:
   - Remove unsaved changes state management
   - Remove "unsaved changes" warning dialogs
   - Remove beforeunload handlers for unsaved personality data

3. **Draft Recovery Mechanisms**:
   - Remove draft recovery on app restart
   - Remove draft restoration prompts
   - Remove draft cleanup on successful save

### Files Likely to Contain Draft Logic

```
apps/desktop/src/components/settings/personalities/
├── CreatePersonalityForm.tsx     # Remove draft saving logic
├── PersonalityForm.tsx          # Remove unsaved changes tracking
└── Draft-related components      # Remove entirely if they exist

packages/ui-shared/src/
├── hooks/useDraftSaving.ts       # Remove if exists
├── hooks/useUnsavedChanges.ts    # Remove if exists
└── utils/draftUtils.ts           # Remove if exists
```

### State Management Cleanup

- Remove draft-related state from personality forms
- Remove draft persistence state from stores
- Remove draft-related actions and reducers
- Clean up draft-related context providers

### Code Patterns to Remove

```typescript
// Remove patterns like these:
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const saveDraft = () => { ... };
const loadDraft = () => { ... };
const clearDraft = () => { ... };

// Remove unsaved changes warnings:
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});
```

## Acceptance Criteria

- [ ] No draft saving UI components remain
- [ ] No unsaved changes tracking state exists
- [ ] No "Save Draft" buttons or functionality remain
- [ ] No unsaved changes warning dialogs exist
- [ ] No draft recovery mechanisms on app restart
- [ ] No beforeunload handlers for personality drafts
- [ ] No draft-related hooks or utilities remain
- [ ] No draft persistence state in stores
- [ ] Application builds successfully after removal
- [ ] No TypeScript errors from removed draft interfaces
- [ ] Unit tests updated to remove draft-related expectations

## UI Changes Required

- Remove "Save Draft" buttons from personality forms
- Remove unsaved changes indicators (asterisks, warning text)
- Remove draft recovery dialogs and prompts
- Simplify form submission flow without draft considerations

## Testing Requirements (include in this task)

- Test personality forms work without draft saving
- Test no unsaved changes warnings appear
- Test form navigation works without draft prompts
- Test application restart doesn't attempt draft recovery
- Update unit tests to remove draft-related test cases
- Verify no console errors from removed draft functionality

## Breaking Changes Documentation

- Document removed draft saving hooks or utilities
- Note any draft-related props removed from components
- List any draft interfaces or types being removed
- Provide migration notes for any dependent code

## Dependencies

- Requires T-remove-localstorage-usage to be completed first (drafts often used localStorage)
- Review existing forms to understand current draft saving implementation
