-- Performance indexes migration
-- Creates indexes for optimal query performance

-- Index for active conversations
CREATE INDEX IF NOT EXISTS idx_conversations_is_active ON conversations(is_active);

-- Index for conversation created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Index for active agents
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);

-- Index for agent created_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

-- Index for messages by conversation_id (most common query)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Index for messages by agent_id
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);

-- Index for messages by timestamp for chronological ordering
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

-- Composite index for messages by conversation and timestamp (for conversation history)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp ON messages(conversation_id, timestamp);

-- Index for conversation_agents by conversation_id
CREATE INDEX IF NOT EXISTS idx_conversation_agents_conversation_id ON conversation_agents(conversation_id);

-- Index for conversation_agents by agent_id
CREATE INDEX IF NOT EXISTS idx_conversation_agents_agent_id ON conversation_agents(agent_id);