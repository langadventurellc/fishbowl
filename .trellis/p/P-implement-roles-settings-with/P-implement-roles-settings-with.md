---
id: P-implement-roles-settings-with
title: Implement Roles Settings with JSON File Persistence
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.edit.test.tsx:
    Created comprehensive test suite for edit mode verification with 18 test
    cases covering modal behavior, form validation, character counters, isDirty
    tracking, and edge cases; Updated mocks and tests to support enhanced change
    detection
  apps/desktop/src/components/settings/roles/CreateRoleForm.tsx:
    Enhanced change detection logic with edge case handling, field-level dirty
    state tracking, improved form reset behavior
  packages/ui-shared/src/types/settings/RoleNameInputProps.ts: Added isDirty prop for visual change indicators
  packages/ui-shared/src/types/settings/RoleDescriptionTextareaProps.ts: Added isDirty prop for visual change indicators
  packages/ui-shared/src/types/settings/RoleSystemPromptTextareaProps.ts: Added isDirty prop for visual change indicators
  apps/desktop/src/components/settings/roles/RoleNameInput.tsx: Added visual dirty state indicator with accessibility support
  apps/desktop/src/components/settings/roles/RoleDescriptionTextarea.tsx: Added visual dirty state indicator with accessibility support
  apps/desktop/src/components/settings/roles/RoleSystemPromptTextarea.tsx: Added visual dirty state indicator with accessibility support
  apps/desktop/src/components/ui/confirmation-dialog.tsx: Created new ConfirmationDialog component using shadcn/ui AlertDialog
  apps/desktop/src/hooks/useConfirmationDialog.ts: Enhanced hook for proper dialog integration with state management
  apps/desktop/src/components/settings/roles/RoleFormModal.tsx: Updated to use new ConfirmationDialog with destructive variant
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.changeDetection.test.tsx: Comprehensive test suite for enhanced change detection functionality
  apps/desktop/src/components/settings/roles/__tests__/CreateRoleForm.basic.test.tsx: Updated mocks to support new form functionality
  apps/desktop/src/components/settings/roles/RolesSection.tsx:
    Enhanced role update handling with improved change detection, optimistic
    updates, and comprehensive error handling with detailed logging
  packages/ui-shared/src/stores/useRolesStore.ts: Added enhanced logging
    throughout update operations, improved error handling, and optimized update
    logic with change detection
  apps/desktop/src/components/settings/roles/RolesList.tsx: Minor updates to
    support enhanced role editing functionality and improved integration with
    updated store
  apps/desktop/src/components/settings/roles/__tests__/RolesList.test.tsx:
    Updated test cases to reflect enhanced role editing functionality and
    improved error handling scenarios
  apps/desktop/src/components/settings/roles/RoleListItem.tsx:
    Enhanced Card container styling with improved borders, shadows, hover
    states, and focus-within rings; improved typography with font-semibold and
    better spacing; enhanced button styling with opacity transitions, refined
    focus rings, and loading state visual feedback with Loader2 spinning icons;
    added sophisticated hover interactions with group states
  apps/desktop/src/components/settings/roles/__tests__/RoleListItem.test.tsx:
    "Updated test assertions to match enhanced styling: changed font-medium to
    font-semibold, updated hover shadow expectations from shadow-sm to
    shadow-md, adjusted delete button color expectations to
    text-muted-foreground, and corrected description truncation expectations for
    increased 120-character limit"
log:
  - >-
    ## General-purpose validation utilities consolidated
    (T-consolidate-general-purpose completed)


    The following validation utility files have been moved from scattered
    locations to a centralized validation folder:


    ### Moved Files (Old → New Location):


    **Timestamp/Date Validation:**

    - `packages/shared/src/services/storage/utils/roles/isValidTimestamp.ts` →
    `packages/shared/src/validation/isValidTimestamp.ts`


    **JSON Utilities:**

    - `packages/shared/src/services/storage/utils/isJsonSerializable.ts` →
    `packages/shared/src/validation/isJsonSerializable.ts`

    - `packages/shared/src/services/storage/utils/safeJsonStringify.ts` →
    `packages/shared/src/validation/safeJsonStringify.ts`

    - `packages/shared/src/services/storage/utils/safeJsonParse.ts` →
    `packages/shared/src/validation/safeJsonParse.ts`

    - `packages/shared/src/services/storage/utils/isValidJson.ts` →
    `packages/shared/src/validation/isValidJson.ts`


    **Schema/Version Validation:**

    - `packages/shared/src/services/storage/utils/isValidSchemaVersion.ts` →
    `packages/shared/src/validation/isValidSchemaVersion.ts`

    - `packages/shared/src/services/storage/utils/parseSchemaVersion.ts` →
    `packages/shared/src/validation/parseSchemaVersion.ts`

    - `packages/shared/src/services/storage/utils/validateWithSchema.ts` →
    `packages/shared/src/validation/validateWithSchema.ts`


    **Path/Security Utilities:**

    - `packages/shared/src/services/storage/utils/validatePath.ts` →
    `packages/shared/src/validation/validatePath.ts`

    - `packages/shared/src/services/storage/utils/isPathSafe.ts` →
    `packages/shared/src/validation/isPathSafe.ts`

    - `packages/shared/src/services/storage/utils/sanitizePath.ts` →
    `packages/shared/src/validation/sanitizePath.ts`


    **Object Utilities:**

    - `packages/shared/src/services/storage/utils/deepMerge.ts` →
    `packages/shared/src/validation/deepMerge.ts`


    **Error Handling/Formatting:**

    - `packages/shared/src/types/llmConfig/sanitizeValue.ts` →
    `packages/shared/src/validation/sanitizeValue.ts`

    - `packages/shared/src/types/llmConfig/groupErrorsByField.ts` →
    `packages/shared/src/validation/groupErrorsByField.ts`

    - `packages/shared/src/types/llmConfig/formatZodErrors.ts` →
    `packages/shared/src/validation/formatZodErrors.ts`


    **Validation Types:**

    - `packages/shared/src/types/validation/ValidationResult.ts` →
    `packages/shared/src/validation/ValidationResult.ts`


    ### Created Files:

    - `packages/shared/src/validation/index.ts` - Barrel exports for all
    validation utilities


    ### Impact:

    - All import references updated throughout codebase

    - Improved discoverability of general-purpose validation utilities

    - Centralized location makes code maintenance easier

    - All quality checks pass (lint, format, type-check, tests)
schema: v1.0
childrenIds:
  - E-data-foundation-and-schema
  - E-desktop-integration-and
  - E-file-persistence-and-state
  - E-settings-ui-components-and
created: 2025-08-09T19:26:30.039Z
updated: 2025-08-09T19:26:30.039Z
---

# Implement Roles Settings with JSON File Persistence

## Executive Summary

Implement functional roles management for the Fishbowl application by creating a simple, file-based persistence system that follows established patterns from the existing settings architecture. Replace the current demo/placeholder roles code with a production-ready implementation that stores roles in a JSON file in the user data folder.

## Project Context

This is a **greenfield implementation** for a non-functional app. The existing roles-related code was created purely for UI/UX demonstration and should be replaced or removed entirely. The implementation must follow the established patterns used by general settings and preferences.json.

## Functional Requirements

### Core Functionality

- **Create roles**: Users can create new roles through the settings UI
- **Edit roles**: Users can modify existing roles (name, description, system prompt)
- **Delete roles**: Users can remove roles they no longer need
- **Persist roles**: All changes automatically save to `roles.json` in user data folder
- **Load roles**: Application loads roles from file on startup and displays in settings UI

### Role Data Structure

Each role contains:

- `id`: Unique string identifier (required)
- `name`: Display name, 1-100 characters (required)
- `description`: Role description, max 500 characters (required)
- `systemPrompt`: AI instructions, 1-5000 characters (required)
- `createdAt`: ISO datetime string (optional - can be null for direct JSON edits)
- `updatedAt`: ISO datetime string (optional - can be null for direct JSON edits)

### User Experience

- Roles section integrated into existing settings modal
- Consistent UI patterns with other settings sections
- Form validation with helpful error messages
- Roles list with create/edit/delete actions
- Changes save automatically (no manual save button needed)

## Technical Requirements

### Architecture Principles

- **Follow existing patterns**: Mirror the implementation of general settings and preferences.json exactly
- **Clean separation**: Desktop-specific code in `apps/desktop`, shared business logic in `packages/shared`, UI-shared types/stores in `packages/ui-shared`
- **File-based persistence**: Store in `roles.json` in user data folder using existing FileStorageService
- **Schema validation**: Use Zod schemas for data validation and type safety
- **No localStorage**: Use proper file-based persistence for Electron compatibility

### Technical Stack

- **Persistence**: JSON file in user data directory via FileStorageService
- **Validation**: Zod schemas with proper error handling
- **State Management**: Zustand store following existing settings patterns
- **IPC Communication**: Use existing settings IPC channels where appropriate
- **Type Safety**: Full TypeScript coverage with proper type definitions

### Code Organization

```
packages/shared/src/
├── types/settings/rolesSettingsSchema.ts          # Zod schema for persistence
├── types/settings/createDefaultRolesSettings.ts   # Default empty roles config
└── services/FileStorageService.ts                 # Existing service (reuse)

packages/ui-shared/src/
├── types/settings/RoleViewModel.ts                # UI role interface (clean up existing)
├── stores/rolesStore.ts                          # Update to use file persistence
├── mapping/settings/                             # UI ↔ persistence mapping
│   ├── mapRolesSettingsPersistenceToUI.ts
│   └── mapRolesSettingsUIToPersistence.ts
└── schemas/roleSchema.ts                         # UI validation schema (clean up existing)

apps/desktop/src/
├── services/settings/SettingsRepository.ts       # Existing service (extend for roles)
└── components/settings/roles/                    # UI components (clean up existing)
    ├── RolesSection.tsx
    ├── RoleForm.tsx
    └── RolesList.tsx
```

## Implementation Strategy

### Phase 1: Foundation

1. **Create persistence schema** (`packages/shared`)
   - Define Zod schema for roles.json structure
   - Create default empty roles configuration
   - Add roles to master settings schema if needed, or keep as separate file

2. **Clean up existing code**
   - Remove localStorage-based rolesPersistence.ts
   - Remove role categories utilities (getRoleCategories.ts, etc.)
   - Remove custom vs predefined role concepts
   - Clean up existing type definitions to match new simple structure

### Phase 2: Core Implementation

3. **Create mapping layer** (`packages/ui-shared`)
   - Functions to convert between UI models and persisted data
   - Handle null timestamps gracefully for direct JSON edits

4. **Update roles store** (`packages/ui-shared`)
   - Replace localStorage persistence with file-based system
   - Implement proper error handling and loading states
   - Follow patterns from other settings stores

### Phase 3: Integration

5. **Extend settings service** (`apps/desktop`)
   - Add roles.json file operations to existing settings infrastructure
   - Use existing FileStorageService for consistent file operations

6. **Update UI components** (`apps/desktop`)
   - Clean up existing roles settings UI
   - Ensure consistent styling and behavior with other settings sections
   - Implement proper form validation and error states

## Data Storage Specifications

### File Location

- **Path**: `app.getPath("userData")/roles.json`
- **Format**: JSON with proper indentation for readability
- **Encoding**: UTF-8

### File Structure

```json
{
  "schemaVersion": "1.0.0",
  "roles": [
    {
      "id": "unique-id-1",
      "name": "Project Manager",
      "description": "Focuses on timelines and coordination",
      "systemPrompt": "You are a project manager...",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "lastUpdated": "2025-01-15T10:30:00.000Z"
}
```

### Initial Data

The application will ship with a `roles.json` file containing a few example roles to demonstrate the feature. These are just regular roles - no special handling or distinction from user-created roles.

## Acceptance Criteria

### Functional Acceptance Criteria

- [ ] **Role Creation**: User can create new roles through settings UI with all required fields
- [ ] **Role Editing**: User can modify existing roles and changes persist immediately
- [ ] **Role Deletion**: User can delete roles with confirmation dialog
- [ ] **Data Persistence**: All role changes save to `roles.json` in user data folder
- [ ] **Application Restart**: Roles load correctly when application restarts
- [ ] **Form Validation**: All role fields validate according to schema constraints
- [ ] **Error Handling**: Clear error messages for validation failures and file operation errors

### Technical Acceptance Criteria

- [ ] **No localStorage**: Roles store uses file-based persistence only
- [ ] **Schema Validation**: All role data validates against Zod schemas
- [ ] **Type Safety**: Full TypeScript coverage with no `any` types
- [ ] **Clean Architecture**: Clear separation between shared, UI-shared, and desktop-specific code
- [ ] **Consistent Patterns**: Implementation follows existing settings patterns exactly
- [ ] **Direct JSON Edit Support**: Application handles manually edited JSON files gracefully
- [ ] **File Error Handling**: Proper error handling for file read/write operations

### UI/UX Acceptance Criteria

- [ ] **Settings Integration**: Roles section appears in settings modal with consistent styling
- [ ] **Responsive Design**: UI works properly at different window sizes
- [ ] **Form UX**: Create/edit forms provide good user experience with proper validation feedback
- [ ] **Loading States**: Appropriate loading indicators during role operations
- [ ] **Empty States**: Helpful messaging when no roles exist

## Security and Data Integrity

### File Security

- Use existing FileStorageService security patterns
- Validate all data through Zod schemas before persistence
- Handle file permission errors gracefully

### Data Validation

- All role fields must pass schema validation before saving
- Sanitize user input to prevent injection attacks in system prompts
- Gracefully handle corrupted or invalid JSON files

## Performance Requirements

### File Operations

- Role loading should complete within 100ms for typical file sizes
- Role saving should be non-blocking with proper error feedback
- Support up to 100 roles without performance degradation

### Memory Usage

- Keep role data in memory during application session
- No unnecessary re-loading of role data
- Efficient updates to prevent full file rewrites when possible

## Future Considerations

This implementation intentionally keeps things simple for the initial release. Future enhancements might include:

- Role import/export functionality
- Role usage analytics
- Role templates or sharing
- Advanced role validation rules

However, these are explicitly **not** part of this project to maintain simplicity and avoid over-engineering.

## Success Metrics

- Users can successfully create, edit, and delete roles through the settings UI
- All role data persists correctly across application restarts
- No crashes or data corruption when users manually edit roles.json
- Settings UI performance remains consistent with other settings sections
- Code follows established architecture patterns with proper separation of concerns
