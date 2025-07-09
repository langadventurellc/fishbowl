import type { ConfigValue } from '../../../shared/types';

export const themeGetHandler = (configCache: ConfigValue) => (): 'light' | 'dark' | 'system' => {
  return configCache.theme;
};
