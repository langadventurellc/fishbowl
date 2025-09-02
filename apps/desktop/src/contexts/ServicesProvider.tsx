import React, { type ReactNode, useEffect, useMemo, useRef } from "react";
import { useConversationStore } from "@fishbowl-ai/ui-shared";
import { RendererProcessServices } from "../renderer/services";
import { ServicesContext } from "./ServicesContext";

interface ServicesProviderProps {
  children: ReactNode;
  services?: RendererProcessServices;
}

/**
 * Provider component that makes renderer process services available to all child components.
 * Creates a single instance of RendererProcessServices and provides it via React context.
 *
 * @example
 * ```tsx
 * // In main.tsx or App.tsx
 * const services = new RendererProcessServices();
 *
 * <ServicesProvider services={services}>
 *   <App />
 * </ServicesProvider>
 * ```
 */
export function ServicesProvider({
  children,
  services,
}: ServicesProviderProps) {
  // Create services instance if not provided (mainly for testing)
  const servicesInstance = useMemo(
    () => services || new RendererProcessServices(),
    [services],
  );

  // Guard to prevent double initialization in React.StrictMode
  const initializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initializeAndLoadConversations = async () => {
      try {
        if (mounted && !initializedRef.current) {
          initializedRef.current = true;

          // Initialize the store with the conversation service
          servicesInstance.logger.debug(
            "boot: initializing conversation store",
          );
          useConversationStore
            .getState()
            .initialize(servicesInstance.conversationService);

          // Load conversations
          servicesInstance.logger.debug("boot: loading conversations");
          await useConversationStore.getState().loadConversations();

          servicesInstance.logger.debug("boot: conversations loaded");
        }
      } catch (error) {
        // Error handling - prevent app crash but log for debugging
        servicesInstance.logger.error(
          "Failed to initialize conversation store",
          error as Error,
        );
      }
    };

    initializeAndLoadConversations();

    return () => {
      mounted = false;
    };
  }, [servicesInstance]);

  return (
    <ServicesContext.Provider value={servicesInstance}>
      {children}
    </ServicesContext.Provider>
  );
}
