---
kind: task
id: T-run-comprehensive-testing-and
title: Run comprehensive testing and validation
status: open
priority: high
prerequisites:
  - T-update-build-scripts-and
created: "2025-07-30T16:32:35.507493"
updated: "2025-07-30T16:32:35.507493"
schema_version: "1.1"
---

## Objective

Perform comprehensive testing and validation to ensure the package split is successful and all functionality remains intact.

## Context

After splitting the packages and updating all imports, thorough testing is needed to verify that no functionality was broken and the new architecture works correctly.

## Implementation Requirements

1. Run full build and test suite for entire monorepo
2. Verify desktop app functionality
3. Check for any remaining broken imports or dependencies
4. Validate package separation is working correctly

## Testing Approach

1. **Clean Build Test:**
   - Clean all build artifacts: `pnpm clean`
   - Rebuild everything: `pnpm build`
   - Verify no build errors

2. **Quality Checks:**
   - Run linting: `pnpm lint`
   - Run type checking: `pnpm type-check`
   - Run formatting: `pnpm format`

3. **Unit Test Suite:**
   - Run all tests: `pnpm test`
   - Verify tests pass in both packages
   - Check test coverage remains adequate

4. **Desktop App Testing:**
   - Build desktop app: `pnpm build:desktop`
   - Run desktop tests: `pnpm test` in desktop directory
   - Manual smoke test of key functionality

5. **Dependency Validation:**
   - Verify no circular dependencies
   - Check that shared package has no UI dependencies
   - Confirm ui-shared properly imports from shared

## Key Areas to Validate

- Settings modal functionality
- Component rendering
- Store state management
- Form validation
- Type checking
- Build performance

## Acceptance Criteria

- [ ] Full monorepo builds without errors
- [ ] All quality checks pass (lint, type-check, format)
- [ ] All unit tests pass in both packages
- [ ] Desktop app builds and runs correctly
- [ ] No circular dependencies detected
- [ ] Shared package is truly UI-agnostic
- [ ] UI-shared package properly extends shared functionality
- [ ] Performance is comparable to pre-split

## Success Metrics

- Build times are reasonable (not significantly slower)
- All existing tests continue to pass
- No runtime errors in desktop app
- Clean separation between UI and business concerns

## Testing Requirements

- Run complete test suite multiple times
- Test both development and production builds
- Verify hot reload works in development
- Check that all imports resolve correctly

### Log
