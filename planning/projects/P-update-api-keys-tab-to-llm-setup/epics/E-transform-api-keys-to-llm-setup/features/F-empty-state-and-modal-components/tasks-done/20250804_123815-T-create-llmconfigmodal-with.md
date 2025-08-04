---
kind: task
id: T-create-llmconfigmodal-with
parent: F-empty-state-and-modal-components
status: done
title: Create LlmConfigModal with stacked modal implementation
priority: high
prerequisites:
  - F-code-migration-and-setup
created: "2025-08-04T12:14:42.374345"
updated: "2025-08-04T12:27:05.151634"
schema_version: "1.1"
worktree: null
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

**2025-08-04T17:38:15.717408Z** - Successfully implemented LlmConfigModal component with stacked modal implementation. The modal opens on top of the settings modal with proper z-index management (z-[60]) and includes all required form fields: custom name input, API key field with show/hide toggle using Eye/EyeOff icons, base URL field with provider-specific defaults (OpenAI: https://api.openai.com/v1, Anthropic: https://api.anthropic.com), and authorization header checkbox. Implemented React Hook Form with Zod validation, keyboard shortcuts (Ctrl/Cmd+S for save), smooth 200ms transitions, and proper focus management. Created separate TypeScript interface files to comply with linting rules. All quality checks pass successfully.

- filesChanged: ["apps/desktop/src/components/ui/checkbox.tsx", "apps/desktop/src/components/settings/llm-setup/LlmConfigModal.tsx", "apps/desktop/src/components/settings/llm-setup/LlmConfigData.ts", "apps/desktop/src/components/settings/llm-setup/LlmConfigModalProps.ts", "apps/desktop/src/components/settings/llm-setup/index.ts", "apps/desktop/package.json"]
