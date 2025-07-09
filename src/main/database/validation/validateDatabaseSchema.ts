/**
 * Validate database schema integrity
 */
import { getDatabase } from '../connection';
import { DatabaseIntegrityError } from './DatabaseIntegrityError';

export function validateDatabaseSchema(): void {
  try {
    const db = getDatabase();

    // Check if required tables exist
    const requiredTables = ['conversations', 'agents', 'messages', 'conversation_agents'];

    for (const table of requiredTables) {
      const result = db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
        .get(table);
      if (!result) {
        throw new DatabaseIntegrityError(`Required table '${table}' does not exist`);
      }
    }

    // Check if required columns exist in conversations table
    const conversationColumns = db.prepare(`PRAGMA table_info(conversations)`).all() as Array<{
      name: string;
    }>;
    const requiredConversationColumns = [
      'id',
      'name',
      'description',
      'created_at',
      'updated_at',
      'is_active',
    ];

    for (const column of requiredConversationColumns) {
      if (!conversationColumns.some(c => c.name === column)) {
        throw new DatabaseIntegrityError(
          `Required column '${column}' does not exist in conversations table`,
        );
      }
    }

    // Check if required columns exist in agents table
    const agentColumns = db.prepare(`PRAGMA table_info(agents)`).all() as Array<{ name: string }>;
    const requiredAgentColumns = [
      'id',
      'name',
      'role',
      'personality',
      'is_active',
      'created_at',
      'updated_at',
    ];

    for (const column of requiredAgentColumns) {
      if (!agentColumns.some(c => c.name === column)) {
        throw new DatabaseIntegrityError(
          `Required column '${column}' does not exist in agents table`,
        );
      }
    }

    // Check if required columns exist in messages table
    const messageColumns = db.prepare(`PRAGMA table_info(messages)`).all() as Array<{
      name: string;
    }>;
    const requiredMessageColumns = [
      'id',
      'conversation_id',
      'agent_id',
      'content',
      'type',
      'metadata',
      'timestamp',
    ];

    for (const column of requiredMessageColumns) {
      if (!messageColumns.some(c => c.name === column)) {
        throw new DatabaseIntegrityError(
          `Required column '${column}' does not exist in messages table`,
        );
      }
    }

    // Check if required columns exist in conversation_agents table
    const relationColumns = db.prepare(`PRAGMA table_info(conversation_agents)`).all() as Array<{
      name: string;
    }>;
    const requiredRelationColumns = ['conversation_id', 'agent_id'];

    for (const column of requiredRelationColumns) {
      if (!relationColumns.some(c => c.name === column)) {
        throw new DatabaseIntegrityError(
          `Required column '${column}' does not exist in conversation_agents table`,
        );
      }
    }

    console.log('Database schema validation completed successfully');
  } catch (error) {
    console.error('Database schema validation failed:', error);
    throw error;
  }
}
