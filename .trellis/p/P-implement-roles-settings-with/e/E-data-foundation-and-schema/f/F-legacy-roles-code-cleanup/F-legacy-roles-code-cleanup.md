---
id: F-legacy-roles-code-cleanup
title: Legacy Roles Code Cleanup
status: open
priority: medium
parent: E-data-foundation-and-schema
prerequisites:
  - F-roles-persistence-schema-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T19:39:12.161Z
updated: 2025-08-09T19:39:12.161Z
---

# Legacy Roles Code Cleanup Feature

## Purpose and Functionality

Remove obsolete demo/placeholder roles code and clean up existing type definitions to align with the new simplified roles architecture. This feature eliminates all traces of the old localStorage-based persistence and custom vs predefined role concepts that are no longer valid.

## Key Components to Implement

### File Removal (`packages/ui-shared/src/`)

- **Delete localStorage persistence**: Remove `stores/rolesPersistence.ts` entirely
- **Delete role category utilities**: Remove all category-related utility files
- **Delete custom vs predefined utilities**: Remove distinction-based utility files
- **Clean up imports**: Update any references to deleted files

### Type Definition Updates

- **Simplify RoleViewModel**: Update existing role view model type to match new schema
- **Remove obsolete type files**: Delete types that no longer apply to simplified architecture
- **Update component prop types**: Clean up props that reference deleted concepts

## Detailed Acceptance Criteria

### File Deletion Requirements

- [ ] **localStorage Persistence Removal**: Delete `packages/ui-shared/src/stores/rolesPersistence.ts`
  - Verify no components or stores import this file
  - Update any remaining references to use new persistence patterns
  - Remove all localStorage-based persistence code

- [ ] **Role Category Utilities Removal**: Delete obsolete utility files
  - Delete `packages/ui-shared/src/utils/getRoleCategories.ts`
  - Delete `packages/ui-shared/src/utils/getRolesByCategory.ts`
  - Verify no components import these utilities
  - Remove any UI code that displays role categories

- [ ] **Custom vs Predefined Utilities Removal**: Delete distinction-based files
  - Delete `packages/ui-shared/src/utils/isPredefinedRole.ts`
  - Delete `packages/ui-shared/src/utils/isValidPredefinedRole.ts`
  - Remove any code that treats roles differently based on type
  - Update UI to treat all roles identically

### Type Definition Updates

- [ ] **RoleViewModel Simplification**: Update `packages/ui-shared/src/types/settings/RoleViewModel.ts`
  - Align with new schema structure (id, name, description, systemPrompt, timestamps)
  - Remove category, isPredefined, or other obsolete fields
  - Ensure timestamps are properly optional (nullable)
  - Maintain compatibility with existing UI components

- [ ] **Obsolete Type Files Cleanup**: Remove types that no longer apply
  - Review all role-related type files for obsolete concepts
  - Delete any types related to role categories or predefined distinctions
  - Update component prop types to remove obsolete fields
  - Ensure remaining types align with simplified architecture

### Import and Reference Updates

- [ ] **Import Statement Updates**: Fix all broken imports
  - Scan all files that imported deleted utilities
  - Update imports to use new schema types where appropriate
  - Remove imports entirely where functionality is no longer needed
  - Verify TypeScript compilation succeeds after all updates

- [ ] **Component Reference Updates**: Update components using obsolete concepts
  - Remove category-based filtering or display logic
  - Remove predefined vs custom role conditional logic
  - Simplify UI to treat all roles uniformly
  - Update prop interfaces to match simplified data model

## Implementation Guidance

### Cleanup Process

1. **Identify Dependencies**: Use TypeScript compiler and search tools to find all imports
2. **Safe Deletion**: Remove files only after updating all references
3. **Verification**: Ensure clean TypeScript compilation after each deletion
4. **Type Alignment**: Update remaining types to match new schema structure

### Files to Delete

Based on the original project specification:

```
packages/ui-shared/src/stores/rolesPersistence.ts
packages/ui-shared/src/utils/getRoleCategories.ts
packages/ui-shared/src/utils/getRolesByCategory.ts
packages/ui-shared/src/utils/isPredefinedRole.ts
packages/ui-shared/src/utils/isValidPredefinedRole.ts
```

### Files to Update

```
packages/ui-shared/src/types/settings/RoleViewModel.ts
Any component prop types that reference obsolete fields
Any UI components using deleted utilities
```

### Technical Approach

- Use ripgrep/grep to find all references to deleted files
- Update TypeScript imports systematically
- Remove obsolete fields from type definitions
- Simplify UI logic that differentiated between role types
- Maintain backward compatibility where possible during transition

## Testing Requirements

### Compilation Testing

- TypeScript compilation succeeds with no errors after all deletions
- No missing import errors or undefined type references
- All updated type definitions properly exported and consumable

### Functionality Testing

- Existing UI components render without errors (even if not fully functional)
- No runtime errors from missing utilities or types
- Type definitions align with new schema structure

## Security Considerations

### Code Removal Safety

- No sensitive data exposed in deleted files
- No security vulnerabilities introduced by removing validation code
- Proper handling of any authentication/authorization code in deleted utilities

## Performance Requirements

### Build Performance

- TypeScript compilation time not degraded by type updates
- Bundle size reduced by removing obsolete utility code
- No performance regressions from simplified type definitions

## Dependencies

- **Prerequisites**: F-roles-persistence-schema-and (new types must exist before cleaning up old ones)
- **Dependents**: F-schema-validation-integration (needs clean foundation)

## Success Metrics

- All specified obsolete files successfully deleted
- Clean TypeScript compilation with no errors or warnings
- All imports updated to remove references to deleted files
- RoleViewModel type simplified and aligned with new schema
- No dead code or commented-out sections remain
- UI components updated to remove obsolete role distinction logic
- Codebase simplified without unnecessary complexity

## Risk Mitigation

### Backup Strategy

- Create git branch before beginning deletions
- Commit incrementally after each successful deletion
- Test TypeScript compilation after each major change

### Rollback Plan

- If critical functionality breaks, restore from git backup
- Re-implement only essential functionality with new patterns
- Avoid reverting to old localStorage-based approach
