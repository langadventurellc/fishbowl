export { ErrorRecoveryManager } from './ErrorRecoveryManager';
export { GracefulDegradationManager } from './GracefulDegradationManager';
export { errorRecoveryManager } from './errorRecoveryManagerInstance';

export type { ErrorRecoveryConfig } from './ErrorRecoveryConfig';
export type { ErrorRecoveryResult } from './ErrorRecoveryResult';
export type { RecoveryStrategy } from './RecoveryStrategy';
export type { DegradationMode } from './DegradationMode';
export type { FallbackService } from './FallbackService';

import { errorRecoveryManager } from './errorRecoveryManagerInstance';

/**
 * Higher-order function that wraps an async function with error recovery
 */
export function withErrorRecovery<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs): Promise<TReturn> => {
    return errorRecoveryManager.executeWithRecovery(() => fn(...args));
  };
}
