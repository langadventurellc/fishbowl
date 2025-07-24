# Architecture Patterns and Guidelines

## Monorepo Structure Rules

1. **Shared Package (`@fishbowl-ai/shared`)**: Business logic, API clients, hooks, stores, types, utils
2. **Platform Apps**: ONLY UI components and platform-specific code
3. **No UI in shared packages**: React Native and web React components are incompatible

## What Can Be Shared ✅

- Business logic and algorithms
- API clients and network code
- State management (Zustand stores)
- Custom hooks (logic only)
- TypeScript types/interfaces
- Utility functions
- Constants and configuration

## What Cannot Be Shared ❌

- UI components (different rendering systems)
- Styles (platform-specific styling systems)
- Navigation (platform-specific routing)
- Platform-specific APIs

## Design Patterns

### Bridge Pattern

For platform-specific features, define interfaces in shared package:

```typescript
// In shared package - define interface
export interface StorageBridge {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
}

// In platform apps - implement
// Desktop: uses Electron secure storage
// Mobile: uses Expo SecureStore
```

### Clean Code Charter

- **KISS**: Keep It Super Simple
- **YAGNI**: You Aren't Gonna Need It
- **SRP**: Single Responsibility Principle
- **DRY**: Don't Repeat Yourself
- **≤ 400 LOC per file**
- **No "util" or "helpers" dumping grounds**
- **Composition over inheritance**
- **Ports & Adapters pattern** for I/O
