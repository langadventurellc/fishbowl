---
id: T-update-agentpillviewmodel-to
title: Update AgentPillViewModel to include enabled state
status: done
priority: medium
parent: F-agent-pill-toggle-enabled
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/AgentPillViewModel.ts: "Added enabled: boolean
    property with detailed JSDoc documentation explaining visual behavior and
    usage for controlling agent participation"
  packages/ui-shared/src/types/chat/__tests__/AgentLabelsContainerDisplayProps.test.ts:
    "Updated mock AgentPillViewModel object to include enabled: true property to
    maintain TypeScript compatibility"
log:
  - Successfully added enabled property to AgentPillViewModel interface with
    comprehensive JSDoc documentation. The property allows UI components to
    display visual indication of enabled/disabled agent state. Updated test
    mocks to maintain TypeScript compatibility. All quality checks pass with no
    breaking changes to existing implementations.
schema: v1.0
childrenIds: []
created: 2025-08-29T03:59:04.393Z
updated: 2025-08-29T03:59:04.393Z
---

# Update AgentPillViewModel to include enabled state

## Context

The `AgentPillViewModel` interface needs to include an `enabled` property to support visual indication of enabled/disabled state in the UI. This will allow the AgentPill component to display different styles based on the agent's enabled state.

## Technical Approach

1. Add `enabled: boolean` property to `AgentPillViewModel` interface
2. Include proper JSDoc documentation explaining the property's purpose
3. Maintain backward compatibility by making it optional initially if needed
4. Update related imports and exports

## Specific Implementation Requirements

### Interface Update

```typescript
export interface AgentPillViewModel {
  // ... existing properties ...

  /**
   * Whether the agent is enabled for new conversations.
   * When false, the agent pill should display with reduced opacity
   * and visual indicators showing it's disabled.
   *
   * Used to control agent participation in conversation generation.
   */
  enabled: boolean;
}
```

### Documentation

- Add clear JSDoc explaining the purpose and visual impact
- Document expected UI behavior when enabled vs disabled
- Include examples of usage patterns

## Acceptance Criteria

- [ ] `enabled` property added to AgentPillViewModel interface
- [ ] Proper JSDoc documentation included
- [ ] TypeScript compilation passes
- [ ] No breaking changes to existing implementations
- [ ] Related barrel exports updated if needed

## Files to Modify

- `packages/ui-shared/src/types/AgentPillViewModel.ts`
- Update related barrel exports in `packages/ui-shared/src/types/index.ts` if needed

## Dependencies

None - this is a foundational type change

## Testing Requirements

- Unit tests to verify the interface includes the new property
- TypeScript compilation tests
- Verify existing code still compiles with the interface change

## Out of Scope

- Do not update component implementations yet
- Do not modify data transformation logic
