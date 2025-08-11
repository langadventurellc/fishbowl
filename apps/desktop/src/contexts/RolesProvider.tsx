import React, { createContext, useContext } from "react";
import type { RolesPersistenceAdapter } from "@fishbowl-ai/ui-shared";
import { desktopRolesAdapter } from "../adapters/desktopRolesAdapter";

interface RolesProviderProps {
  children: React.ReactNode;
}

export const RolesPersistenceAdapterContext =
  createContext<RolesPersistenceAdapter | null>(null);

export const useRolesAdapter = (): RolesPersistenceAdapter => {
  const adapter = useContext(RolesPersistenceAdapterContext);
  if (!adapter) {
    throw new Error("useRolesAdapter must be used within a RolesProvider");
  }
  return adapter;
};

export const RolesProvider: React.FC<RolesProviderProps> = ({ children }) => {
  return (
    <RolesPersistenceAdapterContext.Provider value={desktopRolesAdapter}>
      {children}
    </RolesPersistenceAdapterContext.Provider>
  );
};
