import { ApiConfig } from "./ApiConfig";
import { FeatureFlags } from "./FeatureFlags";
import { WindowConfig } from "./WindowConfig";

export interface AppConfig {
  window: WindowConfig;
  features: FeatureFlags;
  api: ApiConfig;
}
