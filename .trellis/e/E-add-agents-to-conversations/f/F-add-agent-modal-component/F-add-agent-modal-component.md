---
id: F-add-agent-modal-component
title: Add Agent Modal Component
status: open
priority: medium
parent: E-add-agents-to-conversations
prerequisites:
  - F-component-prop-threading-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T03:00:13.777Z
updated: 2025-08-25T03:00:13.777Z
---

# Add Agent Modal Component

## Purpose

Create a modal component that allows users to select and add agents to the current conversation, following existing modal patterns and integrating with the conversation agent system.

## Key Components to Implement

- `AddAgentToConversationModal` component
- Modal state management and controls
- Agent selection interface
- Form validation and error handling
- Integration with useConversationAgents hook

## Detailed Acceptance Criteria

### Modal Component Requirements

✅ **Component Structure**

- Create AddAgentToConversationModal.tsx in components/modals/
- Use shadcn/ui Dialog components (Dialog, DialogContent, DialogHeader, etc.)
- Controlled component with `open` and `onOpenChange` props
- Accept `conversationId` prop for target conversation
- Follow RenameConversationModal patterns

✅ **Agent Selection Interface**

- Dropdown/Select component showing available agents
- Populated from useAgentsStore (configured agents)
- Shows agent name and role in dropdown
- Visual indication of already-added agents
- Support single agent selection (multi-select future enhancement)
- Clear placeholder text when no selection

✅ **Form Validation**

- Prevent adding duplicate agents (show as disabled in list)
- Validate agent selection before submission
- Show validation errors inline
- Disable submit when no valid selection
- Clear error state on valid selection

✅ **Modal Behavior**

- Opens when "Add Agent" button clicked
- Focus management (auto-focus select on open)
- Keyboard navigation support (Tab, Enter, Escape)
- Loading state during add operation
- Auto-close on successful addition
- Proper cleanup on close

✅ **Error Handling**

- Display user-friendly error messages
- Handle IPC communication errors
- Show specific error for duplicate attempts
- Retry capability for transient failures
- Error display using existing patterns (AlertCircle icon)

✅ **Integration Requirements**

- Wire up in AgentLabelsContainerDisplay
- Use useConversationAgents hook for adding
- Trigger refetch after successful add
- Modal only shows when conversation selected
- Props properly typed in ui-shared

## Technical Requirements

- Follow existing modal patterns exactly
- Use existing Button and Input components
- Implement with React hooks (useState, useCallback)
- Proper TypeScript types for all props
- Accessibility compliance (ARIA labels)
- No direct database access

## Implementation Guidance

1. Copy RenameConversationModal as starting template
2. Replace input with Select/Dropdown component
3. Integrate useAgentsStore for agent list
4. Add validation for duplicates
5. Wire up with useConversationAgents.addAgent
6. Test modal flow end-to-end

## Testing Requirements

- Modal opens and closes properly
- Agent list populates from store
- Duplicate agents shown as disabled
- Successful addition closes modal
- Error messages display correctly
- Keyboard navigation works
- Focus management works properly
- Loading states display during operations

## Dependencies

- F-component-prop-threading-and (requires integrated components and conversation context)
