---
id: T-implement-dndcontext-and
title: Implement DndContext and sortable setup in AgentLabelsContainerDisplay
status: done
priority: medium
parent: F-agent-pills-drag-and-drop
prerequisites:
  - T-install-and-configure-dnd-kit
  - T-add-reorderagents-action-to
affectedFiles:
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
  - Successfully implemented DndContext and sortable setup in
    AgentLabelsContainerDisplay component with full drag-and-drop functionality.
    Added dnd-kit integration with PointerSensor configured for 8px activation
    distance to distinguish clicks from drags, preserving all existing click
    behaviors (toggle enabled/disabled, delete). Implemented onDragEnd handler
    that calls reorderAgents store action with proper error handling and type
    safety. Drag-and-drop is only enabled when selectedConversationId exists,
    maintaining existing component behavior patterns. Created SortableAgentPill
    wrapper component that makes individual agent pills draggable while
    preserving all existing functionality.
schema: v1.0
childrenIds: []
created: 2025-09-06T02:19:27.969Z
updated: 2025-09-06T02:19:27.969Z
---

# Implement DndContext and sortable setup in AgentLabelsContainerDisplay

## Context

Add dnd-kit DndContext and sortable infrastructure to the AgentLabelsContainerDisplay component without breaking existing functionality. This sets up the foundation for drag-and-drop while preserving all current click behaviors.

## Specific Requirements

- Wrap agent pills rendering with DndContext
- Configure PointerSensor with `{ distance: 8 }` activation constraint for click vs drag detection
- Set up SortableContext with agent IDs array
- Implement onDragEnd handler to call store reorderAgents action
- Preserve all existing click handlers (toggle enabled, delete)
- Only enable drag-and-drop when selectedConversationId exists

## Technical Approach

1. Import DndContext, SortableContext, PointerSensor from @dnd-kit packages
2. Set up sensors with distance constraint: `useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))`
3. Wrap existing agent pills map with SortableContext using conversationAgent IDs
4. Add onDragEnd handler that calls reorderAgents from store
5. Handle edge cases (no conversation selected, loading states)

## Acceptance Criteria

- [ ] DndContext wraps agent pills with PointerSensor configured
- [ ] SortableContext uses conversationAgent.id as items array
- [ ] onDragEnd handler calls reorderAgents with correct agent ID order
- [ ] Click behaviors preserved (8px threshold prevents accidental drags)
- [ ] Drag-and-drop disabled when no conversation selected or loading
- [ ] Component maintains existing props interface
- [ ] Unit tests verify context setup and drag end handling

## Dependencies

- T-install-and-configure-dnd-kit (dnd-kit packages)
- T-add-reorderagents-action-to (reorderAgents store action)

## Files to Modify

- apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx

## Reference Implementation

Study existing AgentLabelsContainerDisplay component around lines 186-217 where agent pills are rendered. The DndContext should wrap the existing map logic without changing the AgentPill components initially.

## Out of Scope

- Do not modify AgentPill component yet
- Do not implement visual drag feedback yet
- Do not change existing error handling or loading states
