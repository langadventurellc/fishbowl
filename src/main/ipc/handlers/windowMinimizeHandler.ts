import { BrowserWindow } from 'electron';

export const windowMinimizeHandler = (): void => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.minimize();
  }
};
