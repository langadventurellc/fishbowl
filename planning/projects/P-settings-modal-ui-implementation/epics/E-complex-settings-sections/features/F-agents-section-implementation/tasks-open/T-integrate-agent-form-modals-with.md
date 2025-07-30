---
kind: task
id: T-integrate-agent-form-modals-with
title: Integrate agent form modals with AgentsSection button interactions
status: open
priority: high
prerequisites:
  - T-create-agentformmodal-component
created: "2025-07-29T22:10:38.612685"
updated: "2025-07-29T22:10:38.612685"
schema_version: "1.1"
parent: F-agents-section-implementation
---

# Integrate Agent Form Modals with AgentsSection Button Interactions

## Context

Connect the `AgentFormModal` component to all the interactive elements in the `AgentsSection` that currently only log to console. This includes the "Create New Agent" button, edit buttons on agent cards, and "Use Template" buttons on template cards.

**Current state:** All buttons exist but only perform `console.log` operations
**Target state:** Buttons open appropriate form modals with proper data handling

**Reference files:**

- `/apps/desktop/src/components/settings/AgentsSection.tsx` (lines 159-162, 312-318, 328-332, 482-485)
- Existing integration patterns in other settings sections

## Implementation Requirements

### 1. Add Modal State Management

Update `AgentsSection.tsx` to include modal state:

```typescript
// Add imports
import { AgentFormModal } from "./AgentFormModal";
import { useState, useCallback } from "react";

// Add state variables
const [agentModalState, setAgentModalState] = useState<{
  isOpen: boolean;
  mode: "create" | "edit" | "template";
  agent?: AgentCard;
  template?: AgentTemplate;
}>({
  isOpen: false,
  mode: "create",
});
```

### 2. Modal Control Functions

```typescript
const openCreateModal = useCallback(() => {
  setAgentModalState({
    isOpen: true,
    mode: "create",
  });
}, []);

const openEditModal = useCallback((agent: AgentCard) => {
  setAgentModalState({
    isOpen: true,
    mode: "edit",
    agent,
  });
}, []);

const openTemplateModal = useCallback((template: AgentTemplate) => {
  setAgentModalState({
    isOpen: true,
    mode: "template",
    template,
  });
}, []);

const closeModal = useCallback(() => {
  setAgentModalState({
    isOpen: false,
    mode: "create",
  });
}, []);
```

### 3. Form Save Handler

```typescript
const handleAgentSave = useCallback(
  async (data: AgentFormData) => {
    // UI-only implementation as per project requirements
    // In a real implementation, this would save to backend/local storage

    console.log("Agent save operation (UI-only):", {
      mode: agentModalState.mode,
      data,
      timestamp: new Date().toISOString(),
    });

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Show user feedback
    announceToScreenReader(
      `Agent ${data.name} ${agentModalState.mode === "edit" ? "updated" : "created"} successfully`,
      "polite",
    );
  },
  [agentModalState.mode, announceToScreenReader],
);
```

### 4. Update Library Tab Integration

Replace existing console.log calls in `LibraryTab`:

**Create New Agent Button (line 328-332):**

```typescript
<Button className="gap-2" onClick={openCreateModal}>
  <Plus className="h-4 w-4" />
  Create New Agent
</Button>
```

**Empty State Action (line 312-318):**

```typescript
<EmptyLibraryState
  onAction={openCreateModal}
/>
```

**Agent Card Edit Actions (line 159-162):**

```typescript
<AgentCard
  agent={agent}
  onEdit={openEditModal}
  onDelete={(agentId) => {
    console.log("Delete agent:", agentId);
    announceToScreenReader(`Deleting agent ${agent.name}`, "assertive");
  }}
/>
```

### 5. Update Templates Tab Integration

Replace existing console.log call in `TemplatesTab` (line 482-485):

```typescript
<TemplateCard
  key={template.id}
  template={template}
  onUseTemplate={() => openTemplateModal(template)}
/>
```

### 6. Add Modal Rendering

Add modal component at the end of `AgentsSection` component:

```typescript
return (
  <div className={cn("agents-section space-y-6", className)}>
    {/* existing content */}

    <AgentFormModal
      isOpen={agentModalState.isOpen}
      onOpenChange={closeModal}
      mode={agentModalState.mode}
      agent={agentModalState.agent}
      template={agentModalState.template}
      onSave={handleAgentSave}
      isLoading={false} // UI-only implementation
    />
  </div>
);
```

### 7. Type Updates

Ensure proper typing for all handlers:

```typescript
// Update AgentCard onEdit prop type
onEdit: (agent: AgentCard) => void;

// Update TemplateCard onUseTemplate prop type
onUseTemplate: (template: AgentTemplate) => void;

// Update EmptyLibraryState onAction prop type
onAction: () => void;
```

### 8. Accessibility Enhancements

```typescript
// Update announcements for better screen reader feedback
const handleAgentSave = useCallback(
  async (data: AgentFormData) => {
    // ... save logic ...

    const actionWord =
      agentModalState.mode === "edit"
        ? "updated"
        : agentModalState.mode === "template"
          ? "created from template"
          : "created";

    announceToScreenReader(
      `Agent ${data.name} ${actionWord} successfully`,
      "polite",
    );
  },
  [agentModalState.mode, announceToScreenReader],
);
```

## Acceptance Criteria

- [ ] "Create New Agent" button opens modal in create mode
- [ ] Empty state "Create your first agent" button opens modal in create mode
- [ ] Agent card edit buttons open modal in edit mode with agent data pre-populated
- [ ] Template card "Use Template" buttons open modal in template mode with template data
- [ ] Modal state properly manages mode, agent data, and template data
- [ ] Form save handler provides user feedback via screen reader announcements
- [ ] All console.log operations replaced with modal interactions
- [ ] Modal opens/closes smoothly with proper focus management
- [ ] Edit mode pre-populates form with existing agent data
- [ ] Template mode pre-populates form with template configuration
- [ ] Proper TypeScript typing for all event handlers
- [ ] UI-only save simulation with 500ms delay for realistic UX
- [ ] Screen reader announcements for successful operations
- [ ] No regressions in existing search, tab navigation, or card interactions

## Technical Approach

1. **State management**: Use simple useState for modal state rather than complex store
2. **Callback optimization**: Use useCallback for event handlers to prevent unnecessary re-renders
3. **UI-only simulation**: Implement realistic save behavior without actual persistence
4. **Accessibility**: Maintain existing screen reader support with new modal interactions
5. **Type safety**: Ensure all handlers have proper TypeScript typing

## Testing Requirements

Create integration tests covering:

- Create button opens modal in correct mode
- Edit button passes correct agent data to modal
- Template button passes correct template data to modal
- Modal state updates correctly for each mode
- Form submission triggers save handler with correct data
- Screen reader announcements work for save operations
- Modal closes after successful save
- All existing functionality continues to work

## Dependencies

- Requires AgentFormModal component (previous task)
- Uses existing AgentCard and TemplateCard components
- Integrates with existing announceToScreenReader utility
- Uses existing AgentTemplate and AgentCard types

## Security Considerations

- Form validation handled by AgentForm component
- No actual data persistence (UI-only as per project requirements)
- Input sanitization through form schema validation
- Modal prevents background interaction during editing

## User Experience Impact

- Transforms non-functional buttons into fully interactive agent management
- Provides consistent modal-based editing experience
- Maintains existing accessibility and keyboard navigation
- Adds visual feedback for successful operations
- Creates realistic preview of final functionality for stakeholder evaluation

This task completes the core agent management functionality by connecting all UI elements to working form modals, achieving the user's goal of being able to "see the UI change and show me the form to edit or create new agents."

### Log
