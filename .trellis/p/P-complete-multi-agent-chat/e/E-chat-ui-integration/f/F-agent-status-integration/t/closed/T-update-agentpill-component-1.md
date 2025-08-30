---
id: T-update-agentpill-component-1
title: Update AgentPill component usage sites with status integration
status: done
priority: medium
parent: F-agent-status-integration
prerequisites:
  - T-enhance-agentpill-component
affectedFiles:
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    Updated chat-related AgentPill usage to include showStatus={true} prop for
    real-time status display when selectedConversationId exists. Non-chat usage
    maintains default showStatus=false behavior.
  apps/desktop/src/components/layout/MainContentPanelDisplay.tsx:
    Added useChatEventIntegration hook import and integration to enable
    real-time agent status updates in the main conversation interface. Properly
    handles null/undefined conversationId values.
log:
  - Successfully updated AgentPill component usage sites with real-time status
    integration. Added `showStatus={true}` prop to chat-related usage in
    AgentLabelsContainerDisplay and integrated useChatEventIntegration hook in
    MainContentPanelDisplay for real-time agent status updates. All quality
    checks and unit tests pass.
schema: v1.0
childrenIds: []
created: 2025-08-30T04:59:57.353Z
updated: 2025-08-30T04:59:57.353Z
---

# Update AgentPill Usage Sites with Status Integration

## Context

After enhancing the AgentPill component with chat store integration, update all usage sites throughout the desktop application to enable real-time status display where appropriate. This connects the enhanced component to the actual chat interface.

## Detailed Implementation Requirements

### Find All AgentPill Usage Sites

Search the codebase for AgentPill component imports and usage:

- `apps/desktop/src/components/**/*.tsx`
- Look for components that render agents in chat context
- Identify which usage sites should show real-time status

### Update Chat-Related Usage Sites

For components that display agents during active conversations:

1. **Enable Status Integration**:
   - Add `showStatus={true}` prop
   - Pass `conversationAgentId` from conversation context
   - Ensure components have access to conversation agent data

2. **Required Props**:
   - `showStatus={true}` - Enable real-time status display
   - `conversationAgentId={conversationAgent.id}` - Agent identifier for store lookup
   - Maintain all existing props

3. **Integration with useChatEventIntegration**:
   - Ensure parent components use `useChatEventIntegration` hook
   - Verify event integration is active for the conversation
   - Add hook if missing from chat container components

### Non-Chat Usage Sites

For components that display agents outside chat context (agent management, settings):

- Leave `showStatus={false}` or omit prop (default behavior)
- No changes needed - maintain existing functionality

## Technical Approach

1. Use search tools to locate all AgentPill component usage
2. Analyze each usage context to determine if status display is appropriate
3. Update chat-related usage sites with status props
4. Verify parent components have necessary conversation context
5. Add useChatEventIntegration hook where missing
6. Test integration in actual chat scenarios

## Acceptance Criteria

- [ ] All AgentPill usage sites identified through codebase search
- [ ] Chat-related usage sites updated with `showStatus={true}`
- [ ] All required `conversationAgentId` props provided correctly
- [ ] Parent components have useChatEventIntegration integration
- [ ] Non-chat usage sites maintain existing behavior
- [ ] Status integration works in real conversation scenarios
- [ ] No breaking changes to existing agent display functionality
- [ ] Unit tests updated for components with modified AgentPill usage

## Dependencies

- Requires T-enhance-agentpill-component (enhanced component implementation)
- Requires existing useChatEventIntegration hook in chat components

## Security Considerations

- Verify conversationAgentId values are properly validated
- No exposure of internal system identifiers in props
- Maintain existing access control for agent information

## Testing Requirements

- Integration tests for status display in chat interface
- Verify status updates appear correctly during agent processing
- Test error state display and tooltip functionality
- Ensure non-chat usage sites remain unaffected
- Test conversation switching and status state cleanup

## Out of Scope

- No changes to components outside desktop app
- No modifications to shared UI components
- No new component creation - only prop updates to existing usage
