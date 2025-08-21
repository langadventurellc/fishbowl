import React, { createContext, useContext, useEffect, useState } from "react";
import type { AgentsPersistenceAdapter } from "@fishbowl-ai/ui-shared";
import { useAgentsStore } from "@fishbowl-ai/ui-shared";
import { desktopAgentsAdapter } from "../adapters/desktopAgentsAdapter";
import { useServices } from "./useServices";

interface AgentsProviderProps {
  children: React.ReactNode;
}

interface AgentsProviderState {
  isInitializing: boolean;
  initError: Error | null;
}

export const AgentsPersistenceAdapterContext =
  createContext<AgentsPersistenceAdapter | null>(null);

export const useAgentsAdapter = (): AgentsPersistenceAdapter => {
  const adapter = useContext(AgentsPersistenceAdapterContext);
  if (!adapter) {
    throw new Error("useAgentsAdapter must be used within an AgentsProvider");
  }
  return adapter;
};

export const AgentsProvider: React.FC<AgentsProviderProps> = ({ children }) => {
  const { logger } = useServices();
  const [providerState, setProviderState] = useState<AgentsProviderState>({
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

      const store = useAgentsStore.getState();

      // Check if already initialized (e.g., from a previous mount)
      if (store.isInitialized) {
        logger.info("Agents store already initialized, skipping");
        if (mounted) {
          setProviderState({
            isInitializing: false,
            initError: null,
          });
        }
        return;
      }

      logger.info("Initializing agents store with desktop adapter");

      try {
        await store.initialize(desktopAgentsAdapter, logger);

        if (mounted) {
          logger.info("Agents store initialized successfully", {
            agentsCount: store.agents.length,
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

        logger.error("Failed to initialize agents store", errorObj);

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
      useAgentsStore.getState().destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures single initialization

  // Show loading state during initialization
  if (providerState.isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div
            className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"
            aria-label="Loading agents..."
          />
          <p className="text-sm text-muted-foreground">Loading agents...</p>
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
            Failed to Initialize Agents
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
    <AgentsPersistenceAdapterContext.Provider value={desktopAgentsAdapter}>
      {children}
    </AgentsPersistenceAdapterContext.Provider>
  );
};
