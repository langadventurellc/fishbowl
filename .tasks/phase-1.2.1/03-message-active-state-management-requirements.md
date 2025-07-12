# Feature: Message Active State Management

**Implementation Order: 03**

This feature implements the core business logic for managing message active/inactive states, including database operations, IPC handlers, and integration with the Zustand store for state management.

## Feature Components

- **Database Operations**: Update database queries to handle message active state
- **IPC Handlers**: Create and update IPC handlers for message active state operations
- **State Management**: Integrate message active state with Zustand store or existing hooks
- **API Integration**: Ensure AI agent API calls only include active messages

## User Stories

- As a user, I want to toggle message active state so that I can control which messages are included in AI conversations
- As a user, I want inactive messages to be excluded from AI context so that I can manage conversation flow
- As a developer, I want reliable state management for message active state so that UI remains consistent
- As a system, I want efficient database operations for message state changes so that performance is maintained

## Functional Requirements

### Core Functionality

- FR-1: Implement `updateMessageActiveState(messageId: string, isActive: boolean)` database operation
- FR-2: Create `toggleMessageActiveState(messageId: string)` convenience function
- FR-3: Update `getMessagesByConversationId` to support active state filtering
- FR-4: Ensure all message creation operations set appropriate default active state

### Data Management

- FR-5: Update database queries to properly handle is_active field
- FR-6: Implement bulk operations for setting multiple message active states
- FR-7: Add database indexes for efficient active state queries
- FR-8: Ensure transactional consistency for message state updates

### Integration Points

- FR-9: Update IPC handlers for message operations to include active state
- FR-10: Create new IPC channel for message active state toggle operations
- FR-11: Filter active messages when preparing AI conversation context
- FR-12: Integrate message active state with existing message hooks or store

## Technical Requirements

### Technology Stack

- TR-1: Use better-sqlite3 for database operations with proper prepared statements
- TR-2: Follow existing IPC handler patterns for new message state operations
- TR-3: Integrate with Zustand store if message state is added to store
- TR-4: Use existing error handling and validation patterns

### Performance & Scalability

- TR-5: Database queries for active state filtering should complete in <100ms for 10k messages
- TR-6: Bulk active state updates should be atomic and efficient
- TR-7: Active state filtering should use database indexes, not in-memory filtering
- TR-8: IPC operations should be non-blocking and properly error-handled

### Security & Compliance

- TR-9: Validate message ownership before allowing active state changes
- TR-10: Sanitize all input parameters for message state operations
- TR-11: Add proper error handling for invalid message IDs or states

## Architecture Context

### System Integration

- AC-1: Integrates with existing database query system in src/main/database/queries/messages/
- AC-2: Updates IPC handler system in src/main/ipc/handlers/
- AC-3: Connects with message management in src/renderer/hooks/useMessages.ts

### Technical Patterns

- AC-4: Uses existing prepared statement pattern for database operations
- AC-5: Follows established IPC handler pattern with validation and error handling
- AC-6: Implements optimistic update pattern for state management

### File Structure Implications

- AC-7: Updates src/main/database/queries/messages/ with new operations
- AC-8: Adds new IPC handlers in src/main/ipc/handlers/
- AC-9: Updates src/renderer/hooks/useMessages.ts with new operations

## Acceptance Criteria

### Functional Acceptance

- [ ] AC-1: Can toggle individual message active state via database operation
- [ ] AC-2: Can filter messages by active state in database queries
- [ ] AC-3: AI conversation context only includes active messages
- [ ] AC-4: Message active state changes persist across application restarts
- [ ] AC-5: Bulk active state operations complete successfully

### Technical Acceptance

- [ ] AC-6: All database operations use prepared statements for security
- [ ] AC-7: IPC handlers include proper validation and error handling
- [ ] AC-8: State management updates are atomic and consistent
- [ ] AC-9: Performance requirements met for active state operations
- [ ] AC-10: Error handling covers all edge cases (invalid IDs, network issues)

### Quality Gates

- [ ] AC-11: Unit tests cover all message state management operations
- [ ] AC-12: Integration tests verify IPC communication for message state
- [ ] AC-13: Database operations tested with various data sizes
- [ ] AC-14: Error scenarios tested and handled gracefully

## Implementation Hints

Guidance for the planning phase to create appropriate tasks:

### Suggested Task Groupings

1. **Database Operations** (6-8 tasks)
   - Create updateMessageActiveState query function
   - Create toggleMessageActiveState convenience function
   - Update getMessagesByConversationId to support active filtering
   - Add bulk message active state operations
   - Create database indexes for active state queries
   - Add validation for message active state operations
   - Test database operations with various scenarios

2. **IPC Handler Implementation** (4-6 tasks)
   - Create dbMessagesUpdateActiveStateHandler
   - Create dbMessagesToggleActiveStateHandler
   - Update existing message handlers to include active state
   - Add IPC validation for message active state operations
   - Test IPC handlers with various inputs
   - Add error handling for IPC operations

3. **State Management Integration** (5-7 tasks)
   - Update useMessages hook with active state operations
   - Add message active state to existing state management
   - Implement optimistic updates for message state changes
   - Add state validation and error handling
   - Create selectors for active/inactive messages
   - Test state management consistency
   - Add state persistence if needed

4. **AI Context Integration** (3-4 tasks)
   - Update message filtering for AI conversation context
   - Ensure only active messages are sent to AI APIs
   - Add configuration for active message filtering
   - Test AI context filtering functionality

### Critical Implementation Notes

- Start with database operations as they're the foundation
- Ensure proper indexing for active state queries to maintain performance
- Use transactional operations for consistency
- Consider implementing optimistic updates for better user experience

## Constraints & Assumptions

### Technical Constraints

- CA-1: Must work with existing SQLite database structure
- CA-2: Cannot break existing message-related functionality
- CA-3: Must maintain compatibility with current IPC communication patterns

### Business Constraints

- CA-4: Active state changes must be immediate and reliable
- CA-5: AI conversation context must exclude inactive messages consistently

### Assumptions

- CA-6: Database migration and type updates will be completed first
- CA-7: Users will primarily toggle individual messages, not perform bulk operations
- CA-8: Active state filtering will be applied at the database level, not in-memory

## Risks & Mitigation

### Technical Risks

- Risk 1: Database performance degradation with active state filtering - Mitigation: Implement proper indexing and query optimization
- Risk 2: State consistency issues between database and application - Mitigation: Use atomic operations and proper error handling
- Risk 3: IPC communication failures during state updates - Mitigation: Implement retry logic and error recovery

### Schedule Risks

- Risk 4: Complex state management integration takes longer than expected - Mitigation: Start with simple database operations and build incrementally

## Dependencies

### Upstream Dependencies

- Requires completion of: Database migration for is_active field
- Requires completion of: TypeScript types update for message active state
- Needs output from: Updated database schema and validation

### Downstream Impact

- Blocks: UI toggle functionality implementation
- Enables: Message history filtering for AI context

## See Also

### Specifications

- `docs/specifications/implementation-plan.md` - Phase 1.2.1 details
- `docs/specifications/chat-room-mechanics-spec.md` - Message active state requirements

### Technical Documentation

- `CLAUDE.md` - Development standards and database patterns
- `docs/technical/coding-standards.md`
- `src/main/database/queries/messages/` - Existing message query patterns

### Related Features

- `.tasks/phase-1.2.1/01-database-migration-message-active-state-requirements.md`
- `.tasks/phase-1.2.1/02-typescript-types-message-active-state-requirements.md`
- `.tasks/phase-1.2.1/04-ui-message-toggle-functionality-requirements.md`
