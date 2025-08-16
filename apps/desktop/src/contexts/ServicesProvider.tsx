import React, { type ReactNode } from "react";
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
  const servicesInstance = services || new RendererProcessServices();

  return (
    <ServicesContext.Provider value={servicesInstance}>
      {children}
    </ServicesContext.Provider>
  );
}
