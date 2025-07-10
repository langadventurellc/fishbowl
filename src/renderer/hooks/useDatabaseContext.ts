/**
 * Database context for centralized state management
 */

import { useContext } from 'react';

import { DatabaseContextValue } from '.';
import { DatabaseContext } from './DatabaseContext';

/**
 * Hook to use database context
 */
export const useDatabaseContext = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};
