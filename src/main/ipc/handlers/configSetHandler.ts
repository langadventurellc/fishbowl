import type { IpcMainInvokeEvent } from 'electron';
import type { ConfigKey, ConfigValue } from '../../../shared/types';

export const configSetHandler =
  (configCache: ConfigValue, saveConfig: (config: ConfigValue) => void) =>
  (_event: IpcMainInvokeEvent, key: ConfigKey, value: ConfigValue[ConfigKey]): void => {
    const newConfig = { ...configCache, [key]: value };
    saveConfig(newConfig);
  };
