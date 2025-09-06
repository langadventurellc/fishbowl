---
id: T-create-sortableagentpill
title: Create SortableAgentPill wrapper component
status: done
priority: medium
parent: F-agent-pills-drag-and-drop
prerequisites:
  - T-implement-dndcontext-and
affectedFiles: {}
log:
  - "Task was already completed in prerequisite work. The SortableAgentPill
    component exists at apps/desktop/src/components/chat/SortableAgentPill.tsx
    with all required functionality: useSortable hook integration,
    transform/transition styles, visual drag feedback (opacity), and proper prop
    forwarding to AgentPill. Component is actively imported and used in
    AgentLabelsContainerDisplay.tsx."
schema: v1.0
childrenIds: []
created: 2025-09-06T02:19:42.617Z
updated: 2025-09-06T02:19:42.617Z
---

# Create SortableAgentPill wrapper component

## Context

Create a wrapper component that makes individual AgentPill components draggable using dnd-kit's useSortable hook while preserving all existing AgentPill functionality and click behaviors.

## Specific Requirements

- Create SortableAgentPill component that wraps existing AgentPill
- Use useSortable hook with conversationAgent.id as unique identifier
- Apply transform and transition styles from dnd-kit utilities
- Forward all props to wrapped AgentPill component
- Provide basic visual feedback during drag (opacity change)
- Preserve all existing click handlers and behavior

## Technical Approach

1. Create new file: apps/desktop/src/components/chat/SortableAgentPill.tsx
2. Import useSortable hook and CSS utility from dnd-kit
3. Use useSortable with id prop, extract setNodeRef, attributes, listeners, transform
4. Apply CSS.Transform.toString(transform) and transition styles
5. Wrap AgentPill with div that has sortable attributes and listeners
6. Forward all AgentPill props unchanged

## Acceptance Criteria

- [ ] SortableAgentPill component created with useSortable hook
- [ ] Uses conversationAgent.id as sortable identifier
- [ ] Applies transform and transition styles correctly
- [ ] Forwards all props to AgentPill unchanged
- [ ] Provides visual drag feedback (reduced opacity during drag)
- [ ] Preserves all click behavior (onToggleEnabled, onDelete)
- [ ] Component properly typed with TypeScript
- [ ] Unit tests verify props forwarding and sortable behavior

## Dependencies

- T-implement-dndcontext-and (DndContext setup)

## Files to Create

- apps/desktop/src/components/chat/SortableAgentPill.tsx

## Props Interface

The component should accept the same props as AgentPill plus:

- `id: string` (conversationAgent.id for useSortable)

## Reference Implementation

Look at AgentPill usage in AgentLabelsContainerDisplay (lines 205-216) to understand the props that need to be forwarded.

## Out of Scope

- Do not modify AgentPill component itself
- Do not implement custom drag overlays or complex animations
- Do not change AgentPill's internal styling
