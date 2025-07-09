import { BrowserWindow } from 'electron';

export const windowCloseHandler = (): void => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.close();
  }
};
