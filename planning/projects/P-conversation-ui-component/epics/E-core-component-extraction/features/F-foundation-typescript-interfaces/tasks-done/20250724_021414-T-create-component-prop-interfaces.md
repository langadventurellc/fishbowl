---
kind: task
id: T-create-component-prop-interfaces
parent: F-foundation-typescript-interfaces
status: done
title: Create component prop interfaces for UI components
priority: high
prerequisites:
  - T-create-core-data-interfaces
created: "2025-07-23T19:37:44.653872"
updated: "2025-07-24T02:02:41.134721"
schema_version: "1.1"
worktree: null
---

# Create Component Prop Interfaces

## Context

Create TypeScript prop interfaces for all UI components identified in DesignPrototype that will be extracted into reusable components. These interfaces define the contracts for component APIs.

## Implementation Requirements

### Component Prop Interfaces to Create

**1. AgentPillProps** - For agent display component

```typescript
interface AgentPillProps {
  agent: Agent;
  isThinking?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**2. MessageItemProps** - For message display component

```typescript
interface MessageItemProps {
  message: Message;
  isExpanded?: boolean;
  onToggleExpansion?: (messageId: string) => void;
  onToggleContext?: (messageId: string) => void;
  onContextMenuAction?: (action: string, messageId: string) => void;
  className?: string;
}
```

**3. ConversationItemProps** - For sidebar conversation list

```typescript
interface ConversationItemProps {
  conversation: Conversation;
  onSelect?: (conversationName: string) => void;
  onContextMenuAction?: (action: string, conversationName: string) => void;
  className?: string;
}
```

**4. ThemeToggleProps** - For theme switching component

```typescript
interface ThemeToggleProps {
  isDark: boolean;
  onToggle: (isDark: boolean) => void;
  className?: string;
}
```

**5. ContextMenuProps** - For dropdown menu component

```typescript
interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: ContextMenuItem[];
  position?: "above" | "below";
  className?: string;
}

interface ContextMenuItem {
  label: string;
  action: string;
  disabled?: boolean;
  icon?: string;
}
```

**6. SidebarToggleProps** - For collapsible sidebar button

```typescript
interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: (isCollapsed: boolean) => void;
  className?: string;
}
```

### TypeScript Best Practices

1. **Use React.ReactNode** for children props
2. **Optional callback props** for event handling with proper typing
3. **className prop** for styling flexibility on all components
4. **Proper event handler typing** with specific parameters
5. **Union types** for constrained values (positions, actions)
6. **Intersection types** where components extend native HTML elements

### Code Organization

- **All interfaces in `packages/shared/src/types/ui/components.ts`**
- **Import core interfaces** (Message, Agent, Conversation) from core.ts
- **Group related interfaces** together (e.g., ContextMenu and ContextMenuItem)
- **Consistent naming patterns** following React community conventions

## Technical Approach

1. **Analyze DesignPrototype component patterns** to understand prop requirements
2. **Create components.ts file** with all component prop interfaces
3. **Use TypeScript best practices** from React TypeScript cheatsheet
4. **Import core interfaces** from core.ts module
5. **Add comprehensive JSDoc documentation** for each interface
6. **Include usage examples** in comments
7. **Write unit tests** to validate interface contracts

## Acceptance Criteria

✅ **All Component Prop Interfaces Created**

- AgentPillProps with proper Agent interface usage
- MessageItemProps with callback typing and Message interface
- ConversationItemProps with Conversation interface integration
- ThemeToggleProps with boolean state management
- ContextMenuProps with position and item configuration
- SidebarToggleProps with collapse state management

✅ **React TypeScript Best Practices**

- Optional callback props properly typed
- className props on all components for styling flexibility
- Event handlers with specific parameter typing
- No any types used anywhere

✅ **Interface Dependencies**

- Proper imports from core.ts for Message, Agent, Conversation
- Clean separation between data and prop interfaces
- No circular dependencies

✅ **Documentation Complete**

- JSDoc comments on all interfaces explaining purpose
- Usage examples for complex props like callbacks
- Clear parameter descriptions for event handlers

✅ **Type Safety Validated**

- All interfaces pass TypeScript strict mode compilation
- Proper optional vs required property distinction
- Consistent naming conventions (PascalCase interfaces, camelCase props)

## Dependencies

- T-create-core-data-interfaces (core interfaces must exist for imports)

## Testing Requirements

- All prop interfaces import successfully in desktop app components
- TypeScript provides proper intellisense for all prop types
- Interface contracts match expected DesignPrototype component usage
- Event handler typing works correctly with React event system

### Log

**2025-07-24T07:14:14.982495Z** - Successfully implemented all 6 component prop interfaces with comprehensive TypeScript types, JSDoc documentation, and cross-platform compatibility. Created AgentPillProps, MessageItemProps, ConversationItemProps, ThemeToggleProps, ContextMenuProps, ContextMenuItem, and SidebarToggleProps interfaces following React patterns and project conventions. Fixed linting issues by splitting ContextMenuItem into separate file per "one export per file" rule. All interfaces pass strict TypeScript validation, quality checks, and import verification in desktop app.

- filesChanged: ["packages/shared/src/types/ui/components/AgentPillProps.ts", "packages/shared/src/types/ui/components/MessageItemProps.ts", "packages/shared/src/types/ui/components/ConversationItemProps.ts", "packages/shared/src/types/ui/components/ThemeToggleProps.ts", "packages/shared/src/types/ui/components/ContextMenuProps.ts", "packages/shared/src/types/ui/components/ContextMenuItem.ts", "packages/shared/src/types/ui/components/SidebarToggleProps.ts", "packages/shared/src/types/ui/components/index.ts"]
