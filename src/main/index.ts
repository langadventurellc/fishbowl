/* eslint-disable no-console */
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from '../shared/utils';
import {
  checkpointManagerInstance,
  closeDatabase,
  initializeDatabase,
  runMigrations,
  validateDatabaseSchema,
} from './database';
import { errorRecoveryManager } from './error-recovery';
import { setupIpcHandlers, setupWindowEvents } from './ipc';
import { createApplicationMenu } from './menu';
import { createMainWindow } from './window';

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
  try {
    // Initialize database
    console.log('Initializing database...');
    initializeDatabase();

    // Run migrations
    console.log('Running database migrations...');
    runMigrations();

    // Validate database schema
    console.log('Validating database schema...');
    validateDatabaseSchema();

    // Start checkpoint manager
    console.log('Starting checkpoint manager...');
    checkpointManagerInstance.start();

    console.log('Database initialization completed');

    // Start health monitoring after database is ready
    console.log('Starting health monitoring...');
    errorRecoveryManager.startHealthMonitoring();
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Exit if database initialization fails
    app.quit();
    return;
  }

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

// App is quitting
app.on('before-quit', () => {
  try {
    console.log('Stopping checkpoint manager...');
    checkpointManagerInstance.stop();

    console.log('Closing database connection...');
    closeDatabase();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    void createWindow();
  }
});

// In this file you can include the rest of your app's specific main process code
