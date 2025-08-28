---
id: T-fix-model-defaults-and
title: Fix model defaults and standardize on canonical model IDs
status: done
priority: low
parent: F-add-llm-configuration-id-to
prerequisites:
  - T-update-agentform-to-handle
affectedFiles:
  apps/desktop/src/components/settings/agents/AgentForm.tsx:
    Updated default model
    values to use canonical ID 'gpt-4' instead of display name 'Claude 3.5
    Sonnet' for consistency with openai-config-1 llmConfigId
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    Replaced all instances of 'Claude 3.5 Sonnet' with canonical ID
    'claude-3-5-sonnet'
  packages/ui-shared/src/schemas/__tests__/agentSchema.test.ts:
    "Updated test data to use canonical IDs: 'claude-3-5-sonnet' and 'gpt-4'
    instead of display names"
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsUIToPersistence.test.ts: Standardized test data to use 'claude-3-5-sonnet' instead of display name
  packages/ui-shared/src/mapping/agents/__tests__/roundTripMapping.test.ts:
    Updated test data to use canonical IDs 'claude-3-5-sonnet' and
    'claude-3-haiku'
  packages/ui-shared/src/mapping/agents/__tests__/mapAgentsPersistenceToUI.test.ts: Replaced 'Claude 3.5 Sonnet' with canonical ID 'claude-3-5-sonnet'
  apps/desktop/src/components/settings/agents/__tests__/AgentsSection.test.tsx: Updated mock data to use canonical IDs 'claude-3-5-sonnet' and 'gpt-4'
log:
  - 'Successfully standardized model identification across the application to
    use canonical model IDs instead of display names. Updated AgentForm defaults
    to use "gpt-4" (canonical) instead of "Claude 3.5 Sonnet" (display name),
    and ensured consistency with "openai-config-1" llmConfigId. Systematically
    updated test fixtures and mock data throughout the codebase to use canonical
    IDs: "claude-3-5-sonnet", "claude-3-haiku", "gpt-4", etc. All quality checks
    (linting, formatting, type-checking) and unit tests pass successfully.'
schema: v1.0
childrenIds: []
created: 2025-08-28T18:36:20.102Z
updated: 2025-08-28T18:36:20.102Z
---

# Fix Model Defaults and Standardize on Canonical Model IDs

## Context

Standardize model identification across the application to use canonical model IDs (e.g., `gpt-4o`, `claude-3-5-sonnet`) instead of display labels, and fix any defaults that currently use friendly names.

## Technical Approach

1. Review current model defaults in `AgentForm` and other components
2. Replace any display labels with canonical model IDs
3. Ensure consistency between persisted data and UI defaults
4. Update test data to use canonical IDs where appropriate

## Specific Implementation Requirements

### Default Value Audit

Review and update:

- `AgentForm` default model values
- Test fixtures and mock data
- Component initialization values
- Any hardcoded model references

### Canonical ID Standards

Use standardized model identifiers:

- OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`
- Anthropic: `claude-3-5-sonnet`, `claude-3-haiku`, `claude-3-opus`
- Other providers: Follow their official model naming

### Test Data Updates

- Update unit test data to use canonical IDs
- Fix any tests that assert friendly names
- Ensure test mocks use realistic canonical IDs

## Detailed Acceptance Criteria

- [ ] All default model values use canonical IDs (not display names)
- [ ] `AgentForm` defaults initialize with valid canonical model IDs
- [ ] Test data consistently uses canonical IDs
- [ ] No hardcoded friendly names remain in model identification
- [ ] Persistence and UI use same ID format consistently
- [ ] Existing functionality preserved with ID standardization

## Dependencies

- Requires: T-update-agentform-to-handle (form integration should be complete)

## Security Considerations

- Consistent model identification prevents confusion/misconfiguration
- Canonical IDs reduce chance of model mismatches
- No sensitive data involved in ID standardization

## Testing Requirements

- Verify all test fixtures use canonical model IDs
- Test default initialization with canonical IDs
- Ensure model lookup still works with standardized IDs
- Update any tests asserting specific model names

## Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx` (if defaults need fixing)
- Test files with model data (various locations)
- Any components with hardcoded model references

## Out of Scope

- Complex model migration logic (this is standardization, not migration)
- External API integration changes
- Performance optimization for model lookup
