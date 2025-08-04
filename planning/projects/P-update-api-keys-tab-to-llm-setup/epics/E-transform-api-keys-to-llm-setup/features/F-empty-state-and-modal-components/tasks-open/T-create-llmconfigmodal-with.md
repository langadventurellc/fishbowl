---
kind: task
id: T-create-llmconfigmodal-with
title: Create LlmConfigModal with stacked modal implementation
status: open
priority: high
prerequisites:
  - F-code-migration-and-setup
created: "2025-08-04T12:14:42.374345"
updated: "2025-08-04T12:14:42.374345"
schema_version: "1.1"
parent: F-empty-state-and-modal-components
---

## Context

Build the configuration modal component that opens on top of the existing settings modal. This modal allows users to configure LLM provider APIs with form fields.

## Technical Approach

1. Create `apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx`
2. Use Dialog components from shadcn/ui for stacked modal pattern
3. Follow AgentFormModal.tsx pattern for modal structure
4. Implement proper z-index layering for modal stacking

## Implementation Details

### Component Structure:

```tsx
interface LlmConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "openai" | "anthropic";
  initialData?: {
    customName?: string;
    apiKey?: string;
    baseUrl?: string;
    useAuthHeader?: boolean;
  };
  onSave: (data: LlmConfigData) => void;
}
```

### Key Features:

- Modal title shows "Configure OpenAI" or "Configure Anthropic" based on provider
- Proper z-index management (z-50 or higher) to stack above settings modal
- Save and Cancel buttons in modal footer
- Modal backdrop darkens settings modal without closing it
- Smooth transitions (200ms) for open/close animations
- Focus management when modal opens/closes

### Reference Implementation:

- Study `apps/desktop/src/components/settings/agents/AgentFormModal.tsx` for patterns
- Use Dialog components with DialogPortal for proper stacking
- Ensure backdrop clicks don't close the settings modal underneath

## Acceptance Criteria

- [ ] Modal opens on top of settings modal with proper z-index
- [ ] Modal title reflects selected provider name
- [ ] Save button is always enabled (no validation required)
- [ ] Cancel button closes modal without saving
- [ ] Modal backdrop darkens but doesn't close settings modal
- [ ] Smooth 200ms transitions for open/close
- [ ] Focus moves to modal when opened
- [ ] Focus returns to trigger button when closed
- [ ] TypeScript interfaces properly defined
- [ ] Component follows existing modal patterns

## Testing Requirements

No tests!

## Dependencies

This task depends on F-code-migration-and-setup being completed first.

### Log
