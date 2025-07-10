export interface FallbackService {
  name: string;
  isAvailable: () => boolean;
  fallback: Record<string, unknown>; // The fallback data store or service
  operations: Record<string, (...args: unknown[]) => Promise<unknown>>;
}
