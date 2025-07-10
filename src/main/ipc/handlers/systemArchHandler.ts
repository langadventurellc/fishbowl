import { arch } from 'os';

export const systemArchHandler = (): string => {
  return arch();
};
