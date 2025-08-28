---
id: T-update-useagentsstore-to
title: Update useAgentsStore to validate with new schema and handle llmConfigId
status: open
priority: medium
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-update-agent-mapping
  - T-add-llmconfigid-to-ui-schema
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T18:36:02.780Z
updated: 2025-08-28T18:36:02.780Z
---

# Update useAgentsStore to Validate with New Schema and Handle llmConfigId

## Context

Update the `useAgentsStore` to validate agent data using the updated `agentSchema` that now requires `llmConfigId`, and ensure create/update operations handle the new field correctly.

## Technical Approach

1. Ensure store validation uses updated `agentSchema` (now requiring `llmConfigId`)
2. Verify create/update operations receive full `AgentFormData` including `llmConfigId`
3. Confirm mapping functions are used correctly for persistence operations
4. Update any direct object construction to include `llmConfigId`

## Specific Implementation Requirements

### Schema Validation

Verify `useAgentsStore` in `packages/ui-shared/src/stores/useAgentsStore.ts`:

- Uses `agentSchema` for validation (should automatically include `llmConfigId` requirement)
- Create operations validate complete `AgentFormData` including `llmConfigId`
- Update operations validate partial data correctly

### Store Operations

**Create Agent**:

- Ensure function accepts full `AgentFormData` with `llmConfigId`
- Pass complete data through mapping functions
- Maintain existing ID generation and timestamp logic

**Update Agent**:

- Handle `llmConfigId` in partial updates
- Use mapping functions for persistence conversion
- Maintain existing validation patterns

### Error Handling

- Validation errors for missing `llmConfigId` show user-friendly messages
- Failed saves handle `llmConfigId` validation appropriately
- Maintain existing error boundary patterns

## Detailed Acceptance Criteria

- [ ] Store validates agent data using updated `agentSchema` with `llmConfigId` requirement
- [ ] Create operations accept and validate complete `AgentFormData` including `llmConfigId`
- [ ] Update operations handle `llmConfigId` field changes correctly
- [ ] Mapping functions used for all persistence operations (no direct object construction)
- [ ] Validation errors for missing `llmConfigId` provide clear user feedback
- [ ] Existing store functionality (search, delete, etc.) remains unchanged
- [ ] No cross-store validation of `llmConfigId` existence (graceful handling at render time)

## Dependencies

- Requires: T-update-agent-mapping (mapping functions must handle `llmConfigId`)
- Requires: T-add-llmconfigid-to-ui-schema (`agentSchema` and types must be updated)

## Security Considerations

- Schema validation prevents invalid `llmConfigId` values
- No cross-store validation avoids tight coupling security risks
- Maintains existing store security patterns

## Testing Requirements

- Unit tests for create operations with `llmConfigId`
- Test update operations preserve `llmConfigId` correctly
- Test validation errors for missing `llmConfigId`
- Verify existing store tests still pass with schema changes

## Files to Modify

- `packages/ui-shared/src/stores/useAgentsStore.ts`

## Out of Scope

- Cross-store validation of `llmConfigId` existence (handled at render time)
- Complex `llmConfigId` business logic (kept simple for maintainability)
- Form integration beyond accepting complete `AgentFormData`
