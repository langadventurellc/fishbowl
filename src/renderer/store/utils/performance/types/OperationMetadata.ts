/**
 * Metadata about a store operation.
 */
export interface OperationMetadata {
  operationType?: 'get' | 'set' | 'bulk' | 'reset' | 'clear' | 'custom';
  sliceName?: string;
  dataSize?: number;
  ipcOperation?: string;
  [key: string]: unknown;
}
