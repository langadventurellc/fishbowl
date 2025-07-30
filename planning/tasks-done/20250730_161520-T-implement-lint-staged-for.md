---
kind: task
id: T-implement-lint-staged-for
status: done
title: Implement lint-staged for conditional pre-commit hooks
priority: low
prerequisites: []
created: "2025-07-26T13:38:52.058648"
updated: "2025-07-30T16:06:29.312199"
schema_version: "1.1"
worktree: null
---

## Context

Currently, the repository runs quality checks and tests on all pre-commit hooks regardless of which files were changed. This is inefficient when only markdown or non-code files are modified.

## Implementation Requirements

1. **Install lint-staged dependency**
   - Add lint-staged as a dev dependency: `pnpm add -D lint-staged`
   - Research current monorepo setup to ensure compatibility

2. **Configure lint-staged in package.json**
   - Create configuration that runs appropriate tools based on file types:
     - TypeScript/JavaScript files: Run linting, type checking, and related tests
     - Markdown files: Run prettier formatting only
     - CSS/SCSS files: Run stylelint if configured
     - Other files: Skip quality checks

3. **Update Husky pre-commit hook**
   - Modify `.husky/pre-commit` to use `npx lint-staged` instead of unconditional quality checks
   - Ensure hook fails appropriately if lint-staged finds issues

4. **Verify integration with existing tooling**
   - Ensure compatibility with existing `pnpm quality`, `pnpm test` commands
   - Test that monorepo structure works correctly with lint-staged
   - Verify that shared package rebuilding works when needed

## Technical Approach

1. Research the current package.json and identify existing scripts
2. Check current Husky configuration in `.husky/` directory
3. Add lint-staged configuration following monorepo best practices
4. Test with various file change scenarios (code only, markdown only, mixed)

## Acceptance Criteria

- [ ] lint-staged is installed and configured in root package.json
- [ ] Pre-commit hooks only run relevant tools based on changed file types
- [ ] Quality checks still run for TypeScript/JavaScript file changes
- [ ] Markdown-only changes only run prettier formatting
- [ ] Hook execution time is reduced for non-code changes
- [ ] All existing functionality remains intact
- [ ] Documentation updated if necessary

## Testing Requirements

- Test pre-commit behavior with different file change scenarios:
  - Only .md files changed → only prettier runs
  - Only .ts/.tsx files changed → full quality checks run
  - Mixed file types → appropriate tools run for each type
  - No files staged → hook succeeds quickly

## Files to Modify

- `package.json` - Add lint-staged dependency and configuration
- `.husky/pre-commit` - Update to use lint-staged
- Potentially update documentation about development workflow

### Log

**2025-07-30T21:15:20.045528Z** - Successfully implemented lint-staged for conditional pre-commit hooks, optimizing development workflow efficiency. The implementation detects changed file types and runs appropriate quality checks: TypeScript/JavaScript files trigger full pipeline (lint + type-check + tests), while markdown/JSON files only run prettier formatting. This reduces hook execution time for non-code changes while maintaining all existing functionality. All tests passed and the monorepo Turbo integration works correctly.

- filesChanged: ["package.json", ".husky/pre-commit", "pnpm-lock.yaml"]
