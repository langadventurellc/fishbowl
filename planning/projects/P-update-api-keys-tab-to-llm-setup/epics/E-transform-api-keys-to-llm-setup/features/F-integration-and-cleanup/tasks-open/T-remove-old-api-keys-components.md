---
kind: task
id: T-remove-old-api-keys-components
title: Remove old API Keys components from desktop app
status: open
priority: high
prerequisites: []
created: "2025-08-04T14:43:55.924635"
updated: "2025-08-04T14:43:55.924635"
schema_version: "1.1"
parent: F-integration-and-cleanup
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
