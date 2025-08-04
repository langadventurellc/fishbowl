---
kind: task
id: T-final-cleanup-verification-and
title: Final cleanup verification and quality check
status: open
priority: normal
prerequisites:
  - T-remove-old-api-keys-types-and
created: "2025-08-04T14:44:32.148121"
updated: "2025-08-04T14:44:32.148121"
schema_version: "1.1"
parent: F-integration-and-cleanup
---

## Task Overview

Perform a final comprehensive verification that all old API Keys code has been removed and the new LLM Setup system is working correctly without any legacy dependencies.

## Verification Steps

1. **Search for Legacy References**
   - Search globally for "api-keys" (case-insensitive) to ensure no references remain
   - Search for "ApiKeys" to catch any remaining camelCase references
   - Search for "ProviderCard" (excluding LlmProviderCard) to ensure old component is gone
   - Verify no imports from deleted files

2. **Build Verification**
   - Run `pnpm clean` to clear all caches
   - Run `pnpm install` to ensure clean dependencies
   - Run `pnpm build:libs` to build shared packages
   - Run `pnpm build:desktop` to ensure desktop app builds

3. **Quality Checks**
   - Run `pnpm quality` and fix any issues
   - Run `pnpm test` to ensure all tests pass
   - Manually test the LLM Setup flow in desktop app:
     - Empty state displays correctly
     - Can add new LLM configuration
     - Can edit existing configuration
     - Can delete configuration
     - Transitions work smoothly

4. **Documentation Check**
   - Verify no references to old components in comments
   - Ensure new components have proper JSDoc comments
   - Check that CLAUDE.md doesn't reference old API Keys system

## Acceptance Criteria

- [ ] No search results for "api-keys" or "ApiKeys" references
- [ ] No references to old ProviderCard component
- [ ] All builds complete successfully
- [ ] `pnpm quality` passes with no errors
- [ ] All tests pass
- [ ] Manual testing confirms LLM Setup works correctly
- [ ] No legacy references in documentation or comments

## Security Considerations

- Verify no API keys or sensitive data in git history
- Ensure no debug logging of API keys remains
- Confirm secure storage is still working properly

## Final Checklist

- [ ] Feature F-integration-and-cleanup can be marked as complete
- [ ] All acceptance criteria from feature description are met
- [ ] Code is clean and follows project conventions
- [ ] No performance regressions observed

### Log
