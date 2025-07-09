import type { DatabaseContextActions } from './DatabaseContextActions';
import type { DatabaseContextState } from './DatabaseContextState';

/**
 * Database context value interface
 * Combines state and actions for the database context
 */
export interface DatabaseContextValue extends DatabaseContextState, DatabaseContextActions {}
