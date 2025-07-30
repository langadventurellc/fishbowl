---
kind: task
id: T-remove-ui-theme-dependency-from
title: Remove ui-theme dependency from shared package
status: open
priority: normal
prerequisites:
  - T-move-ui-specific-schemas-and
created: "2025-07-30T16:31:49.812648"
updated: "2025-07-30T16:31:49.812648"
schema_version: "1.1"
---

## Objective

Remove the ui-theme dependency from the shared package to ensure business logic is completely independent of UI concerns.

## Context

The current shared package has `@fishbowl-ai/ui-theme` as a dependency, which violates the principle that business logic should be UI-agnostic. After moving UI-related code to ui-shared, this dependency should be removed.

## Implementation Requirements

1. Identify any remaining theme-related code in shared package
2. Move theme-related code to ui-shared if necessary
3. Remove ui-theme dependency from shared package.json
4. Verify shared package builds without ui-theme dependency

## Technical Approach

1. Search shared package for any imports from `@fishbowl-ai/ui-theme`
2. If theme-related code is found:
   - Move it to ui-shared package
   - Update imports in ui-shared
3. Remove `@fishbowl-ai/ui-theme` from shared package.json dependencies
4. Run build and tests to ensure no broken dependencies
5. Verify shared package is now UI-agnostic

## Areas to Check

- Constants that might reference theme values
- Types that might extend theme interfaces
- Utilities that might use theme functions
- Any remaining UI-related code

## Acceptance Criteria

- [ ] No imports from @fishbowl-ai/ui-theme remain in shared package
- [ ] @fishbowl-ai/ui-theme removed from shared package.json dependencies
- [ ] Any theme-related code moved to ui-shared package
- [ ] Shared package builds successfully without ui-theme dependency
- [ ] Shared package passes all tests
- [ ] Business logic is completely UI-agnostic

## Testing Requirements

- Build shared package without ui-theme dependency
- Run all shared package tests
- Verify no theme-related imports remain
- Confirm business logic functions independently

### Log
