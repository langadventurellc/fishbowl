---
kind: task
id: T-create-input-component-prop
title: Create input component prop types in shared package
status: open
priority: high
prerequisites: []
created: "2025-07-24T11:35:28.573428"
updated: "2025-07-24T11:35:28.573428"
schema_version: "1.1"
parent: F-input-display-components
---

# Create Input Component Prop Types

## Context

Create TypeScript prop interfaces for the input display components in the shared package following the established patterns seen in ButtonProps.ts and AgentPillProps.ts. These props will be used by pure display components extracted from DesignPrototype.tsx.

## Technical Approach

1. **Study existing prop patterns** in `packages/shared/src/types/UI/components/`
2. **Create new prop files** following the established naming convention
3. **Use appropriate imports** from core types and React
4. **Add comprehensive JSDoc** with examples and usage patterns
5. **Export from index.ts** for proper barrel exports

## Implementation Requirements

### Named Type Files to Create:

Following the MessageType.ts pattern, create named types for all union strings in separate files:

- `packages/shared/src/types/UI/components/ComponentSize.ts`
- `packages/shared/src/types/UI/components/ToggleMode.ts`
- `packages/shared/src/types/UI/components/LayoutVariant.ts`
- `packages/shared/src/types/UI/components/ResizeDirection.ts`

### Prop Interface Files to Create:

- `packages/shared/src/types/UI/components/MessageInputDisplayProps.ts`
- `packages/shared/src/types/UI/components/SendButtonDisplayProps.ts`
- `packages/shared/src/types/UI/components/ModeToggleDisplayProps.ts`
- `packages/shared/src/types/UI/components/InputContainerDisplayProps.ts`
- `packages/shared/src/types/UI/components/TextareaDisplayProps.ts`

### Named Type Definitions:

**ComponentSize.ts:**

```typescript
/**
 * Component size variants for consistent sizing across input components.
 * - "small": Compact size for inline actions and tight spaces
 * - "medium": Standard size for most use cases (default)
 * - "large": Prominent size for primary actions and emphasis
 */
export type ComponentSize = "small" | "medium" | "large";
```

**ToggleMode.ts:**

```typescript
/**
 * Mode toggle states for Manual/Auto functionality.
 * - "manual": Manual mode where user controls interactions
 * - "auto": Automatic mode with system-driven interactions
 */
export type ToggleMode = "manual" | "auto";
```

**LayoutVariant.ts:**

```typescript
/**
 * Layout variants for container components.
 * - "default": Standard spacing and layout for normal use
 * - "compact": Reduced spacing for smaller screens or constrained layouts
 */
export type LayoutVariant = "default" | "compact";
```

**ResizeDirection.ts:**

```typescript
/**
 * Resize behavior options for textarea components.
 * - "none": No resizing allowed (fixed size)
 * - "vertical": Allow vertical resizing only
 * - "horizontal": Allow horizontal resizing only
 * - "both": Allow resizing in both directions
 */
export type ResizeDirection = "none" | "vertical" | "horizontal" | "both";
```

### Prop Requirements by Component:

**MessageInputDisplayProps:**

- placeholder: string (optional)
- content: string (optional)
- disabled: boolean (optional)
- size: ComponentSize (optional, default "medium")
- className: string (optional)

**SendButtonDisplayProps:**

- disabled: boolean (optional)
- loading: boolean (optional)
- className: string (optional)
- "aria-label": string (optional)

**ModeToggleDisplayProps:**

- currentMode: ToggleMode
- disabled: boolean (optional)
- className: string (optional)

**InputContainerDisplayProps:**

- layoutVariant: LayoutVariant (optional, default "default")
- className: string (optional)
- children: ReactNode

**TextareaDisplayProps:**

- content: string (optional)
- placeholder: string (optional)
- rows: number (optional)
- resize: ResizeDirection (optional, default "none")
- className: string (optional)

### Export Requirements:

Update `packages/shared/src/types/UI/components/index.ts` to export all new types:

```typescript
// Add to existing exports:
export * from "./ComponentSize";
export * from "./ToggleMode";
export * from "./LayoutVariant";
export * from "./ResizeDirection";
export * from "./MessageInputDisplayProps";
export * from "./SendButtonDisplayProps";
export * from "./ModeToggleDisplayProps";
export * from "./InputContainerDisplayProps";
export * from "./TextareaDisplayProps";
```

## Acceptance Criteria

- [ ] All 4 named type files created following MessageType.ts pattern
- [ ] All 5 prop interface files created with comprehensive JSDoc
- [ ] Props follow existing patterns (ButtonProps.ts, AgentPillProps.ts)
- [ ] All types and interfaces exported from components/index.ts
- [ ] Named types properly imported in prop interface files
- [ ] TypeScript strict mode compliance
- [ ] No functional properties (onClick, onChange) - display only
- [ ] Build succeeds with `pnpm build:libs`

## Dependencies

- Existing prop patterns in shared package
- React types for ReactNode

## Security Considerations

- Props are type-safe and validated by TypeScript
- No executable code in prop definitions

### Log
