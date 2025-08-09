---
id: T-update-all-component-imports
title: Update all component imports and remove references to deleted utilities
status: open
priority: high
parent: F-legacy-roles-code-cleanup
prerequisites:
  - T-remove-role-category
  - T-remove-custom-vs-predefined
  - T-update-roleviewmodel-and
affectedFiles: {}
log:
  - 📋 **Dependency Analysis Complete** - Comprehensive dependency analysis has
    been completed for all legacy roles files. See `dependency-map-analysis.md`
    for detailed mapping of imports, impact assessment, and safe deletion
    strategy. Analysis shows NO external component imports found - only barrel
    exports need updating (specific lines documented).
schema: v1.0
childrenIds: []
created: 2025-08-09T21:55:50.493Z
updated: 2025-08-09T21:55:50.493Z
---

# Task: Update All Component Imports and Remove References to Deleted Utilities

## Context

After deleting legacy role utilities, all components that imported or used these utilities need to be updated. This includes removing imports, updating logic that relied on role categories or type distinctions, and ensuring components work with the simplified role model.

## Components to Update

Based on dependency analysis, update any components that:

- Import deleted utilities (getRoleCategories, getRolesByCategory, isPredefinedRole, isValidPredefinedRole)
- Reference rolesPersistence
- Use role categories for filtering or display
- Differentiate between custom and predefined roles

## Implementation Steps

1. **Search and Remove Broken Imports**

   ```bash
   # Find all files with broken imports
   rg "import.*getRoleCategories|getRolesByCategory|isPredefinedRole|isValidPredefinedRole|rolesPersistence"
   ```

   - Remove or comment out these import statements
   - Update TypeScript imports in affected files

2. **Update UI Components**
   - Remove category filter dropdowns or selectors
   - Remove "predefined" or "custom" role badges/labels
   - Simplify role lists to show all roles uniformly
   - Update any conditional rendering based on role type

3. **Update Role Management Logic**
   - Remove code that filters roles by category
   - Remove validation that checks if role is predefined
   - Update edit permissions (all roles should be editable)
   - Remove special handling for system/built-in roles

4. **Fix Component Props**
   - Update component prop interfaces that expect category or type fields
   - Remove props related to role filtering by type
   - Ensure props align with new RoleViewModel structure

5. **Update State Management**
   - Remove any local state for categories or role types
   - Update selectors that filter by role properties
   - Simplify role selection logic

6. **Write Unit Tests**
   - Test that components render without category filters
   - Verify all roles are displayed uniformly
   - Test that role CRUD operations work without type checking
   - Ensure no runtime errors from missing utilities

## Acceptance Criteria

- [ ] All broken imports removed or updated
- [ ] No references to deleted utilities remain
- [ ] UI components no longer show role categories
- [ ] No distinction between role types in UI
- [ ] All roles treated uniformly in components
- [ ] Component props updated to match new model
- [ ] TypeScript compilation succeeds
- [ ] No runtime errors in development mode
- [ ] Unit tests pass for updated components

## Technical Approach

```typescript
// Before: Component with role categories
const RoleList = () => {
  const categories = getRoleCategories(); // Remove
  const predefinedRoles = getRolesByCategory('system'); // Remove

  return (
    <div>
      {isPredefinedRole(role.id) && <Badge>System</Badge>} // Remove
    </div>
  );
};

// After: Simplified component
const RoleList = () => {
  const roles = useRolesStore(state => state.roles);

  return (
    <div>
      {roles.map(role => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  );
};
```

## Testing Requirements

- Manual testing of role management UI
- Verify role creation, editing, and deletion work
- Check that all roles appear in lists without filtering
- Run component tests: `pnpm test`
- Run type checking: `pnpm type-check`
- Run quality checks: `pnpm quality`

## Files Likely to Need Updates

- Role list components
- Role creation/edit forms
- Role selection dropdowns
- Any component importing from utils folder
- Store selectors using deleted utilities

## Dependencies

- Prerequisites: All deletion tasks complete to know what needs updating

## Notes

- Focus on simplification - remove complexity around role types
- All roles should have the same capabilities and UI treatment
- This is a cleanup task - don't add new features

## Estimated Time

2 hours - Requires finding and updating multiple components across the codebase
