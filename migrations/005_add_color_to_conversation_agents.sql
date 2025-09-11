-- Migration: Add color column to conversation_agents table
-- Description: Adds color assignment support for visual agent distinction
-- This migration enables persistent color assignments for agents in conversations.
-- The color column stores CSS variable references (e.g., "--agent-1") that provide
-- visual distinction between different agents in the UI. The default value "--agent-1" 
-- ensures all existing agents have a valid color assignment after migration.

-- Add color column to conversation_agents table
-- TEXT type chosen for SQLite compatibility to store CSS variable names
-- DEFAULT '--agent-1' ensures backward compatibility with existing data
-- NOT NULL constraint ensures data integrity (all agents must have colors)
ALTER TABLE conversation_agents
ADD COLUMN color TEXT DEFAULT '--agent-1' NOT NULL;

-- Note: No index added initially per KISS/YAGNI principles
-- Index can be added later if color-based queries become necessary
-- Valid values enforced at application layer: '--agent-1' through '--agent-8'
-- CSS variable format enables theme flexibility without database changes

-- Rollback Instructions (for reference only):
-- To reverse this migration, execute the following SQL:
-- ALTER TABLE conversation_agents DROP COLUMN color;
-- Note: SQLite supports DROP COLUMN as of version 3.35.0 (2021-03-12)
-- For older SQLite versions, table recreation would be required