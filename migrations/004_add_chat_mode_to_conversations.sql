-- Migration: Add chat_mode column to conversations table
-- Description: Adds chat mode support for Manual and Round Robin conversation modes
-- This migration enables chat mode functionality while maintaining backward compatibility
-- with existing conversations. The chat_mode column supports two modes: 'manual' (current
-- behavior where users control agent participation) and 'round-robin' (new mode where
-- only one agent is enabled at a time and rotates after each response).

-- Add chat_mode column to conversations table
-- VARCHAR type chosen for SQLite compatibility (ENUM not supported)
-- DEFAULT 'manual' preserves existing behavior for all current conversations
-- NOT NULL constraint ensures data integrity (no null/undefined states)
ALTER TABLE conversations
ADD COLUMN chat_mode VARCHAR DEFAULT 'manual' NOT NULL;

-- Note: No index added initially per KISS/YAGNI principles
-- Index can be added later if mode-based queries become necessary
-- Valid values enforced at application layer: 'manual' | 'round-robin'

-- Rollback Instructions (for reference only):
-- To reverse this migration, execute the following SQL:
-- ALTER TABLE conversations DROP COLUMN chat_mode;
-- Note: SQLite supports DROP COLUMN as of version 3.35.0 (2021-03-12)
-- For older SQLite versions, table recreation would be required