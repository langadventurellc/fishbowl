import { BrowserWindow } from 'electron';

/**
 * Set up window event listeners to emit to renderer
 */
export const setupWindowEvents = (window: BrowserWindow): void => {
  window.on('focus', () => {
    window.webContents.send('window:focus');
  });

  window.on('blur', () => {
    window.webContents.send('window:blur');
  });

  window.on('resize', () => {
    const [width, height] = window.getSize();
    window.webContents.send('window:resize', { width, height });
  });
};
