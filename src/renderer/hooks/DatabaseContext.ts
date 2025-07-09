import { createContext } from 'react';
import { DatabaseContextValue } from '.';
import { defaultDatabaseContextValue } from './defaultDatabaseContextValue';

/**
 * Database context
 */

export const DatabaseContext = createContext<DatabaseContextValue>(defaultDatabaseContextValue);
