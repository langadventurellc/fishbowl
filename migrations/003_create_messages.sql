-- Migration: Create messages table and update conversation_agents schema
-- Description: Create messages table for chat system and add enabled column to conversation_agents
-- This migration establishes the messages table with proper foreign key relationships and indexing
-- for the Fishbowl chat system, plus adds conversation agent participation control.

-- Create messages table for storing chat messages
-- Each message represents a single chat entry from user, agent, or system
-- UUIDs are stored as TEXT following SQLite best practices for cross-platform compatibility
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,                              -- UUID stored as text (36 characters)
    conversation_id TEXT NOT NULL,                    -- Foreign key to conversations table
    conversation_agent_id TEXT,                       -- Foreign key to conversation_agents table (nullable for user/system)
    role TEXT NOT NULL,                              -- Message role: user, agent, system
    content TEXT NOT NULL,                           -- Message content (no length limit)
    included BOOLEAN DEFAULT 1,                      -- Include in LLM context (1=yes, 0=no)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- ISO 8601 format timestamp
    -- Note: conversation_agent_id references conversation_agents(id), not settings
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_agent_id) REFERENCES conversation_agents(id) ON DELETE SET NULL
);

-- Composite index for efficient message retrieval by conversation and timestamp
-- Supports the primary query pattern: ORDER BY created_at within conversation
-- This is critical for chat UI performance when displaying conversation history
CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(conversation_id, created_at);

-- Add enabled column to conversation_agents table for participation control
-- This is separate from is_active and controls whether agent participates in new messages
-- Default value of 1 (true) maintains backward compatibility with existing agents
ALTER TABLE conversation_agents
ADD COLUMN enabled BOOLEAN DEFAULT 1;