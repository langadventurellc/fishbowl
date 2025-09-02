import type { IndexColumnInfo } from "./IndexColumnInfo";

/**
 * Index information from PRAGMA index_list and index_info.
 */
export interface IndexInfo {
  seq: number;
  name: string;
  unique: boolean;
  origin: string;
  partial: boolean;
  columns?: IndexColumnInfo[];
}
