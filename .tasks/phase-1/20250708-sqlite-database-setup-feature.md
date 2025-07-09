# SQLite Database Setup Feature Specification

## Overview

This feature implements a comprehensive SQLite database system for the Fishbowl Electron application using better-sqlite3. The database will provide persistent storage for conversations, messages, and agent configurations, operating exclusively within the main process for security and performance. The implementation includes a migration system for schema versioning, optimized queries with prepared statements, and type-safe IPC communication channels.

**Problem Statement:** The application currently uses file-based JSON configuration storage, which is insufficient for managing complex conversation data, message history, and agent configurations that require relational structure and efficient querying.

**Solution Summary:** Implement a SQLite database with better-sqlite3 in the main process, providing structured data storage, migration capabilities, and IPC-based access for the renderer process.

**Primary Goals:**

- Establish persistent storage for conversations, messages, and agent configurations
- Implement database schema versioning and migration system
- Provide type-safe IPC interfaces for database operations
- Optimize database performance for responsive application experience

## Functional Requirements

**FR-1: Database Initialization**

- Initialize SQLite database using better-sqlite3 in main process
- Create database file at `app.getPath('userData')/database.sqlite`
- Establish connection management with proper error handling
- Implement database file creation and validation on first run

**FR-2: Schema Management**

- Create initial database schema with three core tables: `conversations`, `messages`, `agents`
- Implement foreign key relationships between tables
- Add appropriate indexes for query optimization
- Define consistent column types and constraints

**FR-3: Migration System**

- Create sequential numbered migration system (001-initial.sql, 002-add-indexes.sql, etc.)
- Implement migration execution and rollback capabilities
- Track migration version using SQLite's `PRAGMA user_version` or dedicated `schema_migrations` table
- Support safe schema updates during application upgrades
- Consider using existing migration library like `@blackglory/better-sqlite3-migrations` for robust implementation

**FR-4: Database Operations**

- Implement CRUD operations for conversations, messages, and agents
- Create prepared statements for common database operations
- Support batch operations for message insertion
- Implement soft delete functionality for data preservation

**FR-5: IPC Communication**

- Expose database operations through type-safe IPC channels
- Implement request/response patterns for database queries
- Add input validation and sanitization for all database operations
- Support both synchronous and asynchronous operation patterns

**FR-6: Performance Optimization**

- Enable WAL (Write-Ahead Logging) mode for improved concurrency and performance
- Implement database connection pooling and lifecycle management
- Create indexes on frequently queried columns (conversation_id, agent_id, timestamp)
- Use database transactions for data consistency and batch operations
- Implement prepared statements for repeated queries (5x performance improvement)
- Add periodic WAL checkpoint management to prevent file growth
- Implement query optimization for large conversation histories

## Technical Requirements

**TR-1: Technology Stack**

- Use better-sqlite3 library for synchronous SQLite operations (fastest SQLite library for Node.js)
- Implement in TypeScript with strict type checking
- Integrate with existing Electron main process architecture
- Follow existing IPC communication patterns
- Consider migration library: `@blackglory/better-sqlite3-migrations` for robust schema versioning

**TR-2: Database Schema**

```sql
-- Conversations table (matches existing ChatRoom interface)
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  personality TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  metadata TEXT, -- JSON string
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Conversation-Agent junction table
CREATE TABLE conversation_agents (
  conversation_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  PRIMARY KEY (conversation_id, agent_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Performance indexes for optimal query performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_agent_id ON messages(agent_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_conversation_timestamp ON messages(conversation_id, timestamp);
CREATE INDEX idx_agents_active ON agents(is_active);
CREATE INDEX idx_conversations_active ON conversations(is_active);

-- Schema migrations tracking (alternative to PRAGMA user_version)
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
```

**TR-3: File Structure**

```
src/main/database/
├── connection.ts          # Database connection management
├── migrations.ts          # Migration system implementation
├── schema.ts             # Database schema definitions
├── queries/              # Database query implementations
│   ├── conversations.ts  # Conversation CRUD operations
│   ├── messages.ts       # Message CRUD operations
│   └── agents.ts         # Agent CRUD operations
└── migrations/           # SQL migration files
    ├── 001-initial.sql   # Initial schema
    ├── 002-indexes.sql   # Performance indexes
    └── ...
```

**TR-4: IPC Channel Extensions**

- Extend existing IPC channels with database operations
- Add new channels: `db:conversations:*`, `db:messages:*`, `db:agents:*`
- Implement consistent error handling and response formatting
- Support pagination for large result sets (recommended: 100-1000 messages per page)
- Use prepared statements for all database operations (5x performance improvement)
- Implement batch operations for message insertion (up to 20x faster than individual inserts)

**TR-5: Integration Requirements**

- Integrate with existing main process architecture
- Maintain compatibility with current configuration system
- Support existing development and build workflows
- Follow established TypeScript and linting standards
- Enable WAL mode on database initialization: `db.pragma('journal_mode = WAL')`
- Implement WAL checkpoint management to prevent file growth
- Handle better-sqlite3 native module compilation for cross-platform builds

## User Stories

**US-1: Conversation Persistence**
As a user, I want my conversations to be automatically saved to the database so that I can return to them later without losing any message history.

**US-2: Agent Configuration Storage**
As a user, I want my custom agent configurations to persist across application restarts so that I don't have to recreate them every time.

**US-3: Message History Access**
As a user, I want to be able to search through my message history efficiently so that I can find specific conversations or information quickly.

**US-4: Data Integrity**
As a user, I want my conversation data to be stored safely with proper relationships so that messages are always associated with the correct agents and conversations.

**US-5: Schema Evolution**
As a developer, I want the database schema to be versioned and upgradeable so that new features can be added without breaking existing data.

**US-6: Performance**
As a user, I want database operations to be fast and responsive so that the application doesn't feel slow when accessing conversation history.

## Acceptance Criteria

**AC-1: Database Initialization**

- Database file is created successfully on first application run
- Connection is established without errors
- Database is accessible only from main process
- Proper error handling for database creation failures

**AC-2: Schema Creation**

- All required tables (`conversations`, `messages`, `agents`, `conversation_agents`, `schema_migrations`) are created
- Foreign key relationships are properly established
- Indexes are created for optimal query performance
- Schema matches the defined TypeScript interfaces

**AC-3: Migration System**

- Migration system can execute SQL files in sequential order
- Current schema version is tracked in `schema_migrations` table
- Failed migrations are handled gracefully with rollback capability
- New migrations can be added and executed during application updates

**AC-4: Database Operations**

- CRUD operations work correctly for all entity types
- Prepared statements are used for all database operations
- Batch operations support multiple message insertions efficiently
- Soft delete functionality preserves data integrity

**AC-5: IPC Integration**

- Database operations are accessible via IPC channels from renderer process
- All database operations return consistent, type-safe responses
- Input validation prevents SQL injection and data corruption
- Error handling provides meaningful feedback to the UI

**AC-6: Performance Requirements**

- Database operations complete within 100ms for typical queries
- Large conversation histories (1000+ messages) load efficiently
- Database connection management prevents resource leaks
- Transaction handling ensures data consistency

## Non-Goals

**NG-1: Multi-User Support**

- Database is designed for single-user desktop application
- No user authentication or multi-tenancy features
- No concurrent user access patterns

**NG-2: Cloud Synchronization**

- Database remains local to the user's machine
- No cloud backup or synchronization features
- No real-time collaboration capabilities

**NG-3: Advanced Analytics**

- No complex reporting or analytics features
- No data visualization or statistics generation
- No conversation analysis or insights

**NG-4: Database Administration**

- No database administration UI or tools
- No manual database editing capabilities
- No direct SQL query execution from UI

## Technical Considerations

**TC-1: Dependencies**

- Add `better-sqlite3` as a production dependency (current: v12.2.0, actively maintained)
- Consider `@blackglory/better-sqlite3-migrations` for robust migration system
- Ensure compatibility with current Electron version
- Handle native module compilation for different platforms
- Consider `@types/better-sqlite3` for TypeScript support

**TC-2: Error Handling**

- Implement comprehensive error handling for database operations
- Provide meaningful error messages for debugging
- Handle database corruption and recovery scenarios
- Support graceful degradation when database is unavailable

**TC-3: Security**

- Validate all input data before database operations
- Use parameterized queries to prevent SQL injection
- Implement proper access controls through IPC validation
- Ensure sensitive data is not logged or exposed

**TC-4: Performance Optimization**

- Enable WAL mode immediately after database connection: `db.pragma('journal_mode = WAL')`
- Use database transactions for multi-step operations (up to 50% performance improvement)
- Implement batch operations for message insertion (up to 20x faster than individual inserts)
- Use prepared statements for repeated queries (5x performance improvement)
- Add database indexes for frequently queried columns (conversation_id, agent_id, timestamp)
- Implement WAL checkpoint management to prevent file growth:
  ```javascript
  // Monitor WAL file size and checkpoint when needed
  if (walFileSize > acceptableSize) {
    db.pragma('wal_checkpoint(RESTART)');
  }
  ```
- Consider periodic database maintenance (VACUUM, ANALYZE) - can provide 20% performance boost

**TC-5: Testing Strategy**

- Unit tests for database connection and operations
- Integration tests for IPC communication
- Migration testing for schema upgrades
- Performance testing with large datasets

**TC-6: Backup and Recovery**

- Implement database backup functionality
- Support database repair and recovery operations
- Handle database file corruption gracefully
- Provide data export capabilities

## Success Metrics

**SM-1: Functionality Metrics**

- 100% of conversation data persists correctly across application restarts
- All database operations complete successfully without data loss
- Migration system executes without errors during application updates
- IPC communication maintains type safety and error handling

**SM-2: Performance Metrics**

- Database initialization completes within 2 seconds
- Individual message insertion completes within 50ms (with prepared statements)
- Batch message insertion (100 messages) completes within 100ms
- Conversation history loading (100 messages) completes within 200ms
- Database queries maintain sub-100ms response times (with proper indexing)
- WAL mode provides concurrent read/write operations without blocking

**SM-3: Reliability Metrics**

- Zero data corruption incidents during normal operations
- Database connection maintains stability during extended use
- Migration system handles schema updates without data loss
- Error recovery mechanisms function correctly

**SM-4: Integration Metrics**

- Database operations integrate seamlessly with existing IPC architecture
- TypeScript interfaces maintain consistency between database and application layers
- Development workflow remains unchanged with database integration
- Build and deployment processes function correctly with native dependencies

## Implementation Notes

**Migration Library Recommendation:**
Consider using `@blackglory/better-sqlite3-migrations` which provides a robust migration system with user_version tracking and rollback capabilities, or implement a custom solution using `PRAGMA user_version` for simplicity.

**WAL Mode Setup:**

```javascript
const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
```

**Performance Considerations:**

- WAL mode is essential for Electron applications with concurrent operations
- Prepared statements provide 5x performance improvement for repeated queries
- Batch operations can be up to 20x faster than individual inserts
- Monitor WAL file size and checkpoint when needed to prevent unbounded growth

**Electron-Specific Considerations:**

- WAL mode creates temporary files (.db-shm, .db-wal) that may trigger React hot-reload
- Configure build tools to ignore these files during development
- Ensure proper native module compilation for cross-platform distribution

This feature specification provides the foundation for implementing a robust, performant SQLite database system that supports the Fishbowl application's conversation management needs while maintaining security, type safety, and integration with the existing Electron architecture, enhanced with 2025 best practices for better-sqlite3 performance optimization.
