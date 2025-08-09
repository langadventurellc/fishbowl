---
id: T-add-missing-dependencies-to
title: Add missing dependencies to package.json files
status: done
priority: medium
prerequisites: []
affectedFiles:
  apps/desktop/package.json: Added globals ^16.3.0 as devDependency for ESLint
    globals usage in eslint.config.cjs
  apps/mobile/package.json:
    Added expo-updates ^0.28.17 and expo-system-ui ^5.0.10
    as dependencies for app.json config support, and @expo/metro-config ^0.20.17
    as devDependency for metro.config.js
  package.json: Added @fishbowl-ai/eslint-config workspace dependency for root
    ESLint configuration
  packages/shared/package.json: Added @testing-library/jest-dom ^6.6.4 as
    devDependency for enhanced Jest DOM matchers in test setup
  pnpm-lock.yaml: Updated lockfile with new dependencies and their transitive dependencies
log:
  - "Successfully added all 6 missing dependencies to their appropriate
    package.json files with latest stable versions. All dependencies are now
    properly declared, installed, and verified through quality checks. Fixed
    Knip analysis issues by adding: globals (^16.3.0) for ESLint configs,
    expo-updates (^0.28.17) and expo-system-ui (^5.0.10) for mobile app
    configuration, @expo/metro-config (^0.20.17) for Metro bundler setup,
    @fishbowl-ai/eslint-config for root ESLint config, and
    @testing-library/jest-dom (^6.6.4) for enhanced Jest matchers. All imports
    now resolve correctly and build processes work without dependency warnings."
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
