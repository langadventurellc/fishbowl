import {
  createLogger,
  FileStorageService,
  NodeFileSystemBridge,
  SettingsRepository,
} from "@fishbowl-ai/shared";
import { app, BrowserWindow, globalShortcut, ipcMain, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { llmConfigServiceManager } from "./getLlmConfigService.js";
import { llmStorageServiceManager } from "./getLlmStorageService.js";
import { settingsRepositoryManager } from "./getSettingsRepository.js";
import { setupLlmConfigHandlers } from "./handlers/llmConfigHandlers.js";
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

// Create main process logger (will be initialized in app.whenReady)
let mainLogger: Awaited<ReturnType<typeof createLogger>> | null = null;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    title: "Fishbowl",
    icon: path.join(__dirname, "..", "assets", "icon.png"),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
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
        mainLogger?.debug("Settings modal IPC message sent successfully");
      }
    } catch (error) {
      mainLogger?.error(
        "Failed to send open-settings IPC message",
        error as Error,
      );
    }
  } else {
    mainLogger?.warn(
      "Cannot open settings: main window not available or destroyed",
    );
  }
}

// eslint-disable-next-line statement-count/function-statement-count-warn
app.whenReady().then(async () => {
  // Initialize logger first
  try {
    mainLogger = await createLogger({
      config: { name: "desktop-main", level: "info" },
      context: {
        platform: "desktop",
        metadata: { process: "main", pid: process.pid },
      },
    });
    mainLogger.info("Electron main process starting", {
      platform: process.platform,
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
    });
  } catch (error) {
    // Cannot use structured logger here since logger initialization failed
    console.error("Failed to initialize logger:", error);
  }

  createMainWindow();

  // Log window creation
  mainLogger?.info("Main window created", {
    width: 1200,
    height: 800,
    title: "Fishbowl",
  });

  // Initialize settings repository
  try {
    // Get the userData directory for settings persistence
    const userDataPath = app.getPath("userData");
    const settingsFilePath = path.join(userDataPath, "preferences.json");

    // Create file storage service with filesystem bridge
    const fileSystemBridge = new NodeFileSystemBridge();
    const fileStorage = new FileStorageService(fileSystemBridge);

    // Create repository with userData directory path
    const repository = new SettingsRepository(fileStorage, settingsFilePath);

    // Set repository using settings manager
    settingsRepositoryManager.set(repository);

    mainLogger?.info("Settings repository initialized successfully", {
      storageType: "FileStorage",
      settingsPath: settingsFilePath,
    });

    // Initialize LLM storage service
    const llmStorageService = new LlmStorageService();
    llmStorageServiceManager.set(llmStorageService);

    mainLogger?.info("LLM storage service initialized successfully", {
      secureStorageAvailable: llmStorageService.isSecureStorageAvailable(),
    });

    // Initialize LLM configuration service
    const llmConfigService = new LlmConfigService(llmStorageService);
    llmConfigServiceManager.set(llmConfigService);

    // Register IPC handlers BEFORE service initialization
    try {
      setupLlmConfigHandlers(ipcMain, llmConfigService);
      mainLogger?.info(
        "LLM configuration IPC handlers registered successfully",
      );
    } catch (error) {
      mainLogger?.error(
        "Failed to register LLM configuration IPC handlers",
        error as Error,
      );
      // Continue startup - app can function without LLM config handlers
    }

    // Initialize the service AFTER handlers are registered
    try {
      await llmConfigService.initialize();
      const configs = await llmConfigService.list();
      mainLogger?.info("LLM configuration service initialized successfully", {
        configCount: configs.length,
      });
    } catch (error) {
      mainLogger?.error(
        "Failed to initialize LLM configuration service",
        error as Error,
      );
      // Continue startup - app can function without pre-cached configs
    }
  } catch (error) {
    mainLogger?.error(
      "Failed to initialize settings repository",
      error as Error,
    ) || console.error("Failed to initialize settings repository:", error);
    // Continue app startup even if settings fail to initialize
  }

  // Setup IPC handlers
  try {
    setupSettingsHandlers();
    mainLogger?.debug("Settings IPC handlers registered successfully");
  } catch (error) {
    mainLogger?.error(
      "Failed to register settings IPC handlers",
      error as Error,
    );
    // Continue startup - app can function without settings handlers
  }

  // LLM config handlers are now registered earlier in the startup process

  // Setup application menu after window creation
  const { setupApplicationMenu } = await import("./setupApplicationMenu.js");
  setupApplicationMenu();

  // Register global shortcuts after app is ready
  const { registerGlobalShortcuts } = await import(
    "./registerGlobalShortcuts.js"
  );
  registerGlobalShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  mainWindow = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Clean up global shortcuts
  globalShortcut.unregisterAll();
  mainWindow = null;
});

// Export for use by menu and keyboard shortcut handlers
export { openSettingsModal };
