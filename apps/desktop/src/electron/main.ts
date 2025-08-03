// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { app, BrowserWindow, shell, ipcMain, globalShortcut } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { setupSettingsHandlers } from "./settingsHandlers.js";
import {
  SettingsRepository,
  FileStorageService,
  NodeFileSystemBridge,
  createLogger,
} from "@fishbowl-ai/shared";
import "./getSettingsRepository.js"; // Initialize the global setter

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
    // Create file storage service with filesystem bridge
    const fileSystemBridge = new NodeFileSystemBridge();
    const fileStorage = new FileStorageService(fileSystemBridge);

    // Create repository
    const repository = new SettingsRepository(fileStorage);

    // Set repository using global setter from getSettingsRepository.ts
    interface GlobalWithSettings {
      __setSettingsRepository?: (repository: SettingsRepository) => void;
    }
    const globalWithSettings = globalThis as GlobalWithSettings;
    if (globalWithSettings.__setSettingsRepository) {
      globalWithSettings.__setSettingsRepository(repository);
    }

    console.log("Settings repository initialized successfully");
    mainLogger?.debug("Settings repository initialized", {
      storageType: "FileStorage",
    });
  } catch (error) {
    console.error("Failed to initialize settings repository:", error);
    mainLogger?.error(
      "Failed to initialize settings repository",
      error as Error,
    );
    // Continue app startup even if settings fail to initialize
  }

  // Setup IPC handlers
  setupSettingsHandlers();

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
