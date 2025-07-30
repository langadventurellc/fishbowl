---
kind: task
id: T-create-ui-shared-package
title: Create UI-shared package structure and configuration
status: open
priority: high
prerequisites: []
created: "2025-07-30T16:30:46.280572"
updated: "2025-07-30T16:30:46.280572"
schema_version: "1.1"
---

## Objective

Create the new `@fishbowl-ai/ui-shared` package directory structure and configuration files to house UI-specific types, components, and state management.

## Context

This is the first step in splitting the shared package to separate UI concerns from business logic. The new UI-shared package will depend on the business logic package but not vice versa.

## Implementation Requirements

1. Create `packages/ui-shared/` directory structure
2. Set up package.json with proper dependencies and scripts
3. Configure TypeScript compilation
4. Set up build and test scripts
5. Create proper exports structure

## Technical Approach

1. Create directory: `packages/ui-shared/`
2. Copy and modify package.json from existing shared package:
   - Change name to `@fishbowl-ai/ui-shared`
   - Add dependency on `@fishbowl-ai/shared: "workspace:*"`
   - Add dependency on `@fishbowl-ai/ui-theme: "workspace:*"`
   - Keep React peer dependency
   - Include necessary build dependencies (TypeScript, Jest, etc.)
3. Create tsconfig.json for TypeScript compilation
4. Create src/ directory with index.ts barrel export
5. Create initial directory structure for organized exports

## Acceptance Criteria

- [ ] `packages/ui-shared/` directory exists
- [ ] `package.json` is properly configured with correct dependencies
- [ ] `tsconfig.json` is set up for TypeScript compilation
- [ ] `src/index.ts` exists as main export file
- [ ] Package builds successfully with `pnpm build`
- [ ] Package passes type checking with `pnpm type-check`
- [ ] No circular dependencies in package structure

## Files to Create

- `packages/ui-shared/package.json`
- `packages/ui-shared/tsconfig.json`
- `packages/ui-shared/src/index.ts`
- `packages/ui-shared/jest.config.cjs`
- `packages/ui-shared/eslint.config.cjs`

## Testing Requirements

- Verify package builds without errors
- Confirm TypeScript compilation works
- Test that imports resolve correctly

### Log
