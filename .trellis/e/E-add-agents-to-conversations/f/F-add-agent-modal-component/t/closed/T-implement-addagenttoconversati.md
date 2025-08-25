---
id: T-implement-addagenttoconversati
title: Implement AddAgentToConversationModal component with agent selection
status: done
priority: high
parent: F-add-agent-modal-component
prerequisites:
  - T-create-addagenttoconversationm
  - T-update-agentlabelscontainerdis
affectedFiles:
  apps/desktop/src/components/modals/index.ts:
    Created new barrel export file for
    modal components, exporting AddAgentToConversationModal and
    RenameConversationModal following established patterns
log:
  - Successfully verified AddAgentToConversationModal component implementation.
    The component was already fully implemented with comprehensive functionality
    including agent selection dropdown, form validation, loading states, error
    handling, and accessibility support. Created the missing barrel export file
    (apps/desktop/src/components/modals/index.ts) to properly export both modal
    components. All 26 unit tests are passing, covering rendering, agent
    filtering, form interaction, loading states, error handling, accessibility,
    and edge cases. Quality checks (TypeScript, linting, formatting) all pass
    successfully.
schema: v1.0
childrenIds: []
created: 2025-08-25T17:43:50.193Z
updated: 2025-08-25T17:43:50.193Z
---

# Implement AddAgentToConversationModal Component

## Context

Create the complete modal component implementation following RenameConversationModal patterns and integrating with useConversationAgents hook and useAgentsStore for agent selection functionality.

## Related Work

- Feature: F-add-agent-modal-component
- Epic: E-add-agents-to-conversations
- Prerequisites:
  - T-create-addagenttoconversationm (props interface)
  - T-update-agentlabelscontainerdis (props update)
- Pattern References:
  - apps/desktop/src/components/modals/RenameConversationModal.tsx (modal structure)
  - apps/desktop/src/components/settings/agents/PersonalitySelect.tsx (select patterns)

## Implementation Requirements

### 1. Create Modal Component File

**File Location**: `apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`

**Required Imports**:

```typescript
import React, { useState, useCallback, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { AddAgentToConversationModalProps } from "@fishbowl-ai/ui-shared";
import { useAgentsStore } from "@fishbowl-ai/ui-shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useConversationAgents } from "../../hooks/useConversationAgents";
```

### 2. Component State Management

**State Variables**:

- `selectedAgentId: string` - Currently selected agent ID
- `isSubmitting: boolean` - Loading state during submission
- `localError: string | null` - Form validation and submission errors

**State Reset Logic**:

- Reset selectedAgentId when modal opens
- Clear localError on modal open
- Reset form state after successful submission

### 3. Agent Selection Logic

**Available Agents Computation**:

```typescript
const availableAgents = useMemo(() => {
  const conversationAgentIds = new Set(
    conversationAgents.map((ca) => ca.agentId),
  );

  return agents
    .filter((agent) => !conversationAgentIds.has(agent.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}, [agents, conversationAgents]);
```

**Selection Interface**:

- Select dropdown with agent options
- Display format: "{agent.name} - {agent.role?.name}"
- Empty state message: "No available agents to add"
- Placeholder: "Select an agent to add"

### 4. Form Validation

**Client-side Validation**:

- Required field validation (agent must be selected)
- Disabled submit button when no selection
- Real-time validation feedback

**Validation Logic**:

```typescript
const canSubmit =
  selectedAgentId && !isSubmitting && availableAgents.length > 0;
```

### 5. Submit Handler

**Implementation**:

```typescript
const handleSubmit = useCallback(async () => {
  if (!selectedAgentId || isSubmitting) return;

  setIsSubmitting(true);
  setLocalError(null);

  try {
    await addAgent(selectedAgentId);

    // Success: close modal and notify parent
    onOpenChange(false);
    onAgentAdded?.();
  } catch (err) {
    setLocalError("Failed to add agent to conversation");
  } finally {
    setIsSubmitting(false);
  }
}, [selectedAgentId, addAgent, onOpenChange, onAgentAdded, isSubmitting]);
```

### 6. Error Display

**Error Sources**:

- Hook errors from useConversationAgents
- Local validation errors
- Network/submission errors

**Display Pattern**:

```typescript
const displayError = localError || error?.message;

{displayError && (
  <div className="flex items-center gap-2 text-sm text-destructive">
    <AlertCircle className="h-4 w-4" />
    <span>{displayError}</span>
  </div>
)}
```

### 7. Keyboard Support

**Key Handlers**:

- Enter key triggers submission when agent selected
- Escape key closes modal (if not submitting)
- Proper event prevention and bubbling

## Acceptance Criteria

### Modal Behavior Requirements

- ✅ Modal opens/closes with proper focus management
- ✅ Form resets when modal opens
- ✅ Auto-focus on agent selection dropdown
- ✅ Modal closes on successful agent addition
- ✅ Modal can be cancelled without adding agent

### Agent Selection Requirements

- ✅ Dropdown populated with available agents from useAgentsStore
- ✅ Agents already in conversation filtered out (no duplicates)
- ✅ Agents sorted alphabetically for easy discovery
- ✅ Agent display includes name and role information
- ✅ Empty state handled when no agents available

### Form Validation Requirements

- ✅ Submit button disabled until agent selected
- ✅ Required field validation with user feedback
- ✅ Real-time validation state updates
- ✅ Error messages displayed inline
- ✅ Validation errors prevent submission

### Loading and Error States

- ✅ Submit button shows loading spinner during submission
- ✅ Form disabled during submission to prevent double-submission
- ✅ Error messages from useConversationAgents hook displayed
- ✅ Local validation errors displayed appropriately
- ✅ Error styling consistent with existing patterns

### Accessibility Requirements

- ✅ Proper ARIA labels for all form elements
- ✅ Keyboard navigation support (Tab, Enter, Escape)
- ✅ Focus trap within modal dialog
- ✅ Screen reader compatible with state announcements
- ✅ High contrast mode support

### Integration Requirements

- ✅ useConversationAgents hook integration works correctly
- ✅ useAgentsStore integration for agent data
- ✅ Props interface matches AddAgentToConversationModalProps
- ✅ Component follows established modal patterns

### Testing Requirements

- ✅ Unit tests for component rendering
- ✅ Tests for agent selection functionality
- ✅ Tests for form submission and validation
- ✅ Tests for loading states and error handling
- ✅ Tests for keyboard navigation
- ✅ Tests for modal lifecycle behavior
- ✅ Integration tests with mocked hooks

## Dependencies

- AddAgentToConversationModalProps interface (T-create-addagenttoconversationm)
- AgentLabelsContainerDisplayProps update (T-update-agentlabelscontainerdis)
- useConversationAgents hook (already implemented)
- useAgentsStore hook (existing)

## Files to Create

- `apps/desktop/src/components/modals/AddAgentToConversationModal.tsx`
- `apps/desktop/src/components/modals/__tests__/AddAgentToConversationModal.test.tsx`

## Files to Modify

- `apps/desktop/src/components/modals/index.ts` (add export)

## Quality Checks

- Run `pnpm type-check` for TypeScript validation
- Run `pnpm test` for unit test validation
- Run `pnpm quality` for linting and formatting
