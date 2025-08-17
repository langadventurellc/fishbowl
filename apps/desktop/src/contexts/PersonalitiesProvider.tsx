import React, { createContext, useContext, useEffect, useState } from "react";
import type { PersonalitiesPersistenceAdapter } from "@fishbowl-ai/ui-shared";
import { usePersonalitiesStore } from "@fishbowl-ai/ui-shared";
import { desktopPersonalitiesAdapter } from "../adapters/desktopPersonalitiesAdapter";
import { createLoggerSync } from "@fishbowl-ai/shared";

const logger = createLoggerSync({
  config: { name: "PersonalitiesProvider", level: "info" },
});

interface PersonalitiesProviderProps {
  children: React.ReactNode;
}

interface PersonalitiesProviderState {
  isInitializing: boolean;
  initError: Error | null;
}

export const PersonalitiesPersistenceAdapterContext =
  createContext<PersonalitiesPersistenceAdapter | null>(null);

export const usePersonalitiesAdapter = (): PersonalitiesPersistenceAdapter => {
  const adapter = useContext(PersonalitiesPersistenceAdapterContext);
  if (!adapter) {
    throw new Error(
      "usePersonalitiesAdapter must be used within a PersonalitiesProvider",
    );
  }
  return adapter;
};

export const PersonalitiesProvider: React.FC<PersonalitiesProviderProps> = ({
  children,
}) => {
  const [providerState, setProviderState] =
    useState<PersonalitiesProviderState>({
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

      const store = usePersonalitiesStore.getState();

      // Check if already initialized (e.g., from a previous mount)
      if (store.isInitialized) {
        logger.info("Personalities store already initialized, skipping");
        if (mounted) {
          setProviderState({
            isInitializing: false,
            initError: null,
          });
        }
        return;
      }

      logger.info("Initializing personalities store with desktop adapter");

      try {
        await store.initialize(desktopPersonalitiesAdapter);

        if (mounted) {
          logger.info("Personalities store initialized successfully", {
            personalitiesCount: store.personalities.length,
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

        logger.error("Failed to initialize personalities store", errorObj);

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
            aria-label="Loading personalities..."
          />
          <p className="text-sm text-muted-foreground">
            Loading personalities...
          </p>
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
            Failed to Initialize Personalities
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
    <PersonalitiesPersistenceAdapterContext.Provider
      value={desktopPersonalitiesAdapter}
    >
      {children}
    </PersonalitiesPersistenceAdapterContext.Provider>
  );
};
