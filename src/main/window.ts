import { BrowserWindow } from 'electron'
import path from 'path'
import { isDev } from '@shared/utils'

export const createMainWindow = async (): Promise<BrowserWindow> => {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    },
    show: false, // Don't show until ready-to-show
    titleBarStyle: 'default'
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // Focus on the window in development
    if (isDev) {
      mainWindow.focus()
    }
  })

  return mainWindow
}