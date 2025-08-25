---
id: T-create-conversationagentviewmo
title: Create ConversationAgentViewModel UI type in ui-shared package
status: open
priority: high
parent: F-conversation-agents-hook-and
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T07:07:11.265Z
updated: 2025-08-25T07:07:11.265Z
---

# Create ConversationAgentViewModel UI Type

## Context

Implement the UI representation type for conversation agents that populates the base `ConversationAgent` with agent settings data. This type will be used by the `useConversationAgents` hook to provide complete agent data to UI components.

## Technical Requirements

### File Location

- `packages/ui-shared/src/types/conversationAgents/ConversationAgentViewModel.ts`

### Implementation Details

Create a TypeScript interface that extends the base `ConversationAgent` with populated agent data:

```typescript
import { AgentSettingsViewModel } from "../agents/AgentSettingsViewModel";
import { ConversationAgent } from "@fishbowl-ai/shared";

export interface ConversationAgentViewModel {
  id: string;
  conversationId: string;
  agentId: string;
  agent: AgentSettingsViewModel; // Populated agent data from settings
  addedAt: string; // ISO string timestamp
  isActive: boolean;
  displayOrder: number;
}
```

### Integration Requirements

- Import and use existing `AgentSettingsViewModel` from ui-shared types
- Import base `ConversationAgent` interface from shared package
- Follow existing ViewModel pattern used throughout the codebase
- Add to barrel exports in `packages/ui-shared/src/types/conversationAgents/index.ts`
- Update main types index if needed

### TypeScript Requirements

- Full TypeScript type safety with proper imports
- JSDoc documentation for interface and properties
- Consistent with existing type conventions
- Proper exports for use in other packages

## Testing Requirements

- Unit tests for type exports and imports
- Type validation tests ensuring proper structure
- Integration tests with existing AgentSettingsViewModel

## Acceptance Criteria

- ✅ ConversationAgentViewModel interface created with all required properties
- ✅ Proper imports from shared and ui-shared packages
- ✅ Added to barrel exports for package consumption
- ✅ Full TypeScript type safety without any errors
- ✅ JSDoc documentation for developer experience
- ✅ Unit tests covering type structure and exports
- ✅ Follows existing ViewModel patterns in codebase
- ✅ Compatible with planned useConversationAgents hook usage

## Dependencies

- Existing `AgentSettingsViewModel` type from ui-shared
- Base `ConversationAgent` interface from shared package
- Existing conversationAgents type structure (already implemented)

## Implementation Notes

- This is a pure TypeScript interface with no runtime behavior
- Must maintain compatibility with existing type system
- Should follow the exact pattern used by other ViewModels in the project
- Consider future extensibility for display-related properties
