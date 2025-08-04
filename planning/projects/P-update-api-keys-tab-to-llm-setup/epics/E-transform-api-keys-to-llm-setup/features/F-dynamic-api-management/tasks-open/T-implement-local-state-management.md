---
kind: task
id: T-implement-local-state-management
title: Implement local state management for API configurations
status: open
priority: high
prerequisites:
  - T-implement-uuid-generation
created: "2025-08-04T13:36:47.039260"
updated: "2025-08-04T13:36:47.039260"
schema_version: "1.1"
parent: F-dynamic-api-management
---

## Context

The LlmSetupSection component needs to manage an array of API configurations with full CRUD operations. This is a UI-only implementation with no persistence - configurations exist only in component state.

## Implementation Requirements

- Add state for managing array of API configurations
- Each configuration includes: id, customName, provider, apiKey, baseUrl, useAuthHeader
- Implement add functionality to append new configurations
- Implement update functionality for editing existing configurations
- Implement delete functionality to remove configurations
- Handle transitions between empty state and card list views

## Technical Approach

1. Update `apps/desktop/src/components/settings/LlmSetupSection.tsx`:
   - Add state: `const [configuredApis, setConfiguredApis] = useState<LlmProviderConfig[]>([]);`
   - Define the interface extending LlmConfigData with an id field
2. Update the handleSave function to:
   - Generate UUID for new configurations
   - Update existing configuration if editing
   - Append to array if adding new
3. Add handleEdit function to:
   - Set the editing configuration
   - Open modal with pre-filled data
4. Add handleDelete function to:
   - Filter out the configuration by ID
   - Close any open dialogs
5. Implement conditional rendering:
   - Show EmptyLlmState when array is empty
   - Show list of LlmProviderCards when configurations exist

## State Interface

```typescript
interface LlmProviderConfig extends LlmConfigData {
  id: string;
}
```

## Acceptance Criteria

- ✓ State properly typed with TypeScript interface
- ✓ Add new configuration appends to array with generated UUID
- ✓ Edit updates specific configuration by ID
- ✓ Delete removes configuration from array
- ✓ Empty state shows when no configurations
- ✓ Card list shows when configurations exist
- ✓ Smooth transitions between states
- ✓ No persistence - state exists only during session

## Dependencies

- Requires T-implement-uuid-generation for ID generation

## File Location

- Update: `apps/desktop/src/components/settings/LlmSetupSection.tsx`

### Log
