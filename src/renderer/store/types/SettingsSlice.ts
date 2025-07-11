/**
 * Settings slice definition
 */

export interface SettingsSlice {
  preferences: {
    autoSave: boolean;
    defaultProvider: string;
    maxConversationHistory: number;
    enableNotifications: boolean;
  };
  configuration: {
    debugMode: boolean;
    performanceMode: boolean;
    experimentalFeatures: boolean;
  };
  setPreferences: (preferences: Partial<SettingsSlice['preferences']>) => void;
  setConfiguration: (config: Partial<SettingsSlice['configuration']>) => void;
  resetSettings: () => void;
}
