---
kind: task
id: T-remove-old-api-keys-components
parent: F-integration-and-cleanup
status: done
title: Remove old API Keys components from desktop app
priority: high
prerequisites: []
created: "2025-08-04T14:43:55.924635"
updated: "2025-08-04T14:47:25.459010"
schema_version: "1.1"
worktree: null
---

## Task Overview

Remove all old API Keys related components from the desktop application now that the new LLM Setup system is fully integrated and working.

## Files to Delete

1. **apps/desktop/src/components/settings/ApiKeysSettings.tsx**
   - Old component that managed API key settings
   - No longer imported or used anywhere

2. **apps/desktop/src/components/settings/ProviderCard.tsx**
   - Old provider card component
   - Replaced by new LlmProviderCard

3. **apps/desktop/src/components/settings/**tests**/ProviderCard.test.tsx**
   - Test file for old ProviderCard component
   - No longer needed

## Implementation Steps

1. Delete the three files listed above
2. Verify no imports of these components exist (search for "ApiKeysSettings" and "ProviderCard" imports)
3. Run `pnpm quality` to ensure no broken imports
4. Build the desktop app to verify successful compilation

## Acceptance Criteria

- [ ] ApiKeysSettings.tsx deleted
- [ ] ProviderCard.tsx deleted
- [ ] ProviderCard.test.tsx deleted
- [ ] No import errors after deletion
- [ ] `pnpm quality` passes
- [ ] Desktop app builds successfully

## Security Considerations

- Ensure no sensitive data or API keys are accidentally committed during cleanup
- Verify git status before committing to ensure only intended deletions

### Log

**2025-08-04T20:01:29.413669Z** - Successfully removed all old API Keys components from desktop app as part of the LLM Setup transformation cleanup. Deleted ApiKeysSettings.tsx, ProviderCard.tsx, and ProviderCard.test.tsx files. Verified no remaining imports or references exist in the codebase. All quality checks pass and TypeScript compilation is successful, confirming clean removal without breaking the application.

- filesChanged: ["apps/desktop/src/components/settings/ApiKeysSettings.tsx", "apps/desktop/src/components/settings/ProviderCard.tsx", "apps/desktop/src/components/settings/__tests__/ProviderCard.test.tsx"]
