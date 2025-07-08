import { Menu, MenuItemConstructorOptions, app, dialog, BrowserWindow } from 'electron';

export const createApplicationMenu = (): void => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat Room',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Future implementation: Create new chat room
            const window = BrowserWindow.getFocusedWindow();
            if (window) {
              window.webContents.send('menu:new-chat-room');
            }
          },
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Fishbowl',
          click: () => {
            const window = BrowserWindow.getFocusedWindow();
            if (window) {
              void dialog.showMessageBox(window, {
                type: 'info',
                title: 'About Fishbowl',
                message: 'Fishbowl',
                detail: `Version: ${app.getVersion()}\n\nAn Electron-based desktop application for multi-agent AI conversations, enabling natural collaboration between multiple AI personalities in a shared conversation space.`,
                buttons: ['OK'],
              });
            }
          },
        },
      ],
    },
  ];

  // macOS specific adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: 'Fishbowl',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
