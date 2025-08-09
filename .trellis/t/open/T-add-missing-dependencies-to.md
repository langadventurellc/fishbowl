---
id: T-add-missing-dependencies-to
title: Add missing dependencies to package.json files
status: open
priority: medium
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T17:03:20.689Z
updated: 2025-08-09T17:03:20.689Z
---

# Add Missing Dependencies to Package.json Files

## Context

Knip analysis identified 6 unlisted dependencies that are being used in the codebase but not properly declared in package.json files, which can cause build issues and dependency resolution problems.

## Specific Implementation Requirements

Add the following missing dependencies to appropriate package.json files:

- `globals` - Add to `apps/desktop/package.json` (referenced in `…desktop/eslint.config.cjs`)
- `expo-updates` - Add to `apps/mobile/package.json` (referenced in `apps/mobile/app.json`)
- `expo-system-ui` - Add to `apps/mobile/package.json` (referenced in `apps/mobile/app.json`)
- `@expo/metro-config` - Add to `apps/mobile/package.json` (referenced in `…ps/mobile/metro.config.js`)
- `@fishbowl-ai/eslint-config` - Add to root `package.json` (referenced in `eslint.config.cjs`)
- `@testing-library/jest-dom` - Add to `packages/shared/package.json` (referenced in `…ed/src/__tests__/setup.ts`)

## Technical Approach

1. Examine each file that references the missing dependency to understand usage context
2. Determine the appropriate version for each missing dependency
3. Add dependencies to correct package.json files based on where they're used
4. Distinguish between dependencies and devDependencies based on usage
5. Run `pnpm install` to install and update lockfiles
6. Verify that all imports resolve correctly

## Detailed Acceptance Criteria

- All 6 missing dependencies properly added to appropriate package.json files
- Dependencies categorized correctly as dependencies vs devDependencies
- All imports resolve without errors
- Build processes work without dependency warnings
- No version conflicts introduced with existing dependencies
- Lockfiles updated with new dependency versions

## Security Considerations

- Use latest stable versions of missing dependencies
- Check for any security vulnerabilities in added dependencies
- Ensure added dependencies don't introduce transitive security issues

## Testing Requirements

- Run full build: `pnpm build:libs`
- Verify linting works: `pnpm lint`
- Run type checking: `pnpm type-check`
- Test mobile app configuration loads properly
- Verify desktop ESLint configuration works
- Run unit tests to ensure jest-dom functionality works

## Dependencies

None - this task can be completed independently.
