---
kind: feature
id: F-provider-registry-management
title: Provider Registry Management
status: in-progress
priority: normal
prerequisites:
  - F-core-type-definitions
  - F-configuration-loading-service
created: "2025-08-04T19:39:24.296722"
updated: "2025-08-04T19:39:24.296722"
schema_version: "1.1"
parent: E-configuration-infrastructure
---

## Purpose and Functionality

Create the runtime provider registry that manages loaded provider configurations and integrates with the existing settings system. This feature provides the centralized access point for provider configurations across both desktop and mobile platforms, maintaining compatibility with the current `LlmConfigData` structure while enabling the new dynamic provider system.

## Key Components to Implement

1. **Provider Registry Core**
   - Central registry for all loaded provider configurations
   - Provider instance management with unique IDs
   - Provider metadata caching and lookup
   - Thread-safe access patterns for concurrent use

2. **Settings Integration Bridge**
   - Adapter between new provider system and existing `LlmConfigData`
   - Backward compatibility layer for current code
   - Migration utilities for existing configurations
   - Unified API for provider access

3. **Storage Interface Abstraction**
   - Platform-agnostic storage interface definition
   - Configuration persistence contract
   - Secure storage bridge for API keys
   - Configuration versioning support

4. **Registry State Management**
   - Zustand store integration for provider state
   - Real-time updates across UI components
   - Configuration change notifications
   - State synchronization with storage

## Detailed Acceptance Criteria

### Registry Functionality

- ✓ Registry maintains all loaded provider configurations
- ✓ Each provider instance has unique generated ID
- ✓ Registry supports CRUD operations for providers
- ✓ Concurrent access handled safely without race conditions

### Integration Requirements

- ✓ Compatible with existing `SettingsRepository` patterns
- ✓ Maps to current `LlmConfigData` interface seamlessly
- ✓ Supports existing settings UI without changes
- ✓ Migration path for current stored configurations

### Storage Abstraction

- ✓ Storage interface works across desktop and mobile
- ✓ Platform implementations can use native storage
- ✓ Secure fields marked for encryption handling
- ✓ Async operations supported throughout

### State Management

- ✓ Zustand store updates trigger UI refreshes
- ✓ Configuration changes persist automatically
- ✓ State remains consistent across app lifecycle
- ✓ Memory efficient with large provider lists

## Implementation Guidance

### File Structure

```
packages/shared/src/providers/llm/
├── index.ts                        # Barrel exports
├── registry/
│   ├── ProviderRegistry.ts         # Core registry implementation
│   ├── ProviderInstance.ts         # Runtime provider instances
│   └── RegistryEvents.ts           # Event system for updates
├── adapters/
│   ├── LlmConfigAdapter.ts         # Bridge to existing system
│   ├── SettingsAdapter.ts          # Settings repository integration
│   └── MigrationAdapter.ts         # Legacy config migration
├── storage/
│   ├── StorageInterface.ts         # Platform-agnostic interface
│   ├── ConfigurationStorage.ts     # Storage coordination
│   └── SecureFieldHandler.ts       # Secure field management
└── state/
    ├── llmProviderStore.ts         # Zustand store
    └── storeActions.ts             # Store action creators
```

### Registry Architecture

```typescript
export class LlmProviderRegistry {
  private providers: Map<string, LlmProviderInstance>;
  private metadata: Map<string, LlmProviderMetadata>;

  constructor(
    private loader: LlmConfigurationLoader,
    private storage: StorageInterface,
  ) {
    this.providers = new Map();
    this.metadata = new Map();
  }

  async initialize(): Promise<void> {
    // Load provider definitions
    const configs = await this.loader.getProviders();
    configs.forEach((config) => this.metadata.set(config.id, config));

    // Load stored instances
    const instances = await this.storage.loadAll();
    instances.forEach((instance) => this.providers.set(instance.id, instance));
  }

  async createInstance(
    providerId: string,
    values: LlmConfigurationValues,
  ): Promise<LlmProviderInstance> {
    const metadata = this.metadata.get(providerId);
    if (!metadata) throw new Error(`Unknown provider: ${providerId}`);

    const instance = new LlmProviderInstance(
      generateId(),
      providerId,
      values,
      metadata,
    );

    await this.storage.save(instance);
    this.providers.set(instance.id, instance);

    return instance;
  }
}
```

### Storage Interface Pattern

```typescript
export interface LlmStorageInterface {
  save(instance: LlmProviderInstance): Promise<void>;
  load(id: string): Promise<LlmProviderInstance | null>;
  loadAll(): Promise<LlmProviderInstance[]>;
  delete(id: string): Promise<void>;
  update(id: string, values: Partial<LlmConfigurationValues>): Promise<void>;
}

// Platform-specific implementations
export class DesktopLlmStorage implements LlmStorageInterface {
  // Uses keytar for secure storage
}

export class MobileLlmStorage implements LlmStorageInterface {
  // Uses Expo SecureStore
}
```

## Testing Requirements

- Unit tests for registry CRUD operations
- Integration tests with mock storage
- Adapter tests for backward compatibility
- Concurrency tests for thread safety
- State management tests with Zustand
- Migration tests from legacy format

## Security Considerations

- Secure fields never exposed in plain text
- Storage interface enforces encryption
- No sensitive data in registry metadata
- Access control for provider modifications
- Audit logging for configuration changes

## Performance Requirements

- Registry initialization < 200ms
- Instance creation < 50ms
- Storage operations < 500ms
- Memory usage O(n) with provider count
- No blocking operations in critical path

## Dependencies

- F-core-type-definitions: Type system for providers
- F-configuration-loading-service: Provider configuration loader
- External: zustand for state management
- Platform-specific: Storage implementations per platform

### Log
