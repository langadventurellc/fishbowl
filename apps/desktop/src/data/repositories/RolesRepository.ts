import * as path from "path";
import {
  PersistedRolesSettingsData,
  persistedRolesSettingsSchema,
  createLoggerSync,
  FileStorageService,
  FileStorageError,
} from "@fishbowl-ai/shared";

/**
 * Repository for managing roles data persistence in the desktop application.
 * Handles file operations for roles.json with atomic writes, validation, and error handling.
 * Follows the same patterns as SettingsRepository but specialized for roles data.
 */
export class RolesRepository {
  private static readonly DEFAULT_ROLES_FILE_NAME = "roles.json";
  private readonly filePath: string;
  private readonly fileStorageService: FileStorageService;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "RolesRepository" } },
  });

  /**
   * Create roles repository with data path for file operations.
   *
   * @param dataPath Directory path where roles.json should be stored
   */
  constructor(dataPath: string) {
    this.filePath = path.join(
      dataPath,
      RolesRepository.DEFAULT_ROLES_FILE_NAME,
    );
    this.fileStorageService = new FileStorageService();
  }

  /**
   * Load roles from storage. Creates default roles if file doesn't exist.
   * Automatically saves default roles to file for future loads.
   *
   * @returns Promise resolving to roles data (default roles if file not found)
   * @throws FileStorageError for file system issues other than file not found
   * @throws Error for JSON parsing or validation failures
   */
  async loadRoles(): Promise<PersistedRolesSettingsData> {
    try {
      this.logger.debug("Loading roles from file", { filePath: this.filePath });

      const rawRoles = await this.fileStorageService.readJsonFile<unknown>(
        this.filePath,
      );

      const validatedRoles = this.validateRoles(rawRoles);

      this.logger.debug("Roles loaded successfully", {
        roleCount: validatedRoles.roles?.length || 0,
      });

      return validatedRoles;
    } catch (error) {
      // Handle file not found by creating defaults
      if (error instanceof FileStorageError && error.operation === "read") {
        this.logger.debug("Roles file not found, creating with defaults");

        // Import createDefaultRolesSettings
        const { createDefaultRolesSettings } = await import(
          "@fishbowl-ai/shared"
        );

        const defaultRoles = createDefaultRolesSettings();

        // Save defaults to file for future loads
        try {
          await this.saveRoles(defaultRoles);
          this.logger.debug("Default roles saved successfully", {
            roleCount: defaultRoles.roles?.length || 0,
          });
        } catch (saveError) {
          // Log but don't throw - return defaults even if save fails
          this.logger.warn("Failed to save default roles", {
            error: saveError as Error,
          });
        }

        return defaultRoles;
      }

      this.logger.error("Failed to load roles", error as Error);
      throw this.mapError(error, "load");
    }
  }

  /**
   * Save roles to storage with atomic write operation.
   * Validates data before saving and creates directory if needed.
   *
   * @param roles Roles data to persist
   * @returns Promise resolving when save is complete
   * @throws FileStorageError for file system issues
   * @throws Error for validation failures
   */
  async saveRoles(roles: PersistedRolesSettingsData): Promise<void> {
    try {
      this.logger.debug("Saving roles to file", {
        filePath: this.filePath,
        roleCount: roles.roles?.length || 0,
      });

      // Validate before saving
      const validatedRoles = this.validateRoles(roles);

      // Update timestamp
      const rolesWithTimestamp = {
        ...validatedRoles,
        lastUpdated: new Date().toISOString(),
      };

      // Save atomically using FileStorageService
      await this.fileStorageService.writeJsonFile(
        this.filePath,
        rolesWithTimestamp,
      );

      this.logger.debug("Roles saved successfully");
    } catch (error) {
      this.logger.error("Failed to save roles", error as Error);
      throw this.mapError(error, "save");
    }
  }

  /**
   * Reset roles by deleting the roles.json file.
   * Does not throw error if file doesn't exist.
   *
   * @returns Promise resolving when reset is complete
   * @throws FileStorageError for file system issues other than file not found
   */
  async resetRoles(): Promise<void> {
    try {
      this.logger.debug("Resetting roles by deleting file", {
        filePath: this.filePath,
      });

      // Use FileStorageService to delete file consistently with abstraction
      await this.fileStorageService.deleteJsonFile(this.filePath);

      this.logger.debug("Roles file deleted successfully");
    } catch (error: unknown) {
      // ENOENT means file doesn't exist - not an error for reset operation
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "ENOENT"
      ) {
        this.logger.debug("Roles file already doesn't exist, reset complete");
        return;
      }

      this.logger.error("Failed to reset roles", error as Error);
      throw this.mapError(error, "reset");
    }
  }

  /**
   * Validate and parse unknown data into typed roles settings.
   * Ensures data structure is correct and applies schema validation.
   *
   * @param roles Unknown data to validate
   * @returns Validated and typed roles settings
   * @throws Error for validation failures
   */
  private validateRoles(roles: unknown): PersistedRolesSettingsData {
    try {
      // Ensure we have an object structure
      if (!roles || typeof roles !== "object" || Array.isArray(roles)) {
        throw new Error("Roles data must be an object");
      }

      // Validate with Zod schema
      const result = persistedRolesSettingsSchema.safeParse(roles);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw new Error(`Roles validation failed: ${errorMessages}`);
      }

      return result.data;
    } catch (error) {
      this.logger.error("Roles validation failed", error as Error);
      throw error;
    }
  }

  /**
   * Map file system errors to appropriate error types with context.
   * Hides internal file paths from error messages for security.
   *
   * @param error Original error from file operations
   * @param operation Operation that failed (load, save, reset)
   * @returns Mapped error with appropriate context
   */
  private mapError(error: unknown, operation: string): Error {
    if (error instanceof Error) {
      // Map common file system errors
      if ("code" in error) {
        switch ((error as { code: string }).code) {
          case "ENOENT":
            return new Error(`Roles file not found during ${operation}`);
          case "EPERM":
          case "EACCES":
            return new Error(`Permission denied during roles ${operation}`);
          case "ENOSPC":
            return new Error(`Insufficient disk space for roles ${operation}`);
          default:
            break;
        }
      }

      // Return error with operation context, but hide file path
      return new Error(`Failed to ${operation} roles: ${error.message}`);
    }

    return new Error(`Failed to ${operation} roles: Unknown error`);
  }
}
