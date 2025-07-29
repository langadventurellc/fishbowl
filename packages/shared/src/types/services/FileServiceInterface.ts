/**
 * @fileoverview File Service Interface
 *
 * Service interface for configuration file operations with support for
 * atomic operations, metadata management, and cross-platform compatibility.
 */

import type { ConfigurationData } from "../../__tests__/integration/utilities/TemporaryDirectoryManager";
import type { FileCreateOptions } from "./FileCreateOptions";
import type { FileUpdateOptions } from "./FileUpdateOptions";
import type { FileDeleteOptions } from "./FileDeleteOptions";
import type { FileOperationResult } from "./FileOperationResult";
import type { FileMetadata } from "./FileMetadata";

/**
 * File Service Interface
 * Handles configuration file lifecycle operations with atomicity and consistency
 */
export interface FileService {
  /**
   * Create a new configuration file with proper metadata and permissions
   */
  createFile(
    path: string,
    content: ConfigurationData,
    options?: FileCreateOptions,
  ): Promise<FileOperationResult>;

  /**
   * Update an existing configuration file atomically
   */
  updateFile(
    path: string,
    content: ConfigurationData,
    options?: FileUpdateOptions,
  ): Promise<FileOperationResult>;

  /**
   * Delete a configuration file with proper cleanup
   */
  deleteFile(
    path: string,
    options?: FileDeleteOptions,
  ): Promise<FileOperationResult>;

  /**
   * Read configuration file content and parse to ConfigurationData
   */
  readFile(path: string): Promise<ConfigurationData>;

  /**
   * Check if file exists at the specified path
   */
  exists(path: string): Promise<boolean>;

  /**
   * Get file metadata including size, timestamps, and permissions
   */
  getMetadata(path: string): Promise<FileMetadata>;

  /**
   * Set file permissions securely
   */
  setPermissions(path: string, permissions: string): Promise<void>;

  /**
   * Validate file content integrity
   */
  validateFileIntegrity(path: string): Promise<{
    isValid: boolean;
    errors: string[];
    checksum?: string;
  }>;
}
