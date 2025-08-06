// Error classes
export { ConfigurationLoadError } from "./ConfigurationLoadError";
export { ConfigurationValidationError } from "./ConfigurationValidationError";
export { HotReloadError } from "./HotReloadError";

// Error recovery
export { ErrorRecovery } from "./ErrorRecovery";

// Types and interfaces
export type { ConfigurationErrorContext } from "./ConfigurationErrorContext";
export type { ConfigurationErrorData } from "./ConfigurationErrorData";
export type { RecoverySuggestion } from "./RecoverySuggestion";
export type { RecoveryResult } from "./RecoveryResult";

// Error messages and utilities
export { ERROR_MESSAGES } from "./ErrorMessages";
export { extractLineNumber } from "./errorUtils";

// Re-export validation error detail for convenience
export type { ValidationErrorDetail } from "./ValidationErrorDetail";
