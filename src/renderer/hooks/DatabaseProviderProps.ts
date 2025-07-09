/**
 * Database provider props interface
 */
export interface DatabaseProviderProps {
  children: React.ReactNode;
  autoInitialize?: boolean;
  syncInterval?: number;
  enableErrorTracking?: boolean;
}
