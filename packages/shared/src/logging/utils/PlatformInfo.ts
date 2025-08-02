import type { PlatformType } from "./platformTypes";

export interface PlatformInfo {
  type: PlatformType;
  isElectron: boolean;
  isElectronMain: boolean;
  isElectronRenderer: boolean;
  isReactNative: boolean;
  isWeb: boolean;
}
