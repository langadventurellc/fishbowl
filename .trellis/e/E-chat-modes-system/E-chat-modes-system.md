---
id: E-chat-modes-system
title: Chat Modes System
status: in-progress
priority: medium
parent: none
prerequisites: []
affectedFiles:
  migrations/004_add_chat_mode_to_conversations.sql:
    New migration file that adds
    chat_mode VARCHAR column to conversations table with DEFAULT 'manual' NOT
    NULL for backward compatibility, includes comprehensive documentation and
    rollback instructions
  packages/shared/src/types/conversations/Conversation.ts: Added required
    chat_mode field with 'manual' | 'round-robin' literal union type and
    comprehensive JSDoc documentation explaining manual vs round-robin behavior
  packages/shared/src/types/conversations/UpdateConversationInput.ts:
    Added optional chat_mode field with same literal union type to support
    conversation chat mode updates via repository/service layer
  packages/shared/src/types/conversations/__tests__/types.test.ts:
    Extended existing tests with comprehensive chat_mode field validation
    including type safety, field requirements, literal type constraints, and
    UpdateConversationInput tests
  packages/shared/src/repositories/conversations/ConversationsRepository.ts:
    "Updated repository to handle new required chat_mode field with temporary
    manual construction until schema validation is updated, added default values
    for backward compatibility; Updated all CRUD methods to properly handle
    chat_mode field: CREATE method includes chat_mode in INSERT SQL with
    'round-robin' default, GET and LIST methods include chat_mode in SELECT
    queries, UPDATE method handles chat_mode parameter in dynamic SQL
    generation"
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts:
    Fixed mock conversation objects and test expectations to include required
    chat_mode field, separated database row mocks from expected results to
    account for repository adding chat_mode field; Updated all test cases to
    include chat_mode field in mock data and expectations, added comprehensive
    test cases for chat_mode-specific operations including chat_mode-only
    updates and combined title+chat_mode updates, fixed SQL query expectations
    to include chat_mode column
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepositoryInterface.test.ts:
    Updated all mock conversation objects in interface compliance tests to
    include chat_mode field
  packages/shared/src/repositories/conversations/__tests__/exports.test.ts: Fixed mock conversation object to include required chat_mode field
  packages/ui-shared/src/stores/conversation/__tests__/selectors.test.ts:
    Updated createMockConversation factory function to include chat_mode field
    for test compatibility
  packages/shared/src/types/conversations/schemas/conversationSchema.ts:
    Added chat_mode field with z.enum(['manual',
    'round-robin']).default('manual') validation and comprehensive JSDoc
    documentation
  packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts:
    Added optional chat_mode field with z.enum(['manual',
    'round-robin']).optional() validation for conversation updates
  packages/shared/src/types/conversations/schemas/__tests__/conversationSchema.test.ts:
    Extended existing tests with comprehensive chat_mode validation including
    valid/invalid inputs, default behavior, and error messages
  packages/shared/src/types/conversations/schemas/__tests__/updateConversationInputSchema.test.ts:
    Added comprehensive chat_mode tests for optional field validation, partial
    updates, and error handling
  packages/shared/src/services/conversations/ConversationService.ts:
    Added updateConversation method signature with comprehensive JSDoc
    documentation, supporting both title and chat_mode updates via
    UpdateConversationInput parameter
  packages/shared/src/services/conversations/__tests__/ConversationService.test.ts:
    Added comprehensive test coverage for updateConversation method including
    parameter validation, type safety checks, and interface compliance tests
  apps/desktop/src/renderer/services/ConversationIpcAdapter.ts:
    Implemented updateConversation method in IPC adapter with proper error
    handling and validation, following existing patterns for consistency
  apps/desktop/src/electron/__tests__/conversationsHandlers.test.ts:
    Added chat_mode field to mock conversation objects to maintain compatibility
    with updated Conversation type
  apps/desktop/src/electron/__tests__/preload.conversations.test.ts:
    Updated conversation mocks to include required chat_mode field for type
    compatibility
  apps/desktop/src/hooks/conversations/__tests__/useConversation.test.tsx: Fixed mock conversation object to include chat_mode field for type safety
  apps/desktop/src/hooks/conversations/__tests__/useCreateConversation.test.tsx:
    Added chat_mode field to mock conversation for compatibility with updated
    type definitions
  apps/desktop/src/hooks/conversations/__tests__/useUpdateConversation.test.tsx: Updated mock conversation to include required chat_mode field
  apps/desktop/src/shared/ipc/__tests__/conversationsIPC.test.ts:
    Fixed all conversation mock objects to include chat_mode field for type
    compliance across multiple test cases
  apps/desktop/src/renderer/services/__tests__/ConversationIpcAdapter.test.ts:
    Created comprehensive unit test suite for ConversationIpcAdapter with 43
    test cases covering all methods including updateConversation, error
    handling, IPC availability checks, type safety validation, and edge cases.
    Tests include proper Electron API mocking and complete coverage of
    success/failure scenarios.
  packages/ui-shared/src/types/chat-modes/ChatModeIntent.ts:
    Created comprehensive
    ChatModeIntent interface with toEnable and toDisable string arrays,
    extensive JSDoc documentation with examples for different scenarios (first
    agent, round robin, disable all, no-op)
  packages/ui-shared/src/types/chat-modes/ChatModeHandler.ts: Created
    ChatModeHandler interface with readonly name property and three core methods
    (handleAgentAdded, handleAgentToggle, handleConversationProgression),
    comprehensive JSDoc with detailed examples for manual and round-robin modes,
    proper imports from @fishbowl-ai/shared
  packages/ui-shared/src/types/chat-modes/index.ts:
    Created barrel file exporting
    ChatModeHandler and ChatModeIntent types with JSDoc module description
  packages/ui-shared/src/types/index.ts: Added export for chat-modes module to
    main types barrel file, maintaining alphabetical order
  packages/ui-shared/src/chat-modes/ManualChatMode.ts: Created ManualChatMode
    class implementing ChatModeHandler interface with no-op behavior for all
    three methods (handleAgentAdded, handleAgentToggle,
    handleConversationProgression), comprehensive JSDoc documentation with
    examples, and proper TypeScript typing with unused parameter prefixes
  packages/ui-shared/src/chat-modes/__tests__/ManualChatMode.test.ts:
    Created comprehensive unit test suite with 32 tests covering constructor,
    all handler methods, performance requirements (<1ms for 50 agents),
    immutability, error handling, edge cases, and consistency validation.
    Includes helper functions for creating mock ConversationAgent objects
  packages/ui-shared/src/chat-modes/index.ts: Created barrel export file for
    chat-modes directory with module documentation and ManualChatMode export;
    Added barrel export for RoundRobinChatMode class to enable import from
    @fishbowl-ai/ui-shared package; Updated with factory function, registry
    pattern, utility functions, and comprehensive barrel exports. Added
    createChatModeHandler() with registry-based mode creation,
    getSupportedChatModes() and isSupportedChatMode() utility functions,
    ChatModeName type, and re-exports for all chat mode types and classes with
    comprehensive JSDoc documentation.
  packages/ui-shared/src/index.ts: Added export for chat-modes module to main
    ui-shared package exports, maintaining alphabetical order
  packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts: "Created
    RoundRobinChatMode class implementing ChatModeHandler interface with
    single-agent-enabled rotation logic. Features: deterministic agent ordering
    by display_order then added_at, wrap-around rotation, manual override
    support, <10ms performance for 50 agents, and comprehensive JSDoc
    documentation with examples."
  packages/ui-shared/src/chat-modes/__tests__/RoundRobinChatMode.test.ts:
    "Created comprehensive unit test suite with 38 tests covering all
    functionality: constructor, handleAgentAdded, handleAgentToggle,
    handleConversationProgression, edge cases, performance requirements,
    immutability verification, consistency checks, and integration scenarios.
    Includes helper functions for creating mock ConversationAgent objects."
  packages/ui-shared/src/chat-modes/__tests__/factory.test.ts:
    Created comprehensive unit test suite with 37 test cases covering factory
    function creation, error handling for invalid inputs, utility function
    validation, type safety verification, integration testing with existing
    modes, performance testing, and barrel export validation. Tests include edge
    cases, TypeScript type guard functionality, and extensibility pattern
    documentation.
  packages/ui-shared/src/stores/conversation/ConversationStoreActions.ts:
    Added getActiveChatMode method signature to interface with proper JSDoc
    documentation specifying return type and reactive behavior; Added
    ChatModeIntent import and processAgentIntent method signature to the
    interface with proper documentation for the new helper method that processes
    chat mode handler intents.; Added setChatMode method signature with
    comprehensive JSDoc documentation for updating conversation chat modes
  packages/ui-shared/src/stores/conversation/useConversationStore.ts:
    Implemented getActiveChatMode function that derives chat mode from active
    conversation using efficient array.find operation with null safety via
    optional chaining; Added chat mode imports and implemented
    processAgentIntent helper method for processing handler intents into agent
    state updates. Modified toggleAgentEnabled method to delegate to chat mode
    handlers using createChatModeHandler factory and getActiveChatMode
    function.; Implemented setChatMode action with service integration, state
    updates, Round Robin enforcement, and error handling. Added
    enforceRoundRobinInvariant helper method with optimized logic. Added
    UpdateConversationInput import.
  packages/ui-shared/src/stores/conversation/__tests__/getActiveChatMode.test.ts:
    Created comprehensive unit test suite with 20+ test cases covering basic
    functionality, reactive behavior, performance requirements (<1ms), type
    safety, edge cases, and store integration
  packages/ui-shared/src/stores/conversation/__tests__/chatModeDelegation.test.ts:
    Created comprehensive unit test suite with 15+ test cases covering
    processAgentIntent helper method, enhanced toggleAgentEnabled delegation,
    error handling, loading states, and integration scenarios for both manual
    and round-robin modes.
  packages/ui-shared/src/stores/conversation/__tests__/setChatMode.test.ts:
    Created comprehensive unit test suite with 12 test cases covering successful
    updates, Round Robin invariant enforcement, error handling, edge cases, and
    state management scenarios
log: []
schema: v1.0
childrenIds:
  - F-chat-mode-selector-component
  - F-chat-mode-strategy-pattern
  - F-database-schema-and-core-types
  - F-round-robin-behavior
  - F-service-layer-integration
  - F-state-management-integration
created: 2025-09-03T18:13:59.788Z
updated: 2025-09-03T18:13:59.788Z
---

# Chat Modes System Epic

## Overview

Implement a chat modes system that controls how conversation agents are enabled and disabled during conversations. This system introduces two initial modes: **Manual** (current behavior) and **Round Robin** (new default where only one agent is enabled at a time and rotates after each response).

## User Stories

### Primary User Stories

- **As a user**, I want to switch between chat modes so that I can control how agents participate in conversations
- **As a user**, I want Round Robin mode as the default so that agents take turns naturally without manual management
- **As a user**, I want Manual mode available so that I can fully control which agents are active when needed
- **As a user**, I want agent rotation to happen automatically after each response in Round Robin mode
- **As a user**, I want to manually override agent selection in Round Robin mode when needed

### Secondary User Stories

- **As a developer**, I want an extensible chat mode system so that new modes can be added in the future
- **As a user**, I want my chat mode preference persisted per conversation so that each conversation maintains its selected mode

## Acceptance Criteria

### Core Functionality

- [ ] **Chat Mode Interface**: Extensible strategy pattern supporting future modes
- [ ] **Manual Mode**: Complete user control over agent enabled/disabled state (current behavior)
- [ ] **Round Robin Mode**: Only one agent enabled at a time, automatic rotation after responses
- [ ] **Mode Persistence**: Chat mode saved per conversation in database
- [ ] **UI Integration**: Dropdown selector in Agent Labels Container Display
- [ ] **Agent Addition Logic**: New agents respect current chat mode rules
- [ ] **Manual Override**: Users can manually toggle agents in Round Robin mode with appropriate state transitions
- [ ] **Immediate Mode Enforcement**: Switching to Round Robin enforces single-enabled invariant immediately (disables all but first enabled agent by display order)
- [ ] **New Conversation Default**: New conversations default to 'round-robin' mode (repository/service layer sets chat_mode on create)

### Round Robin Behavior Specifications

- [ ] **Agent Addition**:
  - First agent added: automatically enabled
  - Subsequent agents: automatically disabled (current enabled agent remains)
- [ ] **Agent Toggle Manual Override**:
  - Disable current enabled agent: no agents enabled until user enables another
  - Enable different agent: previous enabled agent becomes disabled, new one enabled
- [ ] **Conversation Progression**: After agent responds, current agent disabled and next agent in sequence enabled
- [ ] **Rotation Order**: Sequential by `display_order` then `added_at` timestamp, wrapping to beginning after last agent
- [ ] **Single Agent Edge Case**: When only one agent exists, no disable/enable flicker on completion (no-op rotation)

### Technical Requirements

- [ ] **Database Schema**: Add `chat_mode` column to conversations table with migration
- [ ] **Type Safety**: Update Conversation interface and schemas to include chat_mode field
- [ ] **State Management**: Derive active chat mode from selected conversation (avoid state duplication)
- [ ] **Service Integration**: Add `updateConversation(id, updates)` method to ConversationService using existing conversations.update IPC
- [ ] **Component Architecture**: New ChatModeSelector component with proper accessibility
- [ ] **Strategy Pattern**: Clean separation of mode-specific logic via ChatModeHandler interface returning intent objects
- [ ] **Naming Consistency**: Use `'manual' | 'round-robin'` consistently across all type definitions, schemas, migration defaults, and UI

### Integration & Compatibility

- [ ] **Backward Compatibility**: Existing conversations default to `'manual'` mode to preserve current behavior
- [ ] **Store Integration**: Chat mode handlers return intent objects (`{toEnable: string[], toDisable: string[]}`) for safe state updates
- [ ] **Platform Support**: Works across desktop (and future mobile) platforms
- [ ] **Error Handling**: Graceful handling of invalid mode states and transitions
- [ ] **Performance**: No impact on existing conversation loading or agent management performance

## Technical Architecture

### Core Interfaces

```typescript
// Chat mode strategy pattern with intent-based updates
interface ChatModeHandler {
  readonly name: string;
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent;
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent;
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent;
}

// Intent object for safe state updates
interface ChatModeIntent {
  toEnable: string[]; // ConversationAgent IDs to enable
  toDisable: string[]; // ConversationAgent IDs to disable
}

// Updated conversation type with consistent naming
interface Conversation {
  // ... existing fields
  chat_mode: "manual" | "round-robin";
}
```

### Implementation Structure

- **Core Logic**: `packages/ui-shared/src/chat-modes/`
  - `ChatModeHandler.ts` - Interface definition with intent-based API
  - `ManualChatMode.ts` - No-op implementation for current behavior
  - `RoundRobinChatMode.ts` - Single-agent-enabled rotation logic
  - `index.ts` - Mode registry and factory functions

- **State Management**: `packages/ui-shared/src/stores/conversation/useConversationStore.ts`
  - Derive `activeChatMode` from selected conversation (no separate state)
  - Add `setChatMode()` action for conversation updates
  - Modify `toggleAgentEnabled()` to delegate to chat mode handler
  - Add `handleConversationProgression()` for post-response rotation

- **Database**: `migrations/004_add_chat_mode_to_conversations.sql`
  - Add `chat_mode VARCHAR DEFAULT 'manual'` to conversations table (preserves existing behavior)
  - No index needed initially (keep scope lean per KISS/YAGNI principles)

- **UI Components**: `apps/desktop/src/components/`
  - `chat/ChatModeSelector.tsx` - New dropdown component
  - Update `layout/AgentLabelsContainerDisplay.tsx` to include selector

### Service Integration Points

- **ConversationService**: Add `updateConversation(id, updates)` method using existing conversations.update IPC
- **Repository Layer**: Update ConversationsRepository for chat_mode in INSERT/SELECT/UPDATE operations
  - **New Conversation Default**: Repository create method sets `chat_mode: 'round-robin'` for new conversations
- **IPC Adapter**: Use existing conversations.update IPC for chat_mode updates
- **Agent Management**: Integration with existing toggleAgentEnabled and addAgent flows using intent-based updates
- **Event Handling**: Hook into existing agent update events for rotation triggers

## Dependencies

### Internal Dependencies

- Existing conversation management system (ConversationService, useConversationStore)
- Current agent management UI components (AgentLabelsContainerDisplay, AgentPill)
- Database migration system
- Existing dropdown/select component patterns

### No External Dependencies

- Uses existing UI libraries (shadcn/ui components)
- Leverages existing state management (Zustand)
- Works with current database system (SQLite)

## Implementation Phases

### Phase 1: Core Infrastructure (Estimated: 3-5 features)

- Create chat mode interface and strategy implementations with intent-based API
- Database migration for chat_mode column (default 'manual' for backward compatibility)
- Update core types (Conversation interface and schemas)
- Repository layer updates for chat_mode CRUD

### Phase 2: State Management Integration (Estimated: 2-3 features)

- Extend useConversationStore with derived chat mode state
- Implement chat mode delegation with intent-based updates
- Add conversation progression hooks
- Service layer updates (updateConversation method)

### Phase 3: UI Implementation (Estimated: 2-3 features)

- ChatModeSelector component development
- Integration with AgentLabelsContainerDisplay
- User interaction handling and validation
- Accessibility and responsive design

### Phase 4: Behavior Implementation & Testing (Estimated: 2-4 features)

- Round Robin rotation logic implementation with proper ordering
- Manual override behavior handling
- Edge case handling (single agent, agent removal, empty conversations)
- Comprehensive testing and quality assurance

## Quality Standards

### Testing Requirements

- Unit tests for each ChatModeHandler implementation
- Integration tests for store and service interactions
- UI component testing for ChatModeSelector
- E2E tests for complete user workflows
- Migration testing for database schema changes

### Performance Standards

- No measurable impact on conversation loading time
- Agent state changes must complete within 100ms
- UI interactions should feel immediate (<50ms)
- Database queries remain efficient with new column

### Code Quality

- TypeScript strict mode compliance
- Comprehensive JSDoc documentation
- Clean Code Charter adherence
- Consistent error handling patterns
- Accessibility compliance (WCAG 2.1 AA)

## Success Metrics

### Functional Success

- [ ] Both Manual and Round Robin modes work as specified
- [ ] Users can switch between modes seamlessly
- [ ] Agent rotation occurs automatically in Round Robin mode
- [ ] Manual overrides work correctly in Round Robin mode
- [ ] Chat mode preferences persist across sessions

### Technical Success

- [ ] No regressions in existing functionality
- [ ] Migration completes successfully on existing databases
- [ ] Code coverage >90% for new components
- [ ] Performance benchmarks met
- [ ] Cross-platform compatibility maintained

### User Experience Success

- [ ] Intuitive mode selection interface
- [ ] Clear visual feedback for active agents
- [ ] Smooth agent transitions
- [ ] No unexpected behavior or edge cases
- [ ] Accessible to users with disabilities

## Risk Mitigation

### Technical Risks

- **Database Migration Failure**: Comprehensive testing with existing data, rollback procedures
- **State Management Complexity**: Intent-based updates prevent state corruption, comprehensive unit tests
- **Performance Impact**: Benchmarking, lazy loading, efficient algorithms

### UX Risks

- **User Confusion**: Clear labeling, intuitive defaults (Round Robin for new conversations), help documentation
- **Mode Switching Disruption**: Immediate enforcement of mode rules, user confirmation for destructive changes
- **Accessibility Issues**: Following WCAG guidelines, keyboard navigation, screen reader support

## Future Extensibility

### Planned Extensions

- Additional chat modes (e.g., "Smart Mode" with AI-driven agent selection)
- Per-agent mode preferences
- Advanced rotation patterns
- Mode-specific configuration options

### Architecture Support

- Strategy pattern enables easy mode additions
- Registry system for dynamic mode discovery (future consideration)
- Extensible configuration schema
- Plugin-like architecture for mode-specific features (future consideration)

---

## Files to be Modified/Created

### New Files

- `packages/ui-shared/src/chat-modes/ChatModeHandler.ts`
- `packages/ui-shared/src/chat-modes/ManualChatMode.ts`
- `packages/ui-shared/src/chat-modes/RoundRobinChatMode.ts`
- `packages/ui-shared/src/chat-modes/index.ts`
- `apps/desktop/src/components/chat/ChatModeSelector.tsx`
- `migrations/004_add_chat_mode_to_conversations.sql`

### Modified Files

#### Shared Types and Schemas

- `packages/shared/src/types/conversations/Conversation.ts`
- `packages/shared/src/types/conversations/schemas/conversationSchema.ts`
- `packages/shared/src/types/conversations/UpdateConversationInput.ts`
- `packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts`

#### Repository and Service Layers

- `packages/shared/src/repositories/conversations/ConversationsRepository.ts`
- `packages/shared/src/services/conversations/ConversationService.ts`
- `apps/desktop/src/renderer/services/ConversationIpcAdapter.ts`

#### State Management and UI

- `packages/ui-shared/src/stores/conversation/useConversationStore.ts`
- `apps/desktop/src/components/layout/AgentLabelsContainerDisplay.tsx`

### Test Files

- Unit tests for all new ChatModeHandler implementations
- Integration tests for store modifications
- Component tests for ChatModeSelector
- Migration tests for database changes
- Repository and service layer tests for chat_mode handling

## Migration Strategy

### New Conversation Default Strategy

**Chosen Approach A (Simple and Low-Risk):**

- Database migration keeps `DEFAULT 'manual'` for safety
- Repository `createConversation()` method explicitly sets `chat_mode: 'round-robin'` for new conversations
- This approach separates migration safety from new conversation behavior

### Backward Compatibility Decision

**Existing conversations will default to `'manual'` mode** to preserve current user behavior and avoid unexpected changes to established workflows.

### Database Migration Details

```sql
-- Migration: Add chat_mode column to conversations table
ALTER TABLE conversations
ADD COLUMN chat_mode VARCHAR DEFAULT 'manual' NOT NULL;

-- Note: No index added initially per KISS/YAGNI principles
-- Index can be added later if mode-based queries become necessary
```

### Repository Implementation

- `ConversationsRepository.createConversation()` sets `chat_mode: 'round-robin'` explicitly
- Existing conversations retain `'manual'` mode from database default
- New conversations get `'round-robin'` mode regardless of database default

This epic provides a comprehensive foundation for implementing the chat modes feature while maintaining code quality, extensibility, user experience standards.
