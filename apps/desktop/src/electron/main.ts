import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  shell,
} from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { StructuredLogger } from "@fishbowl-ai/shared";
import { MainProcessServices } from "../main/services/MainProcessServices.js";
import { ensurePersonalityDefinitions } from "./startup/ensurePersonalityDefinitions.js";
import { ensureSystemPromptTemplate } from "./startup/ensureSystemPromptTemplate.js";
import { setupAgentsHandlers } from "./agentsHandlers.js";
import { setupConversationAgentHandlers } from "./conversationAgentHandlers.js";
import { setupConversationsHandlers } from "./conversationsHandlers.js";
import { setupMessagesHandlers } from "./messagesHandlers.js";
import { setupChatHandlers } from "./chatHandlers.js";
import { llmConfigServiceManager } from "./getLlmConfigService.js";
import { llmStorageServiceManager } from "./getLlmStorageService.js";
import { settingsRepositoryManager } from "./getSettingsRepository.js";
import { setupLlmConfigHandlers } from "./handlers/llmConfigHandlers.js";
import { setupLlmModelsHandlers } from "./handlers/llmModelsHandlers.js";
import { setupPersonalityDefinitionsHandlers } from "./handlers/personalityDefinitionsHandlers.js";
import { setupPersonalitiesHandlers } from "./personalitiesHandlers.js";
import { setupRolesHandlers } from "./rolesHandlers.js";
import { LlmConfigService } from "./services/LlmConfigService.js";
import { LlmStorageService } from "./services/LlmStorageService.js";
import { setupSettingsHandlers } from "./settingsHandlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

// Debug logging for production builds - using console since logger not yet initialized
console.log("APP_ROOT:", process.env.APP_ROOT);
console.log("MAIN_DIST:", MAIN_DIST);
console.log("RENDERER_DIST:", RENDERER_DIST);

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

if (!process.env.VITE_DEV_SERVER_URL && process.platform === "win32") {
  app.setPath("userData", path.join(app.getPath("appData"), "Fishbowl"));
}

// Disable sandbox in CI environment to avoid permission issues
if (process.env.CI) {
  app.commandLine.appendSwitch("--no-sandbox");
}

let mainWindow: BrowserWindow | null = null;

// Create main process services container
let mainProcessServices: MainProcessServices | null = null;

function createMainWindow(): void {
  // Platform-specific title bar configuration
  const titleBarConfig =
    process.platform === "darwin"
      ? {
          titleBarStyle: "hiddenInset" as const,
          trafficLightPosition: { x: 10, y: 10 },
        }
      : {
          titleBarStyle: "hidden" as const,
          titleBarOverlay: {
            color: "#e7e5e4", // Match theme background
            symbolColor: "#1e293b", // Match theme foreground
            height: 32,
          },
        };

  mainWindow = new BrowserWindow({
    title: "Fishbowl",
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...titleBarConfig,
    webPreferences: {
      preload: path.join(MAIN_DIST, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
    if (process.env.NODE_ENV === "development") {
      mainWindow?.webContents.openDevTools();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

/**
 * Helper function to send settings open command to renderer process.
 * This function is called by menu items and keyboard shortcuts to trigger
 * the settings modal in the renderer process.
 *
 * @throws {Error} Logs errors instead of throwing to prevent main process crashes
 */
function openSettingsModal(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send("open-settings");

      // Debug logging for development
      if (process.env.NODE_ENV === "development") {
        mainProcessServices?.logger?.debug(
          "Settings modal IPC message sent successfully",
        );
      }
    } catch (error) {
      mainProcessServices?.logger?.error(
        "Failed to send open-settings IPC message",
        error as Error,
      );
    }
  } else {
    mainProcessServices?.logger?.warn(
      "Cannot open settings: main window not available or destroyed",
    );
  }
}

/**
 * Initialize main process services container
 * @returns MainProcessServices instance or null if initialization fails
 */
function initializeMainProcessServices(): MainProcessServices | null {
  try {
    const services = new MainProcessServices();
    services.logger.info("Electron main process starting", {
      platform: process.platform,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
    });
    return services;
  } catch (error) {
    // Cannot use structured logger here since service container initialization failed
    console.error("Failed to initialize main process services:", error);
    return null;
  }
}

/**
 * Run database migrations during startup
 * @param services - The main process services container
 * @throws {Error} Exits the application if migrations fail
 */
async function runDatabaseMigrations(
  services: MainProcessServices,
): Promise<void> {
  try {
    await services.runDatabaseMigrations();
    services.logger.info(
      "Database migrations integration completed successfully",
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    services.logger.error(
      "Database migrations failed during startup:",
      error as Error,
    );

    // Show user-friendly error dialog
    dialog.showErrorBox(
      "Database Migration Failed",
      `Unable to update the application database.

${errorMessage}

The application will now exit.`,
    );

    // Exit application
    app.quit();
    throw error; // Prevent further execution
  }
}

/**
 * Initialize all repository managers with the userData path
 * @param userDataPath - The path to the user data directory
 * @param logger - Logger instance for logging initialization status
 */
/**
 * Initialize all repository managers with the userData path
 * @param userDataPath - The path to the user data directory
 * @param logger - Logger instance for logging initialization status
 */
/**
 * Initialize all repository managers with the userData path
 * @param userDataPath - The path to the user data directory
 * @param logger - Logger instance for logging initialization status
 */
async function initializeRepositoryManagers(
  userDataPath: string,
  logger?: StructuredLogger,
): Promise<void> {
  // Initialize roles repository manager with userData path
  const { rolesRepositoryManager } = await import(
    "../data/repositories/rolesRepositoryManager.js"
  );
  rolesRepositoryManager.initialize(userDataPath);
  logger?.info("Roles repository initialized successfully", {
    dataPath: userDataPath,
  });

  // Initialize personalities repository manager with userData path
  const { personalitiesRepositoryManager } = await import(
    "../data/repositories/personalitiesRepositoryManager.js"
  );
  personalitiesRepositoryManager.initialize(userDataPath);
  logger?.info("Personalities repository initialized successfully", {
    dataPath: userDataPath,
  });

  // Initialize LLM models repository manager with userData path
  const { llmModelsRepositoryManager } = await import(
    "../data/repositories/llmModelsRepositoryManager.js"
  );
  llmModelsRepositoryManager.initialize(userDataPath);
  logger?.info("LLM models repository initialized successfully", {
    dataPath: userDataPath,
  });

  // Initialize agents repository manager with userData path
  const { agentsRepositoryManager } = await import(
    "../data/repositories/agentsRepositoryManager.js"
  );
  agentsRepositoryManager.initialize(userDataPath);
  logger?.info("Agents repository initialized successfully", {
    dataPath: userDataPath,
  });
}

/**
 * Initialize LLM services (storage and configuration)
 * @param logger - Logger instance for logging initialization status
 * @returns The initialized LLM configuration service
 */
/**
 * Initialize LLM services (storage and configuration)
 * @param logger - Logger instance for logging initialization status
 * @returns The initialized LLM configuration service
 */
/**
 * Initialize LLM services (storage and configuration)
 * @param logger - Logger instance for logging initialization status
 * @returns The initialized LLM configuration service
 */
async function initializeLlmServices(
  logger?: StructuredLogger,
): Promise<LlmConfigService | null> {
  try {
    // Initialize LLM storage service
    const llmStorageService = new LlmStorageService();
    llmStorageServiceManager.set(llmStorageService);

    logger?.info("LLM storage service initialized successfully", {
      secureStorageAvailable: llmStorageService.isSecureStorageAvailable(),
    });

    // Initialize LLM configuration service
    const llmConfigService = new LlmConfigService(llmStorageService);
    llmConfigServiceManager.set(llmConfigService);

    // Register IPC handlers BEFORE service initialization
    try {
      setupLlmConfigHandlers(ipcMain, llmConfigService);
      logger?.info("LLM configuration IPC handlers registered successfully");
    } catch (error) {
      logger?.error(
        "Failed to register LLM configuration IPC handlers",
        error as Error,
      );
      // Continue startup - app can function without LLM config handlers
    }

    // Register LLM models IPC handlers
    try {
      setupLlmModelsHandlers(ipcMain);
      logger?.info("LLM models IPC handlers registered successfully");
    } catch (error) {
      logger?.error(
        "Failed to register LLM models IPC handlers",
        error as Error,
      );
      // Continue startup - app can function without LLM models handlers
    }

    // Initialize the service AFTER handlers are registered
    try {
      await llmConfigService.initialize();
      const configs = await llmConfigService.list();
      logger?.info("LLM configuration service initialized successfully", {
        configCount: configs.length,
      });
    } catch (error) {
      logger?.error(
        "Failed to initialize LLM configuration service",
        error as Error,
      );
      // Continue startup - app can function without pre-cached configs
    }

    return llmConfigService;
  } catch (error) {
    logger?.error("Failed to initialize LLM services", error as Error);
    return null;
  }
}

/**
 * Setup all IPC handlers for the application
 * @param services - Main process services container
 * @param logger - Logger instance for logging setup status
 */
/**
 * Setup all IPC handlers for the application
 * @param services - Main process services container
 * @param logger - Logger instance for logging setup status
 */
/**
 * Setup all IPC handlers for the application
 * @param services - Main process services container
 * @param logger - Logger instance for logging setup status
 * @throws {Error} If any essential handler setup fails
 */
function setupIpcHandlers(
  services: MainProcessServices | null,
  logger?: StructuredLogger,
): void {
  setupSettingsIpcHandlers(logger);
  setupRolesIpcHandlers(logger);
  setupPersonalitiesIpcHandlers(logger);
  setupAgentsIpcHandlers(logger);

  if (services) {
    setupConversationsIpcHandlers(services);
    setupConversationAgentsIpcHandlers(services);
    setupMessagesIpcHandlers(services);
    setupChatHandlers(services);
  }
}

/**
 * Setup post-initialization components (menu, shortcuts, event handlers)
 */
async function setupPostInitialization(): Promise<void> {
  // Setup application menu after window creation
  const { setupApplicationMenu } = await import("./setupApplicationMenu.js");
  setupApplicationMenu();

  // Register global shortcuts after app is ready
  const { registerGlobalShortcuts } = await import(
    "./registerGlobalShortcuts.js"
  );
  registerGlobalShortcuts();

  // Setup activate event handler
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
}

/**
 * Setup settings IPC handlers with proper error handling
 * @param logger - Logger instance for logging setup status
 * @throws {Error} If handler setup fails
 */
function setupSettingsIpcHandlers(logger?: StructuredLogger): void {
  try {
    setupSettingsHandlers();
    logger?.debug("Settings IPC handlers registered successfully");
  } catch (error) {
    logger?.error("Failed to register settings IPC handlers", error as Error);
    throw new Error(
      "Settings IPC handlers are required for application functionality",
    );
  }
}

/**
 * Setup roles IPC handlers with proper error handling
 * @param logger - Logger instance for logging setup status
 * @throws {Error} If handler setup fails
 */
function setupRolesIpcHandlers(logger?: StructuredLogger): void {
  try {
    setupRolesHandlers();
    logger?.debug("Roles IPC handlers registered successfully");
  } catch (error) {
    logger?.error("Failed to register roles IPC handlers", error as Error);
    throw new Error(
      "Roles IPC handlers are required for application functionality",
    );
  }
}

/**
 * Setup personalities IPC handlers with proper error handling
 * @param logger - Logger instance for logging setup status
 * @throws {Error} If handler setup fails
 */
function setupPersonalitiesIpcHandlers(logger?: StructuredLogger): void {
  try {
    setupPersonalitiesHandlers();
    setupPersonalityDefinitionsHandlers();
    logger?.debug("Personalities IPC handlers registered successfully");
  } catch (error) {
    logger?.error(
      "Failed to register personalities IPC handlers",
      error as Error,
    );
    throw new Error(
      "Personalities IPC handlers are required for application functionality",
    );
  }
}

/**
 * Setup agents IPC handlers with proper error handling
 * @param logger - Logger instance for logging setup status
 * @throws {Error} If handler setup fails
 */
function setupAgentsIpcHandlers(logger?: StructuredLogger): void {
  try {
    setupAgentsHandlers();
    logger?.debug("Agents IPC handlers registered successfully");
  } catch (error) {
    logger?.error("Failed to register agents IPC handlers", error as Error);
    throw new Error(
      "Agents IPC handlers are required for application functionality",
    );
  }
}

/**
 * Setup conversations IPC handlers with proper error handling
 * @param services - Main process services container
 * @throws {Error} If handler setup fails
 */
function setupConversationsIpcHandlers(services: MainProcessServices): void {
  try {
    setupConversationsHandlers(services);
    services.logger.debug("Conversations IPC handlers registered successfully");
  } catch (error) {
    services.logger.error(
      "Failed to register conversations IPC handlers",
      error as Error,
    );
    throw new Error(
      "Conversations IPC handlers are required for application functionality",
    );
  }
}

/**
 * Setup conversation agents IPC handlers with proper error handling
 * @param services - Main process services container
 * @throws {Error} If handler setup fails
 */
function setupConversationAgentsIpcHandlers(
  services: MainProcessServices,
): void {
  try {
    setupConversationAgentHandlers(services);
    services.logger.debug(
      "Conversation agents IPC handlers registered successfully",
    );
  } catch (error) {
    services.logger.error(
      "Failed to register conversation agents IPC handlers",
      error as Error,
    );
    throw new Error(
      "Conversation agents IPC handlers are required for application functionality",
    );
  }
}

/**
 * Setup messages IPC handlers with proper error handling
 * @param services - Main process services container
 * @throws {Error} If handler setup fails
 */
function setupMessagesIpcHandlers(services: MainProcessServices): void {
  try {
    setupMessagesHandlers(services);
    services.logger.debug("Messages IPC handlers registered successfully");
  } catch (error) {
    services.logger.error(
      "Failed to register messages IPC handlers",
      error as Error,
    );
    throw new Error(
      "Messages IPC handlers are required for application functionality",
    );
  }
}

/**
 * Create and log main window
 * @param services - Main process services for logging
 */
function createAndLogMainWindow(services: MainProcessServices | null): void {
  createMainWindow();

  // Log window creation
  services?.logger?.info("Main window created", {
    width: 1200,
    height: 800,
    title: "Fishbowl",
  });
}

/**
 * Initialize settings repository and all related repository managers
 * @param services - Main process services container
 * @throws {Error} If settings repository initialization fails (non-critical)
 */
async function initializeSettingsAndRepositories(
  services: MainProcessServices | null,
): Promise<void> {
  try {
    // Get the userData directory for settings persistence
    const userDataPath = app.getPath("userData");
    const settingsFilePath = path.join(userDataPath, "preferences.json");

    // Create repository using the configured services from the container
    if (services) {
      const repository = services.createSettingsRepository(settingsFilePath);
      settingsRepositoryManager.set(repository);

      services.logger.info("Settings repository initialized successfully", {
        storageType: "FileStorage",
        settingsPath: settingsFilePath,
      });
    }

    // Initialize all repository managers
    await initializeRepositoryManagers(userDataPath, services?.logger);

    // Initialize LLM services
    await initializeLlmServices(services?.logger);
  } catch (error) {
    services?.logger?.error(
      "Failed to initialize settings repository",
      error as Error,
    ) || console.error("Failed to initialize settings repository:", error);
    // Continue app startup even if settings fail to initialize
  }
}

/**
 * Setup critical IPC handlers with proper error handling
 * @param services - Main process services container
 * @param logger - Logger instance for logging setup status
 * @throws {Error} If critical IPC handler setup fails - terminates application
 */
function setupCriticalIpcHandlers(
  services: MainProcessServices | null,
  logger?: StructuredLogger,
): void {
  try {
    setupIpcHandlers(services, logger);
    logger?.info("All IPC handlers registered successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger?.fatal(
      "Critical IPC handler setup failed - application cannot function",
      error as Error,
    ) || console.error("Critical IPC handler setup failed:", error);

    // Show user-friendly error dialog
    dialog.showErrorBox(
      "Application Initialization Failed",
      `Unable to initialize essential application components.

${errorMessage}

The application will now exit.`,
    );

    // Exit application
    app.quit();
    throw error; // Prevent further execution
  }
}

/**
 * Main application initialization coordinator
 * Orchestrates the startup sequence in a clean, maintainable way
 */
/**
 * Main application initialization coordinator
 * Orchestrates the startup sequence in a clean, maintainable way
 */
/**
 * Main application initialization coordinator
 * Orchestrates the startup sequence in a clean, maintainable way
 */
async function initializeApplication(): Promise<void> {
  // Ensure personality definitions are copied to userData on first run
  await ensurePersonalityDefinitions();

  // Ensure system prompt template is copied to userData on startup
  await ensureSystemPromptTemplate();

  // Initialize main process services container
  mainProcessServices = initializeMainProcessServices();

  // Initialize database and run migrations
  if (mainProcessServices) {
    await initializeDatabase(mainProcessServices);
    await runDatabaseMigrations(mainProcessServices);
  }

  // Create main window and log creation
  createAndLogMainWindow(mainProcessServices);

  // Initialize settings repository and all repository managers
  await initializeSettingsAndRepositories(mainProcessServices);

  // Setup critical IPC handlers - will exit app if this fails
  setupCriticalIpcHandlers(mainProcessServices, mainProcessServices?.logger);

  // Setup post-initialization components
  await setupPostInitialization();
}

/**
 * Initialize the database connection during app startup.
 * Ensures database is connected and ready before the UI opens.
 *
 * @param services - The main process services container
 * @throws {Error} Exits the application if database initialization fails
 */
async function initializeDatabase(
  services: MainProcessServices,
): Promise<void> {
  services.logger.info("Verifying database connection...");

  try {
    // Database is connected in constructor, verify it's working
    const isConnected = services.databaseBridge.isConnected?.();
    if (!isConnected) {
      throw new Error("Database connection verification failed");
    }

    // Test the connection with a simple query
    await services.databaseBridge.query("SELECT 1");

    services.logger.info("Database verified successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const dbError = error instanceof Error ? error : new Error(errorMessage);

    services.logger.error("Failed to verify database:", dbError);

    // Show user-friendly error dialog
    dialog.showErrorBox(
      "Database Initialization Failed",
      `Unable to initialize the application database.\n\n${errorMessage}\n\nThe application will now exit.`,
    );

    // Exit application
    app.quit();
    throw error; // Re-throw to prevent further execution
  }
}

app.whenReady().then(initializeApplication);

app.on("window-all-closed", () => {
  mainWindow = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  // Clean up global shortcuts
  globalShortcut.unregisterAll();
  mainWindow = null;

  // Close database connection if services are available
  if (mainProcessServices?.databaseBridge) {
    event.preventDefault(); // Prevent immediate quit to allow cleanup

    try {
      mainProcessServices.logger.info("Closing database connection...");

      // Create timeout promise for 2-second limit
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error("Database close operation timed out after 2 seconds"),
          );
        }, 2000);
      });

      // Race between database close and timeout
      await Promise.race([
        mainProcessServices.databaseBridge.close(),
        timeoutPromise,
      ]);

      mainProcessServices.logger.info(
        "Database connection closed successfully",
      );
    } catch (error) {
      const dbError = error instanceof Error ? error : new Error(String(error));

      if (dbError.message.includes("timed out")) {
        mainProcessServices.logger.warn(
          "Database close timed out - forcing application shutdown",
          { error: dbError.message, stack: dbError.stack },
        );
      } else {
        mainProcessServices.logger.error(
          "Error closing database connection:",
          dbError,
        );
      }
      // Don't prevent shutdown on database close errors or timeout
    } finally {
      // Clear services reference and allow quit
      mainProcessServices = null;
      app.quit();
    }
  }
});

// Export for use by menu and keyboard shortcut handlers
export { openSettingsModal };
