/**
 * Store configuration options
 */

import type { PersistConfig } from './PersistConfig';
import type { DevToolsConfig } from './DevToolsConfig';

export interface StoreConfig {
  persist: PersistConfig;
  devtools: DevToolsConfig;
}
