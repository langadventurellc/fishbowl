import { useContext } from "react";
import { ServicesContext } from "./ServicesContext";
import { RendererProcessServices } from "../renderer/services";

/**
 * Hook to access configured renderer process services.
 * Must be used within a ServicesProvider.
 *
 * @returns Configured renderer process services
 * @throws Error if used outside of ServicesProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const services = useServices();
 *
 *   useEffect(() => {
 *     services.logger.info('Component mounted');
 *   }, [services.logger]);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useServices(): RendererProcessServices {
  const services = useContext(ServicesContext);

  if (!services) {
    throw new Error("useServices must be used within a ServicesProvider");
  }

  return services;
}
