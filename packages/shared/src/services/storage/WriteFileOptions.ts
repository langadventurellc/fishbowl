import { TextEncoding } from "./TextEncoding";

/**
 * Options for file write operations.
 * Supports Node.js fs.WriteFileOptions subset.
 */
export interface WriteFileOptions {
  /** File permission mode (default: 0o666) */
  mode?: number;
  /** Text encoding for the file content */
  encoding?: TextEncoding;
}
