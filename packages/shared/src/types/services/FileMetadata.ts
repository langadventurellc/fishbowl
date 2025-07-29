/**
 * @fileoverview File Metadata
 *
 * File metadata information
 */

/**
 * File metadata information
 */
export interface FileMetadata {
  size: number;
  createdAt: string;
  modifiedAt: string;
  permissions: string;
  checksum?: string;
  version?: string;
}
