import { app, BrowserWindow } from 'electron'
import path from 'path'
import { isDev } from '@shared/utils'
import { createMainWindow } from './window'

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null

const createWindow = async (): Promise<void> => {
  // Create the browser window
  mainWindow = await createMainWindow()
  
  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  
  // Open the DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
  
  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null
  })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow)

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process code