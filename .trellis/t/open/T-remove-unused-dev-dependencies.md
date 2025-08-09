---
id: T-remove-unused-dev-dependencies
title: Remove unused dev dependencies from package.json files
status: open
priority: high
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T17:02:54.965Z
updated: 2025-08-09T17:02:54.965Z
---

# Remove Unused Dev Dependencies from Package.json Files

## Context

Knip analysis identified 8 unused dev dependencies that are not being used in development workflows and can be safely removed to clean up package.json files.

## Specific Implementation Requirements

Remove the following unused dev dependencies:

- `@electron/rebuild` from `apps/desktop/package.json:64:6`
- `tailwindcss` from `apps/desktop/package.json:82:6`
- `tw-animate-css` from `apps/desktop/package.json:84:6`
- `@babel/core` from `apps/mobile/package.json:68:6`
- `@react-native-community/cli` from `apps/mobile/package.json:70:6`
- `babel-jest` from `apps/mobile/package.json:74:6`
- `@testing-library/react` from `packages/shared/package.json:29:6`
- `tailwindcss` from `packages/ui-theme/package.json:27:6`

## Technical Approach

1. Edit each package.json file to remove the specified unused dev dependencies
2. Run `pnpm install` to update lockfiles
3. Verify development workflows still function (lint, format, type-check, test)
4. Check that build processes remain unaffected

## Detailed Acceptance Criteria

- All 8 unused dev dependencies removed from their respective package.json files
- Development lockfiles updated correctly
- All development commands continue to work: `pnpm lint`, `pnpm format`, `pnpm type-check`
- Build processes unaffected by dev dependency removal
- Testing workflows continue to function properly
- No warnings about missing dev dependencies during builds

## Security Considerations

- Verify removed dev dependencies aren't required for security scanning tools
- Ensure no development security tools are inadvertently removed

## Testing Requirements

- Run quality checks: `pnpm quality`
- Verify linting works: `pnpm lint`
- Confirm formatting works: `pnpm format`
- Test TypeScript compilation: `pnpm type-check`
- Run unit tests: `pnpm test`

## Dependencies

None - this task can be completed independently.
