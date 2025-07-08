'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const electron_1 = require('electron');
const path_1 = __importDefault(require('path'));
const utils_1 = require('@shared/utils');
const window_1 = require('./window');
const menu_1 = require('./menu');
const ipc_1 = require('./ipc');
// Keep a global reference of the window object
let mainWindow = null;
const createWindow = () => {
  // Create the browser window
  mainWindow = (0, window_1.createMainWindow)();
  // Set up window events
  (0, ipc_1.setupWindowEvents)(mainWindow);
  // Load the app
  if (utils_1.isDev) {
    void mainWindow.loadURL('http://localhost:5173');
  } else {
    void mainWindow.loadFile(path_1.default.join(__dirname, '../renderer/index.html'));
  }
  // Open the DevTools in development
  if (utils_1.isDev) {
    mainWindow.webContents.openDevTools();
  }
  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
};
// This method will be called when Electron has finished initialization
void electron_1.app.whenReady().then(() => {
  // Set up IPC handlers
  (0, ipc_1.setupIpcHandlers)();
  // Create application menu
  (0, menu_1.createApplicationMenu)();
  // Create the main window
  createWindow();
});
// Quit when all windows are closed
electron_1.app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    electron_1.app.quit();
  }
});
electron_1.app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    void createWindow();
  }
});
// In this file you can include the rest of your app's specific main process code
