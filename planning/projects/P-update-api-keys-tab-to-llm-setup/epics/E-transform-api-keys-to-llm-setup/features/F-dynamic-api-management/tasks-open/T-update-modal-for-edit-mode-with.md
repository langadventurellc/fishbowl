---
kind: task
id: T-update-modal-for-edit-mode-with
title: Update modal for edit mode with pre-filled data
status: open
priority: normal
prerequisites:
  - T-implement-local-state-management
created: "2025-08-04T13:37:06.165617"
updated: "2025-08-04T13:37:06.165617"
schema_version: "1.1"
parent: F-dynamic-api-management
---

## Context

The LlmConfigModal needs to support both add and edit modes. When editing, the modal should pre-fill all fields with existing configuration data and make the provider type read-only.

## Implementation Requirements

- Add mode prop to distinguish between 'add' and 'edit' modes
- Pre-populate form fields when editing
- Make provider selector read-only in edit mode
- Update modal title based on mode
- Pass configuration ID through for updates

## Technical Approach

1. Update LlmConfigModal component props:

   ```typescript
   interface LlmConfigModalProps {
     isOpen: boolean;
     onClose: () => void;
     onSave: (data: LlmConfigData & { id?: string }) => void;
     mode?: "add" | "edit";
     initialData?: LlmConfigData & { id: string };
   }
   ```

2. Update modal behavior:
   - Set form default values from initialData when provided
   - Disable provider selector when mode is 'edit'
   - Change title to "Edit [Configuration Name]" in edit mode
   - Include ID in onSave callback data when editing

3. Update LlmSetupSection to:
   - Track editing state with configuration data
   - Pass mode and initialData to modal
   - Clear editing state when modal closes

## UI Changes

- Modal title: "Setup LLM API" (add) vs "Edit [Name]" (edit)
- Provider selector: Enabled (add) vs Disabled/Read-only (edit)
- All other fields remain editable in both modes
- Save button behavior unchanged

## Acceptance Criteria

- ✓ Modal accepts mode and initialData props
- ✓ Form fields pre-populated in edit mode
- ✓ Provider selector disabled in edit mode
- ✓ Modal title reflects current mode
- ✓ Configuration ID passed through on save
- ✓ Editing state properly managed in parent
- ✓ Cancel/close clears editing state

## Dependencies

- Requires T-implement-local-state-management for state structure

## Files to Update

- `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`
- `apps/desktop/src/components/settings/LlmSetupSection.tsx`

### Log
