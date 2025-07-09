/**
 * Table information interface
 */
import { IndexInfo } from './IndexInfo';

export interface TableInfo {
  name: string;
  rowCount: number;
  indexes: IndexInfo[];
}
