---
id: T-integrate-sortableagentpill
title: Integrate SortableAgentPill in AgentLabelsContainerDisplay
status: done
priority: medium
parent: F-agent-pills-drag-and-drop
prerequisites:
  - T-create-sortableagentpill
affectedFiles: {}
log:
  - "Task was already completed prior to claiming. Verified comprehensive
    integration of SortableAgentPill in AgentLabelsContainerDisplay with all
    acceptance criteria met: conditional rendering for conversation agents,
    backwards compatibility with regular AgentPill for non-conversation view,
    proper prop passing including conversationAgent.id as id, complete
    drag-and-drop functionality with 8px threshold, and preserved error handling
    patterns."
schema: v1.0
childrenIds: []
created: 2025-09-06T02:19:56.663Z
updated: 2025-09-06T02:19:56.663Z
---

# Integrate SortableAgentPill in AgentLabelsContainerDisplay

## Context

Replace the direct AgentPill usage in AgentLabelsContainerDisplay with SortableAgentPill for conversation agents, enabling the final drag-and-drop functionality while maintaining backward compatibility for non-conversation views.

## Specific Requirements

- Replace AgentPill with SortableAgentPill for conversation agents only
- Keep AgentPill for non-conversation (settings view) agents unchanged
- Pass conversationAgent.id as id prop to SortableAgentPill
- Maintain all existing props (agent, onToggleEnabled, onDelete, etc.)
- Ensure drag-and-drop only works when conversation is selected

## Technical Approach

1. Import SortableAgentPill component
2. Update conversation agents mapping (lines 189-217) to use SortableAgentPill
3. Add id={conversationAgent.id} prop to SortableAgentPill instances
4. Keep non-conversation agents mapping unchanged (lines 218-238)
5. Ensure proper error handling and loading states are preserved

## Acceptance Criteria

- [ ] SortableAgentPill used for conversation agents (selectedConversationId exists)
- [ ] Regular AgentPill still used for non-conversation view (backwards compatibility)
- [ ] conversationAgent.id passed as id prop to SortableAgentPill
- [ ] All existing props maintained (onToggleEnabled, onDelete, etc.)
- [ ] Loading and error states work correctly with sortable pills
- [ ] Drag-and-drop reordering works end-to-end
- [ ] Click vs drag detection works with 8px threshold
- [ ] Unit tests verify integration and conditional rendering

## Dependencies

- T-create-sortableagentpill (SortableAgentPill component)

## Files to Modify

- apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx (lines 189-217)

## Integration Points

This task completes the drag-and-drop feature by connecting:

- DndContext setup (T-implement-dndcontext-and)
- SortableAgentPill component (T-create-sortableagentpill)
- reorderAgents store action (T-add-reorderagents-action-to)

## Out of Scope

- Do not modify AgentPill component itself
- Do not change non-conversation agent rendering behavior
- Do not modify props interface or error handling patterns
