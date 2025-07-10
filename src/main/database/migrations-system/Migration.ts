/**
 * Migration interface
 */
export interface Migration {
  version: number;
  filename: string;
  sql: string;
}
