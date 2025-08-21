---
id: T-fix-dependency-issues
title: Fix dependency issues identified by Knip analysis
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T18:08:02.939Z
updated: 2025-08-21T18:08:02.939Z
---

# Fix Dependency Issues - Knip Cleanup

## Context

Knip analysis identified several dependency issues: unused devDependencies that can be removed and one missing dependency that needs to be properly declared.

## Implementation Requirements

### Remove Unused devDependencies (3 items)

**Root package.json:**

- Remove `@langadventurellc/tsla-linter` from devDependencies (line 61)
  - Not used in any eslint config or scripts

**packages/shared/package.json:**

- Remove `@testing-library/jest-dom` from devDependencies (line 29)
  - Not imported anywhere in the shared package

**packages/ui-theme/package.json:**

- Remove `tailwindcss` from devDependencies (line 27)
  - Theme package doesn't directly use tailwind

### Add Missing Dependency (1 item)

**packages/ui-shared/package.json:**

- Add `@testing-library/jest-dom` to devDependencies
  - Currently imported in `packages/ui-shared/src/__tests__/setup.ts` but not declared
  - Use version `^15.0.6` to match other testing-library versions

### Dependencies to Keep (False Positives)

**Do NOT remove these from packages/eslint-config/package.json:**

- `eslint-plugin-react` - Used in `react.js` config
- `eslint-plugin-react-hooks` - Used in `react.js` config
- `globals` - Used in `react.js` config

These were flagged as unused but are actually required by the eslint config.

## Technical Approach

1. **Update package.json files**: Make the dependency changes listed above
2. **Clean install**: Run `pnpm install` to update lock files
3. **Verify functionality**: Ensure eslint configs still work and tests pass
4. **Run quality checks**: Verify all linting and type checking still works

## Acceptance Criteria

- [ ] 3 unused devDependencies removed from respective package.json files
- [ ] `@testing-library/jest-dom` added to ui-shared devDependencies
- [ ] `pnpm install` completes successfully with updated lock files
- [ ] All quality checks pass (`pnpm quality`)
- [ ] ESLint configurations still work properly
- [ ] Tests in ui-shared package still pass
- [ ] No dependency warnings or errors in build outputs

## Verification Steps

1. Run `pnpm install` after package.json changes
2. Run `pnpm quality` to verify linting and type checking
3. Run `pnpm test` to verify ui-shared tests still work
4. Check that eslint configs are functional by running lint commands
5. Verify no unused dependency warnings remain

## Security Considerations

- Ensure removed dependencies weren't providing any security scanning or validation
- Verify the added @testing-library/jest-dom dependency is from trusted source
