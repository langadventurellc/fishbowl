import { platform } from 'os';

export const systemPlatformHandler = (): string => {
  return platform();
};
