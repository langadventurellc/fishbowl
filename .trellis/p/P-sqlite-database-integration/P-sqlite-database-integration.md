---
id: P-sqlite-database-integration
title: SQLite Database Integration for Fishbowl Desktop
status: in-progress
priority: medium
prerequisites: []
affectedFiles:
  packages/shared/src/services/database/types/DatabaseErrorCode.ts:
    New enum with 18 standardized database error codes covering all failure
    scenarios
  packages/shared/src/services/database/types/DatabaseError.ts:
    New abstract base class for all database errors with IPC serialization
    support
  packages/shared/src/services/database/types/ConnectionError.ts: New error class for database connection failures with context
  packages/shared/src/services/database/types/QueryError.ts: New error class for SQL query failures with SQL and parameter context
  packages/shared/src/services/database/types/TransactionError.ts: New error class for transaction-specific failures
  packages/shared/src/services/database/types/PermissionError.ts: New error class for database access permission issues
  packages/shared/src/services/database/types/ConstraintViolationError.ts: New error class for constraint violations with constraint type mapping
  packages/shared/src/services/database/types/index.ts:
    New barrel export file for
    all database error types; Added type exports for all new
    DatabaseResult-related interfaces using proper 'export type' syntax for
    isolatedModules compliance; Added exports for new configuration option types
  packages/shared/src/services/database/index.ts: New database package index
    exporting all types; Updated to export the DatabaseBridge interface
    alongside existing type exports; Enhanced main barrel file with
    comprehensive exports organized by category, detailed JSDoc documentation,
    and clear import examples for applications
  packages/shared/src/services/index.ts: Updated to export database types
    alongside storage types; Added convenience exports of
    ConversationsRepositoryInterface and ConversationsRepository from
    repositories for easier access; Added export for migrations module to make
    MigrationService available
  packages/shared/src/services/database/types/__tests__/DatabaseError.test.ts: Comprehensive tests for base DatabaseError class functionality
  packages/shared/src/services/database/types/__tests__/ConnectionError.test.ts: Unit tests for ConnectionError with context and serialization testing
  packages/shared/src/services/database/types/__tests__/QueryError.test.ts: Unit tests for QueryError covering SQL and parameter handling
  packages/shared/src/services/database/types/__tests__/TransactionError.test.ts: Unit tests for TransactionError with operation context
  packages/shared/src/services/database/types/__tests__/PermissionError.test.ts: Unit tests for PermissionError with resource context
  packages/shared/src/services/database/types/__tests__/ConstraintViolationError.test.ts:
    Unit tests for ConstraintViolationError with constraint type mapping
    verification
  packages/shared/src/services/database/types/DatabaseResult.ts:
    Created base DatabaseResult interface with lastInsertRowid, changes, and
    affectedRows properties compatible with both SQLite drivers
  packages/shared/src/services/database/types/QueryMetadata.ts:
    Created QueryMetadata interface for query execution information including
    columns, executionTime, and rowsExamined
  packages/shared/src/services/database/types/QueryResult.ts: Created generic
    QueryResult interface for SELECT operations with typed row arrays and
    optional metadata
  packages/shared/src/services/database/types/ExecutionResult.ts:
    Created ExecutionResult interface extending DatabaseResult with
    success/error state for INSERT/UPDATE/DELETE operations
  packages/shared/src/services/database/types/__tests__/DatabaseResult.test.ts:
    Created comprehensive test suite with 20 test cases covering type safety,
    generic inference, error scenarios, and platform compatibility
  packages/shared/src/services/database/DatabaseBridge.ts: Created the main
    DatabaseBridge interface with complete method definitions, generics for type
    safety, and comprehensive JSDoc documentation
  packages/shared/src/services/database/__tests__/DatabaseBridge.test.ts:
    Created comprehensive test suite with 17 test cases covering interface
    compliance, type safety, method signatures, and usage patterns
  packages/shared/src/services/database/types/QueryOptions.ts:
    Created QueryOptions interface with timeout, pagination, metadata, debug,
    and prepare options
  packages/shared/src/services/database/types/TransactionOptions.ts:
    Created TransactionOptions interface with isolation levels, retry
    configuration, and read-only support
  packages/shared/src/services/database/types/ConnectionOptions.ts:
    Created ConnectionOptions interface with connection pooling, pragmas, WAL
    mode, and file path configuration
  packages/shared/src/services/database/types/TransactionIsolationLevel.ts: Created TransactionIsolationLevel type with SQL standard isolation levels
  packages/shared/src/services/database/types/__tests__/QueryOptions.test.ts: Comprehensive unit tests for QueryOptions type validation and behavior
  packages/shared/src/services/database/types/__tests__/TransactionOptions.test.ts:
    Comprehensive unit tests for TransactionOptions including isolation levels
    and retry logic
  packages/shared/src/services/database/types/__tests__/ConnectionOptions.test.ts:
    Comprehensive unit tests for ConnectionOptions including pragma
    configuration and option merging
  packages/shared/src/services/database/types/__tests__/TransactionIsolationLevel.test.ts:
    Comprehensive unit tests for TransactionIsolationLevel type safety and
    runtime validation
  packages/shared/src/services/database/__tests__/package-exports.test.ts:
    Created comprehensive test suite validating all export functionality, import
    patterns, TypeScript compilation, tree shaking compatibility, and circular
    dependency prevention
  apps/desktop/package.json: Added better-sqlite3 ^12.2.0 to dependencies and
    @types/better-sqlite3 ^7.6.13 to devDependencies
  apps/desktop/src/main/services/NodeDatabaseBridge.ts: Created new
    NodeDatabaseBridge class implementing DatabaseBridge interface with
    constructor, pragma configuration, connection management, and stub methods
    for future implementation; Implemented complete execute method with prepared
    statements, DatabaseResult mapping, BigInt handling, and comprehensive error
    mapping from SQLite errors to DatabaseError types; Implemented query<T>
    method following interface contract with prepared statements, parameter
    binding, error conversion to DatabaseError types, and connection state
    validation; Enhanced close() method with comprehensive logging, error
    handling, and idempotent behavior. Added logger initialization and
    connection lifecycle logging in constructor. Improved error handling with
    proper ConnectionError throwing.; Implemented complete transaction<T> method
    with BEGIN/COMMIT/ROLLBACK pattern, transaction state tracking
    (isTransactionActive flag), error conversion to TransactionError with proper
    logging, nested transaction handling, and extractFailedOperation helper
    method; Added imports for path utilities (dirname) and fs operations (stat,
    mkdir, existsSync). Implemented backup() method with better-sqlite3 backup
    API, directory creation, path validation, and comprehensive error handling.
    Implemented vacuum() method with VACUUM command execution, transaction state
    validation, and proper error conversion. Implemented getSize() method with
    fs.stat() for file size retrieval, in-memory database detection, and
    detailed logging with size formatting.
  apps/desktop/src/main/services/__tests__/NodeDatabaseBridge.test.ts:
    Created comprehensive unit test suite with 18 test cases covering
    implemented functionality including constructor behavior, pragma
    configuration, interface compliance, error scenarios, and connection state
    tracking; Added comprehensive unit test suite for execute method with 15+
    test cases covering INSERT/UPDATE/DELETE operations, error scenarios,
    constraint violations, and parameter handling; Added comprehensive test
    suite for query method with 18 test cases covering typed results, various
    data types, empty results, complex parameters, large result sets, type
    safety, connection errors, SQL errors, constraint violations, JOIN
    operations, and aggregate queries; Added comprehensive unit tests for new
    logging functionality including constructor logging, close() method logging,
    error scenarios, and connection state tracking. Added mock logger setup and
    extensive test coverage for all new features.; Added comprehensive
    transaction test suite with 13 test cases covering successful transactions,
    rollback scenarios, nested operations, error handling, type preservation,
    connection validation, and transaction lifecycle logging; Added fs and
    fs/promises module mocking at top level. Added backup() method property to
    mockDatabase object. Added comprehensive test suite for backup() method with
    5 test cases covering successful backup, connection validation, path
    validation, API failure handling, and directory creation. Added
    comprehensive test suite for vacuum() method with 4 test cases covering
    successful execution, connection validation, transaction state validation,
    and command failure handling. Added comprehensive test suite for getSize()
    method with 5 test cases covering successful size retrieval, connection
    validation, in-memory database handling, file stat failures, and various
    file sizes with proper MB conversion testing.
  apps/desktop/src/main/services/MainProcessServices.ts:
    Added NodeDatabaseBridge
    property, imports for electron app and path modules, constructor
    initialization, and getDatabasePath() helper method; Added
    performDatabaseHealthCheck() method that checks database connection and
    performs basic connectivity test with proper error handling and logging;
    Added DatabaseBridge type import from @fishbowl-ai/shared. Added
    createDatabaseService<T>() factory method with comprehensive JSDoc
    documentation, usage examples, and TypeScript generics for type-safe
    database service creation.; Added ConversationsRepository import, property
    declaration, initialization in constructor with proper error handling,
    createConversationService factory method, and getConversationsRepository
    getter method; Added MigrationService import, property, initialization in
    constructor, runDatabaseMigrations() method, and getMigrationsPath() helper
    method with proper error handling and logging
  apps/desktop/src/main/services/__tests__/MainProcessServices.test.ts:
    Added comprehensive unit tests for database service integration with proper
    mocking, verification of service initialization, method availability, and
    consistent behavior; Added comprehensive unit tests for
    performDatabaseHealthCheck() method with 5 test cases covering all scenarios
    including mocked database bridge behavior; Added comprehensive test suite
    for createDatabaseService method with 7 test cases including mock service
    classes (MockUserRepository, MockConversationService), factory function
    verification, error handling, type safety testing, and complex service
    creation patterns.; Added ConversationsRepository mocking, initialization
    test, createConversationService tests for normal operation and error
    handling, getConversationsRepository tests for normal operation and error
    handling; Added comprehensive unit tests for MigrationService integration
    including mocks, initialization tests, and all migration execution scenarios
  apps/desktop/src/electron/main.ts: Added initializeDatabase function with
    connection verification and error handling, integrated database
    initialization into app.whenReady() before window creation, added graceful
    database cleanup in before-quit event handler, imported dialog module for
    error display; Enhanced database cleanup in before-quit event handler with
    Promise.race() timeout mechanism, added comprehensive timeout vs general
    error logging, implemented 2-second shutdown limit as required by
    performance specifications; Added migration execution to app.whenReady()
    flow after database initialization, with proper error handling,
    user-friendly error dialog, and graceful app exit on failures. Maintains
    existing startup sequence and performance characteristics.
  packages/shared/src/types/conversations/Conversation.ts: Created core
    Conversation interface with id, title, created_at, updated_at fields and
    JSDoc documentation
  packages/shared/src/types/conversations/CreateConversationInput.ts: Created input type for new conversation creation with optional title field
  packages/shared/src/types/conversations/UpdateConversationInput.ts: Created input type for conversation updates with optional title field
  packages/shared/src/types/conversations/ConversationResult.ts: Created discriminated union result type for conversation operations
  packages/shared/src/types/conversations/index.ts:
    Created barrel export file for
    all conversation types using proper export type syntax; Updated barrel
    export to include schemas and error classes using proper export type syntax
    and organized comments
  packages/shared/src/types/index.ts: Added conversations module export to main types barrel
  packages/shared/src/types/conversations/__tests__/types.test.ts: Created comprehensive unit tests verifying type structure and compatibility
  packages/shared/src/types/conversations/schemas/conversationSchema.ts:
    Created Zod schema for complete conversation validation with UUID, datetime,
    and title constraints
  packages/shared/src/types/conversations/schemas/createConversationInputSchema.ts: Created schema for conversation creation input with optional title validation
  packages/shared/src/types/conversations/schemas/updateConversationInputSchema.ts:
    Created schema for conversation updates with partial validation and
    at-least-one-field requirement
  packages/shared/src/types/conversations/schemas/index.ts: Created barrel export file for all schemas and their inferred types
  packages/shared/src/types/conversations/schemas/__tests__/conversationSchema.test.ts:
    Comprehensive test suite for conversation schema validation covering valid
    inputs, invalid fields, missing fields, and edge cases
  packages/shared/src/types/conversations/schemas/__tests__/createConversationInputSchema.test.ts:
    Complete test coverage for create input schema including optional title
    behavior and validation rules
  packages/shared/src/types/conversations/schemas/__tests__/updateConversationInputSchema.test.ts:
    Full test suite for update schema covering partial updates, empty object
    rejection, and validation constraints
  packages/shared/src/types/conversations/errors/ConversationNotFoundError.ts:
    Created ConversationNotFoundError class extending Error with conversationId
    property and toJSON serialization method
  packages/shared/src/types/conversations/errors/ConversationValidationError.ts:
    Created ConversationValidationError class extending Error with validation
    error details array and toJSON serialization method
  packages/shared/src/types/conversations/errors/index.ts: Created barrel export file for both error classes
  packages/shared/src/types/conversations/errors/__tests__/ConversationNotFoundError.test.ts:
    Comprehensive test suite covering constructor, inheritance, serialization,
    and error properties for ConversationNotFoundError
  packages/shared/src/types/conversations/errors/__tests__/ConversationValidationError.test.ts:
    Complete test coverage for ConversationValidationError including
    single/multiple errors, inheritance, serialization, and edge cases
  packages/shared/src/types/conversations/__tests__/exports.test.ts:
    Created comprehensive test suite verifying all exports are available,
    schemas work correctly, error classes are constructable, no circular
    dependencies exist, and runtime vs type-only exports are properly separated
  packages/shared/src/repositories/conversations/ConversationsRepositoryInterface.ts:
    Created repository interface with comprehensive CRUD methods and detailed
    JSDoc documentation
  packages/shared/src/repositories/conversations/index.ts: Created barrel export
    file for conversations repository module; Added ConversationsRepository
    export to barrel file; Added re-exports of conversation types (Conversation,
    CreateConversationInput, UpdateConversationInput, ConversationResult) and
    error classes (ConversationNotFoundError, ConversationValidationError) for
    convenience access
  packages/shared/src/repositories/index.ts: Added conversations module export to main repositories barrel
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepositoryInterface.test.ts:
    Created comprehensive interface compliance test suite with mock
    implementation
  packages/shared/src/repositories/conversations/ConversationsRepository.ts:
    Created ConversationsRepository class with constructor, dependencies,
    placeholder methods, and utility functions; Implemented create, get, and
    exists methods with comprehensive validation, UUID generation, database
    operations, and error handling using Zod schemas and parameterized SQL
    queries; Added import for updateConversationInputSchema and implemented
    list(), update(), and delete() methods with proper SQL queries, input
    validation, existence checks, error handling, and logging
  packages/shared/src/repositories/conversations/__tests__/ConversationsRepository.test.ts:
    Created comprehensive test suite covering constructor, interface compliance,
    and placeholder method behavior; Added comprehensive test suite with 21
    tests covering all implemented methods, validation scenarios, error
    handling, and edge cases using proper mocks and TypeScript types; Added
    comprehensive test suites for list, update, and delete methods including
    happy paths, error scenarios, validation testing, and database error
    handling with proper mocking
  packages/shared/src/repositories/conversations/__tests__/exports.test.ts:
    Created comprehensive test suite verifying all exports are available,
    properly typed, and accessible from main package export with proper mocking
    of dependencies
  packages/shared/src/services/migrations/MigrationErrorCode.ts:
    Created comprehensive enum with migration-specific error codes following
    DatabaseErrorCode pattern
  packages/shared/src/services/migrations/MigrationError.ts: Created
    MigrationError class extending Error with filename, context, and
    serialization support
  packages/shared/src/services/migrations/MigrationFile.ts:
    Created interface for
    discovered migration files with filename, order, and path properties
  packages/shared/src/services/migrations/AppliedMigration.ts: Created interface matching database schema for tracking applied migrations
  packages/shared/src/services/migrations/MigrationResult.ts: Created discriminated union type for migration execution results
  packages/shared/src/services/migrations/MigrationStatus.ts: Created enum for
    migration execution states (pending, running, applied, failed, skipped)
  packages/shared/src/services/migrations/MigrationOperation.ts:
    Created enum for migration operation types (apply, rollback, discover,
    validate, initialize)
  packages/shared/src/services/migrations/index.ts: Created barrel export file
    following database types pattern; Updated barrel export to include
    MigrationDiscovery class for external consumption; Updated barrel export to
    include MigrationTracking service for external consumption; Updated barrel
    export to include MigrationService as primary export along with new result
    and error types
  packages/shared/src/services/migrations/__tests__/MigrationError.test.ts: Created comprehensive unit tests for MigrationError class with 100% coverage
  packages/shared/src/services/migrations/__tests__/types.test.ts:
    Created comprehensive unit tests for all migration types and enums with
    integration scenarios
  packages/shared/src/services/migrations/MigrationDiscovery.ts:
    Created core MigrationDiscovery class with discoverMigrations() and
    loadMigrationContent() methods, following established patterns for file
    system operations and error handling
  packages/shared/src/services/storage/FileSystemBridge.ts:
    Extended interface to
    include optional readdir() method for directory listing functionality
  apps/desktop/src/main/services/NodeFileSystemBridge.ts: Implemented readdir()
    method using fs.readdir with proper validation and error handling
  packages/shared/src/services/migrations/__tests__/MigrationDiscovery.test.ts:
    Created comprehensive unit test suite with mocked dependencies covering
    directory validation, file discovery, content loading, and error scenarios
  packages/shared/src/services/migrations/MigrationTracking.ts:
    Created core MigrationTracking service class with ensureMigrationsTable(),
    getAppliedMigrations(), isPending(), and recordMigration() methods using
    DatabaseBridge dependency injection pattern
  packages/shared/src/services/migrations/__tests__/MigrationTracking.test.ts:
    Created comprehensive unit test suite covering all methods, error scenarios,
    and integration workflows with 100% test coverage
  packages/shared/src/services/migrations/MigrationService.ts:
    Created main MigrationService orchestration class with runMigrations method,
    transaction management, and comprehensive error handling; Fixed import
    statements to use TypeScript module resolution without .js extensions for
    Jest compatibility
  packages/shared/src/services/migrations/MigrationExecutionResult.ts:
    Created result interface for migration execution process with success
    status, counts, and error details
  packages/shared/src/services/migrations/MigrationExecutionError.ts:
    Created interface for migration execution error details with order,
    filename, and error message
  packages/shared/src/services/migrations/__tests__/MigrationService.test.ts:
    Created comprehensive unit test suite with 8 test cases covering all major
    functionality and error scenarios
  migrations/001_create_conversations.sql: Created initial migration file for
    conversations table with UUID primary key, title, timestamps, performance
    index on created_at DESC, and automatic updated_at trigger with
    comprehensive SQL comments
  migrations/__tests__/001_create_conversations.test.ts: Created comprehensive
    unit test suite validating migration file existence, SQL syntax, table
    structure, index definition, trigger functionality, documentation quality,
    and performance requirements
  migrations/README.md: Completely rewrote with comprehensive documentation
    covering migration system architecture, naming conventions, SQL best
    practices, execution workflows, platform support, troubleshooting, security
    considerations, and testing guidance. Used conversations migration as
    concrete example throughout.
  migrations/__tests__/README.test.ts:
    Created comprehensive test suite validating
    README documentation completeness, accuracy, formatting, and alignment with
    actual implementation. Tests cover all required sections, examples, best
    practices, and content accuracy.
  apps/desktop/src/electron/__tests__/main.test.ts: Created comprehensive unit
    test suite covering migration integration scenarios including successful
    startup flow, migration failures, error dialog display, app exit behavior,
    and startup sequence validation. All 6 tests pass successfully.
  apps/desktop/src/components/conversations/NewConversationButton.tsx:
    Created NewConversationButton component with TypeScript interface, loading
    states, accessibility features, and comprehensive documentation
  apps/desktop/src/components/conversations/__tests__/NewConversationButton.test.tsx:
    Created comprehensive unit test suite covering all component functionality
    including rendering, loading states, click handling, accessibility, and
    performance optimizations
log: []
schema: v1.0
childrenIds:
  - E-conversations-repository-layer
  - E-database-infrastructure-setup
  - E-ipc-communication-layer
  - E-migration-system-implementatio
  - E-ui-integration
created: 2025-08-22T00:41:57.455Z
updated: 2025-08-22T00:41:57.455Z
---

# SQLite Database Integration for Fishbowl Desktop

## Executive Summary

Implement SQLite database persistence for the Fishbowl desktop application to store conversations locally. This project establishes the foundational data layer using a platform bridge pattern that will support both desktop (Electron) and future mobile (React Native) implementations. The initial MVP focuses on creating a minimal conversations table with a simple forward-only migration system.

## Functional Requirements

### Core Database Functionality

- **Local data persistence** using SQLite for storing application data
- **Conversations management** with ability to create, read, update, and delete conversation records
- **Migration system** to manage database schema changes over time
- **Platform abstraction** through bridge pattern for desktop/mobile compatibility

### MVP Scope (Phase 1)

- Single `conversations` table with minimal fields (id, title, created_at, updated_at)
- Create new conversation functionality triggered by UI button
- Forward-only migration system (no rollback capability)
- Desktop-only implementation using better-sqlite3

### Future Expansion (Not in MVP)

- Messages table for storing conversation content
- Agent associations and metadata
- Full CRUD operations for conversations
- Mobile platform support using expo-sqlite

## Technical Requirements

### Technology Stack

- **Desktop Database**: better-sqlite3 (synchronous, performant, TypeScript-friendly)
- **Mobile Database**: expo-sqlite (future implementation)
- **Migration Format**: Numbered SQL files (001_create_conversations.sql, etc.)
- **Database Location**: User data directory (`userData/fishbowl.db`)

### Architecture Overview

```mermaid
graph TB
    subgraph "Desktop App"
        UI[React UI Components]
        IPC[IPC Handlers]
        MP[Main Process Services]
        NDB[NodeDatabaseBridge]
        SQLite[(SQLite DB)]
    end

    subgraph "Shared Package"
        DB[DatabaseBridge Interface]
        CR[ConversationsRepository]
        MS[MigrationService]
        Types[Types & Schemas]
    end

    UI -->|invoke| IPC
    IPC --> MP
    MP --> CR
    CR --> DB
    NDB -.implements.-> DB
    NDB --> SQLite
    MS --> DB
```

### Platform Bridge Pattern

The implementation follows the established pattern in the codebase:

1. **DatabaseBridge Interface** (shared package)
   - Abstract database operations (query, execute, transaction)
   - Migration running capabilities
   - Platform-agnostic API

2. **NodeDatabaseBridge** (desktop implementation)
   - Implements DatabaseBridge using better-sqlite3
   - Runs in Electron main process for security
   - Handles file system operations

3. **Repository Pattern**
   - ConversationsRepository in shared package
   - Business logic independent of platform
   - Uses dependency injection with DatabaseBridge

### Migration System Design

**Simple Forward-Only Approach:**

- SQL files in `/migrations/` directory
- Numbered format: `001_initial_schema.sql`, `002_add_feature.sql`
- Migrations table tracks applied migrations
- Run on application startup
- No rollback capability (intentional simplicity)

**Migration Table Structure:**

```sql
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Data Model

### Conversations Table (MVP)

```sql
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,  -- UUID
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Future Tables (Post-MVP)

- `messages` - Conversation messages with agent associations
- `agents` - Agent configurations used in conversations
- `message_metadata` - Additional message data (reactions, edits, etc.)

## Integration Requirements

### IPC Communication

- New IPC channel: `conversations:create`
- Follow existing IPC handler patterns in the codebase
- Return standardized response format with success/error states

### UI Integration

- Connect "New Conversation" button in Home.tsx
- Use existing button component from shadcn/ui
- Display success/error feedback to user

### Error Handling

- Graceful database initialization failures
- Migration error reporting
- Transaction rollback on errors
- User-friendly error messages

## Acceptance Criteria

### Database Setup

- [ ] Database file created in correct user data directory
- [ ] Database persists between application restarts
- [ ] Migrations run automatically on startup
- [ ] Migration tracking prevents duplicate execution

### Conversation Creation

- [ ] Clicking "New Conversation" creates database record
- [ ] New conversation has unique UUID
- [ ] Title defaults to "New Conversation" or timestamp
- [ ] Created/updated timestamps are set correctly
- [ ] Success feedback shown to user

### Code Quality

- [ ] Follows existing bridge pattern architecture
- [ ] TypeScript types for all database operations
- [ ] Unit tests for repository methods
- [ ] Integration tests for IPC handlers
- [ ] Error scenarios properly handled

### Platform Compatibility

- [ ] DatabaseBridge interface supports future mobile implementation
- [ ] No platform-specific code in shared package
- [ ] Repository logic is platform-agnostic
- [ ] Migration system works across platforms

## Development Phases

### Phase 1: MVP Implementation (Current)

1. Install better-sqlite3 dependency
2. Create DatabaseBridge interface
3. Implement NodeDatabaseBridge for desktop
4. Create migration runner service
5. Add conversations table migration
6. Implement ConversationsRepository
7. Wire up IPC handlers
8. Connect UI button
9. Test implementation

### Phase 2: Extended Functionality (Future)

- Add messages table and relationships
- Implement full CRUD operations
- Add conversation search/filtering
- Include conversation metadata

### Phase 3: Mobile Support (Future)

- Implement ExpoDatabaseBridge
- Test migration compatibility
- Ensure data sync capabilities

## Success Metrics

- Database operations complete in <100ms
- Zero data loss between sessions
- Migrations execute successfully on first run
- Clean separation between platform and business logic
- All tests passing (unit and integration)

## Constraints and Considerations

### Performance

- Keep JSON conversation data under 10MB per record (future consideration)
- Index frequently queried fields
- Use transactions for multi-step operations

### Security

- Database runs in main process only (not renderer)
- Validate all input from renderer process
- Use parameterized queries to prevent SQL injection

### Maintainability

- Simple migration system (50-100 lines of code)
- Clear separation of concerns
- Well-documented interfaces
- Follow existing code patterns in the repository
