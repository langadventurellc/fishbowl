---
kind: feature
id: F-foundation-typescript-interfaces
title: Foundation TypeScript Interfaces
status: in-progress
priority: high
prerequisites: []
created: "2025-07-23T19:06:52.136939"
updated: "2025-07-23T19:06:52.136939"
schema_version: "1.1"
parent: E-core-component-extraction
---

# Foundation TypeScript Interfaces

## Purpose

Create comprehensive TypeScript interfaces in the shared package to define props and data structures for all UI components that will be extracted from DesignPrototype. These interfaces serve as the foundation for type-safe component development.

## Acceptance Criteria

✅ **Core Data Interfaces Created**

- `Message` interface with id, agent, role, content, timestamp, type, isActive, agentColor
- `Agent` interface with name, role, color, isThinking properties
- `Conversation` interface with name, lastActivity, isActive properties
- `ThemeMode` type for 'light' | 'dark' theme switching

✅ **Component Props Interfaces**

- `AgentPillProps` for agent display component props
- `MessageItemProps` for message display component props
- `ConversationItemProps` for sidebar conversation list props
- `ThemeToggleProps` for theme switching component props
- `ContextMenuProps` for dropdown menu component props
- `SidebarToggleProps` for collapsible sidebar button props

✅ **File Organization**

- All interfaces placed in `packages/shared/src/types/ui/` directory
- Barrel export in `packages/shared/src/types/ui/index.ts`
- Main export from `packages/shared/src/types/index.ts`
- JSDoc comments on all interfaces explaining usage

✅ **Type Safety**

- All interfaces pass TypeScript strict mode validation
- No `any` types used
- Proper optional vs required property distinction
- Consistent naming conventions (PascalCase for interfaces, camelCase for properties)

## Implementation Guidance

**Directory Structure:**

```
packages/shared/src/types/ui/
├── index.ts (barrel export)
├── core.ts (Message, Agent, Conversation)
├── components.ts (all component prop interfaces)
└── theme.ts (ThemeMode and styling types)
```

**Interface Patterns:**

- Use readonly arrays where data shouldn't be mutated
- Include optional callback props for future event handling
- Define union types for constrained string values
- Add JSDoc comments with usage examples

## Testing Requirements

- Import all interfaces successfully in desktop app
- TypeScript compilation passes with strict mode
- All interfaces accessible via clean import paths
- IDE provides proper intellisense for all types

## Dependencies

None - this is a foundation feature that other features depend on.

### Log
