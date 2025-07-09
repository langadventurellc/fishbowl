import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from '../shared/utils';
import { createMainWindow } from './window';
import { createApplicationMenu } from './menu';
import { setupIpcHandlers, setupWindowEvents } from './ipc';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window
  mainWindow = createMainWindow();

  // Set up window events
  setupWindowEvents(mainWindow);

  // Load the app
  if (isDev) {
    void mainWindow.loadURL('http://localhost:5173');
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Open the DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
};

// This method will be called when Electron has finished initialization
void app.whenReady().then(() => {
  // Set up IPC handlers
  setupIpcHandlers();

  // Create application menu
  createApplicationMenu();

  // Create the main window
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    void createWindow();
  }
});

// In this file you can include the rest of your app's specific main process code
