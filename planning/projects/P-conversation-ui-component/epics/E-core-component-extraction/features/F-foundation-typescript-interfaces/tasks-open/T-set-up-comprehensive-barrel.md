---
kind: task
id: T-set-up-comprehensive-barrel
title: Set up comprehensive barrel exports and validate imports
status: open
priority: normal
prerequisites:
  - T-create-component-prop-interfaces
created: "2025-07-23T19:38:07.972143"
updated: "2025-07-23T19:38:07.972143"
schema_version: "1.1"
parent: F-foundation-typescript-interfaces
---

# Set Up Comprehensive Barrel Exports and Validate Imports

## Context

Configure the complete barrel export system for all UI interfaces and validate that imports work correctly across the monorepo, ensuring clean import paths and proper TypeScript module resolution.

## Implementation Requirements

### Barrel Export Configuration

**1. UI Module Barrel Export** (`packages/shared/src/types/ui/index.ts`)

```typescript
// Re-export all core data interfaces
export * from "./core";

// Re-export all component prop interfaces
export * from "./components";

// Re-export theme-related types
export * from "./theme";

// Provide grouped exports for convenience
export type {
  // Core entities
  Message,
  Agent,
  Conversation,
} from "./core";

export type {
  // Component props
  AgentPillProps,
  MessageItemProps,
  ConversationItemProps,
  ThemeToggleProps,
  ContextMenuProps,
  SidebarToggleProps,
} from "./components";

export type { ThemeMode } from "./theme";
```

**2. Main Types Barrel Export** (`packages/shared/src/types/index.ts`)

```typescript
// Re-export all UI types for clean imports
export * from "./ui";

// Other type modules (existing or future)
// export * from './api';
// export * from './store';
```

**3. Package Main Export** (`packages/shared/src/index.ts`)

```typescript
// Export types module
export * from "./types";

// Other package modules
// export * from './hooks';
// export * from './utils';
```

### Import Validation Testing

**1. Desktop App Import Test**
Create test file in `apps/desktop/src/test-ui-imports.ts`:

```typescript
// Test clean import paths
import type {
  Message,
  Agent,
  Conversation,
  ThemeMode,
  AgentPillProps,
  MessageItemProps,
  ConversationItemProps,
  ThemeToggleProps,
  ContextMenuProps,
  SidebarToggleProps,
} from "@fishbowl-ai/shared";

// Validate interface usage
const testMessage: Message = {
  id: "1",
  agent: "Test Agent",
  role: "user",
  content: "Test message",
  timestamp: "2:30 PM",
  type: "user",
  isActive: true,
  agentColor: "#3b82f6",
};
```

**2. Mobile App Import Test**
Create test file in `apps/mobile/src/test-ui-imports.ts` with same structure

## Technical Approach

1. **Configure barrel exports** in proper hierarchical order (core → components → ui → types → main)
2. **Update package.json** exports if needed for proper module resolution
3. **Create import test files** in both desktop and mobile apps
4. **Run TypeScript compilation** to validate all imports resolve correctly
5. **Test IDE intellisense** to ensure proper type completion
6. **Verify no circular dependencies** exist in the export chain
7. **Include unit tests** for interface validation

## Acceptance Criteria

✅ **Complete Barrel Export System**

- ui/index.ts exports all interfaces from submodules
- types/index.ts exports entire UI module
- shared/index.ts exports types for clean import paths
- All exports use proper TypeScript syntax

✅ **Clean Import Paths Working**

- Desktop app can import: `import type { Message } from '@fishbowl-ai/shared'`
- Mobile app can import: `import type { AgentPillProps } from '@fishbowl-ai/shared'`
- All interfaces accessible via package name imports

✅ **TypeScript Compilation Successful**

- All interface imports resolve without errors
- TypeScript strict mode compilation passes
- No circular dependency warnings

✅ **IDE Integration Working**

- Proper intellisense for all imported types
- Auto-completion shows interface properties correctly
- Jump-to-definition works for all interfaces

✅ **Import Test Files Created**

- Test files in both desktop and mobile apps demonstrate working imports
- Example usage of all interfaces validates proper typing
- Files serve as documentation for proper import patterns

## Dependencies

- T-create-component-prop-interfaces (all interfaces must exist before exporting)

## Testing Requirements

- TypeScript compilation passes for all apps with new imports
- `pnpm type-check` command succeeds across entire monorepo
- IDE provides proper intellisense for all exported types
- Import test files demonstrate successful usage of all interfaces
- No circular dependency errors in module resolution

### Log
