---
kind: task
id: T-update-crud-operations-to-use
parent: F-state-management-system
status: done
title: Update CRUD Operations to Use Cache
priority: high
prerequisites:
  - T-implement-configuration-cache
created: "2025-08-07T11:22:43.193046"
updated: "2025-08-07T11:35:35.445863"
schema_version: "1.1"
worktree: null
---

# Update CRUD Operations to Use Cache

## Context

After implementing the cache infrastructure, we need to update all CRUD operations in LlmConfigService to use the cache for reads and maintain cache consistency for writes. This follows the write-through cache pattern where storage is updated first, then cache is updated only if storage succeeds.

**File to modify**: `apps/desktop/src/electron/services/LlmConfigService.ts`

## Implementation Requirements

### 1. Update read() Method

Modify read() to use cache after ensuring initialization:

```typescript
async read(id: string): Promise<LlmConfig | null> {
  try {
    await this.ensureInitialized();

    this.logger.debug("Reading LLM configuration from cache", { id });

    // Validate ID format (keep existing validation)
    if (!id || typeof id !== "string") {
      throw new InvalidConfigError("Invalid configuration ID", {
        providedId: id,
      });
    }

    // Get from cache instead of storage
    const config = this.cache.get(id) || null;

    this.logger.debug(config ? "Configuration found in cache" : "Configuration not found", { id });
    return config;

  } catch (error) {
    // Keep existing error handling logic
  }
}
```

### 2. Update list() Method

Modify list() to return cached configurations:

```typescript
async list(): Promise<LlmConfig[]> {
  try {
    await this.ensureInitialized();

    const configs = Array.from(this.cache.values());

    this.logger.debug("Listed LLM configurations from cache", {
      count: configs.length,
    });

    return configs;

  } catch (error) {
    // Keep existing error handling logic
  }
}
```

### 3. Update create() Method

Modify create() to update cache after successful storage:

```typescript
async create(input: LlmConfigInput): Promise<LlmConfig> {
  try {
    await this.ensureInitialized();

    // Check cache for duplicate names (more efficient than storage call)
    const configs = Array.from(this.cache.values());
    const duplicateName = configs.find(
      (cfg) => cfg.customName === input.customName,
    );

    if (duplicateName) {
      throw new DuplicateConfigError(input.customName);
    }

    // Continue with existing storage logic...
    // Then after successful storage:

    // Update cache with new configuration
    this.cache.set(finalConfig.id, finalConfig);

    return finalConfig;

  } catch (error) {
    // Keep existing error handling
  }
}
```

### 4. Update update() Method

Modify update() to maintain cache consistency using atomic pattern:

```typescript
async update(id: string, updates: Partial<LlmConfigInput>): Promise<LlmConfig> {
  try {
    await this.ensureInitialized();

    // Get existing from cache
    const existing = this.cache.get(id);
    if (!existing) {
      throw new ConfigNotFoundError(id);
    }

    // Check for duplicate names in cache if name is changing
    if (updates.customName && updates.customName !== existing.customName) {
      const configs = Array.from(this.cache.values());
      const duplicate = configs.find(
        (cfg) => cfg.customName === updates.customName && cfg.id !== id,
      );

      if (duplicate) {
        throw new DuplicateConfigError(updates.customName);
      }
    }

    // Update storage first
    const result = await this.storageService.repository.update(id, updates);

    // Update cache only if storage succeeds
    const updatedConfig: LlmConfig = {
      ...result,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(id, updatedConfig);

    return updatedConfig;

  } catch (error) {
    // Keep existing error handling - cache remains unchanged on failure
  }
}
```

### 5. Update delete() Method

Modify delete() to remove from cache after successful storage deletion:

```typescript
async delete(id: string): Promise<void> {
  try {
    await this.ensureInitialized();

    // Check cache instead of storage
    const existing = this.cache.get(id);
    if (!existing) {
      this.logger.debug("Configuration not found in cache for deletion", { id });
      return;
    }

    // Delete from storage first
    const result = await this.storageService.deleteConfiguration(id);

    if (!result.success) {
      throw new ConfigOperationError(
        "delete",
        result.error || "Failed to delete configuration",
        { id },
      );
    }

    // Remove from cache only if storage deletion succeeds
    this.cache.delete(id);

    this.logger.info("LLM configuration deleted successfully", {
      id,
      provider: existing.provider,
      customName: existing.customName,
    });

  } catch (error) {
    // Keep existing error handling - cache remains unchanged on failure
  }
}
```

## Acceptance Criteria

- ✓ read() method returns configurations from cache, not storage
- ✓ list() method returns all cached configurations efficiently
- ✓ create() method updates cache after successful storage
- ✓ update() method follows atomic pattern (storage first, then cache)
- ✓ delete() method removes from cache after successful storage deletion
- ✓ All cache operations happen after ensureInitialized()
- ✓ Cache is updated only when storage operations succeed
- ✓ Failed storage operations don't corrupt cache state
- ✓ All existing error handling and business logic is preserved
- ✓ All existing validation and logging continues to work
- ✓ Unit tests verify cache is used for reads and updated for writes
- ✓ Unit tests verify cache consistency after each operation type

## Testing Requirements

Add unit tests for:

1. read() returns configuration from cache after initialization
2. list() returns all configurations from cache
3. create() adds new configuration to cache after storage success
4. update() modifies cache entry after storage success
5. delete() removes configuration from cache after storage success
6. Failed create operations don't add to cache
7. Failed update operations don't modify cache
8. Failed delete operations don't remove from cache
9. Duplicate name validation uses cache for efficiency

## Technical Notes

- Follow atomic operation pattern: storage first, cache second
- Never update cache if storage operation fails
- Cache should be the single source of truth for reads after initialization
- Preserve all existing business logic, validation, and error handling
- Use existing logger patterns for cache operation logging

## Dependencies

- Depends on T-implement-configuration-cache completing first
- This task requires the cache infrastructure to be in place

### Log

**2025-08-07T16:49:05.933979Z** - Successfully updated all CRUD operations in LlmConfigService to use cache instead of direct storage access. Implemented write-through cache pattern where storage operations are performed first, then cache is updated only upon successful storage operations. All existing business logic, validation, and error handling was preserved. Updated unit tests to work with new cache behavior. Quality checks and all tests now pass.

- filesChanged: ["apps/desktop/src/electron/services/LlmConfigService.ts", "apps/desktop/src/electron/services/__tests__/LlmConfigService.test.ts"]
