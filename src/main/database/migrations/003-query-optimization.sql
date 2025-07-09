-- Query optimization indexes migration
-- Creates additional indexes for optimal query performance based on analysis

-- Enhanced composite index for active conversations ordered by updated_at
CREATE INDEX IF NOT EXISTS idx_conversations_active_updated ON conversations(is_active, updated_at) WHERE is_active = 1;

-- Enhanced composite index for active agents ordered by name
CREATE INDEX IF NOT EXISTS idx_agents_active_name ON agents(is_active, name) WHERE is_active = 1;

-- Composite index for messages with conversation_id and timestamp (covering common query pattern)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp_desc ON messages(conversation_id, timestamp DESC);

-- Composite index for messages with agent_id and timestamp
CREATE INDEX IF NOT EXISTS idx_messages_agent_timestamp ON messages(agent_id, timestamp DESC);

-- Composite index for conversation_agents with conversation_id including agent_id (covering index)
CREATE INDEX IF NOT EXISTS idx_conversation_agents_conversation_agent ON conversation_agents(conversation_id, agent_id);

-- Covering index for messages metadata queries
CREATE INDEX IF NOT EXISTS idx_messages_type_timestamp ON messages(type, timestamp DESC);

-- Partial index for active conversation agents (optimization for joins)
CREATE INDEX IF NOT EXISTS idx_conversation_agents_active ON conversation_agents(conversation_id, agent_id) 
WHERE EXISTS (SELECT 1 FROM agents WHERE agents.id = conversation_agents.agent_id AND agents.is_active = 1);

-- Index for message search by content (if full-text search is needed in future)
-- Note: This is prepared for future full-text search capabilities
CREATE INDEX IF NOT EXISTS idx_messages_content ON messages(content);

-- Optimize queries for conversation with most recent message
CREATE INDEX IF NOT EXISTS idx_messages_conversation_latest ON messages(conversation_id, timestamp DESC, id);

-- Index for agent role queries (common for filtering by agent type)
CREATE INDEX IF NOT EXISTS idx_agents_role_active ON agents(role, is_active) WHERE is_active = 1;