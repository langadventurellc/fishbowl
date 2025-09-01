import React, { type ReactNode, useEffect, useMemo } from "react";
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

  useEffect(() => {
    let mounted = true;

    const initializeConversationStore = async () => {
      try {
        if (mounted) {
          useConversationStore
            .getState()
            .initialize(servicesInstance.conversationService);
        }
      } catch (error) {
        // Error handling - prevent app crash but log for debugging
        console.error("Failed to initialize conversation store:", error);
      }
    };

    initializeConversationStore();

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
