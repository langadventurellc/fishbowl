declare const electronAPI: {
  readonly minimize: () => Promise<void>;
  readonly maximize: () => Promise<void>;
  readonly close: () => Promise<void>;
  readonly getVersion: () => Promise<string>;
  readonly getSystemInfo: () => Promise<import('../shared/types').SystemInfo>;
  readonly getConfig: <K extends import('../shared/types').ConfigKey>(
    key: K,
  ) => Promise<import('../shared/types').ConfigValue[K]>;
  readonly setConfig: <K extends import('../shared/types').ConfigKey>(
    key: K,
    value: import('../shared/types').ConfigValue[K],
  ) => Promise<void>;
  readonly onWindowFocus: (callback: () => void) => () => void;
  readonly onWindowBlur: (callback: () => void) => () => void;
  readonly onWindowResize: (
    callback: (data: { width: number; height: number }) => void,
  ) => () => void;
  readonly onWindowMaximize: (callback: () => void) => () => void;
  readonly onWindowUnmaximize: (callback: () => void) => () => void;
  readonly onWindowMinimize: (callback: () => void) => () => void;
  readonly onWindowRestore: (callback: () => void) => () => void;
  readonly getTheme: () => Promise<'light' | 'dark' | 'system'>;
  readonly setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  readonly onThemeChange: (callback: (theme: 'light' | 'dark' | 'system') => void) => () => void;
  readonly isDev: () => Promise<boolean>;
  readonly openDevTools: () => Promise<void>;
  readonly closeDevTools: () => Promise<void>;
  readonly platform: () => Promise<NodeJS.Platform>;
  readonly arch: () => Promise<string>;
  readonly version: () => Promise<string>;
};
export type ElectronAPI = typeof electronAPI;
export {};
