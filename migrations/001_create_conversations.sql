-- Migration: Create conversations table
-- Description: Initial table for storing chat conversation metadata
-- This migration establishes the foundational conversations table with proper
-- indexing and triggers for the Fishbowl application database schema.

-- Create conversations table for storing chat sessions
-- Each conversation represents a multi-agent chat session with a user-defined title
-- UUIDs are stored as TEXT following SQLite best practices for cross-platform compatibility
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,                              -- UUID stored as text (36 characters)
    title TEXT NOT NULL,                              -- Human-readable conversation title
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- ISO 8601 format timestamp
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP     -- Auto-updated on changes
);

-- Index for efficient date-based queries (newest conversations first)
-- This supports the common use case of displaying recent conversations
-- in the application UI with optimal query performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_at
ON conversations(created_at DESC);

-- Trigger to automatically update updated_at timestamp on any row modification
-- Ensures accurate tracking of when conversations were last modified
-- without requiring application-level timestamp management
CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at
AFTER UPDATE ON conversations
FOR EACH ROW
BEGIN
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;