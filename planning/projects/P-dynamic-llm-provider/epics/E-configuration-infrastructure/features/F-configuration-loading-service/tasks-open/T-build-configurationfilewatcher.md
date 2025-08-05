---
kind: task
id: T-build-configurationfilewatcher
title: Build ConfigurationFileWatcher for hot-reload with platform abstraction
status: open
priority: normal
prerequisites:
  - T-implement-configurationcache-for
created: "2025-08-05T17:38:37.092512"
updated: "2025-08-05T17:38:37.092512"
schema_version: "1.1"
parent: F-configuration-loading-service
---

## Context

Implement file system watching for configuration files to enable hot-reload during development. The watcher should detect file changes and trigger configuration reload with proper error handling and event emission.

**Note: Integration and performance tests are not to be created for this task.**

## Implementation Requirements

### File Structure

- Create `packages/shared/src/services/llm-providers/watchers/ConfigurationWatcher.ts`
- Create `packages/shared/src/services/llm-providers/watchers/WatcherFactory.ts`
- Create `packages/shared/src/services/llm-providers/watchers/types.ts`
- Create `packages/shared/src/services/llm-providers/watchers/index.ts` barrel export

### ConfigurationWatcher Class

```typescript
export class ConfigurationWatcher extends EventEmitter {
  private watcher: fs.FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isWatching: boolean = false;

  constructor(
    private filePath: string,
    private options: WatcherOptions = {},
  ) {
    super();
  }

  async start(): Promise<void>;
  async stop(): Promise<void>;
  isActive(): boolean;
  getWatchedPath(): string;

  private handleFileChange(event: string, filename: string): void;
  private debounceChange(): void;
  private validateFile(): Promise<boolean>;
}
```

### WatcherFactory for Platform Abstraction

```typescript
export class WatcherFactory {
  static createWatcher(
    filePath: string,
    options: WatcherOptions = {},
  ): ConfigurationWatcher {
    // Platform-specific watcher creation
    if (isElectron()) {
      return new ElectronConfigurationWatcher(filePath, options);
    }
    return new NodeConfigurationWatcher(filePath, options);
  }
}
```

### WatcherOptions Interface

```typescript
export interface WatcherOptions {
  debounceMs?: number; // default: 500ms
  enableInProduction?: boolean; // default: false
  validateOnChange?: boolean; // default: true
  emitRawEvents?: boolean; // default: false
  watcherBackend?: "native" | "polling"; // default: 'native'
}

export interface WatcherEvents {
  change: (filePath: string) => void;
  error: (error: Error) => void;
  ready: (filePath: string) => void;
  unlink: (filePath: string) => void;
}
```

### Development Environment Detection

```typescript
function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined
  );
}

function isElectron(): boolean {
  return typeof window !== "undefined" && window.process?.type === "renderer";
}
```

### Event Handling Strategy

1. **Debounced changes**: Prevent excessive reload on rapid file writes
2. **Validation on change**: Verify file is valid before emitting events
3. **Error isolation**: File watcher errors don't crash the service
4. **Event emission**: Emit structured events for configuration changes

### Hot-Reload Integration

- **File change detection**: Watch for modify, rename, and delete events
- **Validation before reload**: Use existing validation schemas
- **Cache invalidation**: Trigger cache refresh on valid changes
- **Error recovery**: Continue watching even after reload failures

### Platform Considerations

- **Desktop (Electron)**: Use native file system APIs
- **Mobile**: File watching may be limited or unavailable
- **Development vs Production**: Only enable in development by default

## Acceptance Criteria

- ✓ Watcher activates only in development environment by default
- ✓ File changes trigger reload events within 500ms (configurable)
- ✓ Debouncing prevents excessive reload on rapid file changes
- ✓ Validation errors during reload don't crash the service
- ✓ Console logs show reload events in development mode
- ✓ start() and stop() methods manage watcher lifecycle properly
- ✓ Events emitted include file path and change type information
- ✓ Error handling isolates file system errors from service
- ✓ Unit tests cover watcher lifecycle and event handling

## Testing Requirements

Create comprehensive unit tests in `__tests__/ConfigurationWatcher.test.ts`:

- Watcher lifecycle: start, stop, restart scenarios
- File change detection and debouncing logic
- Event emission for various file operations
- Error handling for invalid files and file system errors
- Platform abstraction and factory creation
- Development environment detection

Mock file system operations for isolated testing.

**Note: Integration or performance tests are not to be created.**

### Log
