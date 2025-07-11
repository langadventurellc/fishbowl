# Feature Specification: Message Active State Management

**Implementation Order: Phase 1.2.1**  
**Estimated Complexity: Medium**  
**Created: 2025-07-11**

## 1. Overview

### Problem Statement

The Fishbowl application needs the ability to selectively include or exclude messages from AI conversation context. Currently, all messages in a conversation are sent to AI providers, but users need control over which messages should be considered when generating AI responses.

### Solution Summary

Implement a message active state system that adds an `isActive` boolean field to messages, allowing users to toggle message inclusion in AI conversations while maintaining all messages visible in the UI for context and reference.

### Primary Goals

- Enable selective message inclusion in AI conversation context
- Maintain backward compatibility with existing message functionality
- Provide reliable database operations for message state management
- Ensure type safety across all application layers

### Expected Outcomes

- Messages can be toggled between active and inactive states
- AI conversation context only includes active messages
- All messages remain visible in the UI regardless of active state
- Database operations are efficient and reliable

## 2. Feature Components

### Database Migration Component

- **Responsibilities**: Add `is_active` INTEGER field to messages table
- **Inputs**: Existing database schema (v3)
- **Outputs**: Updated database schema (v4) with message active state support
- **Dependencies**: None (foundation component)

### TypeScript Types Component

- **Responsibilities**: Update all message-related types and validation schemas
- **Inputs**: Existing message interfaces and Zod schemas
- **Outputs**: Updated types with `isActive` boolean field
- **Dependencies**: Database migration completion

### Database Operations Component

- **Responsibilities**: Implement active state queries and update operations
- **Inputs**: Message IDs and active state values
- **Outputs**: Updated message records and filtered query results
- **Dependencies**: TypeScript types completion

### IPC Handler Component

- **Responsibilities**: Expose message active state operations to renderer process
- **Inputs**: IPC requests for message state changes
- **Outputs**: Updated message data via IPC responses
- **Dependencies**: Database operations completion

### State Management Component

- **Responsibilities**: Integrate active state management with existing message hooks
- **Inputs**: User interactions and IPC responses
- **Outputs**: Updated application state and UI reactivity
- **Dependencies**: IPC handler completion

### AI Context Integration Component

- **Responsibilities**: Filter messages for AI conversation context
- **Inputs**: All conversation messages
- **Outputs**: Filtered active messages for AI providers
- **Dependencies**: State management completion

## 3. Functional Requirements

### FR-1: Database Schema Requirements

- FR-1.1: Add `is_active` INTEGER NOT NULL DEFAULT 1 field to messages table
- FR-1.2: Create migration script 004-message-active-state.sql
- FR-1.3: Ensure all existing messages default to active state (is_active = 1)
- FR-1.4: Add database index on `is_active` field for query optimization
- FR-1.5: Validate migration on databases with 0, 100, 1000, and 10000+ messages

### FR-2: TypeScript Type Requirements

- FR-2.1: Update `DatabaseMessage` interface with `is_active: boolean` field
- FR-2.2: Update `Message` interface with `isActive: boolean` field
- FR-2.3: Update `CreateMessageData` interface with optional `isActive: boolean` field (default true)
- FR-2.4: Add Zod validation schemas for message active state
- FR-2.5: Maintain type mapping consistency between database and application layers

### FR-3: Database Query Requirements

- FR-3.1: Implement `updateMessageActiveState(messageId: string, isActive: boolean)` function
- FR-3.2: Create `toggleMessageActiveState(messageId: string)` convenience function
- FR-3.3: Update `getMessagesByConversationId` to include `is_active` field in results
- FR-3.4: Create `getActiveMessagesByConversationId` filtered query function
- FR-3.5: Ensure all message queries include `is_active` field in SELECT statements

### FR-4: IPC Handler Requirements

- FR-4.1: Create `dbMessagesUpdateActiveStateHandler` for active state updates
- FR-4.2: Create `dbMessagesToggleActiveStateHandler` for toggle operations
- FR-4.3: Update existing message handlers to include `isActive` field in responses
- FR-4.4: Add proper validation and error handling for active state operations
- FR-4.5: Maintain camelCase to snake_case field mapping (isActive ↔ is_active)

### FR-5: State Management Requirements

- FR-5.1: Update `useMessages` hook with active state operations
- FR-5.2: Add `updateMessageActiveState` and `toggleMessageActiveState` functions
- FR-5.3: Implement optimistic updates for immediate UI feedback
- FR-5.4: Add error handling and recovery for failed state updates
- FR-5.5: Maintain consistency between local state and database state

### FR-6: AI Context Integration Requirements

- FR-6.1: Filter messages at application layer before sending to AI providers
- FR-6.2: Create `getActiveMessagesForAI` utility function
- FR-6.3: Ensure inactive messages are excluded from AI conversation context
- FR-6.4: Maintain all messages visible in UI regardless of active state
- FR-6.5: Add configuration option to bypass active state filtering if needed

## 4. Technical Requirements

### Current Tech Stack

- **Database**: SQLite via better-sqlite3 v12.2.0
- **TypeScript**: v5.8.3 with strict mode enabled
- **Validation**: Zod v3.25.76 for runtime validation
- **IPC**: Electron IPC with type-safe communication
- **State Management**: React hooks (messages not in Zustand store)
- **Error Handling**: Custom error classes with categorization

### Architectural Patterns

- **Migration Pattern**: Sequential SQL migration files with version tracking
- **Database Pattern**: Prepared statements with transaction support
- **Type Pattern**: Separate database and application type definitions
- **IPC Pattern**: Validation → Operation → Response transformation
- **State Pattern**: Hook-based state management with optimistic updates
- **Error Pattern**: Comprehensive error handling with recovery mechanisms

### Integration Points

- **Database Layer**: `src/main/database/queries/messages/`
- **IPC Layer**: `src/main/ipc/handlers/`
- **Type Layer**: `src/shared/types/` and `src/main/database/schema/`
- **State Layer**: `src/renderer/hooks/useMessages.ts`
- **Validation Layer**: `src/shared/types/validation/database-schema.ts`

## 5. Implementation Guidance

### Suggested Implementation Order

1. **Database Migration** (Foundation) - Creates database schema support
2. **TypeScript Types** (Type Safety) - Enables type-safe development
3. **Database Operations** (Core Logic) - Implements business logic
4. **IPC Handlers** (Communication) - Exposes operations to UI
5. **State Management** (UI Integration) - Connects to user interface
6. **AI Context Integration** (Feature Completion) - Enables AI filtering

### Parallel Work Opportunities

- Database migration can be developed independently
- TypeScript types can be developed in parallel with migration
- IPC handlers can be prepared while database operations are being implemented
- State management can be scaffolded while IPC handlers are being developed

### Critical Path Items

- Database migration must complete before type validation can be tested
- TypeScript types must be ready before database operations can be implemented
- Database operations must be working before IPC handlers can be functional
- IPC handlers must be complete before state management can be integrated

### Testing Checkpoints

- Database migration: Test on various database sizes and scenarios
- TypeScript types: Verify type safety and compilation
- Database operations: Test CRUD operations and edge cases
- IPC handlers: Test communication and error scenarios
- State management: Test optimistic updates and error recovery
- AI context integration: Test message filtering functionality

## 6. User Stories

### Primary User Stories

- **As a user**, I want to toggle message active state so that I can control which messages are included in AI conversations
- **As a user**, I want inactive messages to be excluded from AI context so that I can manage conversation flow effectively
- **As a user**, I want all messages to remain visible in the UI so that I can see full conversation context
- **As a user**, I want message state changes to be immediate so that I can see the effect of my actions

### Developer Stories

- **As a developer**, I want reliable database operations for message state so that I can build UI features confidently
- **As a developer**, I want type-safe message active state operations so that I can catch errors at compile time
- **As a developer**, I want consistent state management so that UI remains synchronized with data
- **As a developer**, I want comprehensive error handling so that I can provide good user experience

### System Stories

- **As a system**, I want efficient database queries so that performance is maintained with large message volumes
- **As a system**, I want transaction-safe operations so that data integrity is preserved
- **As a system**, I want backward compatibility so that existing functionality continues to work
- **As a system**, I want secure operations so that message state cannot be manipulated maliciously

## 7. Acceptance Criteria

### Database Migration Acceptance

- [ ] Migration script 004-message-active-state.sql successfully adds `is_active` INTEGER NOT NULL DEFAULT 1 field
- [ ] All existing messages default to `is_active = 1` after migration
- [ ] Migration completes successfully on databases with 0, 100, 1000, and 10000+ messages
- [ ] Database schema version increments to v4
- [ ] Migration performance completes within 30 seconds for 100k+ messages

### TypeScript Types Acceptance

- [ ] `DatabaseMessage` interface includes `is_active: boolean` field
- [ ] `Message` interface includes `isActive: boolean` field
- [ ] `CreateMessageData` includes optional `isActive: boolean` field with default true
- [ ] All message-related interfaces compile without TypeScript errors
- [ ] Zod validation schemas accept and validate `isActive` field properly

### Database Operations Acceptance

- [ ] `updateMessageActiveState(messageId, isActive)` function updates message state correctly
- [ ] `toggleMessageActiveState(messageId)` function toggles message state correctly
- [ ] `getMessagesByConversationId` includes `is_active` field in results
- [ ] `getActiveMessagesByConversationId` returns only active messages
- [ ] Database operations complete in <100ms for typical message volumes

### IPC Handler Acceptance

- [ ] `dbMessagesUpdateActiveStateHandler` processes active state updates correctly
- [ ] `dbMessagesToggleActiveStateHandler` processes toggle operations correctly
- [ ] IPC handlers include proper input validation and error handling
- [ ] camelCase to snake_case field mapping works correctly (isActive ↔ is_active)
- [ ] Error responses include meaningful error messages and codes

### State Management Acceptance

- [ ] `useMessages` hook includes `updateMessageActiveState` and `toggleMessageActiveState` functions
- [ ] Optimistic updates provide immediate UI feedback
- [ ] Error handling reverts optimistic updates on failure
- [ ] State consistency is maintained between local state and database
- [ ] Hook operations integrate seamlessly with existing message functionality

### AI Context Integration Acceptance

- [ ] `getActiveMessagesForAI` utility function filters messages correctly
- [ ] AI conversation context includes only active messages
- [ ] Inactive messages are excluded from AI provider requests
- [ ] All messages remain visible in UI regardless of active state
- [ ] Message filtering performance does not impact AI response times

## 8. Non-Goals

### Explicit Scope Exclusions

- **Bulk message state operations** - Individual message toggles only
- **Message state history tracking** - No audit trail for state changes
- **UI toggle interface** - Only backend functionality (UI covered in separate task)
- **Message state persistence in Zustand** - Keep existing hook-based pattern
- **Advanced filtering options** - Simple active/inactive state only
- **Message state synchronization** - No real-time updates across instances

### Deferred Optimizations

- **Message state caching** - Use existing database query patterns
- **Advanced indexing strategies** - Basic index on `is_active` field sufficient
- **Message state analytics** - No tracking of state change patterns
- **Performance monitoring** - Use existing IPC performance monitoring

### Nice-to-Have Items Excluded

- **Message state keyboard shortcuts** - UI functionality for later
- **Message state batch operations** - Individual operations sufficient
- **Message state export/import** - Not needed for core functionality
- **Message state webhooks** - No external integrations needed

## 9. Technical Considerations

### Security Requirements

- **Input Validation**: All message IDs validated as UUIDs, active state validated as boolean
- **Message Ownership**: Validate message belongs to conversation before allowing state changes
- **SQL Injection Prevention**: Use prepared statements for all database operations
- **IPC Security**: Validate all IPC inputs with Zod schemas before processing
- **Data Sanitization**: Ensure boolean values are properly sanitized and validated

### Performance Constraints

- **Database Query Performance**: Active state queries must complete in <100ms for 10k messages
- **IPC Communication**: State update operations must complete in <50ms
- **Memory Usage**: Message state should not significantly increase memory footprint
- **UI Responsiveness**: Optimistic updates must provide immediate feedback (<10ms)
- **Database Index**: `is_active` field index must improve query performance by >50%

### Error Handling Requirements

- **Database Errors**: Handle connection failures, constraint violations, and transaction rollbacks
- **Validation Errors**: Provide meaningful error messages for invalid inputs
- **IPC Errors**: Handle communication failures and timeout scenarios
- **State Errors**: Recover from optimistic update failures gracefully
- **Migration Errors**: Handle migration failures with rollback capability

### Data Migration Considerations

- **Schema Changes**: ALTER TABLE operation must be atomic and reversible
- **Data Integrity**: Ensure no data loss during migration process
- **Performance Impact**: Migration should not lock database for extended periods
- **Rollback Strategy**: Provide clear rollback procedure for migration failures
- **Testing Strategy**: Test migration on various database sizes and conditions

## 10. Success Metrics

### Functional Completeness Criteria

- All 31 functional requirements (FR-1.1 through FR-6.5) implemented and tested
- Database migration successfully upgrades schema from v3 to v4
- TypeScript compilation passes with strict mode enabled
- All IPC handlers respond correctly with proper error handling
- Message state operations integrate seamlessly with existing functionality

### Performance Benchmarks

- Database migration completes in <30 seconds for 100k messages
- Active state queries complete in <100ms for 10k messages
- IPC operations complete in <50ms for typical use cases
- UI updates occur in <10ms with optimistic updates
- No significant impact on existing message operation performance

### Quality Metrics

- 100% TypeScript type coverage for message-related code
- 100% test coverage for database operations and IPC handlers
- Zero ESLint violations with strict linting rules
- All Zod validation schemas have corresponding TypeScript types
- No `any` types introduced in implementation

### User Acceptance Criteria

- Message active state toggles work reliably in all scenarios
- AI conversation context correctly excludes inactive messages
- All messages remain visible in UI regardless of active state
- Error scenarios are handled gracefully with meaningful user feedback
- Feature integrates seamlessly with existing message functionality

## 11. Appendix: File Structure Hints

### Database Layer

```
src/main/database/
├── migrations/
│   └── 004-message-active-state.sql           # Migration script
├── queries/messages/
│   ├── updateMessageActiveState.ts            # Dedicated active state update
│   ├── toggleMessageActiveState.ts            # Toggle convenience function
│   ├── getActiveMessagesByConversationId.ts   # Filtered query function
│   └── index.ts                               # Export all message queries
└── schema/
    └── DatabaseMessage.ts                     # Update with is_active field
```

### Type Definitions

```
src/shared/types/
├── index.ts                                   # Update Message interface
└── validation/
    └── database-schema.ts                     # Update Zod schemas
```

### IPC Layer

```
src/main/ipc/handlers/
├── dbMessagesUpdateActiveStateHandler.ts      # Active state update handler
├── dbMessagesToggleActiveStateHandler.ts      # Toggle handler
└── index.ts                                   # Register new handlers
```

### State Management

```
src/renderer/hooks/
└── useMessages.ts                             # Update with active state operations
```

### Utilities

```
src/shared/utils/
└── aiContextUtils.ts                          # Message filtering for AI context
```

### Tests

```
tests/
├── unit/main/database/
│   ├── migrations/
│   │   └── 004-message-active-state.test.ts  # Migration tests
│   └── queries/messages/
│       ├── updateMessageActiveState.test.ts  # Query tests
│       └── toggleMessageActiveState.test.ts  # Toggle tests
├── unit/main/ipc/handlers/
│   ├── dbMessagesUpdateActiveState.test.ts   # IPC handler tests
│   └── dbMessagesToggleActiveState.test.ts   # Toggle handler tests
└── integration/
    └── messageActiveState.test.ts             # End-to-end tests
```

This file structure enables logical task decomposition while maintaining the project's established patterns of one export per file and clear separation of concerns.

---

_This feature specification provides comprehensive guidance for implementing message active state functionality in the Fishbowl application. The specification follows established architectural patterns and provides sufficient detail for creating 20-30 focused implementation tasks of 1-2 hours each._
