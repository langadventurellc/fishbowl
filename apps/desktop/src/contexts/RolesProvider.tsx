import React, { createContext, useContext, useEffect, useState } from "react";
import type { RolesPersistenceAdapter } from "@fishbowl-ai/ui-shared";
import { useRolesStore } from "@fishbowl-ai/ui-shared";
import { desktopRolesAdapter } from "../adapters/desktopRolesAdapter";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "RolesProvider", level: "info" },
});

interface RolesProviderProps {
  children: React.ReactNode;
}

interface RolesProviderState {
  isInitializing: boolean;
  initError: Error | null;
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
  const [providerState, setProviderState] = useState<RolesProviderState>({
    isInitializing: true,
    initError: null,
  });

  useEffect(() => {
    let mounted = true;
    let initAttempted = false;

    const initializeStore = async () => {
      // Prevent multiple initialization attempts
      if (initAttempted) {
        return;
      }
      initAttempted = true;

      const store = useRolesStore.getState();

      // Check if already initialized (e.g., from a previous mount)
      if (store.isInitialized) {
        logger.info("Roles store already initialized, skipping");
        if (mounted) {
          setProviderState({
            isInitializing: false,
            initError: null,
          });
        }
        return;
      }

      logger.info("Initializing roles store with desktop adapter");

      try {
        await store.initialize(desktopRolesAdapter);

        if (mounted) {
          logger.info("Roles store initialized successfully", {
            rolesCount: store.roles.length,
            hasError: !!store.error?.message,
          });

          setProviderState({
            isInitializing: false,
            initError: null,
          });
        }
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        logger.error("Failed to initialize roles store", errorObj);

        if (mounted) {
          setProviderState({
            isInitializing: false,
            initError: errorObj,
          });
        }
      }
    };

    initializeStore();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array ensures single initialization

  // Show loading state during initialization
  if (providerState.isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div
            className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"
            aria-label="Loading roles..."
          />
          <p className="text-sm text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed critically
  if (providerState.initError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Failed to Initialize Roles
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {providerState.initError.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Render children with adapter context when ready
  return (
    <RolesPersistenceAdapterContext.Provider value={desktopRolesAdapter}>
      {children}
    </RolesPersistenceAdapterContext.Provider>
  );
};
