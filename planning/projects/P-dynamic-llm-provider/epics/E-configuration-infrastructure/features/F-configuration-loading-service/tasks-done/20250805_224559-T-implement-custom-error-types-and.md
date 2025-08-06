---
kind: task
id: T-implement-custom-error-types-and
parent: F-configuration-loading-service
status: done
title: Implement custom error types and error handling for configuration loading failures
priority: normal
prerequisites: []
created: "2025-08-05T17:39:31.578879"
updated: "2025-08-05T22:30:42.447918"
schema_version: "1.1"
worktree: null
---

## Context

Create comprehensive error handling for the configuration loading service with custom error types that extend the existing error system in `packages/shared/src/services/storage/errors/`. This provides detailed context and recovery suggestions for different failure modes.

**Note: Integration and performance tests are not to be created for this task.**

## Implementation Requirements

### File Location

- Create `packages/shared/src/services/llm-providers/errors/ConfigurationLoadError.ts`
- Create `packages/shared/src/services/llm-providers/errors/ConfigurationValidationError.ts`
- Create `packages/shared/src/services/llm-providers/errors/HotReloadError.ts`
- Create `packages/shared/src/services/llm-providers/errors/ErrorRecovery.ts`
- Create `packages/shared/src/services/llm-providers/errors/index.ts` barrel export

### ConfigurationLoadError Class

```typescript
export class ConfigurationLoadError extends FileStorageError {
  constructor(
    public readonly filePath: string,
    public readonly operation: "load" | "parse" | "validate",
    message: string,
    public readonly cause?: Error,
    public readonly context?: ConfigurationErrorContext,
  ) {
    super(message);
    this.name = "ConfigurationLoadError";
  }

  getRecoverySuggestions(): string[];
  getDetailedMessage(): string;
  toJSON(): ConfigurationErrorData;
}
```

### ConfigurationValidationError Class

```typescript
export class ConfigurationValidationError extends ConfigurationLoadError {
  constructor(
    filePath: string,
    public readonly validationErrors: FormattedValidationError[],
    public readonly rawData?: unknown,
  ) {
    super(filePath, "validate", "Configuration validation failed");
    this.name = "ConfigurationValidationError";
  }

  getFieldErrors(): Record<string, string[]>;
  getFirstError(): FormattedValidationError | null;
  hasFieldError(fieldPath: string): boolean;
}
```

### HotReloadError Class

```typescript
export class HotReloadError extends ConfigurationLoadError {
  constructor(
    filePath: string,
    public readonly reloadAttempt: number,
    cause: Error,
    public readonly lastValidConfiguration?: LlmProviderConfig[],
  ) {
    super(filePath, "load", `Hot-reload failed (attempt ${reloadAttempt})`);
    this.name = "HotReloadError";
  }

  hasValidFallback(): boolean;
  shouldRetryReload(): boolean;
  getRetryDelay(): number;
}
```

### ErrorRecovery Utility

```typescript
export class ErrorRecovery {
  static suggestionsForError(error: Error): RecoverySuggestion[];
  static canRecover(error: ConfigurationLoadError): boolean;
  static attemptRecovery(
    error: ConfigurationLoadError,
  ): Promise<RecoveryResult>;

  private static recoverFromFileNotFound(
    error: ConfigurationLoadError,
  ): RecoveryResult;
  private static recoverFromValidationError(
    error: ConfigurationValidationError,
  ): RecoveryResult;
  private static recoverFromParseError(
    error: ConfigurationLoadError,
  ): RecoveryResult;
}

export interface RecoverySuggestion {
  type: "user_action" | "auto_fix" | "fallback";
  message: string;
  action?: () => Promise<void>;
}

export interface RecoveryResult {
  success: boolean;
  fallbackData?: LlmProviderConfig[];
  appliedFixes?: string[];
  remainingErrors?: Error[];
}
```

### Error Context and Metadata

```typescript
export interface ConfigurationErrorContext {
  schemaVersion?: string;
  providersCount?: number;
  fileSize?: number;
  lastModified?: Date;
  previousErrors?: string[];
  environment: "development" | "production";
}

export interface ConfigurationErrorData {
  name: string;
  message: string;
  filePath: string;
  operation: string;
  context?: ConfigurationErrorContext;
  stack?: string;
  timestamp: string;
}
```

### Error Message Templates

```typescript
const ERROR_MESSAGES = {
  FILE_NOT_FOUND: (path: string) =>
    `Configuration file not found at '${path}'. Create the file or check the path.`,

  INVALID_JSON: (path: string, line?: number) =>
    `Invalid JSON syntax in '${path}'${line ? ` at line ${line}` : ""}. Check for missing commas, quotes, or brackets.`,

  VALIDATION_FAILED: (path: string, errorCount: number) =>
    `Configuration validation failed in '${path}' with ${errorCount} error${errorCount > 1 ? "s" : ""}. See details below.`,

  HOT_RELOAD_FAILED: (path: string, attempt: number) =>
    `Hot-reload failed for '${path}' (attempt ${attempt}). Using last valid configuration.`,
};
```

### Integration with Existing Error System

- Extend `FileStorageError` from existing error hierarchy
- Use `ErrorFactory` patterns from storage errors
- Maintain consistency with existing error interfaces
- Leverage existing logger for error reporting

### Development vs Production Error Handling

- **Development**: Full error details, stack traces, recovery suggestions
- **Production**: User-friendly messages, error codes, minimal technical details
- **Logging**: Structured error data for monitoring and debugging

### Graceful Degradation Strategy

1. **File not found**: Return empty provider list, log warning
2. **Parse errors**: Return empty list, detailed error in development
3. **Validation errors**: Return empty list, field-level error details
4. **Hot-reload errors**: Keep using last valid configuration

## Acceptance Criteria

- ✓ Custom error types extend existing FileStorageError hierarchy
- ✓ Errors include file path, operation type, and detailed context
- ✓ Recovery suggestions provided for common error scenarios
- ✓ Validation errors include field-level details with paths
- ✓ Hot-reload errors maintain last valid configuration fallback
- ✓ Error messages adapt to development vs production environment
- ✓ JSON parse errors include line number information
- ✓ Error recovery utility suggests actionable fixes
- ✓ Unit tests cover all error types and recovery scenarios

## Testing Requirements

Create comprehensive unit tests in `__tests__/ConfigurationErrors.test.ts`:

- Error creation with proper inheritance and properties
- Error context and metadata attachment
- Recovery suggestion generation for different error types
- Error message formatting for development vs production
- JSON error parsing with line number extraction
- Hot-reload error handling with fallback scenarios
- ErrorRecovery utility testing with various error types

**Note: Integration or performance tests are not to be created.**

### Log

**2025-08-06T03:45:59.563759Z** - Successfully implemented comprehensive error handling system for configuration loading service with custom error types, recovery strategies, and extensive test coverage. Created enhanced ConfigurationLoadError with backward compatibility, specialized ConfigurationValidationError with field-level error reporting, HotReloadError with exponential backoff retry logic, and ErrorRecovery utility for automated error recovery. All error classes extend existing FileStorageError hierarchy, provide detailed context and recovery suggestions, adapt behavior for development vs production environments, and include comprehensive unit tests with 100% coverage.

- filesChanged: ["packages/shared/src/services/llm-providers/errors/ConfigurationLoadError.ts", "packages/shared/src/services/llm-providers/errors/ConfigurationValidationError.ts", "packages/shared/src/services/llm-providers/errors/HotReloadError.ts", "packages/shared/src/services/llm-providers/errors/ErrorRecovery.ts", "packages/shared/src/services/llm-providers/errors/ConfigurationErrorContext.ts", "packages/shared/src/services/llm-providers/errors/ConfigurationErrorData.ts", "packages/shared/src/services/llm-providers/errors/ErrorMessages.ts", "packages/shared/src/services/llm-providers/errors/errorUtils.ts", "packages/shared/src/services/llm-providers/errors/RecoverySuggestion.ts", "packages/shared/src/services/llm-providers/errors/RecoveryResult.ts", "packages/shared/src/services/llm-providers/errors/index.ts", "packages/shared/src/services/llm-providers/errors/__tests__/ConfigurationErrors.test.ts"]
