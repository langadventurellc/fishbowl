import type { IpcMainInvokeEvent } from 'electron';
import type { ConfigKey, ConfigValue } from '../../../shared/types';

export const configGetHandler =
  (configCache: ConfigValue) =>
  (_event: IpcMainInvokeEvent, key: ConfigKey): ConfigValue[ConfigKey] => {
    return configCache[key];
  };
