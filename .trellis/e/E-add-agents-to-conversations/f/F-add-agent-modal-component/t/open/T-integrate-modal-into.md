---
id: T-integrate-modal-into
title: Integrate modal into AgentLabelsContainerDisplay with conversation agents
status: open
priority: high
parent: F-add-agent-modal-component
prerequisites:
  - T-implement-addagenttoconversati
  - T-update-agentlabelscontainerdis
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T17:44:34.507Z
updated: 2025-08-25T17:44:34.507Z
---

# Integrate Modal into AgentLabelsContainerDisplay

## Context

Update the AgentLabelsContainerDisplay component to use useConversationAgents hook, display conversation-specific agents, and integrate the AddAgentToConversationModal for adding new agents to conversations.

## Related Work

- Feature: F-add-agent-modal-component
- Epic: E-add-agents-to-conversations
- Prerequisites:
  - T-implement-addagenttoconversati (modal component)
  - T-update-agentlabelscontainerdis (props interface update)
- Current File: apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx

## Implementation Requirements

### 1. Update Component Implementation

**File**: `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

**Required Changes**:

**Add Imports**:

```typescript
import { useState } from "react";
import { useConversationAgents } from "../../hooks/useConversationAgents";
import { AddAgentToConversationModal } from "../modals/AddAgentToConversationModal";
```

**Update Component Logic**:

```typescript
export const AgentLabelsContainerDisplay: React.FC<AgentLabelsContainerDisplayProps> = ({
  // Remove agents prop - will be populated from hook
  onAddAgent, // Keep for backward compatibility
  selectedConversationId, // NEW prop
  barHeight = "56px",
  agentSpacing = "8px",
  containerPadding = "0 16px",
  horizontalScroll = true,
  showBottomBorder = true,
  backgroundVariant = "card",
  className,
  style,
}) => {
  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Hook integration
  const { conversationAgents, isLoading, error } = useConversationAgents(selectedConversationId);

  // Transform conversation agents to display format
  const displayAgents = conversationAgents.map(ca => ca.agent);

  // Handler for Add Agent button
  const handleAddAgent = useCallback(() => {
    if (onAddAgent) {
      onAddAgent(); // Maintain backward compatibility
    } else {
      setAddModalOpen(true); // New modal behavior
    }
  }, [onAddAgent]);

  // Add Agent button should be disabled when no conversation selected
  const canAddAgent = !!selectedConversationId;
```

### 2. Agent Display Integration

**Agent Pills Display**:

- Use conversationAgents from useConversationAgents hook instead of props.agents
- Transform ConversationAgentViewModel to AgentViewModel for display
- Handle loading states during agent fetch
- Display error states when agent loading fails

**Loading State Handling**:

```typescript
{isLoading && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Loading agents...</span>
  </div>
)}
```

### 3. Add Agent Button Logic

**Button State Management**:

- Disabled when selectedConversationId is null
- Disabled during loading states
- Shows tooltip when disabled explaining why
- Opens modal when clicked (if selectedConversationId exists)

**Button Implementation**:

```typescript
<Button
  variant="ghost"
  size="small"
  onClick={handleAddAgent}
  disabled={!canAddAgent || isLoading}
  className="add-agent-button"
  aria-label={!canAddAgent ? "Select a conversation to add agents" : "Add agent to conversation"}
  title={!canAddAgent ? "Select a conversation to add agents" : undefined}
>
  +
</Button>
```

### 4. Modal Integration

**Modal Implementation**:

```typescript
{selectedConversationId && (
  <AddAgentToConversationModal
    open={addModalOpen}
    onOpenChange={setAddModalOpen}
    conversationId={selectedConversationId}
    onAgentAdded={() => {
      // Modal will trigger useConversationAgents refetch automatically
      // No additional action needed
    }}
  />
)}
```

### 5. Error Handling

**Error Display**:

- Show errors from useConversationAgents hook
- Display in consistent error format
- Provide retry mechanism where appropriate

**Error State**:

```typescript
{error && (
  <div className="flex items-center gap-2 text-sm text-destructive">
    <AlertCircle className="h-4 w-4" />
    <span>Failed to load agents: {error.message}</span>
  </div>
)}
```

### 6. Backward Compatibility

**Legacy Support**:

- Support both props.agents (legacy) and useConversationAgents (new)
- Maintain onAddAgent callback for existing usage
- Graceful degradation when selectedConversationId not provided

**Compatibility Logic**:

```typescript
// Use conversation agents if selectedConversationId provided, otherwise fall back to props
const displayAgents = selectedConversationId
  ? conversationAgents.map((ca) => ca.agent)
  : agents;
```

## Technical Approach

### 1. Hook Integration Strategy

- Primary data source: useConversationAgents hook
- Fallback data source: props.agents (backward compatibility)
- Loading state management through hook
- Error handling through hook + local error state

### 2. Modal State Management

- Local state for modal open/close
- Modal triggered by Add Agent button click
- Modal automatically refetches data through useConversationAgents

### 3. Component Architecture

- Functional component with hooks
- Proper dependency arrays for useCallback/useEffect
- Memoization where appropriate for performance

## Acceptance Criteria

### Functional Requirements

- ✅ Component uses useConversationAgents hook when selectedConversationId provided
- ✅ Displays conversation-specific agents as pills
- ✅ Add Agent button opens AddAgentToConversationModal
- ✅ Add Agent button disabled when no conversation selected
- ✅ Modal integration works with automatic data refresh
- ✅ Backward compatibility maintained for existing usage

### UI/UX Requirements

- ✅ Loading states displayed during agent fetch
- ✅ Error states displayed with retry options
- ✅ Add Agent button shows appropriate disabled state
- ✅ Tooltip/title explains why button is disabled
- ✅ Agent pills display correctly with conversation data

### Integration Requirements

- ✅ useConversationAgents hook integration works correctly
- ✅ useAgentsStore integration maintained for modal
- ✅ AddAgentToConversationModal integration complete
- ✅ Props interface update properly implemented
- ✅ Component follows established patterns

### State Management Requirements

- ✅ Modal state managed locally with useState
- ✅ Agent data managed through useConversationAgents
- ✅ Loading and error states properly handled
- ✅ State synchronization after agent addition

### Accessibility Requirements

- ✅ Proper ARIA labels for disabled button states
- ✅ Screen reader announcements for loading/error states
- ✅ Keyboard navigation maintained
- ✅ Focus management with modal integration

### Testing Requirements

- ✅ Unit tests for component rendering with different props
- ✅ Tests for useConversationAgents hook integration
- ✅ Tests for modal state management
- ✅ Tests for Add Agent button behavior
- ✅ Tests for loading and error states
- ✅ Tests for backward compatibility scenarios

## Dependencies

- AddAgentToConversationModalProps interface (T-create-addagenttoconversationm)
- AgentLabelsContainerDisplayProps update (T-update-agentlabelscontainerdis)
- AddAgentToConversationModal component (T-implement-addagenttoconversati)
- useConversationAgents hook (already implemented)

## Files to Modify

- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`
- `apps/desktop/src/components/layout/__tests__/AgentLabelsContainerDisplay.test.tsx` (if exists, otherwise create)

## Files to Create

- `apps/desktop/src/components/layout/__tests__/AgentLabelsContainerDisplay.test.tsx` (if not exists)

## Quality Checks

- Run `pnpm type-check` for TypeScript validation
- Run `pnpm test` for unit test validation
- Run `pnpm quality` for linting and formatting
- Manual testing: modal opens, agents display, integration works
