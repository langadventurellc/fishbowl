---
kind: task
id: T-create-llmsetupsection-component
title: Create LlmSetupSection component with state management
status: open
priority: normal
prerequisites:
  - T-create-emptyllmstate-component
  - T-add-keyboard-shortcuts-and
created: "2025-08-04T12:15:37.172834"
updated: "2025-08-04T12:15:37.172834"
schema_version: "1.1"
parent: F-empty-state-and-modal-components
---

## Context

Create the main LlmSetupSection component that integrates EmptyLlmState and LlmConfigModal. This component manages the UI state and coordinates between the empty state and modal.

## Technical Approach

1. Create `apps/desktop/src/components/settings/llm-setup/LlmSetupSection.tsx`
2. Manage local state for modal visibility and mock configured APIs
3. Handle transitions between empty and configured states
4. Create barrel export in `llm-setup/index.ts`

## Implementation Details

### Component Structure:

```tsx
export const LlmSetupSection: React.FC = () => {
  // Local state for UI demonstration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    "openai" | "anthropic"
  >("openai");
  const [configuredApis, setConfiguredApis] = useState<LlmConfig[]>([]);

  // ... component logic
};
```

### State Management:

- Track modal open/close state
- Store selected provider for modal
- Maintain list of configured APIs (UI state only)
- Handle adding new configurations

### Component Integration:

- Show EmptyLlmState when no APIs configured
- Show provider cards when APIs exist (future feature)
- Open modal from empty state button click
- Pass provider selection to modal

### File Structure:

```
llm-setup/
├── EmptyLlmState.tsx
├── LlmConfigModal.tsx
├── LlmSetupSection.tsx
└── index.ts (barrel exports)
```

## Acceptance Criteria

- [ ] Component renders EmptyLlmState when no APIs configured
- [ ] Clicking setup button opens LlmConfigModal
- [ ] Modal receives selected provider from dropdown
- [ ] Saving in modal adds to configured APIs list
- [ ] Component manages all UI state locally
- [ ] Barrel export created for clean imports
- [ ] TypeScript types for all data structures
- [ ] Component integrates smoothly with SettingsContent
- [ ] Follows existing section component patterns

## Testing Requirements

No tests!

## Integration Points

- This component will be imported by SettingsContent.tsx
- Must follow same patterns as other settings sections
- No persistence logic (UI state only)

## Dependencies

This task depends on:

- T-create-emptyllmstate-component for the empty state
- T-add-keyboard-shortcuts-and for the complete modal

### Log
