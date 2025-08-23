import {
  FileStorageService,
  SettingsRepository,
  ConversationsRepository,
  MigrationService,
  createLoggerSync,
  type StructuredLogger,
  type DatabaseBridge,
  type ConversationsRepositoryInterface,
} from "@fishbowl-ai/shared";
import { app } from "electron";
import * as path from "path";
import { NodeFileSystemBridge } from "./NodeFileSystemBridge";
import { NodeDatabaseBridge } from "./NodeDatabaseBridge";
import { NodeCryptoUtils } from "../utils/NodeCryptoUtils";
import { NodePathUtils } from "../utils/NodePathUtils";
import { NodeDeviceInfo } from "../utils/NodeDeviceInfo";

/**
 * Service container for Electron main process dependencies.
 *
 * Implements dependency injection pattern by creating Node.js implementations
 * and injecting them into shared services. Provides configured services
 * for use throughout the main process.
 *
 * @example
 * ```typescript
 * // In main.ts
 * const services = new MainProcessServices();
 *
 * // Use configured services
 * const settings = await services.settingsRepository.loadSettings();
 * services.logger.info("Application started");
 * ```
 */
export class MainProcessServices {
  // Node.js implementations
  readonly fileSystemBridge: NodeFileSystemBridge;
  readonly databaseBridge: NodeDatabaseBridge;
  readonly cryptoUtils: NodeCryptoUtils;
  readonly deviceInfo: NodeDeviceInfo;

  // Configured shared services
  readonly fileStorage: FileStorageService;
  readonly logger: StructuredLogger;
  readonly migrationService: MigrationService;

  /**
   * Repository for managing conversation persistence.
   */
  readonly conversationsRepository: ConversationsRepositoryInterface;

  constructor() {
    // Initialize Node.js implementations
    this.fileSystemBridge = new NodeFileSystemBridge();
    this.databaseBridge = new NodeDatabaseBridge(this.getDatabasePath());
    this.cryptoUtils = new NodeCryptoUtils();
    this.deviceInfo = new NodeDeviceInfo();
    const pathUtils = new NodePathUtils();

    // Create file storage service with Node.js file system bridge
    this.fileStorage = new FileStorageService(
      this.fileSystemBridge,
      this.cryptoUtils,
      pathUtils,
    );

    // Create logger with Node.js implementations
    // Using createLogger for consistent configuration
    this.logger = this.createConfiguredLogger();

    // Initialize migration service
    this.migrationService = new MigrationService(
      this.databaseBridge,
      this.fileSystemBridge,
      pathUtils,
      this.getMigrationsPath(),
    );

    // Initialize conversations repository
    try {
      const cryptoUtils = new NodeCryptoUtils();
      this.conversationsRepository = new ConversationsRepository(
        this.databaseBridge,
        cryptoUtils,
      );

      this.logger.info("ConversationsRepository initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize ConversationsRepository",
        error instanceof Error ? error : undefined,
      );
      throw new Error("ConversationsRepository initialization failed");
    }
  }

  /**
   * Create a SettingsRepository with the configured file storage service.
   *
   * @param settingsFilePath - Path to the settings file
   * @returns Configured SettingsRepository instance
   */
  createSettingsRepository(settingsFilePath: string): SettingsRepository {
    return new SettingsRepository(this.fileStorage, settingsFilePath);
  }

  /**
   * Create a database-dependent service with the configured database bridge.
   * Follows the factory method pattern to provide clean dependency injection
   * for services that need database access.
   *
   * @template T The type of service to create
   * @param serviceFactory Function that creates the service with database dependency
   * @returns Configured service instance with database access
   *
   * @example
   * ```typescript
   * // Create a user repository
   * const userRepository = mainProcessServices.createDatabaseService(
   *   (db) => new UserRepository(db)
   * );
   *
   * // Create a conversation service with additional dependencies
   * const conversationService = mainProcessServices.createDatabaseService(
   *   (db) => new ConversationService(db, logger)
   * );
   * ```
   */
  createDatabaseService<T>(
    serviceFactory: (databaseBridge: DatabaseBridge) => T,
  ): T {
    return serviceFactory(this.databaseBridge);
  }

  /**
   * Create a conversation-related service with repository dependency.
   *
   * @template T The service type to create
   * @param ServiceClass Constructor for the service class
   * @returns Instance of the service with repository injected
   *
   * @example
   * ```typescript
   * class ConversationSearchService {
   *   constructor(private repo: ConversationsRepositoryInterface) {}
   * }
   *
   * const searchService = services.createConversationService(ConversationSearchService);
   * ```
   */
  createConversationService<T>(
    ServiceClass: new (repo: ConversationsRepositoryInterface) => T,
  ): T {
    if (!this.conversationsRepository) {
      throw new Error("ConversationsRepository not initialized");
    }

    return new ServiceClass(this.conversationsRepository);
  }

  /**
   * Get the conversations repository instance.
   *
   * @returns The conversations repository
   * @throws Error if repository not initialized
   */
  getConversationsRepository(): ConversationsRepositoryInterface {
    if (!this.conversationsRepository) {
      throw new Error("ConversationsRepository not initialized");
    }

    return this.conversationsRepository;
  }

  /**
   * Create a configured logger with Node.js implementations.
   * Uses createLoggerSync function for consistent configuration with dependency injection.
   *
   * @returns Configured logger instance
   */
  private createConfiguredLogger(): StructuredLogger {
    // Create logger with Node.js implementations using createLoggerSync
    // This approach ensures consistent configuration while injecting our implementations
    try {
      // Use createLoggerSync with our Node implementations
      // Note: createLoggerSync already handles injection internally,
      // but we want to ensure it uses our specific Node implementations
      return createLoggerSync({
        config: {
          name: "desktop-main",
          level: "info",
          includeDeviceInfo: true,
        },
        context: {
          platform: "desktop",
          metadata: { process: "main", pid: process.pid },
        },
      }) as StructuredLogger;
    } catch (error) {
      // Fallback to console logging if logger creation fails
      console.error("Failed to create configured logger:", error);

      // Create minimal logger fallback
      return {
        debug: (msg: string, meta?: unknown) => console.debug(msg, meta),
        info: (msg: string, meta?: unknown) => console.info(msg, meta),
        warn: (msg: string, meta?: unknown) => console.warn(msg, meta),
        error: (msg: string, meta?: unknown) => console.error(msg, meta),
      } as StructuredLogger;
    }
  }

  /**
   * Run database migrations to ensure schema is up to date.
   * This should be called during application startup after database initialization.
   *
   * @returns Promise that resolves when migrations complete successfully
   * @throws Error if migrations fail
   */
  async runDatabaseMigrations(): Promise<void> {
    try {
      this.logger.info("Starting database migrations");
      const result = await this.migrationService.runMigrations();

      if (result.success) {
        this.logger.info("Database migrations completed successfully", {
          migrationsRun: result.migrationsRun,
          currentVersion: result.currentVersion,
        });
      } else {
        const errorDetails = result.errors
          ?.map((e) => `${e.filename}: ${e.error}`)
          .join(", ");
        this.logger.error(
          `Database migrations failed - ran ${result.migrationsRun} migrations, errors: ${errorDetails}`,
        );
        throw new Error(`Database migrations failed: ${errorDetails}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        "Migration execution failed",
        error instanceof Error ? error : undefined,
      );
      throw new Error(`Migration execution failed: ${errorMessage}`);
    }
  }

  /**
   * Performs a basic database health check.
   *
   * @returns Object indicating if database is healthy and any issues found
   */
  async performDatabaseHealthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check 1: Database connection
      if (!this.databaseBridge.isConnected()) {
        issues.push("Database connection not established");
        return { isHealthy: false, issues };
      }

      // Check 2: Basic connectivity test
      const connectivityResult = await this.databaseBridge.query(
        "SELECT 1 as test",
        [],
      );

      if (!connectivityResult || connectivityResult.length === 0) {
        throw new Error("Database connectivity test failed");
      }

      this.logger.debug("Database connectivity test passed");

      if (issues.length === 0) {
        this.logger.info("Database health check completed successfully");
        return { isHealthy: true, issues: [] };
      }

      return { isHealthy: false, issues };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown database error";
      issues.push(`Database health check failed: ${errorMessage}`);
      this.logger.error(
        "Database health check failed",
        error instanceof Error ? error : undefined,
      );
      return { isHealthy: false, issues };
    }
  }

  /**
   * Get the path to the database file in the user data directory.
   *
   * @returns Database file path
   */
  private getDatabasePath(): string {
    const userDataPath = app.getPath("userData");
    return path.join(userDataPath, "fishbowl.db");
  }

  /**
   * Get the path to the migrations directory.
   * Resolves correctly for both development and production environments.
   *
   * @returns Migrations directory path
   */
  private getMigrationsPath(): string {
    if (app.isPackaged) {
      // Production: use app resources path
      const appPath = app.getAppPath();
      const migrationsPath = path.join(appPath, "migrations");
      this.logger.debug("Using packaged migrations path", {
        path: migrationsPath,
      });
      return migrationsPath;
    } else {
      // Development: use project root migrations
      const appPath = app.getAppPath();
      const projectRoot = path.resolve(appPath, "..", "..");
      const migrationsPath = path.join(projectRoot, "migrations");
      this.logger.debug("Using development migrations path", {
        path: migrationsPath,
      });
      return migrationsPath;
    }
  }
}
