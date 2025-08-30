---
id: T-update-agentpillviewmodel
title: Update AgentPillViewModel interface to support status states
status: open
priority: high
parent: F-agent-status-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-30T04:59:10.882Z
updated: 2025-08-30T04:59:10.882Z
---

# Update AgentPillViewModel Interface for Status States

## Context

The AgentPill component needs to display real-time agent processing states (thinking, error, complete) but the current AgentPillViewModel interface only supports `isThinking: boolean`. This task extends the interface to support rich status information from the chat store.

## Detailed Implementation Requirements

### Update AgentPillViewModel Interface

**File**: `packages/ui-shared/src/types/chat/AgentPillViewModel.ts`

Add these properties to the existing interface:

- `status: 'idle' | 'thinking' | 'complete' | 'error'` - Current agent processing state
- `error?: AgentError | null` - Agent-specific error information when status is 'error'
- Keep existing `isThinking: boolean` for backward compatibility during transition

### Update AgentError Import

Ensure AgentError type is properly imported and exported from the chat types barrel file.

## Technical Approach

1. Extend the existing AgentPillViewModel interface in place
2. Import AgentError type from the existing AgentError.ts file
3. Update the barrel export in `packages/ui-shared/src/types/chat/index.ts`
4. Maintain backward compatibility with existing `isThinking` property

## Acceptance Criteria

- [ ] AgentPillViewModel interface includes new status and error properties
- [ ] AgentError type is properly imported and available
- [ ] Interface exports correctly through barrel file
- [ ] TypeScript compilation passes without errors
- [ ] Existing isThinking property remains for compatibility

## Dependencies

None - this is foundational type work

## Security Considerations

- AgentError messages should only contain user-safe error information
- No sensitive API details or internal system information exposed

## Out of Scope

- No changes to AgentPill component implementation (handled in separate task)
- No changes to useChatStore (already supports the required state)
- No removal of existing isThinking property
