import {
  ConversationAgentsRepository,
  ConversationsRepository,
  FileStorageService,
  MessageRepository,
  SettingsRepository,
  createLoggerSync,
  type ConversationsRepositoryInterface,
  type DatabaseBridge,
  type StructuredLogger,
} from "@fishbowl-ai/shared";
import { app } from "electron";
import * as path from "path";
import { NodeCryptoUtils } from "../utils/NodeCryptoUtils";
import { NodeDeviceInfo } from "../utils/NodeDeviceInfo";
import { NodePathUtils } from "../utils/NodePathUtils";
import { MainDatabaseService } from "./MainDatabaseService";
import { NodeDatabaseBridge } from "./NodeDatabaseBridge";
import { NodeFileSystemBridge } from "./NodeFileSystemBridge";

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
  readonly databaseService: MainDatabaseService;

  /**
   * Repository for managing conversation persistence.
   */
  readonly conversationsRepository: ConversationsRepositoryInterface;

  /**
   * Repository for managing conversation agent persistence.
   */
  readonly conversationAgentsRepository: ConversationAgentsRepository;

  /**
   * Repository for managing message persistence.
   */
  readonly messagesRepository: MessageRepository;

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

    // Initialize conversation agents repository
    try {
      this.conversationAgentsRepository = new ConversationAgentsRepository(
        this.databaseBridge,
        this.cryptoUtils,
      );

      this.logger.info("ConversationAgentsRepository initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize ConversationAgentsRepository",
        error instanceof Error ? error : undefined,
      );
      throw new Error("ConversationAgentsRepository initialization failed");
    }

    // Initialize messages repository
    try {
      this.messagesRepository = new MessageRepository(
        this.databaseBridge,
        this.cryptoUtils,
      );

      this.logger.info("MessageRepository initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize MessageRepository",
        error instanceof Error ? error : undefined,
      );
      throw new Error("MessageRepository initialization failed");
    }

    this.databaseService = new MainDatabaseService(
      this.databaseBridge,
      this.fileSystemBridge,
      this.logger,
      pathUtils,
    );
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
  createDatabaseBridge<T>(
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
   * Get the path to the database file in the user data directory.
   *
   * @returns Database file path
   */
  private getDatabasePath(): string {
    const userDataPath = app.getPath("userData");
    return path.join(userDataPath, "fishbowl.db");
  }

  /**
   * Run database migrations to ensure schema is up to date.
   * This should be called during application startup after database initialization.
   *
   * @returns Promise that resolves when migrations complete successfully
   * @throws Error if migrations fail
   */
  async runDatabaseMigrations(): Promise<void> {
    await this.databaseService.runDatabaseMigrations();
  }
}
