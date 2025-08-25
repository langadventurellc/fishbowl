---
id: T-create-addagenttoconversationm-1
title: Create AddAgentToConversationModal component with selection dropdown
status: done
priority: high
parent: F-add-agent-modal-component
prerequisites:
  - T-create-addagenttoconversationm
affectedFiles:
  apps/desktop/src/components/modals/AddAgentToConversationModal.tsx:
    Created new modal component with agent selection dropdown, form validation,
    loading states, and error handling following RenameConversationModal pattern
  apps/desktop/src/components/modals/__tests__/AddAgentToConversationModal.test.tsx:
    Created comprehensive unit test suite with 26 tests covering all
    functionality, edge cases, and accessibility requirements
log:
  - Implemented AddAgentToConversationModal component with selection dropdown
    following established modal patterns. Component features agent selection
    dropdown populated from useAgentsStore, filters out agents already in
    conversation, includes form validation, loading states, error handling, and
    proper accessibility. All tests passing with 26 comprehensive test cases
    covering rendering, filtering, form interaction, loading states, error
    handling, and accessibility.
schema: v1.0
childrenIds: []
created: 2025-08-25T17:42:39.165Z
updated: 2025-08-25T17:42:39.165Z
---

# Create AddAgentToConversationModal Component

## Context

Implement the core modal component for adding agents to conversations, following the established modal patterns from RenameConversationModal and using the existing select component patterns from PersonalitySelect and RoleSelect.

## Related Work

- Feature: F-add-agent-modal-component
- Epic: E-add-agents-to-conversations
- Prerequisites: T-create-addagenttoconversationm (props interface)
- Pattern References:
  - apps/desktop/src/components/modals/RenameConversationModal.tsx
  - apps/desktop/src/components/settings/agents/PersonalitySelect.tsx

## Implementation Requirements

### 1. Create Modal Component

**File Location**: `apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`

**Component Structure**:

```typescript
export function AddAgentToConversationModal({
  open,
  onOpenChange,
  conversationId,
  onAgentAdded,
}: AddAgentToConversationModalProps): React.ReactElement {
  // State management
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Hooks
  const { agents } = useAgentsStore();
  const { conversationAgents, addAgent, error } =
    useConversationAgents(conversationId);

  // Component logic
  // Modal JSX following RenameConversationModal pattern
}
```

### 2. Agent Selection Logic

**Available Agents Filtering**:

- Get all agents from useAgentsStore
- Filter out agents already in conversation (from useConversationAgents)
- Sort alphabetically by name for easy discovery
- Handle empty state when no agents available

**Selection Interface**:

- Use shadcn/ui Select components (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)
- Display agent name as primary text
- Show agent role and personality as secondary text
- Include placeholder text "Select an agent to add"

### 3. Form Handling

**Validation**:

- Agent must be selected (required field)
- Prevent duplicate addition (already filtered from dropdown)
- Real-time validation with disabled submit button

**Submission Flow**:

```typescript
const handleSubmit = useCallback(async () => {
  if (!selectedAgentId || isSubmitting) return;

  setIsSubmitting(true);
  setLocalError(null);

  try {
    await addAgent(selectedAgentId);

    // Success: close modal and call optional callback
    onOpenChange(false);
    onAgentAdded?.();
  } catch (err) {
    setLocalError("Failed to add agent to conversation");
  } finally {
    setIsSubmitting(false);
  }
}, [selectedAgentId, addAgent, onOpenChange, onAgentAdded, isSubmitting]);
```

### 4. Modal Structure

**Dialog Layout**:

- DialogHeader with title "Add Agent to Conversation"
- DialogDescription: "Select an agent to add to this conversation"
- Form content area with agent selection dropdown
- DialogFooter with Cancel and Add buttons

**Loading States**:

- Submit button shows loading spinner during submission
- Submit button disabled during loading
- Form disabled during submission

**Error Handling**:

- Display errors from useConversationAgents hook
- Show local validation errors
- Error styling with AlertCircle icon

### 5. Accessibility

**Focus Management**:

- Auto-focus select dropdown when modal opens
- Focus trap within modal
- Return focus to trigger after close

**ARIA Attributes**:

- Proper ARIA labels for select dropdown
- Error announcements for screen readers
- Loading state announcements

**Keyboard Navigation**:

- Enter key submits form when agent selected
- Escape key closes modal
- Full keyboard navigation through select options

## Technical Approach

### 1. Component Architecture

- Functional component with TypeScript
- Controlled component pattern (no internal state for agent selection)
- Proper cleanup on unmount and modal close

### 2. State Management

- Local state for form submission and validation
- Integration with existing useConversationAgents hook
- Error state handling at component level

### 3. Modal Lifecycle

- Reset form state when modal opens
- Clear errors on open
- Focus management on open/close

### 4. Integration Pattern

```typescript
// Usage pattern in AgentLabelsContainerDisplay
const [addModalOpen, setAddModalOpen] = useState(false);

return (
  <>
    <Button onClick={() => setAddModalOpen(true)}>
      Add Agent
    </Button>

    <AddAgentToConversationModal
      open={addModalOpen}
      onOpenChange={setAddModalOpen}
      conversationId={selectedConversationId}
      onAgentAdded={() => {
        // Optional: trigger refetch or show success message
      }}
    />
  </>
);
```

## Acceptance Criteria

### Functional Requirements

- ✅ Modal opens/closes with proper state management
- ✅ Agent dropdown populated from useAgentsStore
- ✅ Agents already in conversation are filtered out
- ✅ Selected agent can be successfully added via useConversationAgents
- ✅ Modal closes automatically on successful addition
- ✅ Form validation prevents submission without selection
- ✅ Loading states displayed during submission
- ✅ Error messages shown for failed operations

### UI/UX Requirements

- ✅ Consistent styling with existing modals (RenameConversationModal)
- ✅ Agent selection shows name, role, and personality information
- ✅ Proper disabled states during loading
- ✅ Loading spinner on submit button during operation
- ✅ Error styling consistent with existing patterns

### Accessibility Requirements

- ✅ Keyboard navigation support (Tab, Enter, Escape)
- ✅ Proper ARIA labels and descriptions
- ✅ Focus management (auto-focus dropdown, focus trap)
- ✅ Screen reader announcements for state changes
- ✅ High contrast mode compatibility

### Integration Requirements

- ✅ Compatible with useConversationAgents hook
- ✅ Integrates with useAgentsStore for agent data
- ✅ Follows established modal component patterns
- ✅ Props interface matches AddAgentToConversationModalProps

### Testing Requirements

- ✅ Unit tests for component rendering and behavior
- ✅ Test agent selection and form submission
- ✅ Test loading states and error handling
- ✅ Test keyboard navigation and accessibility
- ✅ Test integration with hooks (mocked)
- ✅ Test modal lifecycle (open/close behavior)

## Dependencies

- AddAgentToConversationModalProps interface (prerequisite)
- useConversationAgents hook (already implemented)
- useAgentsStore hook (existing)
- shadcn/ui Dialog and Select components (existing)

## Files to Create

- `apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`
- `apps/desktop/src/components/modals/__tests__/AddAgentToConversationModal.test.tsx`

## Files to Modify

- `apps/desktop/src/components/modals/index.ts` (add export)

## Security Considerations

- Input validation for conversationId parameter
- Prevent XSS through proper text escaping
- Validate agent selection against available agents
- Error message sanitization
