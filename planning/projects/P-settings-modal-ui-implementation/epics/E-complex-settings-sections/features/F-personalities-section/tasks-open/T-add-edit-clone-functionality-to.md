---
kind: task
id: T-add-edit-clone-functionality-to
title: Add edit/clone functionality to personality cards
status: open
priority: normal
prerequisites:
  - T-implement-saved-personalities
created: "2025-07-28T17:02:42.958116"
updated: "2025-07-28T17:02:42.958116"
schema_version: "1.1"
parent: F-personalities-section
---

# Add Edit/Clone Functionality to Personality Cards

## Context

Implement the interactive functionality for personality cards in the Saved tab, enabling users to edit existing personalities or create clones with modified values.

## Implementation Requirements

### Edit Functionality

- Edit button opens personality in Create New tab with pre-filled values
- All form fields populated with existing personality data
- Form validation applied to edited data
- Save updates existing personality (no new ID)
- User feedback for successful edits

### Clone Functionality

- Clone button creates duplicate personality with new ID
- Original name gets "(Copy)" suffix for uniqueness
- All trait values and settings duplicated exactly
- Clone opens in Create New tab for immediate editing
- User can modify cloned values before saving

### State Management Integration

```typescript
// Store methods to implement
const editPersonality = (personality: Personality) => {
  // Switch to Create New tab
  // Pre-fill form with personality data
  // Set edit mode flag
};

const clonePersonality = (personality: Personality) => {
  // Create new personality with copied data
  // Generate new ID and update name
  // Switch to Create New tab with cloned data
};
```

### User Experience Flow

1. **Edit Flow**: Click Edit → Switch to Create New tab → Form pre-filled → Save updates existing
2. **Clone Flow**: Click Clone → Create duplicate → Switch to Create New tab → Modify → Save as new

### Form State Management

- Track edit vs create mode in form state
- Handle form reset when switching between modes
- Preserve unsaved changes with user confirmation
- Clear form when creating truly new personality

### Visual Feedback

- Loading states during save operations
- Success/error messages for operations
- Disabled states during async operations
- Confirmation dialogs for destructive actions

## Acceptance Criteria

- [ ] Edit button populates Create New tab with existing personality data
- [ ] Clone button creates duplicate with "(Copy)" suffix
- [ ] Edit mode saves updates to existing personality
- [ ] Clone mode saves as new personality with new ID
- [ ] Form state properly managed between edit/create modes
- [ ] User feedback provided for all operations (success/error)
- [ ] Tab switching works smoothly during edit/clone operations
- [ ] Form validation applies to edited data
- [ ] Unsaved changes handled with user confirmation

## Testing Requirements

- Unit tests for edit/clone button functionality
- Integration tests for tab switching with pre-filled data
- Test form state management across edit/create modes
- Verify store updates for both edit and clone operations
- Test user confirmation flows for unsaved changes
- Accessibility tests for edit/clone interactions

## Dependencies

- Zustand store with edit/clone methods
- Create New tab form implementation
- Tab switching functionality from Interactive Tab System
- Form state management utilities
- User confirmation/dialog components

## Security Considerations

- Validate personality IDs before edit operations
- Sanitize cloned data to prevent injection
- Ensure user can only edit their own personalities
- Validate edit permissions before allowing modifications

## Performance Requirements

- Edit/clone operations feel immediate (< 100ms)
- Tab switching during edit/clone is smooth
- Form population happens without visible delays
- Store updates optimized to prevent unnecessary re-renders
- Large personality datasets don't impact edit/clone performance

### Log
