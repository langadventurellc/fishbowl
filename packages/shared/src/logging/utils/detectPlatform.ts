import type { PlatformInfo } from "./PlatformInfo";

// Type guards for global objects
declare global {
  interface Window {
    process?: {
      type?: string;
    };
  }

  namespace NodeJS {
    interface Process {
      type?: "browser" | "renderer" | "worker";
    }
  }

  var __DEV__: boolean | undefined;
}

/**
 * Detects the current platform (Electron, React Native, or Web)
 * @returns {PlatformInfo} Information about the detected platform
 */
export function detectPlatform(): PlatformInfo {
  // Check for Electron main process
  if (typeof process !== "undefined" && process.type === "browser") {
    return {
      type: "electron-main",
      isElectron: true,
      isElectronMain: true,
      isElectronRenderer: false,
      isReactNative: false,
      isWeb: false,
    };
  }

  // Check for Electron renderer process
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.window !== "undefined" &&
    globalThis.window.process?.type === "renderer"
  ) {
    return {
      type: "electron-renderer",
      isElectron: true,
      isElectronMain: false,
      isElectronRenderer: true,
      isReactNative: false,
      isWeb: false,
    };
  }

  // Check for React Native
  if (
    (typeof globalThis !== "undefined" &&
      typeof globalThis.navigator !== "undefined" &&
      globalThis.navigator.product === "ReactNative") ||
    (typeof globalThis !== "undefined" &&
      typeof globalThis.global !== "undefined" &&
      globalThis.global.__DEV__ !== undefined)
  ) {
    return {
      type: "react-native",
      isElectron: false,
      isElectronMain: false,
      isElectronRenderer: false,
      isReactNative: true,
      isWeb: false,
    };
  }

  // Default to web
  return {
    type: "web",
    isElectron: false,
    isElectronMain: false,
    isElectronRenderer: false,
    isReactNative: false,
    isWeb: true,
  };
}
