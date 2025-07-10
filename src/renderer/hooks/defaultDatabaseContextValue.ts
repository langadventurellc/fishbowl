import { DatabaseContextValue } from '.';
import { defaultDatabaseActions } from './defaultDatabaseActions';
import { defaultDatabaseState } from './defaultDatabaseState';

/**
 * Default database context value
 */

export const defaultDatabaseContextValue: DatabaseContextValue = {
  ...defaultDatabaseState,
  ...defaultDatabaseActions,
};
