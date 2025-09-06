---
id: F-agent-pills-drag-and-drop
title: Agent Pills Drag-and-Drop Reordering
status: done
priority: medium
parent: none
prerequisites: []
affectedFiles:
  apps/desktop/package.json: "Added three @dnd-kit dependencies: @dnd-kit/core
    (^6.3.1), @dnd-kit/sortable (^8.0.0), and @dnd-kit/utilities (^3.2.2) to
    enable drag-and-drop functionality for agent pills"
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Added reorderAgents method signature to interface with JSDoc documentation
    describing parameters and behavior
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Implemented reorderAgents method with race condition protection using
    activeRequestToken, optimistic UI updates with rollback on failure,
    validation of agent IDs, sequential service calls to update display_order,
    and comprehensive error handling following existing patterns
  apps/desktop/src/components/chat/SortableAgentPill.tsx: Created new wrapper
    component that integrates useSortable hook from dnd-kit with existing
    AgentPill component. Provides drag handles, visual feedback during drag
    operations, and maintains all existing AgentPill props and functionality.
  apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx:
    Added comprehensive drag-and-drop functionality using dnd-kit. Integrated
    DndContext with PointerSensor (8px activation distance), SortableContext for
    agent pills, handleDragEnd callback that calls reorderAgents store action,
    and proper conditional rendering to only enable drag-and-drop when
    conversation is selected. Preserved all existing click behaviors and error
    handling patterns.
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-reorderagents-action-to
  - T-create-sortableagentpill
  - T-implement-dndcontext-and
  - T-install-and-configure-dnd-kit
  - T-integrate-sortableagentpill
created: 2025-09-06T02:12:37.040Z
updated: 2025-09-06T02:12:37.040Z
---

# Agent Pills Drag-and-Drop Reordering

## Purpose and Functionality

Implement drag-and-drop reordering functionality for agent pills within the AgentLabelsContainerDisplay component using dnd-kit. Users will drag agent pills to reorder them visually, with changes persisted to the database via the existing `display_order` field using the established IPC update pathway.

## Key Components to Implement

1. **dnd-kit Integration**: Add dnd-kit library dependencies and configure drag-and-drop context
2. **Click vs Drag Detection**: Use dnd-kit PointerSensor with distance constraint to distinguish clicks from drags
3. **Store Integration**: Add reorderAgents action to conversation store in ui-shared package

## Acceptance Criteria

### Functional Behavior

- **Drag Initiation**: Mouse down + movement (6-10px threshold) triggers drag mode
- **Click Preservation**: Mouse down + no movement preserves existing click behavior (toggle enabled/disabled)
- **Reorder Persistence**: New order saved to database via existing `conversationAgent:update` IPC channel
- **Visual Feedback**: Basic drag preview during drag operations
- **Error Handling**: Failed updates revert UI order and show error message

### Integration Points

- **Existing Click Handlers**: Preserve toggle enabled/disabled and delete functionality
- **Conversation Store**: Add to existing `useConversationStore` in `packages/ui-shared/src/stores/conversation`
- **IPC Integration**: Use existing `ConversationIpcAdapter.updateConversationAgent()` pathway
- **Database Schema**: Use existing `display_order` field in ConversationAgent table

## Technical Requirements

### Dependencies

- Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

### Architecture Pattern

- Reuse existing IPC pathway: `conversationAgent:update` channel with display_order updates
- Follow existing store patterns in ui-shared package

## Implementation Guidance

### File Structure

- Modify `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx` - Add DndContext and sorting logic
- Extend `packages/ui-shared/src/stores/conversation/useConversationStore.ts` - Add reorderAgents action
- Optional: `apps/desktop/src/components/chat/SortableAgentPill.tsx` - Wrapper component if needed

### Technical Approach

1. **PointerSensor Configuration**: Use `{ distance: 8 }` activation constraint for click vs drag detection
2. **Existing Sorting**: Repository already orders by `display_order ASC, added_at ASC`

### Store Integration

- Add `reorderAgents(conversationId: string, agentIds: string[])` action
- Use existing `updateConversationAgent` calls for persistence
- Follow existing error handling patterns

## Testing Requirements

### Unit Tests

- Test click vs drag detection with different movement distances
- Test store reorder action with mock IPC calls

## Dependencies on Other Features

- None - Enhancement to existing functionality

## Definition of Done

- [ ] dnd-kit dependencies installed and configured
- [ ] PointerSensor with distance constraint implemented
- [ ] Click vs drag detection working correctly
- [ ] Drag-and-drop reordering functional in UI
- [ ] Store reorderAgents action implemented in ui-shared
- [ ] Integration with existing IPC update pathway
- [ ] Unit tests for core drag-and-drop logic
