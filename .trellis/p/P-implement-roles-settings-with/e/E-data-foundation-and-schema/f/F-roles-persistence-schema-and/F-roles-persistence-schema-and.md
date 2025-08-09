---
id: F-roles-persistence-schema-and
title: Roles Persistence Schema and Types
status: open
priority: medium
parent: E-data-foundation-and-schema
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T19:38:39.580Z
updated: 2025-08-09T19:38:39.580Z
---

# Roles Persistence Schema and Types Feature

## Purpose and Functionality

Create the foundational Zod schema and TypeScript types for roles persistence in the `packages/shared` package. This feature establishes the core data validation and type definitions that all other components will rely on for type safety and data integrity.

## Key Components to Implement

### Schema Definition (`packages/shared/src/types/settings/`)

- **rolesSettingsSchema.ts**: Complete Zod schema for roles.json file structure
- **createDefaultRolesSettings.ts**: Factory function for empty/default configuration
- **TypeScript exports**: Exported types for consumption by other packages

### Schema Features

- **Field Validation**: All role field constraints (name 1-100 chars, description max 500, systemPrompt 1-5000)
- **Optional Timestamps**: Handle null createdAt/updatedAt for direct JSON edits
- **Schema Versioning**: Include version field for future schema migrations
- **Error Messages**: Meaningful validation error messages for debugging

## Detailed Acceptance Criteria

### Schema Validation Requirements

- [ ] **Role Field Validation**: Individual role schema validates all fields with proper constraints
  - `id`: Required string with minimum length 1
  - `name`: Required string, 1-100 characters
  - `description`: Required string, maximum 500 characters
  - `systemPrompt`: Required string, 1-5000 characters
  - `createdAt`: Optional ISO datetime string (nullable)
  - `updatedAt`: Optional ISO datetime string (nullable)

- [ ] **File Schema Validation**: Complete roles.json file schema validates structure
  - `schemaVersion`: Required string for version tracking
  - `roles`: Array of role objects, defaults to empty array
  - `lastUpdated`: Required ISO datetime string with current time default

- [ ] **Validation Error Messages**: Schema provides clear, actionable error messages
  - Field-specific errors indicate which constraint was violated
  - Character limit violations include current and maximum counts
  - Missing required fields clearly identified

### Type Definition Requirements

- [ ] **TypeScript Type Exports**: All schemas export corresponding TypeScript types
  - `PersistedRoleData` type from individual role schema
  - `PersistedRolesSettingsData` type from complete file schema
  - Types available for import by other packages

- [ ] **Type Safety**: All exported types have full TypeScript coverage
  - No `any` types in schema definitions
  - Proper inference from Zod schemas
  - Types compatible with existing settings patterns

### Default Configuration Requirements

- [ ] **Default Factory Function**: `createDefaultRolesSettings()` produces valid configuration
  - Returns empty roles array
  - Includes current schema version
  - Sets lastUpdated to current timestamp
  - Validates successfully against schema

- [ ] **Schema Versioning**: Version management implemented for future compatibility
  - Current version clearly defined and exported
  - Schema includes version field for migration support
  - Version validation integrated into main schema

## Implementation Guidance

### File Structure

```
packages/shared/src/types/settings/
├── rolesSettingsSchema.ts          # Main Zod schemas
├── createDefaultRolesSettings.ts   # Default factory
└── index.ts                        # Barrel exports
```

### Technical Approach

- Follow exact patterns from existing settings schemas (general, appearance, advanced)
- Use Zod's `.default()` method for field defaults
- Implement proper error message customization with `.refine()` where needed
- Export both schemas and inferred types from each file
- Use consistent naming conventions with existing settings

### Integration Requirements

- Schema must validate roles.json files created by desktop persistence layer
- Types must be consumable by ui-shared mapping functions
- Validation must work with both programmatic and direct JSON file edits
- Error handling must integrate with existing application error patterns

## Testing Requirements

### Schema Validation Testing

- Valid role data passes validation successfully
- Invalid role data produces appropriate error messages
- Edge cases (empty strings, null values, character limits) handled correctly
- Default configuration factory produces schema-valid output

### Type Safety Testing

- TypeScript compilation succeeds with exported types
- Types are properly inferred from Zod schemas
- No type errors when importing in other packages
- Full type coverage verification

## Security Considerations

### Input Validation

- All string fields have maximum length limits to prevent DoS attacks
- No arbitrary code execution possible through schema validation
- Proper handling of special characters in role names and descriptions
- System prompt field accepts necessary characters without security risks

### Data Sanitization

- Role names sanitized to prevent injection in UI contexts
- System prompts validated for reasonable length without content restrictions
- Schema prevents malformed JSON from causing application crashes

## Performance Requirements

### Validation Performance

- Schema validation completes in <10ms for typical role data (1-20 roles)
- Type definitions don't significantly impact bundle size
- Validation errors generate quickly without performance degradation

### Memory Usage

- Schema objects don't consume excessive memory when instantiated
- Type definitions compiled efficiently without bloating output
- Validation doesn't create memory leaks during repeated operations

## Dependencies

- **Prerequisites**: None - this is the foundational feature
- **Dependents**: All other features in this epic and subsequent epics

## Success Metrics

- Clean TypeScript compilation with no type errors
- Schema validation catches all invalid role configurations with helpful messages
- Default configuration factory produces valid empty structure
- All exported types available for use by dependent packages
- Schema follows existing settings patterns exactly
- Performance benchmarks met for validation speed
