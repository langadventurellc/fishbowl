---
id: T-clean-up-unused-imports-and
title: Clean up unused imports and dead code
status: done
priority: low
parent: F-legacy-code-cleanup-and
prerequisites:
  - T-remove-localstorage-usage
  - T-remove-draft-saving-logic-and
  - T-remove-tab-navigation-system
affectedFiles:
  packages/eslint-config/index.js: Updated TypeScript ESLint configuration to
    allow underscore variables for intentionally unused destructured variables
  packages/shared/src/services/storage/utils/personalities/__tests__/validatePersonalitiesData.test.ts: Removed ESLint disable comments in favor of proper configuration
  packages/ui-shared/src/types/settings/InteractiveTabsProps.ts: Removed unused type definition (no references found)
  packages/ui-shared/src/types/settings/TabSectionConfiguration.ts: Removed unused type definition (no references found)
  packages/ui-shared/src/types/settings/PersonalitiesSectionProps.ts: Removed empty interface that was no longer needed
  packages/ui-shared/src/types/settings/index.ts: Updated exports to remove references to deleted type definitions
  apps/desktop/src/components/settings/personalities/PersonalitiesSection.tsx: Removed unused import and simplified component type annotation
log:
  - >-
    Successfully completed comprehensive cleanup of unused imports, dead code,
    and obsolete type definitions after localStorage, draft saving, and tab
    navigation system removal. Key accomplishments:


    1. **Fixed Linting Issues**: Updated ESLint configuration to allow
    underscore variables for intentionally unused destructured variables in
    tests, resolving all unused variable warnings.


    2. **Removed Unused Type Definitions**: Eliminated obsolete interfaces from
    removed features:
       - InteractiveTabsProps (no references found)
       - TabSectionConfiguration (no references found) 
       - PersonalitiesSectionProps (empty interface, no longer needed)

    3. **Updated Export Files**: Cleaned up index.ts files to remove exports for
    deleted type definitions.


    4. **Verified Legitimate Code**: Confirmed that remaining "tab-related" code
    like SavedPersonalitiesTab is actually legitimate functionality for
    displaying saved personalities, not part of the removed tab navigation
    system. Similarly confirmed useUnsavedChanges is proper form state
    management, not part of the removed draft saving system.


    5. **Quality Assurance**: All linting, formatting, and type checks now pass.
    Build system works correctly after cleaning turbo cache.


    The codebase is now clean of unused imports, dead code paths, and obsolete
    type definitions while preserving all legitimate functionality. No
    localStorage references, removed draft logic, or defunct tab navigation code
    remains.
schema: v1.0
childrenIds: []
created: 2025-08-15T18:10:33.281Z
updated: 2025-08-15T18:10:33.281Z
---

# Clean Up Unused Imports and Dead Code

## Context

Perform final cleanup of unused imports, dead code paths, and obsolete type definitions that remain after removing localStorage, draft saving, and tab navigation systems. Ensure codebase is clean and follows project quality standards.

## Implementation Requirements

### Code Quality Cleanup

1. **Unused Imports**:
   - Remove imports that are no longer used after cleanup
   - Clean up React hooks that were only used for removed features
   - Remove utility function imports that no longer exist
   - Remove type imports for removed interfaces

2. **Dead Code Paths**:
   - Remove conditional logic that will never execute
   - Remove functions that are no longer called
   - Remove utility functions only used by removed features
   - Remove unused constants and enums

3. **Type Definitions**:
   - Remove interfaces for removed features (tabs, drafts, localStorage)
   - Remove type exports that are no longer needed
   - Clean up union types that included removed options
   - Remove unused generic type parameters

4. **Component Props**:
   - Remove props that are no longer passed or used
   - Simplify component interfaces after feature removal
   - Remove optional props that are never provided
   - Clean up prop destructuring for removed props

### Automated Cleanup Tools

Use project linting and TypeScript to identify issues:

- Run ESLint to catch unused variables and imports
- Use TypeScript compiler to identify unreferenced code
- Use IDE "find unused" features to locate dead code
- Run format/lint commands to clean up code style

### Files to Review

```
apps/desktop/src/components/settings/personalities/
├── All personality components    # Remove unused imports/props
└── Index files                  # Update exports

packages/ui-shared/src/
├── types/personalities/         # Remove unused type definitions
├── hooks/                       # Remove unused custom hooks
├── utils/                       # Remove unused utility functions
└── stores/                      # Clean up unused store properties
```

## Acceptance Criteria

- [ ] No unused imports remain in personality-related files
- [ ] No unreferenced functions or utilities exist
- [ ] No unused type definitions or interfaces remain
- [ ] No dead code paths exist (unreachable conditions)
- [ ] All component props are used or removed
- [ ] ESLint passes without unused variable warnings
- [ ] TypeScript compilation succeeds without unused code warnings
- [ ] No TODO comments related to removed features remain
- [ ] Code formatting follows project standards
- [ ] All remaining code follows current patterns

### Verification Commands

- `pnpm lint` - Should pass without unused variable warnings
- `pnpm type-check` - Should pass without unreferenced code warnings
- `pnpm quality` - Should pass all quality checks

## Testing Requirements (include in this task)

- Test that application builds and runs successfully
- Test that removed imports don't break existing functionality
- Test that simplified components still work correctly
- Verify no runtime errors from cleaned up code
- Run full test suite to ensure no regressions

## Code Quality Improvements

- Consistent formatting after cleanup
- Simplified component interfaces
- Cleaner import statements
- Removed outdated comments and documentation
- Updated JSDoc comments where necessary

## Documentation Updates

- Remove any inline comments referencing removed features
- Update component documentation to reflect simplified interfaces
- Remove outdated TODO comments
- Update README or documentation files if they reference removed features

## Performance Benefits

- Reduced bundle size from removed code
- Faster TypeScript compilation
- Cleaner development experience
- Improved code maintainability

## Breaking Changes Summary

Document final summary of all breaking changes made during cleanup:

- List all removed components, hooks, and utilities
- Note all interface changes and removed props
- Provide migration guide for any external dependencies
- Document any API changes that affect other features

## Dependencies

- Requires all other cleanup tasks to be completed first
- Should be done after major removals to catch all unused code
- Final step in the cleanup process
