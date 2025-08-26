-- Migration: Create conversation_agents table
-- Description: Associates configured agents with specific conversations
-- This migration creates the conversation_agents table to support linking agents
-- to conversations in the Fishbowl application. Note that agent_id references
-- agent configuration data from application settings, NOT a database foreign key.

-- Create conversation_agents table for agent-to-conversation associations
-- Each record represents a configured agent that has been added to a specific conversation
-- This is NOT a traditional many-to-many junction table - agent_id references configuration
-- stored in application settings, not a database table (agents are not database entities)
CREATE TABLE IF NOT EXISTS conversation_agents (
    id TEXT PRIMARY KEY,                              -- UUID stored as text (36 characters)
    conversation_id TEXT NOT NULL,                    -- Foreign key to conversations table
    agent_id TEXT NOT NULL,                          -- Configuration ID from settings (NOT a FK)
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,      -- ISO 8601 format timestamp
    is_active BOOLEAN DEFAULT 1,                     -- Active status flag for future use
    display_order INTEGER DEFAULT 0,                 -- Ordering support for future UI enhancements
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, agent_id)                -- Prevent duplicate agent assignments
);

-- Index for efficient conversation-based queries (most common use case)
-- Supports fast lookup of all agents associated with a specific conversation
-- Critical for UI display in Agent Labels Container and conversation loading
CREATE INDEX IF NOT EXISTS idx_conversation_agents_conversation
ON conversation_agents(conversation_id);

-- Index for efficient agent-based queries
-- Supports finding all conversations that include a specific agent
-- Useful for analytics, agent usage tracking, and future cross-conversation features
CREATE INDEX IF NOT EXISTS idx_conversation_agents_agent
ON conversation_agents(agent_id);

-- Composite index for efficient uniqueness checking and direct lookups
-- Optimizes the UNIQUE constraint and supports queries for specific agent-conversation pairs
-- Improves performance when checking if an agent is already in a conversation
CREATE INDEX IF NOT EXISTS idx_conversation_agents_composite
ON conversation_agents(conversation_id, agent_id);

-- Note: No automatic timestamp update trigger needed for this table
-- The added_at timestamp serves as an immutable creation record
-- is_active and display_order fields support future functionality without schema changes

-- Rollback Instructions (for reference only):
-- To reverse this migration, execute the following SQL:
-- DROP INDEX IF EXISTS idx_conversation_agents_composite;
-- DROP INDEX IF EXISTS idx_conversation_agents_agent; 
-- DROP INDEX IF EXISTS idx_conversation_agents_conversation;
-- DROP TABLE IF EXISTS conversation_agents;