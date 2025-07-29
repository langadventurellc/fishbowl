// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { app, BrowserWindow, shell, ipcMain, globalShortcut } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

// Debug logging for production builds
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
        console.log("Settings modal IPC message sent successfully");
      }
    } catch (error) {
      console.error("Failed to send open-settings IPC message:", error);
    }
  } else {
    console.warn(
      "Cannot open settings: main window not available or destroyed",
    );
  }
}

app.whenReady().then(async () => {
  createMainWindow();

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
