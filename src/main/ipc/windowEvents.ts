import { BrowserWindow } from 'electron';

/**
 * Set up window event listeners to emit to renderer
 */
export const setupWindowEvents = (window: BrowserWindow): void => {
  // Window focus events
  window.on('focus', () => {
    window.webContents.send('window:focus');
  });

  window.on('blur', () => {
    window.webContents.send('window:blur');
  });

  // Window resize events
  window.on('resize', () => {
    const [width, height] = window.getSize();
    window.webContents.send('window:resize', { width, height });
  });

  // Window state events
  window.on('maximize', () => {
    window.webContents.send('window:maximize');
  });

  window.on('unmaximize', () => {
    window.webContents.send('window:unmaximize');
  });

  window.on('minimize', () => {
    window.webContents.send('window:minimize');
  });

  window.on('restore', () => {
    window.webContents.send('window:restore');
  });

  window.on('enter-full-screen', () => {
    window.webContents.send('window:enter-full-screen');
  });

  window.on('leave-full-screen', () => {
    window.webContents.send('window:leave-full-screen');
  });

  // Window move events
  window.on('move', () => {
    const [x, y] = window.getPosition();
    window.webContents.send('window:move', { x, y });
  });

  // Window show/hide events
  window.on('show', () => {
    window.webContents.send('window:show');
  });

  window.on('hide', () => {
    window.webContents.send('window:hide');
  });

  // Window ready events
  window.on('ready-to-show', () => {
    window.webContents.send('window:ready-to-show');
  });

  // Handle window state persistence
  const saveWindowState = () => {
    const bounds = window.getBounds();
    const windowState = {
      ...bounds,
      isMaximized: window.isMaximized(),
      isMinimized: window.isMinimized(),
      isFullscreen: window.isFullScreen(),
    };

    // Send to renderer for potential state management
    window.webContents.send('window:state-changed', windowState);
  };

  // Save window state on significant changes
  window.on('resize', saveWindowState);
  window.on('move', saveWindowState);
  window.on('maximize', saveWindowState);
  window.on('unmaximize', saveWindowState);
  window.on('minimize', saveWindowState);
  window.on('restore', saveWindowState);
  window.on('enter-full-screen', saveWindowState);
  window.on('leave-full-screen', saveWindowState);
};
