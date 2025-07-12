-- Message Active State Migration
-- Adds is_active field to messages table to enable selective inclusion in AI conversation context

-- Add is_active column to messages table
-- Uses INTEGER type with DEFAULT 1 to match pattern used in conversations and agents tables
-- All existing messages will default to active state (is_active = 1)
ALTER TABLE messages ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;

-- Create index on is_active field for query optimization
-- Enables fast filtering of active/inactive messages
CREATE INDEX IF NOT EXISTS idx_messages_is_active ON messages(is_active);

-- Create composite index for conversation_id and is_active queries
-- Optimizes queries for active messages within a specific conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_active ON messages(conversation_id, is_active);

-- Create composite index for active messages with timestamp ordering
-- Optimizes queries for chronological ordering of active messages
CREATE INDEX IF NOT EXISTS idx_messages_active_timestamp ON messages(is_active, timestamp DESC) WHERE is_active = 1;

-- Create composite index for conversation active messages with timestamp
-- Optimizes queries for active conversation history with chronological ordering
CREATE INDEX IF NOT EXISTS idx_messages_conversation_active_timestamp ON messages(conversation_id, is_active, timestamp DESC) WHERE is_active = 1;