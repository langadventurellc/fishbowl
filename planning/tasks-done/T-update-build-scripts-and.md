---
kind: task
id: T-update-build-scripts-and
title: Update build scripts and workspace configuration
status: done
priority: normal
prerequisites:
  - T-update-desktop-app-imports-to
created: "2025-07-30T16:32:20.637923"
updated: "2025-07-30T16:32:20.637923"
schema_version: "1.1"
---

## Objective

Update build scripts, workspace configuration, and CI/CD processes to properly handle the new two-package structure.

## Context

With the addition of the ui-shared package, build processes need to be updated to ensure proper compilation order and dependency management across the monorepo.

## Implementation Requirements

1. Update root package.json scripts to build both packages
2. Ensure proper build order (shared → ui-shared → apps)
3. Update quality check scripts for both packages
4. Verify workspace configuration handles new package

## Technical Approach

1. Update root `package.json` scripts:
   - `build:libs` should build both shared and ui-shared
   - `quality` should run checks on both packages
   - `test` should include both packages
2. Verify `pnpm-workspace.yaml` properly includes new package (should already work with `packages/*`)
3. Update any CI/CD configuration if necessary
4. Test build order and dependencies

## Root Scripts to Update

- `pnpm build:libs` - Should build shared, then ui-shared
- `pnpm quality` - Should check both packages
- `pnpm test` - Should test both packages
- `pnpm type-check` - Should check both packages
- `pnpm lint` - Should lint both packages

## Build Order Considerations

Correct build order:

1. `@fishbowl-ai/shared` (no dependencies on other workspace packages)
2. `@fishbowl-ai/ui-shared` (depends on shared)
3. Desktop app (depends on both)

## Acceptance Criteria

- [ ] Root build scripts properly handle both packages
- [ ] Build order ensures dependencies are built before dependents
- [ ] Quality checks run on both packages
- [ ] Workspace configuration includes ui-shared package
- [ ] All monorepo commands work with new package structure
- [ ] CI/CD processes (if any) handle new package

## Testing Requirements

- Test `pnpm build:libs` builds both packages in correct order
- Verify `pnpm quality` checks both packages
- Run full monorepo build to ensure everything works
- Test clean and rebuild process

### Log
