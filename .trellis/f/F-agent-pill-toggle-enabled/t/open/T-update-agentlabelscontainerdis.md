---
id: T-update-agentlabelscontainerdis
title: Update AgentLabelsContainerDisplay to wire up toggle functionality
status: open
priority: high
parent: F-agent-pill-toggle-enabled
prerequisites:
  - T-add-toggleenabled-function-to
  - T-update-agentpill-component
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-29T03:59:41.217Z
updated: 2025-08-29T03:59:41.217Z
---

# Update AgentLabelsContainerDisplay to wire up toggle functionality

## Context

Connect the AgentLabelsContainerDisplay component to the toggle functionality by passing the toggleEnabled handler from useConversationAgents to AgentPill components and updating data transformation logic.

## Technical Approach

1. Extract toggleEnabled function from useConversationAgents hook
2. Update data transformation to include enabled state and conversationAgentId
3. Pass toggle handler and required props to AgentPill components
4. Handle loading states during toggle operations

## Specific Implementation Requirements

### Hook Integration

- Extract `toggleEnabled` from `useConversationAgents` hook
- Handle loading and error states during toggle operations

### Data Transformation Updates

```typescript
const agentViewModel: AgentPillViewModel =
  "id" in agent
    ? {
        name: agent.name,
        role: agent.role,
        color: "#3b82f6",
        isThinking: false,
        enabled: true, // From agent settings default
      }
    : {
        ...agent,
        enabled: conversationAgent.enabled, // From conversation agent data
      };
```

### AgentPill Integration

- Pass `onToggleEnabled={toggleEnabled}` prop to AgentPill
- Pass `conversationAgentId` for identification
- Only enable toggle when conversation is selected

### Error Handling

- Display error states if toggle operations fail
- Maintain existing error display patterns
- Handle loading states during toggle operations

## Acceptance Criteria

- [ ] toggleEnabled function extracted from useConversationAgents hook
- [ ] AgentPill receives onToggleEnabled handler when appropriate
- [ ] conversationAgentId passed correctly to AgentPill
- [ ] Data transformation includes actual enabled state from database
- [ ] Toggle only enabled when conversation is selected
- [ ] Error handling works for toggle failures
- [ ] Loading states handled appropriately
- [ ] Unit tests verify integration works correctly

## Files to Modify

- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

## Dependencies

- Prerequisite: useConversationAgents hook must have toggleEnabled function
- Prerequisite: AgentPill must support onToggleEnabled prop
- Uses existing error handling and loading state patterns

## Testing Requirements

- Unit tests for toggle handler integration
- Test data transformation includes enabled state
- Test error scenarios and loading states
- Verify toggle only works when conversation selected
- Integration tests with mocked useConversationAgents hook

## Security Considerations

- Validate conversationAgentId before passing to toggle function
- Ensure toggle operations are authorized for the current user/conversation

## Out of Scope

- Do not modify the useConversationAgents hook implementation
- Do not change the AgentPill component interface
