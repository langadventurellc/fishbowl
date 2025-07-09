import { app } from 'electron';

export const devIsDevHandler = (): boolean => {
  return !app.isPackaged;
};
