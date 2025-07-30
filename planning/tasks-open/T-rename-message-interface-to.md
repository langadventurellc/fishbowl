---
kind: task
id: T-rename-message-interface-to
title: Rename Message interface to MessageViewModel with backward compatibility
status: open
priority: high
prerequisites: []
created: "2025-07-30T01:45:51.394894"
updated: "2025-07-30T01:45:51.394894"
schema_version: "1.1"
---

# Rename Message Interface to MessageViewModel with Backward Compatibility

## Context and Purpose

Rename the `Message` interface in `packages/shared/src/types/ui/core/Message.ts` to `MessageViewModel` to establish clear architectural boundaries between UI presentation types and business domain types. This prevents naming conflicts and makes the UI-specific nature explicit.

## Implementation Steps

### 1. Update the interface definition

**File**: `packages/shared/src/types/ui/core/Message.ts`

- **Rename interface**: Change `Message` to `MessageViewModel`
- **Update JSDoc**: Update documentation to reflect ViewModel purpose
- **Add backward compatibility**: Add deprecated alias for gradual migration

```typescript
/**
 * Message View Model for conversation UI system.
 *
 * UI-specific type for message display in conversation interface.
 * Optimized for presentation layer with display-specific properties.
 */
export interface MessageViewModel {
  // ... existing properties unchanged
}

/** @deprecated Use MessageViewModel instead */
export interface Message extends MessageViewModel {}
```

### 2. Update export barrel files

**File**: `packages/shared/src/types/ui/core/index.ts`

```typescript
// Update to export both names
export * from "./Message"; // This exports both MessageViewModel and Message
```

### 3. Validate no breaking changes

- **Build check**: Run `pnpm build:libs` to ensure shared package builds
- **Type check**: Run `pnpm quality` to verify TypeScript compilation
- **Import validation**: Verify existing `Message` imports still work through backward compatibility

## Acceptance Criteria

### Functional Requirements

- ✅ Interface renamed from `Message` to `MessageViewModel`
- ✅ Backward compatibility maintained with deprecated `Message` alias
- ✅ JSDoc updated to reflect ViewModel purpose and UI-specific nature
- ✅ All existing imports continue to work without modification

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ No TypeScript compilation errors
- ✅ Export structure supports both new and legacy names

### Documentation Requirements

- ✅ Interface documentation clearly indicates UI-specific nature
- ✅ Deprecation warning on legacy Message interface
- ✅ Clear migration guidance in comments

## Notes

- **Non-breaking change**: Existing code continues to work with Message import
- **Gradual migration**: Consuming code can be updated incrementally in future tasks
- **Future cleanup**: Remove deprecated Message interface after full migration

## Time Estimate

**Total: 30 minutes**

- Interface renaming and documentation: 15 minutes
- Build validation and testing: 15 minutes

### Log
