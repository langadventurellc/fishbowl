---
id: E-add-agents-to-conversations
title: Add Agents to Conversations
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  migrations/002_create_conversation_agents.sql: Created new database migration
    script with conversation_agents table definition, including comprehensive
    comments explaining design decisions, proper foreign key relationships,
    unique constraints, and performance indexes following SQLite best practices
    and existing project conventions.
  packages/shared/src/types/conversationAgents/ConversationAgent.ts:
    Core ConversationAgent interface matching database schema with comprehensive
    JSDoc documentation
  packages/shared/src/types/conversationAgents/AddAgentToConversationInput.ts: Input type for adding agents to conversations with optional display_order
  packages/shared/src/types/conversationAgents/RemoveAgentFromConversationInput.ts: Input type for removing agents from conversations
  packages/shared/src/types/conversationAgents/UpdateConversationAgentInput.ts: Input type for updating conversation agent associations
  packages/shared/src/types/conversationAgents/ConversationAgentResult.ts: Result type for single conversation agent operations
  packages/shared/src/types/conversationAgents/ConversationAgentsResult.ts: Result type for multiple conversation agents operations
  packages/shared/src/types/conversationAgents/schemas/conversationAgentSchema.ts: Zod schema for complete conversation agent validation with business rules
  packages/shared/src/types/conversationAgents/schemas/addAgentToConversationInputSchema.ts: Zod schema for validating agent addition input
  packages/shared/src/types/conversationAgents/schemas/removeAgentFromConversationInputSchema.ts: Zod schema for validating agent removal input
  packages/shared/src/types/conversationAgents/schemas/updateConversationAgentInputSchema.ts: Zod schema for validating conversation agent updates with refine logic
  packages/shared/src/types/conversationAgents/schemas/index.ts: Barrel export file for schemas and inferred types
  packages/shared/src/types/conversationAgents/errors/ConversationAgentNotFoundError.ts:
    Custom error for conversation agent not found scenarios with flexible
    constructor parameters
  packages/shared/src/types/conversationAgents/errors/ConversationAgentValidationError.ts: Custom error for validation failures with detailed error information
  packages/shared/src/types/conversationAgents/errors/DuplicateAgentError.ts: Custom error for duplicate agent assignment attempts
  packages/shared/src/types/conversationAgents/errors/index.ts: Barrel export file for error classes
  packages/shared/src/types/conversationAgents/index.ts: Main barrel export file for all conversation agent types
  packages/shared/src/types/index.ts: Added conversationAgents export to main types index
  packages/shared/src/types/conversationAgents/schemas/__tests__/conversationAgentSchema.test.ts:
    Comprehensive tests for core schema validation covering all fields and edge
    cases
  packages/shared/src/types/conversationAgents/schemas/__tests__/addAgentToConversationInputSchema.test.ts: Tests for agent addition input validation schema
  packages/shared/src/types/conversationAgents/schemas/__tests__/updateConversationAgentInputSchema.test.ts: Tests for agent update input validation including refine logic
  packages/shared/src/types/conversationAgents/errors/__tests__/ConversationAgentNotFoundError.test.ts:
    Tests for ConversationAgentNotFoundError with various constructor parameters
    and serialization
  packages/shared/src/types/conversationAgents/errors/__tests__/ConversationAgentValidationError.test.ts: Tests for ConversationAgentValidationError with multiple validation scenarios
  packages/shared/src/types/conversationAgents/errors/__tests__/DuplicateAgentError.test.ts: Tests for DuplicateAgentError with various ID formats and edge cases
  packages/shared/src/repositories/conversationAgents/ConversationAgentsRepository.ts:
    Complete repository implementation with CRUD operations, domain-specific
    queries, validation, error handling, and logging following
    ConversationsRepository pattern
  packages/shared/src/repositories/conversationAgents/__tests__/ConversationAgentsRepository.test.ts:
    Comprehensive test suite covering all methods, error cases, validation, and
    edge cases with 17 passing tests
  packages/shared/src/repositories/conversationAgents/__tests__/exports.test.ts: Export validation tests ensuring proper barrel exports
  packages/shared/src/repositories/conversationAgents/index.ts: Barrel export file for ConversationAgentsRepository
  packages/shared/src/repositories/index.ts: Added conversationAgents export to main repositories index
log: []
schema: v1.0
childrenIds:
  - F-add-agent-modal-component
  - F-component-prop-threading-and
  - F-database-schema-for
  - F-service-layer-and-ipc
  - F-ui-state-management-and-hooks
created: 2025-08-25T02:24:23.057Z
updated: 2025-08-25T02:24:23.057Z
---

# Add Agents to Conversations Epic

## Purpose and Goals

Enable users to add existing agents to conversations through a modal interface accessible from the Agent Labels Container Display component. This feature allows users to dynamically compose conversations by selecting from pre-configured agents in the system.

## Major Components and Deliverables

### 1. Modal Interface Component

- Create `AddAgentToConversationModal` component following existing modal patterns (e.g., `RenameConversationModal`)
- Implement dropdown/selection interface populated with available agents from `useAgentsStore` (configured settings)
- Follow established modal state management using `useState` hooks
- Use shadcn/ui Dialog components with proper focus management
- Include loading states and error handling patterns

### 2. Database Schema Enhancement

- Create new `conversation_agents` table (NOT a true junction table - see note below)
- Include `conversation_id` (foreign key) and `agent_id` (NOT a foreign key - stores configuration ID)
- Add fields: `added_at`, `is_active`, `display_order` for future enhancements
- Follow existing migration pattern with numbered prefix: `002_create_conversation_agents.sql`
- Implement proper constraints including UNIQUE(conversation_id, agent_id)
- **Important**: `agent_id` references agent configuration stored in settings, not a database table

### 3. Data Flow Architecture

- **Prop Drilling Pattern**: Pass `selectedConversationId` from `Home.tsx` → `ConversationLayoutDisplay` → `MainContentPanelDisplay` → `AgentLabelsContainerDisplay`
- **No React Context needed initially**: Follow existing prop drilling pattern used for agent selection
- Future consideration: Add conversation context if prop drilling becomes unwieldy

### 4. Repository Implementation

- Create `ConversationAgentsRepository` class in shared package for CRUD operations following `ConversationsRepository` pattern
- Repository handles database operations, validation, and error handling
- Wire directly into `MainProcessServices` alongside existing repositories
- No service layer needed - follow existing conversation architecture

### 5. IPC Layer Integration

- Create `conversationAgentHandlers.ts` following existing IPC patterns
- Implement channels: `conversationAgent:getByConversation`, `conversationAgent:add`, `conversationAgent:remove`
- Add preload bridge methods in `preload/index.ts`
- IPC handlers call repository methods directly (no service layer)
- All database operations go through main process (Electron security model)

### 6. State Management & Synchronization

- Create `useConversationAgents` hook following `useConversations` pattern
- Implement refetch pattern for state synchronization after mutations
- Create separate store for runtime display (not extending `useAgentsStore`)
- Hook manages loading states, error handling, and data fetching

### 7. Component Integration Updates

- Update `AgentLabelsContainerDisplay` to receive `selectedConversationId` prop
- Update type definitions in `ui-shared` package
- Integrate `useConversationAgents` hook for real-time agent display
- Disable "Add Agent" button when no conversation is selected

## Detailed Acceptance Criteria

### Functional Requirements

✅ **Modal Functionality**

- Modal opens when "Add Agent to Conversation" button is clicked
- Dropdown populated with all configured agents from `useAgentsStore`
- Selected agent(s) can be confirmed and added to current conversation
- Modal closes automatically on successful addition
- Form validation prevents adding duplicate agents to same conversation
- Loading state shown during add operation

✅ **Database Operations**

- `conversation_agents` table created with proper relationships
- Agent associations persist correctly across sessions
- Deletion cascades properly when conversations are removed
- Migration includes rollback capability
- Unique constraint prevents duplicate agent-conversation pairs

✅ **UI Integration**

- Agent pills appear immediately in Agent Labels Container after addition (via refetch)
- Button is disabled/hidden when no conversation is selected in sidebar
- Consistent styling with existing Agent Labels Container patterns
- Proper loading states during agent addition process
- Error messages displayed using existing error handling patterns

✅ **Data Flow**

- Current conversation ID flows from `Home.tsx` through prop chain
- `AgentLabelsContainerDisplay` receives `selectedConversationId` prop
- Conversation agents loaded when conversation selection changes
- State updates trigger re-renders only where necessary

### Technical Requirements

✅ **Component Architecture**

- Follow existing modal component patterns (`RenameConversationModal` structure)
- Use controlled component pattern with `open`/`onOpenChange` props
- Implement proper TypeScript interfaces for all components
- Maintain separation between UI and business logic
- Use existing hooks pattern (`useUpdateConversation`, `useDeleteConversation`)
- Hooks call IPC methods directly (no service abstraction)

✅ **Type System**

- Create `ConversationAgent` interface in shared package
- Create `ConversationAgentViewModel` in ui-shared for UI layer
- Extend `AgentLabelsContainerDisplayProps` with `selectedConversationId`
- Use existing `AgentSettingsViewModel` (has ID) for agent data

✅ **Repository Architecture**

- `ConversationAgentsRepository` handles database operations, validation, and error handling
- Repository registered in `MainProcessServices` initialization
- Follow existing repository pattern (no service layer)
- Direct repository usage in IPC handlers

✅ **IPC Communication**

- All database operations go through Electron main process
- IPC handlers follow existing error handling patterns
- Preload bridge exposes type-safe API to renderer
- Channel names follow convention: `conversationAgent:action`

✅ **State Management**

- `useConversationAgents` hook manages conversation-specific agents
- Refetch pattern for synchronization (same as sidebar conversations)
- Loading and error states follow existing patterns
- No polling or websockets needed (local SQLite database)

### Performance and Quality Standards

✅ **Performance**

- Agent dropdown loads available agents efficiently from existing store
- No unnecessary re-renders during modal interactions
- Database queries optimized with proper indexing
- Refetch only triggered after successful mutations

✅ **Security and Validation**

- Input validation on agent selection
- Duplicate prevention at both UI and database levels
- Proper error boundaries for failed operations
- All database operations through IPC (no direct DB access from renderer)

### User Experience Requirements

✅ **Usability**

- Clear visual feedback during agent addition process
- Error messages are user-friendly and actionable
- Modal follows consistent design language
- Agent selection is intuitive and accessible

✅ **Accessibility**

- Modal is keyboard navigable
- Proper ARIA labels for screen readers
- Focus management when modal opens/closes
- Color contrast meets accessibility standards

## Technical Implementation Details

### Database Migration

```sql
-- 002_create_conversation_agents.sql
-- Note: This is NOT a traditional many-to-many junction table.
-- agent_id stores the configuration ID from the agents settings store,
-- not a foreign key to an agents table (which doesn't exist in the database).
-- Agents are managed in application settings/configuration, not as database entities.

CREATE TABLE IF NOT EXISTS conversation_agents (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,  -- Configuration ID from settings, NOT a foreign key
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    -- NO foreign key constraint for agent_id - references configuration, not DB table
    UNIQUE(conversation_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_agents_conversation
ON conversation_agents(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversation_agents_agent
ON conversation_agents(agent_id);
```

### Type Definitions

```typescript
// packages/shared/src/types/conversationAgents/ConversationAgent.ts
// Following exact pattern from conversations/Conversation.ts
export interface ConversationAgent {
  id: string;
  conversationId: string;
  agentId: string; // References agent configuration ID from settings, not a DB record
  addedAt: string; // ISO string timestamp following conversation pattern
  isActive: boolean;
  displayOrder: number;
}

// packages/ui-shared/src/types/conversationAgents/ConversationAgentViewModel.ts
// Following existing ViewModel patterns
export interface ConversationAgentViewModel {
  id: string;
  conversationId: string;
  agentId: string;
  agent: AgentSettingsViewModel; // Populated agent data
  addedAt: string; // ISO string timestamp
  isActive: boolean;
  displayOrder: number;
}
```

### Hook Implementation Pattern

```typescript
// apps/desktop/src/hooks/useConversationAgents.ts
// Following exact pattern from useConversations hook
export function useConversationAgents(conversationId: string | null) {
  // State management
  const [conversationAgents, setConversationAgents] = useState<
    ConversationAgentViewModel[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch agents for conversation - direct IPC call
  const fetchConversationAgents = useCallback(async () => {
    if (!conversationId) return;
    // Direct IPC call to repository via handlers
    const response =
      await window.electronAPI.conversationAgent.getByConversation(
        conversationId,
      );
    if (response.success) {
      setConversationAgents(response.data);
    } else {
      setError(new Error(response.error.message));
    }
  }, [conversationId]);

  // Add agent with refetch - direct IPC call
  const addAgent = useCallback(
    async (agentId: string) => {
      const response = await window.electronAPI.conversationAgent.add({
        conversationId,
        agentId,
      });
      if (response.success) {
        await fetchConversationAgents(); // Refetch pattern
      } else {
        setError(new Error(response.error.message));
      }
    },
    [conversationId, fetchConversationAgents],
  );

  return {
    conversationAgents,
    isLoading,
    error,
    addAgent,
    refetch: fetchConversationAgents,
  };
}
```

## Integration Points

### Component Hierarchy

```
Home.tsx (manages selectedConversationId state)
  └── ConversationLayoutDisplay (receives as prop)
      └── MainContentPanelDisplay (receives as prop)
          └── AgentLabelsContainerDisplay (receives selectedConversationId)
              ├── Uses useConversationAgents(selectedConversationId)
              └── Uses useAgentsStore() for dropdown options
```

### Data Flow Sequence (Following Conversation Pattern)

1. User selects conversation in sidebar → `selectedConversationId` updates
2. Prop flows down to `AgentLabelsContainerDisplay`
3. `useConversationAgents` hook fetches agents via IPC → Repository → Database
4. User clicks "Add Agent" → Modal opens with agents from `useAgentsStore`
5. User selects agent → IPC call → Repository → Database update
6. Hook refetches → UI updates immediately with new agent pill

**Architecture**: Hook → IPC Handler → Repository → Database (no service layer)

## Risk Mitigation

- Database migration tested with rollback capability
- IPC channel names avoid conflicts with `conversationAgent:` prefix
- Prop drilling acceptable for current depth (consider Context if grows)
- Error handling at each layer (UI, IPC, Service, Store)
- Validation prevents duplicate agents at UI and DB levels

## User Stories

**As a user, I want to**:

- Add existing agents to my current conversation without creating new ones
- See available agents in an organized dropdown selection
- Have added agents appear immediately in my conversation interface
- Be prevented from accidentally adding the same agent twice
- Have the feature disabled when no conversation is active

**As a developer, I want to**:

- Follow established patterns for consistency and maintainability
- Have proper database relationships for data integrity
- Use existing store mechanisms for state management
- Maintain component separation and reusability
- Avoid network-related complexity (local SQLite only)

## Implementation Dependencies

- Existing `useAgentsStore` for configured agents list
- Existing modal patterns from `RenameConversationModal`
- Existing IPC handler patterns from `conversationsHandlers.ts`
- Existing repository patterns from `ConversationsRepository`
- Existing hook patterns from `useConversations`
- **Note**: No service layer dependencies - follow direct repository pattern

## Estimated Scale

- **Features**: 4 implementable features
- **Database Changes**: 1 migration script with new table
- **New Components**: 1 modal component, 1 custom hook
- **Repository Layer**: 1 new repository, 1 IPC handler file
- **Component Updates**: 3 component modifications for prop drilling
- **Type Definitions**: 2 new type files (shared and ui-shared)
- **Simplified Architecture**: No service layer needed

## Success Metrics

- Users can successfully add agents to conversations via modal interface
- No duplicate agents exist in single conversations
- Agent additions persist correctly across app restarts
- Modal interface follows established UX patterns
- Database relationships maintain integrity under all operations
- State synchronization works without polling or websockets
- All operations complete within 500ms (local database)
