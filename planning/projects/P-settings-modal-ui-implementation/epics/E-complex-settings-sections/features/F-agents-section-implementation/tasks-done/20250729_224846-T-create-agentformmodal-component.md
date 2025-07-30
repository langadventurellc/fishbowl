---
kind: task
id: T-create-agentformmodal-component
parent: F-agents-section-implementation
status: done
title: Create AgentFormModal component for modal dialog wrapper
priority: high
prerequisites:
  - T-create-agentform-component-with
created: "2025-07-29T22:09:53.956765"
updated: "2025-07-29T22:43:26.213230"
schema_version: "1.1"
worktree: null
---

# Create AgentFormModal Component for Modal Dialog Wrapper

## Context

Implement the `AgentFormModal` component that wraps the `AgentForm` in a modal dialog, following the established pattern used in `RoleFormModal.tsx`. This component handles modal state, unsaved changes protection, and keyboard shortcuts.

**Reference existing patterns:**

- `/apps/desktop/src/components/settings/RoleFormModal.tsx`
- `/apps/desktop/src/components/settings/types/RoleFormModalProps.ts`

## Implementation Requirements

Create `apps/desktop/src/components/settings/AgentFormModal.tsx`:

### 1. Component Architecture

```typescript
import React, { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { AgentForm } from "./AgentForm";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import {
  useUnsavedChanges,
  type AgentFormData,
  type AgentFormModalProps,
} from "@fishbowl-ai/shared";
```

### 2. Modal State Management

```typescript
const handleOpenChange = useCallback(
  async (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      const confirmed = await showConfirmation({
        title: "Unsaved Changes",
        message:
          "You have unsaved changes. Are you sure you want to close without saving?",
        confirmText: "Close Without Saving",
        cancelText: "Continue Editing",
      });
      if (!confirmed) return;
    }
    onOpenChange(open);
  },
  [hasUnsavedChanges, showConfirmation, onOpenChange],
);
```

### 3. Modal Content by Mode

**Create Mode:**

- Title: "Create New Agent"
- Description: "Configure a new AI agent with custom settings and behavior."

**Edit Mode:**

- Title: "Edit Agent"
- Description: "Update the agent's configuration and settings."

**Template Mode:**

- Title: "Create Agent from Template"
- Description: "Create a new agent based on the selected template configuration."

### 4. Form Integration

```typescript
<AgentForm
  mode={mode}
  initialData={agent}
  templateData={template}
  onSave={handleSave}
  onCancel={handleCancel}
  existingAgents={existingAgents}
  isLoading={isLoading}
/>
```

### 5. Keyboard Shortcuts

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + S to save (form handles actual submission)
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      // AgentForm component handles the actual submission
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen]);
```

### 6. Modal Styling and Layout

```typescript
<DialogContent className="agent-form-modal max-w-3xl max-h-[85vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>
      {mode === "create"
        ? "Create New Agent"
        : mode === "edit"
          ? "Edit Agent"
          : "Create Agent from Template"}
    </DialogTitle>
    <DialogDescription>
      {mode === "create"
        ? "Configure a new AI agent with custom settings and behavior."
        : mode === "edit"
          ? "Update the agent's configuration and settings."
          : "Create a new agent based on the selected template configuration."}
    </DialogDescription>
  </DialogHeader>

  <AgentForm {...formProps} />
</DialogContent>
```

### 7. Success Handling

```typescript
const handleSave = useCallback(
  async (data: AgentFormData) => {
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save agent:", error);
      // Error handling - form component will show validation errors
    }
  },
  [onSave, onOpenChange],
);
```

### 8. Template Data Handling

When `mode === "template"`, pass both `template` and initial agent data:

- Use template configuration for form defaults
- Generate appropriate agent name with template suffix
- Show template source in modal description

## Acceptance Criteria

- [ ] Modal component wraps AgentForm with proper dialog structure
- [ ] Supports create, edit, and template modes with appropriate titles/descriptions
- [ ] Unsaved changes protection with confirmation dialog
- [ ] Keyboard shortcuts (Ctrl/Cmd+S for save, Esc for close)
- [ ] Proper modal sizing (max-width 3xl, max-height 85vh, scrollable)
- [ ] Integration with useConfirmationDialog hook
- [ ] Form submission success closes modal
- [ ] Cancel button triggers unsaved changes check
- [ ] Template mode shows appropriate messaging
- [ ] Modal prevents interaction with background content
- [ ] Proper focus management when opening/closing
- [ ] Loading states handled during save operations
- [ ] Error handling for failed save operations

## Technical Approach

1. **Follow RoleFormModal pattern**: Use identical structure and behavior patterns
2. **Modal accessibility**: Proper focus management and keyboard navigation
3. **State integration**: Hook into unsaved changes and confirmation systems
4. **Mode handling**: Support all three modes (create/edit/template) with appropriate UI
5. **Error boundaries**: Graceful error handling for form operations

## Testing Requirements

Create unit tests covering:

- Modal opens/closes correctly for each mode
- Unsaved changes confirmation works
- Keyboard shortcuts function properly
- Form submission success closes modal
- Cancel button behavior with/without unsaved changes
- Template mode passes correct data to form
- Modal content updates based on mode
- Loading states during save operations

## Dependencies

- Requires AgentForm component (previous task)
- Uses existing confirmation dialog hook
- Integrates with shadcn/ui Dialog components
- Uses unsaved changes tracking from shared package

## Security Considerations

- Prevents accidental data loss through unsaved changes protection
- Modal overlay prevents interaction with background elements
- Form validation handled by wrapped AgentForm component
- Keyboard shortcut event handling is properly scoped

## Integration Points

This modal will be used by:

- "Create New Agent" button in Library tab
- Edit buttons on AgentCard components
- "Use Template" buttons on TemplateCard components

The modal provides a consistent interface for all agent creation/editing workflows while maintaining the established UX patterns from other form modals in the application.

### Log

**2025-07-30T03:48:46.872150Z** - Successfully implemented the AgentFormModal component following the exact pattern from RoleFormModal. The component provides a complete modal wrapper for agent creation and editing with comprehensive features:

**Key Features Implemented:**

- Modal dialog using shadcn/ui Dialog components with max-w-3xl and max-h-[85vh] sizing
- Support for all three modes (create, edit, template) with appropriate titles and descriptions
- Unsaved changes protection with confirmation dialog integration
- Keyboard shortcuts (Ctrl/Cmd+S for save, Esc for close)
- Proper form integration with AgentForm component
- Loading states and error handling
- Accessibility features with proper focus management

**Modal Content by Mode:**

- Create: "Create New Agent" with configuration description
- Edit: "Edit Agent" with update description
- Template: "Create Agent from Template" with template-based description

**Technical Implementation:**

- Follows established RoleFormModal pattern exactly
- Uses useConfirmationDialog hook for unsaved changes protection
- Integrates with useUnsavedChanges for global state tracking
- Proper TypeScript interfaces and error handling
- Comprehensive JSDoc documentation

The component is ready for integration with AgentsSection button interactions and provides a consistent modal experience following established UX patterns.

- filesChanged: ["apps/desktop/src/components/settings/AgentFormModal.tsx"]
