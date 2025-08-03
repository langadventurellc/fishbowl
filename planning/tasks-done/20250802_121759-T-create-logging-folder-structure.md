---
kind: task
id: T-create-logging-folder-structure
status: done
title: Create logging folder structure and TypeScript interfaces
priority: high
prerequisites:
  - T-add-loglevel-dependency-to
created: "2025-08-02T11:46:00.410968"
updated: "2025-08-02T12:09:31.470941"
schema_version: "1.1"
worktree: null
---

## Create logging folder structure and TypeScript interfaces

### Context

Set up the foundational folder structure and TypeScript interfaces for the structured logging system. This establishes the architecture and contracts that all other logging components will implement.

### Implementation Requirements

1. Create the logging directory structure under `packages/shared/src/`
2. Define all TypeScript interfaces for the logging system
3. Create placeholder files for future implementation
4. Set up proper exports

### Technical Approach

1. Create the following directory structure:

   ```
   packages/shared/src/logging/
     ├── index.ts
     ├── types.ts (interfaces)
     ├── formatters/
     │   └── index.ts
     ├── transports/
     │   └── index.ts
     ├── utils/
     │   └── index.ts
     └── config/
         └── index.ts
   ```

2. In `types.ts`, define these interfaces:
   - `LogContext`
   - `LogEntry`
   - `ErrorInfo`
   - `StructuredLogger` interface
   - `Formatter` interface
   - `Transport` interface
   - `LogConfig` interface
   - `LogFilter` interface

3. Create barrel exports in each index.ts file

### File Contents

#### packages/shared/src/logging/types.ts

```typescript
export interface LogContext {
  [key: string]: any;
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: ErrorInfo;
  platform: "electron" | "react-native" | "web";
  environment: "development" | "staging" | "production";
  sessionId: string;
  version: string;
}

export interface StructuredLogger {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;

  child(context: LogContext): StructuredLogger;
  setContext(context: LogContext): void;
  startTimer(label: string): () => void;
}

export interface Formatter {
  format(entry: LogEntry): string;
}

export interface Transport {
  log(entry: LogEntry): void;
}

export interface LogFilter {
  test(entry: LogEntry): boolean;
}

export interface TransportConfig {
  type: "console" | "file";
  formatter: string;
  level: string;
  filters?: LogFilter[];
}

export interface LogConfig {
  name?: string;
  level?: string;
  includeDeviceInfo?: boolean;
  transports?: TransportConfig[];
}
```

### Acceptance Criteria

- [ ] Complete directory structure is created under `packages/shared/src/logging/`
- [ ] All TypeScript interfaces are defined in `types.ts`
- [ ] Barrel exports are set up in all index.ts files
- [ ] TypeScript compilation succeeds
- [ ] `pnpm quality` passes without issues

### Testing Requirements

- Verify TypeScript interfaces compile correctly
- Ensure all exports are accessible from the main logging index
- Create a simple test file that imports and uses the interfaces to verify structure

### Log

**2025-08-02T17:17:59.442957Z** - Successfully implemented complete logging folder structure and TypeScript interfaces for the structured logging system. Created comprehensive interfaces following the project's one-export-per-file pattern. All interfaces are properly typed with cross-references and include full JSDoc documentation. The implementation provides a solid foundation for building formatters, transports, and utilities in future tasks. All quality checks pass (linting, formatting, type checking) and shared packages build successfully.

- filesChanged: ["packages/shared/src/logging/types/LogContext.ts", "packages/shared/src/logging/types/ErrorInfo.ts", "packages/shared/src/logging/types/LogEntry.ts", "packages/shared/src/logging/types/Formatter.ts", "packages/shared/src/logging/types/Transport.ts", "packages/shared/src/logging/types/LogFilter.ts", "packages/shared/src/logging/types/StructuredLogger.ts", "packages/shared/src/logging/types/LogConfig.ts", "packages/shared/src/logging/types/index.ts", "packages/shared/src/logging/formatters/index.ts", "packages/shared/src/logging/transports/index.ts", "packages/shared/src/logging/utils/index.ts", "packages/shared/src/logging/config/index.ts", "packages/shared/src/logging/index.ts", "packages/shared/src/index.ts"]
