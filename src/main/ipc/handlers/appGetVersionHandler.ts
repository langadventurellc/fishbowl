import { app } from 'electron';

export const appGetVersionHandler = (): string => {
  return app.getVersion();
};
