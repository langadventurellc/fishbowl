---
kind: task
id: T-create-core-data-interfaces
title: Create core data interfaces (Message, Agent, Conversation, ThemeMode)
status: open
priority: high
prerequisites:
  - T-create-ui-directory-structure
created: "2025-07-23T19:37:20.401859"
updated: "2025-07-23T19:37:20.401859"
schema_version: "1.1"
parent: F-foundation-typescript-interfaces
---

# Create Core Data Interfaces

## Context

Implement the fundamental data interfaces extracted from DesignPrototype.tsx that define the core entities used throughout the conversation UI system.

## Implementation Requirements

### Core Interfaces to Create

**1. Message Interface** (`packages/shared/src/types/ui/core.ts`)
Based on DesignPrototype analysis, create Message interface with these properties:

```typescript
interface Message {
  id: string;
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  type: "agent" | "user" | "system";
  isActive: boolean;
  agentColor: string;
}
```

**2. Agent Interface**

```typescript
interface Agent {
  name: string;
  role: string;
  color: string;
  isThinking: boolean;
}
```

**3. Conversation Interface**

```typescript
interface Conversation {
  name: string;
  lastActivity: string;
  isActive: boolean;
}
```

**4. ThemeMode Type** (`packages/shared/src/types/ui/theme.ts`)

```typescript
type ThemeMode = "light" | "dark";
```

### Implementation Details

1. **Add comprehensive JSDoc comments** for each interface explaining:
   - Purpose and usage context
   - Property descriptions with examples
   - How interfaces relate to UI components

2. **Use readonly arrays** where appropriate for immutable data
3. **Define proper optional vs required properties**
4. **Include union types** for constrained string values
5. **Follow PascalCase** for interface names, camelCase for properties

### Code Quality Requirements

- **No `any` types** - Use specific, concrete types always
- **Proper TypeScript strict mode** compliance
- **Consistent naming conventions** across all interfaces
- **Include usage examples** in JSDoc comments

## Technical Approach

1. **Study DesignPrototype.tsx** to understand exact property usage patterns
2. **Create core.ts file** with Message, Agent, and Conversation interfaces
3. **Create theme.ts file** with ThemeMode type and any related styling types
4. **Add comprehensive JSDoc documentation** explaining interface purpose
5. **Export interfaces** from their respective modules
6. **Include unit tests** to validate interface structure

## Acceptance Criteria

✅ **Message Interface Complete**

- All properties from DesignPrototype analysis included
- Proper type definitions for each property
- JSDoc comments with usage examples

✅ **Agent Interface Complete**

- Properties match agent objects in DesignPrototype
- Color property properly typed as string
- isThinking boolean for state management

✅ **Conversation Interface Complete**

- Properties match conversation objects
- isActive boolean for current conversation tracking

✅ **ThemeMode Type Complete**

- Union type for 'light' | 'dark' theme switching
- Located in proper theme.ts file

✅ **Type Safety Validated**

- All interfaces pass TypeScript strict mode
- No any types used anywhere
- Proper optional vs required property distinction

✅ **Documentation Complete**

- JSDoc comments on all interfaces
- Usage examples provided
- Clear explanations of interface purpose

## Dependencies

- T-create-ui-directory-structure (directory structure must exist)

## Testing Requirements

- Interfaces import successfully from both desktop and mobile apps
- TypeScript compilation passes with strict mode enabled
- Interface properties match DesignPrototype usage patterns
- JSDoc documentation renders correctly in IDE intellisense

### Log
