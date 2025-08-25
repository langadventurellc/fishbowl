---
id: T-create-conversationagentviewmo
title: Create ConversationAgentViewModel type definition
status: done
priority: medium
parent: F-service-layer-and-ipc
prerequisites: []
affectedFiles:
  packages/ui-shared/src/types/conversationAgents/ConversationAgentViewModel.ts:
    Core ConversationAgentViewModel interface with all required fields,
    comprehensive JSDoc documentation, and proper TypeScript types following
    existing patterns
  packages/ui-shared/src/types/conversationAgents/index.ts: Barrel export file for conversationAgents types module
  packages/ui-shared/src/types/index.ts: Added conversationAgents export to main types index in alphabetical order
log:
  - Implemented ConversationAgentViewModel type definition with comprehensive
    JSDoc documentation. Created the type in ui-shared package following
    existing ViewModel patterns, using AgentSettingsViewModel for agent
    configuration data. Added proper barrel exports and updated main types
    index. All quality checks pass and shared libraries built successfully.
schema: v1.0
childrenIds: []
created: 2025-08-25T04:37:56.281Z
updated: 2025-08-25T04:37:56.281Z
---

# Create ConversationAgentViewModel type definition

## Context

Create the ConversationAgentViewModel type that combines conversation agent data with populated agent configuration details. This type will be used by the service layer and UI components.

## Technical Approach

Follow existing ViewModel patterns in the ui-shared package, providing a populated version of ConversationAgent that includes the full agent configuration data.

## Implementation Requirements

### Type Definition Location

Create `packages/ui-shared/src/types/conversationAgents/ConversationAgentViewModel.ts`:

```typescript
import { ConversationAgent } from "@fishbowl-ai/shared";
import { AgentSettingsViewModel } from "../agents"; // Use existing agent view model

/**
 * View model for conversation agent associations with populated agent data.
 *
 * Extends the base ConversationAgent with populated agent configuration
 * details from the settings store.
 */
export interface ConversationAgentViewModel {
  /** Unique identifier for the conversation-agent association */
  id: string;

  /** ID of the conversation */
  conversationId: string;

  /** ID of the agent configuration (from settings store) */
  agentId: string;

  /** Full agent configuration data populated from settings */
  agent: AgentSettingsViewModel;

  /** When the agent was added to the conversation */
  addedAt: Date;

  /** Whether the agent association is currently active */
  isActive: boolean;

  /** Display order for UI sorting (0-based) */
  displayOrder: number;
}
```

### Barrel Export Integration

Update the main barrel export file `packages/ui-shared/src/types/index.ts`:

```typescript
export * from "./conversationAgents/ConversationAgentViewModel";
```

Create a conversation agents barrel export `packages/ui-shared/src/types/conversationAgents/index.ts`:

```typescript
export * from "./ConversationAgentViewModel";
```

### JSDoc Documentation

Include comprehensive JSDoc documentation:

- Purpose and usage of the ViewModel
- Relationship between ConversationAgent and AgentSettingsViewModel
- Field descriptions with data sources
- Usage examples for service layer integration

### Type Safety Considerations

- Use existing AgentSettingsViewModel for agent data consistency
- Maintain compatibility with ConversationAgent base interface
- Ensure Date type usage matches existing patterns
- Use consistent naming conventions with other ViewModels

## Dependencies

- ConversationAgent interface from shared package
- AgentSettingsViewModel from existing ui-shared types
- Existing ui-shared type infrastructure

## Acceptance Criteria

- [ ] ConversationAgentViewModel interface defined with all required fields
- [ ] Uses existing AgentSettingsViewModel for agent data
- [ ] Comprehensive JSDoc documentation
- [ ] Barrel exports created and updated
- [ ] Type follows existing ViewModel patterns
- [ ] Compatible with ConversationAgent base interface
- [ ] Field types match intended usage patterns

## Implementation Notes

- This is a simple type definition task but critical for service layer integration
- The populated agent field provides the bridge between database and settings data
- Must be created before service layer implementation can be completed
- Should follow existing naming and documentation conventions
