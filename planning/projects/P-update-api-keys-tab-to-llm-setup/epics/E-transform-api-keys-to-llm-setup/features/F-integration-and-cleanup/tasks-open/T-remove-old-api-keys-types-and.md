---
kind: task
id: T-remove-old-api-keys-types-and
title: Remove old API Keys types and schemas from ui-shared
status: open
priority: high
prerequisites:
  - T-remove-old-api-keys-components
created: "2025-08-04T14:44:13.477995"
updated: "2025-08-04T14:44:13.477995"
schema_version: "1.1"
parent: F-integration-and-cleanup
---

## Task Overview

Remove all old API Keys related types and schemas from the ui-shared package. These are no longer used after the migration to the new LLM Setup system.

## Files to Delete

1. **packages/ui-shared/src/types/settings/ApiKeysState.ts**
   - Old state interface for API keys

2. **packages/ui-shared/src/types/settings/ApiKeysFormData.ts**
   - Old form data type using createApiKeysFormSchema

3. **packages/ui-shared/src/types/settings/ProviderCardProps.ts**
   - Props interface for old ProviderCard component

4. **packages/ui-shared/src/schemas/createApiKeysFormSchema.ts**
   - Old schema factory for API keys validation

## Export Cleanup Required

1. **packages/ui-shared/src/types/settings/index.ts**
   - Remove line: `export * from "./ApiKeysFormData";`
   - Remove line: `export * from "./ApiKeysState";`
   - Remove line: `export * from "./ProviderCardProps";`

2. **packages/ui-shared/src/schemas/index.ts**
   - Remove line: `export { createApiKeysFormSchema } from "./createApiKeysFormSchema";`

## Implementation Steps

1. Delete the four type/schema files listed above
2. Update the two index.ts files to remove exports
3. Run `pnpm build:libs` to rebuild the shared packages
4. Run `pnpm quality` to ensure no broken imports
5. Search codebase for any remaining references to these types

## Acceptance Criteria

- [ ] All four old type/schema files deleted
- [ ] Export statements removed from both index files
- [ ] No remaining imports of ApiKeysState, ApiKeysFormData, ProviderCardProps, or createApiKeysFormSchema
- [ ] `pnpm build:libs` completes successfully
- [ ] `pnpm quality` passes
- [ ] No TypeScript errors in consuming applications

## Notes

This task depends on T-remove-old-api-keys-components because we need to ensure the desktop components are removed first to avoid import errors during the cleanup process.

### Log
