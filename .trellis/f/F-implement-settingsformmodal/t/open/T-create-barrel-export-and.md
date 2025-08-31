---
id: T-create-barrel-export-and
title: Create barrel export and update SettingsModal nested detection
status: open
priority: medium
parent: F-implement-settingsformmodal
prerequisites:
  - T-create-settingsformmodal-base
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-31T04:52:41.830Z
updated: 2025-08-31T04:52:41.830Z
---

# Create Barrel Export and Update SettingsModal Detection

## Context

Create the common settings components barrel export file and update SettingsModal to use `[data-form-modal]` selector instead of CSS class-based detection. This decouples the nested dialog detection from specific CSS classes and makes the system more portable.

## Implementation Requirements

### 1. Barrel Export File

- **Location**: `apps/desktop/src/components/settings/common/index.ts`
- **Purpose**: Centralized exports for common settings components
- **Content**: Export SettingsFormModal and prepare for future common components

```typescript
// apps/desktop/src/components/settings/common/index.ts
export { SettingsFormModal } from "./SettingsFormModal";
// Add other common components here as they are created
```

### 2. SettingsModal Detection Update

- **Current Implementation**: Uses CSS class-based detection for nested dialogs
- **New Implementation**: Use `[data-form-modal]` selector for detection
- **File**: `apps/desktop/src/components/settings/SettingsModal.tsx`
- **Specific Change**: Update nested dialog detection logic

### 3. Detection Logic Changes

Find and update the nested dialog detection code:

- Replace CSS class selectors with `document.querySelector('[data-form-modal]')`
- Ensure the detection works correctly with the new data attribute approach
- Maintain existing behavior while using the new selector

## Technical Approach

### 1. Barrel Export Creation

- Create new `index.ts` file in common directory
- Follow existing barrel export patterns in the codebase
- Use named exports for clear import statements

### 2. SettingsModal Investigation

- Find current nested dialog detection logic in SettingsModal.tsx
- Identify the specific CSS selector or class-based detection code
- Replace with `[data-form-modal]` attribute selector

### 3. Update Detection Logic

```typescript
// Example of what the detection logic might look like
const hasNestedFormModal = () => {
  return document.querySelector("[data-form-modal]") !== null;
};
```

## Acceptance Criteria

### Barrel Export

- ✅ **File Creation**: `apps/desktop/src/components/settings/common/index.ts` exists
- ✅ **SettingsFormModal Export**: Named export available
- ✅ **Import Path**: Can import as `import { SettingsFormModal } from '../common'`
- ✅ **TypeScript**: No type errors or import issues

### SettingsModal Updates

- ✅ **Detection Updated**: Uses `[data-form-modal]` selector instead of CSS classes
- ✅ **Functionality Preserved**: Nested dialog detection works as before
- ✅ **No Breaking Changes**: Existing behavior maintained
- ✅ **Decoupled**: No dependency on specific CSS class names

### Integration

- ✅ **Data Attribute**: SettingsFormModal sets `data-form-modal="true"`
- ✅ **Detection Works**: SettingsModal properly detects SettingsFormModal
- ✅ **Portability**: System works independent of CSS styling approaches

### Unit Testing

Write tests covering:

- ✅ **Barrel Export**: Can import SettingsFormModal from common/index
- ✅ **Detection Logic**: SettingsModal nested detection works with data attribute
- ✅ **Edge Cases**: Detection handles multiple form modals correctly
- ✅ **No False Positives**: Doesn't detect non-form modals

## Dependencies

- **Prerequisite**: T-create-settingsformmodal-base (SettingsFormModal component exists)

## Research Required

- Find current nested dialog detection implementation in SettingsModal.tsx
- Identify the specific selector or class-based logic to replace
- Understand existing detection behavior to maintain compatibility

## Out of Scope

- Migration of existing form modals to use SettingsFormModal (separate tasks)
- Changes to form modal CSS styling
- Performance optimization of detection logic

## Files to Create/Modify

- **Create**: `apps/desktop/src/components/settings/common/index.ts`
- **Modify**: `apps/desktop/src/components/settings/SettingsModal.tsx`
- Unit test updates for both files
