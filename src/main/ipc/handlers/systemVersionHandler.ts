import { version } from 'os';

export const systemVersionHandler = (): string => {
  return version();
};
