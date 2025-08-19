import * as path from "path";
import {
  PersistedAgentsSettingsData,
  persistedAgentsSettingsSchema,
  createLoggerSync,
  FileStorageService,
  FileStorageError,
  createDefaultAgentsSettings,
} from "@fishbowl-ai/shared";
import { NodeFileSystemBridge } from "../../main/services/NodeFileSystemBridge";
import { NodeCryptoUtils } from "../../main/utils/NodeCryptoUtils";
import { NodePathUtils } from "../../main/utils/NodePathUtils";

/**
 * Repository for managing agents data persistence in the desktop application.
 * Handles file operations for agents.json with atomic writes, validation, and error handling.
 * Follows the same patterns as PersonalitiesRepository but specialized for agents data.
 */
export class AgentsRepository {
  private static readonly DEFAULT_AGENTS_FILE_NAME = "agents.json";
  private readonly filePath: string;
  private readonly fileStorageService: FileStorageService;
  private readonly logger = createLoggerSync({
    context: { metadata: { component: "AgentsRepository" } },
  });

  /**
   * Create agents repository with data path for file operations.
   *
   * @param dataPath Directory path where agents.json should be stored
   */
  constructor(dataPath: string) {
    this.filePath = path.join(
      dataPath,
      AgentsRepository.DEFAULT_AGENTS_FILE_NAME,
    );
    const fileSystemBridge = new NodeFileSystemBridge();
    const cryptoUtils = new NodeCryptoUtils();
    const pathUtils = new NodePathUtils();
    this.fileStorageService = new FileStorageService(
      fileSystemBridge,
      cryptoUtils,
      pathUtils,
    );
  }

  /**
   * Load agents from storage. Creates default agents if file doesn't exist.
   * Automatically saves default agents to file for future loads.
   *
   * @returns Promise resolving to agents data (default agents if file not found)
   * @throws FileStorageError for file system issues other than file not found
   * @throws Error for JSON parsing or validation failures
   */
  async loadAgents(): Promise<PersistedAgentsSettingsData> {
    try {
      this.logger.debug("Loading agents from file", {
        filePath: this.filePath,
      });

      const rawAgents = await this.fileStorageService.readJsonFile<unknown>(
        this.filePath,
      );

      const validatedAgents = this.validateAgents(rawAgents);

      this.logger.debug("Agents loaded successfully", {
        agentCount: validatedAgents.agents?.length || 0,
      });

      return validatedAgents;
    } catch (error) {
      // Handle file not found by creating defaults
      if (error instanceof FileStorageError && error.operation === "read") {
        this.logger.debug("Agents file not found, creating with defaults");

        const defaultAgents = createDefaultAgentsSettings();

        // Save defaults to file for future loads
        try {
          await this.saveAgents(defaultAgents);
          this.logger.debug("Default agents saved successfully", {
            agentCount: defaultAgents.agents?.length || 0,
          });
        } catch (saveError) {
          // Log but don't throw - return defaults even if save fails
          this.logger.warn("Failed to save default agents", {
            error: saveError as Error,
          });
        }

        return defaultAgents;
      }

      this.logger.error("Failed to load agents", error as Error);
      throw this.mapError(error, "load");
    }
  }

  /**
   * Save agents to storage with atomic write operation.
   * Validates data before saving and creates directory if needed.
   *
   * @param agents Agents data to persist
   * @returns Promise resolving when save is complete
   * @throws FileStorageError for file system issues
   * @throws Error for validation failures
   */
  async saveAgents(agents: PersistedAgentsSettingsData): Promise<void> {
    try {
      this.logger.debug("Saving agents to file", {
        filePath: this.filePath,
        agentCount: agents.agents?.length || 0,
      });

      // Validate before saving
      const validatedAgents = this.validateAgents(agents);

      // Update timestamp
      const agentsWithTimestamp = {
        ...validatedAgents,
        lastUpdated: new Date().toISOString(),
      };

      // Save atomically using FileStorageService
      await this.fileStorageService.writeJsonFile(
        this.filePath,
        agentsWithTimestamp,
      );

      this.logger.debug("Agents saved successfully");
    } catch (error) {
      this.logger.error("Failed to save agents", error as Error);
      throw this.mapError(error, "save");
    }
  }

  /**
   * Reset agents by loading defaults and saving them to file.
   * Creates default agents using createDefaultAgentsSettings and saves them.
   *
   * @returns Promise resolving when reset is complete
   * @throws Error for default creation or save failures
   */
  async resetAgents(): Promise<void> {
    try {
      this.logger.info("Resetting agents to defaults", {
        filePath: this.filePath,
      });

      // Load default agents
      const defaultAgents = createDefaultAgentsSettings();

      this.logger.debug("Default agents created", {
        agentCount: defaultAgents.agents?.length || 0,
      });

      // Save defaults using saveAgents method
      await this.saveAgents(defaultAgents);

      this.logger.info("Agents reset to defaults successfully");
    } catch (error) {
      this.logger.error("Failed to reset agents", error as Error);
      throw this.mapError(error, "reset");
    }
  }

  /**
   * Validate and parse unknown data into typed agents settings.
   * Ensures data structure is correct and applies schema validation.
   *
   * @param agents Unknown data to validate
   * @returns Validated and typed agents settings
   * @throws Error for validation failures
   */
  private validateAgents(agents: unknown): PersistedAgentsSettingsData {
    try {
      // Ensure we have an object structure
      if (!agents || typeof agents !== "object" || Array.isArray(agents)) {
        throw new Error("Agents data must be an object");
      }

      // Validate with Zod schema
      const result = persistedAgentsSettingsSchema.safeParse(agents);

      if (!result.success) {
        const errorMessages = result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw new Error(`Agents validation failed: ${errorMessages}`);
      }

      return result.data;
    } catch (error) {
      this.logger.error("Agents validation failed", error as Error);
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
            return new Error(`Agents file not found during ${operation}`);
          case "EPERM":
          case "EACCES":
            return new Error(`Permission denied during agents ${operation}`);
          case "ENOSPC":
            return new Error(`Insufficient disk space for agents ${operation}`);
          default:
            break;
        }
      }

      // Return error with operation context, but hide file path
      return new Error(`Failed to ${operation} agents: ${error.message}`);
    }

    return new Error(`Failed to ${operation} agents: Unknown error`);
  }
}
