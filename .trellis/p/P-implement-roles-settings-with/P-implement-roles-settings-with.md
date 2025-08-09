---
id: P-implement-roles-settings-with
title: Implement Roles Settings with JSON File Persistence
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
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
