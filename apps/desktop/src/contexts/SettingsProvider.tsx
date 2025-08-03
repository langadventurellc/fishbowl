import React, { createContext, useContext } from "react";
import type { SettingsPersistenceAdapter } from "@fishbowl-ai/ui-shared";
import { desktopSettingsAdapter } from "../adapters/desktopSettingsAdapter";

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsPersistenceAdapterContext =
  createContext<SettingsPersistenceAdapter | null>(null);

export const useSettingsPersistenceAdapter = (): SettingsPersistenceAdapter => {
  const adapter = useContext(SettingsPersistenceAdapterContext);
  if (!adapter) {
    throw new Error(
      "useSettingsPersistenceAdapter must be used within a SettingsProvider",
    );
  }
  return adapter;
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  return (
    <SettingsPersistenceAdapterContext.Provider value={desktopSettingsAdapter}>
      {children}
    </SettingsPersistenceAdapterContext.Provider>
  );
};
