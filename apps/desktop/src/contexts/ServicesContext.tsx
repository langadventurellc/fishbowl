import { createContext } from "react";
import { RendererProcessServices } from "../renderer/services";

/**
 * React context for accessing configured renderer process services.
 * Provides dependency-injected services throughout the React component tree.
 */
export const ServicesContext = createContext<RendererProcessServices | null>(
  null,
);
