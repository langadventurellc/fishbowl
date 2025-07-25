---
kind: task
id: T-create-layout-component-props
parent: F-layout-display-components
status: done
title: Create layout component props interfaces in shared package
priority: high
prerequisites: []
created: "2025-07-24T22:05:57.916754"
updated: "2025-07-24T22:22:47.951695"
schema_version: "1.1"
worktree: null
---

# Create Layout Component Props Interfaces in Shared Package

## Purpose

Create TypeScript interfaces for all layout component props in the shared package to ensure type safety and maintain the monorepo architecture pattern where types are shared across platforms.

## Context

Following the established monorepo pattern, all component props interfaces must be created in `packages/shared/src/types/ui/components/` to enable sharing between desktop and future mobile implementations. This follows the same pattern as existing components like MessageItemProps, SidebarContainerDisplayProps, etc.

## Technical Approach

### 1. Create layout-display.types.ts file

- Location: `packages/shared/src/types/ui/components/layout-display.types.ts`
- Export all layout component prop interfaces
- Use existing types like Agent[], Message[], ThemeMode where appropriate
- Follow existing naming conventions (ComponentNameProps pattern)

### 2. Component Interfaces to Create

#### ConversationScreenDisplayProps

```typescript
export interface ConversationScreenDisplayProps {
  sidebarVisible: boolean;
  children: React.ReactNode;
  themeMode: ThemeMode;
  className?: string;
}
```

#### MainContentPanelDisplayProps

```typescript
export interface MainContentPanelDisplayProps {
  children: React.ReactNode;
  className?: string;
}
```

#### ChatContainerDisplayProps

```typescript
export interface ChatContainerDisplayProps {
  children: React.ReactNode;
  className?: string;
  scrollPosition?: number;
  onScroll?: (scrollTop: number) => void;
}
```

#### AgentLabelsContainerDisplayProps

```typescript
export interface AgentLabelsContainerDisplayProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "compact" | "normal" | "relaxed";
}
```

#### ConversationLayoutDisplayProps

```typescript
export interface ConversationLayoutDisplayProps {
  sidebarComponent: React.ReactNode;
  mainContentComponent: React.ReactNode;
  sidebarVisible: boolean;
  responsive?: boolean;
  className?: string;
}
```

### 3. Import Dependencies

- Import React types for ReactNode
- Import existing types from shared package (ThemeMode, etc.)
- Ensure proper barrel exports

## Implementation Steps

1. **Create layout-display.types.ts file** in `packages/shared/src/types/ui/components/`
2. **Define all component prop interfaces** with proper TypeScript types
3. **Import required dependencies** from React and existing shared types
4. **Export all interfaces** for component consumption
5. **Update barrel exports** in index files if they exist
6. **Verify type definitions** match the component usage patterns from DesignPrototype

## Acceptance Criteria

✅ **File Structure**

- `packages/shared/src/types/ui/components/layout-display.types.ts` created
- All 5 component prop interfaces defined
- Follows existing naming conventions (ComponentNameProps)

✅ **Type Safety**

- All props properly typed with TypeScript
- ReactNode used for children props
- Optional props marked with `?`
- Imports from existing shared types where applicable

✅ **Code Standards**

- Follows existing code patterns in the types directory
- Proper JSDoc comments for complex interfaces
- Consistent formatting with prettier
- No TypeScript errors or warnings

✅ **Integration Ready**

- Types are exportable for component consumption
- Matches the component usage patterns identified in DesignPrototype
- Compatible with CSS-in-JS styling approach used in project

## Dependencies

- Must analyze existing component props patterns in shared package
- Must use existing types like ThemeMode from `packages/shared/src/types/ui/theme/`
- Must follow the barrel export pattern if used in the project

## Notes

- These interfaces will be consumed by the layout components created in subsequent tasks
- The interfaces should be flexible enough to support both current DesignPrototype usage and future enhancements
- Consider responsive design patterns when defining prop interfaces

### Log

**2025-07-25T03:30:44.766444Z** - Created comprehensive TypeScript props interfaces for all 5 layout display components in the shared package. Implemented ConversationScreenDisplayProps, MainContentPanelDisplayProps, ChatContainerDisplayProps, AgentLabelsContainerDisplayProps, and ConversationLayoutDisplayProps following project conventions with single exports per file. Added proper JSDoc documentation, React.ReactNode types for composition, theme support, responsive behavior props, and event handlers. Updated barrel exports to include all new interfaces. All quality checks pass (linting, formatting, type-checking).

- filesChanged: ["packages/shared/src/types/ui/components/ConversationScreenDisplayProps.ts", "packages/shared/src/types/ui/components/MainContentPanelDisplayProps.ts", "packages/shared/src/types/ui/components/ChatContainerDisplayProps.ts", "packages/shared/src/types/ui/components/AgentLabelsContainerDisplayProps.ts", "packages/shared/src/types/ui/components/ConversationLayoutDisplayProps.ts", "packages/shared/src/types/ui/components/index.ts"]
