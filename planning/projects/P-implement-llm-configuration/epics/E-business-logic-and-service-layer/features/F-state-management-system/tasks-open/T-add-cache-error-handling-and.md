---
kind: task
id: T-add-cache-error-handling-and
title: Add Cache Error Handling and Recovery
status: open
priority: normal
prerequisites:
  - T-update-crud-operations-to-use
created: "2025-08-07T11:23:16.466182"
updated: "2025-08-07T11:23:16.466182"
schema_version: "1.1"
parent: F-state-management-system
---

# Add Cache Error Handling and Recovery

## Context

With cache infrastructure and CRUD operations in place, we need to add robust error handling and recovery mechanisms to ensure the cache can handle various failure scenarios and provide cache refresh capabilities for operational maintenance.

**File to modify**: `apps/desktop/src/electron/services/LlmConfigService.ts`

## Implementation Requirements

### 1. Enhance Initialization Error Handling

Improve the initialize() method to handle different types of storage failures:

```typescript
async initialize(): Promise<void> {
  if (this.initialized) return;

  try {
    // Load all configurations from storage
    const configs = await this.getAllConfigurationsFromStorage();

    // Clear any existing cache state
    this.cache.clear();

    // Populate cache
    configs.forEach((config) => {
      this.cache.set(config.id, config);
    });

    this.initialized = true;
    this.logger.info(`Successfully loaded ${configs.length} LLM configurations into cache`);

  } catch (error) {
    this.logger.error("Failed to initialize LLM config cache", error);

    // Clear cache and continue with empty state for graceful degradation
    this.cache.clear();
    this.initialized = true;

    this.logger.warn("Starting with empty configuration cache due to initialization failure");
  }
}
```

### 2. Add Cache Refresh Capability

Add a public method to manually refresh the cache when needed:

```typescript
/**
 * Refresh the cache by reloading all configurations from storage.
 * Useful for recovery scenarios or when cache sync is suspected to be lost.
 */
async refreshCache(): Promise<void> {
  try {
    this.logger.info("Refreshing LLM configuration cache");

    // Load fresh data from storage
    const configs = await this.getAllConfigurationsFromStorage();

    // Replace cache contents
    this.cache.clear();
    configs.forEach((config) => {
      this.cache.set(config.id, config);
    });

    this.logger.info(`Cache refreshed with ${configs.length} configurations`);

  } catch (error) {
    this.logger.error("Failed to refresh cache", error);
    throw new ConfigOperationError(
      "refresh",
      "Cache refresh failed",
      undefined,
      error instanceof Error ? error : undefined,
    );
  }
}
```

### 3. Add Cache Validation

Add a method to validate cache integrity and sync with storage:

```typescript
/**
 * Validate cache integrity by comparing with storage.
 * Returns information about any discrepancies found.
 */
async validateCache(): Promise<{
  isValid: boolean;
  issues: string[];
  cacheCount: number;
  storageCount: number;
}> {
  await this.ensureInitialized();

  const issues: string[] = [];
  const cacheConfigs = Array.from(this.cache.values());

  try {
    // Get configurations from storage
    const storageConfigs = await this.getAllConfigurationsFromStorage();

    // Compare counts
    if (cacheConfigs.length !== storageConfigs.length) {
      issues.push(`Count mismatch: cache has ${cacheConfigs.length}, storage has ${storageConfigs.length}`);
    }

    // Check for missing configurations in cache
    const cacheIds = new Set(cacheConfigs.map(c => c.id));
    const storageIds = new Set(storageConfigs.map(c => c.id));

    for (const storageId of storageIds) {
      if (!cacheIds.has(storageId)) {
        issues.push(`Configuration ${storageId} exists in storage but not in cache`);
      }
    }

    for (const cacheId of cacheIds) {
      if (!storageIds.has(cacheId)) {
        issues.push(`Configuration ${cacheId} exists in cache but not in storage`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      cacheCount: cacheConfigs.length,
      storageCount: storageConfigs.length
    };

  } catch (error) {
    issues.push(`Storage access failed during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      isValid: false,
      issues,
      cacheCount: cacheConfigs.length,
      storageCount: -1
    };
  }
}
```

### 4. Add Cache Health Monitoring

Add a method to check cache health and provide diagnostic information:

```typescript
/**
 * Get cache health and diagnostic information.
 */
getCacheInfo(): {
  initialized: boolean;
  configCount: number;
  memorySizeEstimate: string;
} {
  const configCount = this.cache.size;

  // Rough memory estimate (each config ~1KB on average)
  const memorySizeEstimate = `~${Math.round(configCount * 1024 / 1024 * 100) / 100}MB`;

  return {
    initialized: this.initialized,
    configCount,
    memorySizeEstimate
  };
}
```

### 5. Improve Operation Error Recovery

Enhance error handling in CRUD operations to suggest cache refresh on persistent failures:

```typescript
// In CRUD methods, add cache refresh suggestion for repeated failures
catch (error) {
  this.logger.error("Operation failed, consider refreshing cache", error);

  // Existing error handling...
  throw new ConfigOperationError(
    operation,
    `${operation} failed. Consider calling refreshCache() if this persists.`,
    context,
    error instanceof Error ? error : undefined,
  );
}
```

## Acceptance Criteria

- ✓ Cache initialization handles various storage failure scenarios gracefully
- ✓ refreshCache() method allows manual cache refresh from storage
- ✓ validateCache() method detects cache/storage inconsistencies
- ✓ getCacheInfo() provides diagnostic information about cache state
- ✓ Error messages suggest cache refresh for persistent operational failures
- ✓ Cache can be cleared and rebuilt without restarting the application
- ✓ All error scenarios are logged with appropriate severity levels
- ✓ Memory usage is monitored and reported in cache diagnostics
- ✓ Unit tests cover all error scenarios and recovery mechanisms
- ✓ Unit tests verify cache refresh functionality works correctly

## Testing Requirements

Add unit tests for:

1. initialize() handles storage connection failures
2. initialize() handles corrupted storage data
3. initialize() handles partial storage read failures
4. refreshCache() successfully reloads cache from storage
5. refreshCache() handles storage failures appropriately
6. validateCache() detects missing configurations in cache
7. validateCache() detects extra configurations in cache
8. validateCache() handles storage access failures
9. getCacheInfo() returns accurate diagnostic information
10. Error recovery suggestions are included in operation failures

## Technical Notes

- Use existing error classes and logging patterns
- Don't expose cache internals to external consumers
- Ensure thread-safety for cache operations (though Node.js is single-threaded)
- Keep diagnostic methods lightweight to avoid performance impact
- Preserve backward compatibility with existing service interface

## Performance Considerations

- validateCache() should be used sparingly as it reads from storage
- refreshCache() clears and rebuilds entire cache - use judiciously
- getCacheInfo() should be lightweight for frequent health checks
- Error recovery should not automatically trigger expensive operations

## Dependencies

- Depends on T-update-crud-operations-to-use completing first
- Requires cache infrastructure and CRUD integration to be in place

### Log
