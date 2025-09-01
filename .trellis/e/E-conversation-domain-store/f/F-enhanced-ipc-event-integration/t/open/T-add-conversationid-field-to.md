---
id: T-add-conversationid-field-to
title: Add conversationId field to AgentUpdateEvent interface
status: open
priority: high
parent: F-enhanced-ipc-event-integration
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-01T05:43:02.259Z
updated: 2025-09-01T05:43:02.259Z
---

## Purpose

Add `conversationId: string` field to the existing AgentUpdateEvent interface to enable direct conversation filtering in the domain store, eliminating the need for reverse mapping.

## Context

The current AgentUpdateEvent structure only includes `conversationAgentId` which requires reverse lookup to determine which conversation the event belongs to. Adding `conversationId` directly to the event payload will improve performance and simplify event filtering in the conversation domain store.

## Implementation Requirements

### File to Update

- **Location**: `apps/desktop/src/shared/ipc/chat/agentUpdateEvent.ts`
- **Current interface**: Lines 4-26 contain the existing AgentUpdateEvent structure

### Specific Changes

1. Add `conversationId: string` field to the interface
2. Place it as the first field for logical grouping with conversationAgentId
3. Add proper JSDoc documentation for the new field
4. Maintain all existing fields without modification

### Enhanced Interface Structure

```typescript
export interface AgentUpdateEvent {
  /** Unique identifier for the conversation */
  conversationId: string; // NEW FIELD
  /** Unique identifier for the conversation agent */
  conversationAgentId: string;
  /** Current status of the agent */
  status: "thinking" | "complete" | "error";
  // ... all existing optional fields remain unchanged
}
```

## Acceptance Criteria

- [ ] `conversationId: string` field added as first property in interface
- [ ] JSDoc comment added explaining the field purpose
- [ ] All existing fields preserved with exact same types and optionality
- [ ] No breaking changes to existing event structure
- [ ] Interface maintains TypeScript compilation

## Out of Scope

- Event emission changes (handled in separate task)
- Consumer updates (handled in separate tasks)
- Any other fields beyond conversationId

## Testing Notes

Include unit test updates that verify:

- Interface compiles correctly with new field
- TypeScript type checking validates required conversationId field
- Existing event creation patterns still work

## Dependencies

None - this is a pure interface change
