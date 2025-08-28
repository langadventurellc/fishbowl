---
id: T-add-llmconfigid-to-shared
title: Add llmConfigId to shared persistence schema and rebuild libs
status: open
priority: high
parent: F-add-llm-configuration-id-to
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:33:54.065Z
updated: 2025-08-28T18:33:54.065Z
---

# Add llmConfigId to Shared Persistence Schema

## Context

This task implements the foundational schema changes for the LLM Configuration ID feature by updating the shared persistence schema to include `llmConfigId` field.

## Technical Approach

1. Update `persistedAgentSchema` in `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts`
2. Add `llmConfigId: z.string().min(1, "LLM Configuration ID is required")` field
3. Rebuild shared packages with `pnpm build:libs` to make types available to dependent packages
4. Update existing unit tests to include the new required field

## Specific Implementation Requirements

### Schema Update

- Add `llmConfigId` field after the `model` field in `persistedAgentSchema`
- Use validation: `z.string({ message: "LLM Configuration ID must be a string" }).min(1, "LLM Configuration ID is required")`
- Add comment: `// LLM configuration identifier to distinguish between multiple providers for the same model`

### Test Updates

- Update all test data in `packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts` to include valid `llmConfigId` values
- Add specific test case for `llmConfigId` validation (required, non-empty string)
- Ensure existing tests still pass with the new required field

## Detailed Acceptance Criteria

- [ ] `persistedAgentSchema` includes `llmConfigId: z.string().min(1)` as required field
- [ ] Schema validation requires non-empty `llmConfigId` string
- [ ] `pnpm build:libs` completes successfully after changes
- [ ] All existing persistence schema tests pass with updated test data
- [ ] New test validates `llmConfigId` field requirements
- [ ] TypeScript types are properly inferred and exported

## Dependencies

- None (foundational change)

## Security Considerations

- Field validation prevents empty/invalid configuration IDs
- No sensitive data exposure (only stores configuration identifiers)

## Testing Requirements

- Unit tests for schema validation including new `llmConfigId` field
- Test data updated to include valid `llmConfigId` values
- Negative test cases for missing/empty `llmConfigId`

## Files to Modify

- `packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts` - Add schema field
- `packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts` - Update tests

## Out of Scope

- UI schema changes (separate task)
- Mapper updates (separate task)
- Component changes (separate task)
