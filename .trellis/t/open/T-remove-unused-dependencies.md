---
id: T-remove-unused-dependencies
title: Remove unused dependencies from package.json files
status: open
priority: high
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T17:02:43.313Z
updated: 2025-08-09T17:02:43.313Z
---

# Remove Unused Dependencies from Package.json Files

## Context

Knip analysis identified 10 unused dependencies across the monorepo that can be safely removed to reduce bundle size and clean up package.json files.

## Specific Implementation Requirements

Remove the following unused dependencies:

- `@radix-ui/react-context-menu` from `apps/desktop/package.json:42:6`
- `@fishbowl-ai/shared` from `apps/mobile/package.json:42:6`
- `@fishbowl-ai/ui-theme` from `apps/mobile/package.json:43:6`
- `expo-modules-core` from `apps/mobile/package.json:47:6`
- `eslint-plugin-react` from `packages/eslint-config/package.json:21:6`
- `eslint-plugin-react-hooks` from `packages/eslint-config/package.json:22:6`
- `globals` from `packages/eslint-config/package.json:24:6`
- `zustand` from `packages/shared/package.json:25:6`
- `@fishbowl-ai/ui-theme` from `packages/ui-shared/package.json:24:6`
- `tw-animate-css` from `packages/ui-theme/package.json:31:6`

## Technical Approach

1. Edit each package.json file to remove the specified unused dependencies
2. Run `pnpm install` to update lockfiles
3. Verify builds still work with `pnpm build:libs` and `pnpm type-check`
4. Test key functionality to ensure no runtime issues

## Detailed Acceptance Criteria

- All 10 unused dependencies removed from their respective package.json files
- Lockfiles updated after dependency removal
- All builds pass without errors
- Type checking passes for all packages
- No runtime errors introduced by dependency removal
- Bundle size reduction measurable (document before/after sizes)

## Security Considerations

- Verify removed dependencies don't contain security patches needed elsewhere
- Ensure no transitive dependency issues are introduced

## Testing Requirements

- Run full test suite after changes: `pnpm test`
- Verify desktop app starts correctly
- Confirm mobile app configuration remains valid
- Test build processes for all packages

## Dependencies

None - this task can be completed independently.
