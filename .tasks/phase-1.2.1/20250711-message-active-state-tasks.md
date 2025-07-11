# Feature Implementation Plan: Message Active State Management

_Generated: 2025-07-11_
_Based on Feature Specification: [20250711-message-active-state-feature.md](./20250711-message-active-state-feature.md)_

## Architecture Overview

The Message Active State Management feature adds an `isActive` boolean field to messages, enabling selective inclusion of messages in AI conversation context. The implementation follows the established Fishbowl architecture patterns with database migrations, type-safe IPC communication, and React hook-based state management.

### System Architecture

```mermaid
graph TB
    subgraph "Database Layer"
        DB[(SQLite Database)]
        Migration[004-message-active-state.sql]
        Queries[Message Queries]
    end

    subgraph "Main Process"
        IPC[IPC Handlers]
        Validation[Zod Validation]
        Operations[Database Operations]
    end

    subgraph "Renderer Process"
        Hooks[useMessages Hook]
        State[Local State]
        UI[Message Components]
    end

    subgraph "AI Integration"
        Filter[Message Filter]
        Context[AI Context]
        Providers[AI Providers]
    end

    Migration --> DB
    DB --> Queries
    Queries --> Operations
    Operations --> IPC
    IPC --> Validation
    Validation --> Hooks
    Hooks --> State
    State --> UI
    Hooks --> Filter
    Filter --> Context
    Context --> Providers
```

### Data Flow

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Hook as useMessages Hook
    participant IPC as IPC Handler
    participant DB as Database
    participant AI as AI Context Filter

    UI->>Hook: toggleMessageActiveState(messageId)
    Hook->>Hook: Optimistic update (immediate UI feedback)
    Hook->>IPC: dbMessagesToggleActiveState(messageId)
    IPC->>IPC: Validate messageId with Zod
    IPC->>DB: toggleMessageActiveState(messageId)
    DB->>DB: UPDATE messages SET is_active = NOT is_active
    DB->>IPC: Updated message data
    IPC->>Hook: Success response with updated message
    Hook->>Hook: Sync local state with database
    Hook->>UI: Re-render with updated state

    Note over AI: When AI needs conversation context
    AI->>Hook: getActiveMessagesForAI(conversationId)
    Hook->>DB: getActiveMessagesByConversationId(conversationId)
    DB->>AI: Filtered active messages only
```

### Security Architecture

```mermaid
graph LR
    subgraph "Input Validation"
        Request[IPC Request]
        Zod[Zod Schema]
        Sanitize[Input Sanitization]
    end

    subgraph "Authorization"
        Ownership[Message Ownership]
        Access[Conversation Access]
        Permissions[User Permissions]
    end

    subgraph "Database Security"
        Prepared[Prepared Statements]
        Validation[Data Validation]
        Transactions[Transaction Safety]
    end

    Request --> Zod
    Zod --> Sanitize
    Sanitize --> Ownership
    Ownership --> Access
    Access --> Permissions
    Permissions --> Prepared
    Prepared --> Validation
    Validation --> Transactions
```

## Technology Stack

### Core Technologies

- **Language/Runtime:** TypeScript 5.8.3 with strict mode enabled
- **Database:** SQLite via better-sqlite3 v12.2.0
- **Framework:** Electron with React 19.1.0 for UI
- **Build System:** Vite 7.0.3 with TypeScript compilation

### Libraries & Dependencies

- **Validation:** Zod v3.25.76 for runtime type validation
- **State Management:** React hooks (messages not in Zustand store)
- **Database Operations:** better-sqlite3 with prepared statements
- **Testing:** Vitest 3.2.4 for unit testing
- **Type Safety:** TypeScript with strict mode and comprehensive interfaces

### Patterns & Approaches

- **Architectural Patterns:** Layered architecture with clear separation of concerns
- **Database Pattern:** Sequential migrations with prepared statements and transactions
- **IPC Pattern:** Type-safe communication with Zod validation and error handling
- **State Pattern:** Hook-based state management with optimistic updates
- **Security Patterns:** Input validation, prepared statements, and permission checks
- **Testing Patterns:** Unit tests for each layer (database, IPC, hooks)
- **Development Practices:** One export per file, research before implement

### External Integrations

- **Database:** SQLite database with migration system
- **IPC:** Electron IPC for main-renderer communication
- **AI Providers:** Message filtering for AI conversation context
- **Error Handling:** Custom error classes with categorization

## Security Considerations

- **Input Validation:** All message IDs validated as UUIDs, active state validated as boolean
- **Message Ownership:** Basic validation ensuring message exists before state changes
- **SQL Injection Prevention:** Prepared statements for all database operations
- **IPC Security:** Zod schemas validate all IPC inputs before processing
- **Data Sanitization:** Boolean values properly sanitized and validated

## Relevant Files

### Database Layer

- `src/main/database/migrations/004-message-active-state.sql` - Migration script to add is_active field
- `src/main/database/queries/messages/updateMessageActiveState.ts` - Update message active state
- `src/main/database/queries/messages/toggleMessageActiveState.ts` - Toggle message active state
- `src/main/database/queries/messages/getActiveMessagesByConversationId.ts` - Get active messages
- `src/main/database/schema/DatabaseMessage.ts` - Update with is_active field

### Type Definitions

- `src/shared/types/index.ts` - Update Message interface with isActive field
- `src/shared/types/validation/database-schema.ts` - Update Zod schemas for validation

### IPC Layer

- `src/main/ipc/handlers/dbMessagesUpdateActiveStateHandler.ts` - Update active state handler
- `src/main/ipc/handlers/dbMessagesToggleActiveStateHandler.ts` - Toggle active state handler
- `src/main/ipc/handlers/index.ts` - Register new IPC handlers

### State Management

- `src/renderer/hooks/useMessages.ts` - Add active state operations to message hook

### Utilities

- `src/shared/utils/aiContextUtils.ts` - Message filtering utilities for AI context

### Tests

- `tests/unit/main/database/migrations/004-message-active-state.test.ts` - Migration tests
- `tests/unit/main/database/queries/messages/updateMessageActiveState.test.ts` - Update query tests
- `tests/unit/main/database/queries/messages/toggleMessageActiveState.test.ts` - Toggle query tests
- `tests/unit/main/ipc/handlers/dbMessagesUpdateActiveState.test.ts` - IPC handler tests
- `tests/unit/main/ipc/handlers/dbMessagesToggleActiveState.test.ts` - Toggle handler tests
- `tests/unit/renderer/hooks/useMessages.test.ts` - Hook tests with active state

## Implementation Notes

- Follow Research → Plan → Implement workflow for each task
- Use better-sqlite3 documentation for database operations
- Search codebase for similar patterns before creating new implementations
- One export per file (enforced by linting) - no utils mega-files
- Tests should be written in the same task as implementation
- Run formatting, linting, and testing after each sub-task
- Security validation must be implemented for all user inputs
- After completing a parent task, stop and await user confirmation to proceed

## Task Execution Reminders

When executing tasks, remember to:

1. **Research first** - Never jump straight to coding
2. **Check existing patterns** - Search codebase for similar implementations
3. **Validate security** - Every input must be validated
4. **Write tests immediately** - In the same task as implementation
5. **Run quality checks** - Format, lint, test after each sub-task
6. **One export per file** - This is enforced by linting

## Implementation Tasks

- 1.0 Database Schema Migration
  - [x] 1.1 Create migration script 004-message-active-state.sql with ALTER TABLE statement
  - [x] 1.2 Add is_active INTEGER NOT NULL DEFAULT 1 field to messages table
  - [x] 1.3 Create database index on is_active field for query optimization
  - [x] 1.4 Update database schema version tracking to v4
  - [x] 1.5 Write unit tests for migration script with various database sizes
  - [x] 1.6 Test migration rollback capability and data integrity

  ### Files modified with description of changes
  - `src/main/database/migrations/004-message-active-state.sql` - Added migration script with ALTER TABLE statement to add is_active column, created 4 performance indexes for query optimization. Migration follows established patterns with proper comments and IF NOT EXISTS clauses for safety.
  - Database schema version automatically updated to v4 by migration system during execution.

- 2.0 TypeScript Type System Updates
  - [x] 2.1 Update DatabaseMessage interface with is_active boolean field
  - [x] 2.2 Update Message interface with isActive boolean field for application layer
  - [x] 2.3 Update CreateMessageData interface with optional isActive field (default true)
  - [x] 2.4 Create UpdateMessageActiveStateData interface for IPC operations
  - [x] 2.5 Add Zod validation schemas for message active state operations
  - [x] 2.6 Write unit tests for type validation and schema compilation

  ### Files modified with description of changes
  - `src/main/database/schema/DatabaseMessage.ts` - Added `is_active: boolean` field to DatabaseMessage interface following the established pattern from DatabaseAgent and DatabaseConversation interfaces. The field is positioned after the core identifying fields (id, conversation_id, agent_id) and before content fields.
  - `src/main/ipc/handlers/dbMessagesCreateHandler.ts` - Added `is_active: true` default value when creating new messages to match the interface requirement and ensure new messages are active by default.
  - `tests/unit/main/ipc/database-handlers.test.ts` - Updated mockMessage object and createMessage test call to include `is_active: true` field, ensuring test compatibility with the updated interface.
  - `src/shared/types/index.ts` - Added `isActive: boolean` field to Message interface at line 161, positioned after agentId and before content fields to maintain consistency with the database schema structure. This ensures the application layer Message interface matches the database layer DatabaseMessage interface.
  - `src/main/ipc/handlers/dbMessagesCreateHandler.ts` - Added `isActive: message.is_active` field transformation in the return object to properly convert from database snake_case to application camelCase format.
  - `src/main/ipc/handlers/dbMessagesGetHandler.ts` - Added `isActive: message.is_active` field transformation in the return object to ensure the retrieved message includes the active state.
  - `src/main/ipc/handlers/dbMessagesListHandler.ts` - Added `isActive: message.is_active` field transformation in the map function to ensure all listed messages include the active state.
  - `src/main/ipc/handlers/dbTransactionsCreateMessagesBatchHandler.ts` - Added `is_active: true` to messageRecord object and updated insertMessage.run call to include the active state parameter. Also added `isActive: messageRecord.is_active` to the return object transformation.
  - `tests/integration/ipc-database-integration.test.ts` - Updated all mockMessage objects to include `isActive: true` field for test compatibility with the updated interface.
  - `tests/unit/renderer/hooks/useMessages.test.ts` - Updated all mockMessage objects to include `isActive: true` field for test compatibility with the updated interface.
  - `src/shared/types/index.ts` - Added `isActive?: boolean` field to CreateMessageData interface at line 275, positioned after the type field and before metadata field to maintain logical grouping. This makes the field optional with the default value provided by Zod validation.
  - `src/shared/types/validation/database-schema.ts` - Added `isActive: z.boolean().default(true)` to both CreateMessageSchema (line 58) and SanitizedCreateMessageSchema (line 214) following the same pattern used in CreateConversationSchema. This ensures consistent validation and default behavior across all message creation operations.
  - `src/main/ipc/handlers/dbMessagesCreateHandler.ts` - Updated line 18 to use `validatedData.isActive` instead of hardcoded `true` value, allowing the validated data (with proper default) to be used throughout the message creation process.
  - `src/main/ipc/handlers/dbTransactionsCreateMessagesBatchHandler.ts` - Updated SQL INSERT statement to include `is_active` field (line 17), changed line 29 to use `msgData.isActive` instead of hardcoded `true`, ensuring the batch handler properly uses validated data for all message operations.
  - `tests/unit/shared/types/validation-schemas.test.ts` - Updated the CreateMessage validation test (line 173) to expect `isActive: true` in the result, matching the new schema behavior with default value.
  - `src/shared/types/index.ts` - Added `UpdateMessageActiveStateData` interface at line 279-281, positioned after CreateMessageData interface to maintain logical grouping of message-related types. The interface contains only the `isActive: boolean` field, following the pattern of other update interfaces but specific to the active state operation.
  - `src/shared/types/validation/database-schema.ts` - Added `UpdateMessageActiveStateSchema` at line 65-68 with id (UUID) and isActive (boolean) validation, following the same pattern as other update schemas like UpdateAgentSchema and UpdateConversationSchema.
  - `src/shared/types/validation/database-schema.ts` - Added `SanitizedUpdateMessageActiveStateSchema` at line 240-243 with enhanced validation using UuidSchema for the id field, ensuring proper input sanitization for IPC operations.
  - `tests/unit/shared/types/validation-schemas.test.ts` - Added comprehensive unit tests for both `UpdateMessageActiveStateSchema` and `SanitizedUpdateMessageActiveStateSchema`. Tests cover valid data scenarios (true/false states), invalid data scenarios (malformed UUIDs, missing fields, wrong data types), and edge cases (empty strings, null values). Added import for uuid v4 for proper test UUID generation. Total of 12 new test cases added following the established testing patterns in the codebase.

- 3.0 Database Query Operations
  - [x] 3.1 Implement updateMessageActiveState query function with prepared statements
  - [ ] 3.2 Implement toggleMessageActiveState convenience function
  - [ ] 3.3 Update getMessagesByConversationId to include is_active field in results
  - [ ] 3.4 Create getActiveMessagesByConversationId filtered query function
  - [ ] 3.5 Add proper error handling and transaction support for state operations
  - [ ] 3.6 Write comprehensive unit tests for all query operations

  ### Files modified with description of changes
  - `src/main/database/queries/messages/updateMessageActiveState.ts` - Implemented updateMessageActiveState query function with prepared statements following established patterns. Function accepts messageId (string) and isActive (boolean), converts boolean to SQLite integer (0/1), uses prepared statement for security, handles result.changes for error detection, and returns fresh data via getMessageById call.
  - `src/main/database/queries/messages/index.ts` - Added barrel export for updateMessageActiveState function positioned after updateMessage for logical grouping of update operations.
  - `tests/unit/main/database/queries/messages/updateMessageActiveState.test.ts` - Created comprehensive unit tests (9 test cases) covering successful updates (true/false states), edge cases (message not found, database errors), SQL query verification, boolean-to-integer conversion for SQLite, and integration with getMessageById. All tests pass with proper mocking patterns following established codebase conventions.

  **Quality Checks Completed:**
  - ✅ **Format**: Prettier formatting applied successfully
  - ✅ **Tests**: All 9 unit tests pass (successful updates, edge cases, SQL verification, integration)
  - ✅ **Implementation**: Follows established patterns from existing message query functions
  - ✅ **Security**: Uses prepared statements to prevent SQL injection
  - ✅ **Error Handling**: Proper null return when no rows affected
  - ✅ **Types**: Full TypeScript type safety with DatabaseMessage interface

- 4.0 IPC Handler Implementation
  - [ ] 4.1 Create dbMessagesUpdateActiveStateHandler with input validation
  - [ ] 4.2 Create dbMessagesToggleActiveStateHandler with error handling
  - [ ] 4.3 Update existing message handlers to include isActive field in responses
  - [ ] 4.4 Add camelCase to snake_case field mapping for isActive ↔ is_active
  - [ ] 4.5 Register new IPC handlers in handler index file
  - [ ] 4.6 Write unit tests for IPC handlers with mock database operations

  ### Files modified with description of changes
  - (to be filled in after task completion)

- 5.0 Preload API Bridge Extension
  - [ ] 5.1 Add dbMessagesUpdateActiveState method to preload API
  - [ ] 5.2 Add dbMessagesToggleActiveState method to preload API
  - [ ] 5.3 Update IPC channel definitions for new message operations
  - [ ] 5.4 Add type definitions for new preload API methods
  - [ ] 5.5 Ensure proper error handling in preload bridge
  - [ ] 5.6 Write unit tests for preload API methods

  ### Files modified with description of changes
  - (to be filled in after task completion)

- 6.0 State Management Hook Integration
  - [ ] 6.1 Add updateMessageActiveState function to useMessages hook
  - [ ] 6.2 Add toggleMessageActiveState function to useMessages hook
  - [ ] 6.3 Implement optimistic updates for immediate UI feedback
  - [ ] 6.4 Add error handling and recovery for failed state updates
  - [ ] 6.5 Ensure consistency between local state and database state
  - [ ] 6.6 Write unit tests for hook functions with mock IPC operations

  ### Files modified with description of changes
  - (to be filled in after task completion)

- 7.0 AI Context Integration
  - [ ] 7.1 Create getActiveMessagesForAI utility function
  - [ ] 7.2 Implement message filtering at application layer
  - [ ] 7.3 Ensure inactive messages are excluded from AI conversation context
  - [ ] 7.4 Add configuration option to bypass active state filtering if needed
  - [ ] 7.5 Optimize filtering performance for large message volumes
  - [ ] 7.6 Write unit tests for AI context filtering functions

  ### Files modified with description of changes
  - (to be filled in after task completion)

- 8.0 Security Validation and Error Handling
  - [ ] 8.1 Implement message ID validation as UUID in all operations
  - [ ] 8.2 Add active state boolean validation with proper sanitization
  - [ ] 8.3 Create comprehensive error classes for active state operations
  - [ ] 8.4 Add input validation for all IPC operations with meaningful error messages
  - [ ] 8.5 Implement proper transaction rollback for failed operations
  - [ ] 8.6 Write unit tests for security validation and error scenarios

  ### Files modified with description of changes
  - (to be filled in after task completion)

## Task Sizing Guidelines

Each sub-task is designed to be completed in 1-2 hours and focuses on a single aspect of the implementation. The tasks follow the established codebase patterns and maintain consistency with existing architecture.

**Security and Quality Requirements:**

- All inputs must be validated with Zod schemas
- Database operations must use prepared statements
- Error handling must be comprehensive with meaningful messages
- Tests must be written for each implemented function
- Code must pass linting, formatting, and type checking

**Dependencies:**

- Tasks 1.0-3.0 can be worked on in parallel (database foundation)
- Tasks 4.0-5.0 depend on completion of tasks 1.0-3.0
- Tasks 6.0-7.0 depend on completion of tasks 4.0-5.0
- Tasks 8.0-10.0 can be worked on throughout implementation

**Success Criteria:**

- All 31 functional requirements from the specification are implemented
- Database migration successfully upgrades schema from v3 to v4
- Message active state operations integrate seamlessly with existing functionality
- AI conversation context correctly filters messages based on active state
- All quality checks pass with zero violations

This implementation plan provides a systematic approach to adding message active state functionality while maintaining the high quality standards and architectural patterns established in the Fishbowl codebase.
