---
kind: task
id: T-rename-conversation-interface-to
title: Rename Conversation interface to ConversationViewModel with backward compatibility
status: open
priority: high
prerequisites: []
created: "2025-07-30T01:46:01.008062"
updated: "2025-07-30T01:46:01.008062"
schema_version: "1.1"
---

# Rename Conversation Interface to ConversationViewModel with Backward Compatibility

## Context and Purpose

Rename the `Conversation` interface in `packages/shared/src/types/ui/core/Conversation.ts` to `ConversationViewModel` to establish clear architectural boundaries between UI presentation types and business domain types. This prevents naming conflicts and makes the UI-specific nature explicit.

## Implementation Steps

### 1. Update the interface definition

**File**: `packages/shared/src/types/ui/core/Conversation.ts`

- **Rename interface**: Change `Conversation` to `ConversationViewModel`
- **Update JSDoc**: Update documentation to reflect ViewModel purpose
- **Add backward compatibility**: Add deprecated alias for gradual migration

```typescript
/**
 * Conversation View Model for conversation UI system.
 *
 * UI-specific type for conversation display in sidebar and navigation.
 * Optimized for presentation layer with display-specific properties.
 */
export interface ConversationViewModel {
  // ... existing properties unchanged
}

/** @deprecated Use ConversationViewModel instead */
export interface Conversation extends ConversationViewModel {}
```

### 2. Update export barrel files

**File**: `packages/shared/src/types/ui/core/index.ts`

```typescript
// Update to export both names
export * from "./Conversation"; // This exports both ConversationViewModel and Conversation
```

### 3. Validate no breaking changes

- **Build check**: Run `pnpm build:libs` to ensure shared package builds
- **Type check**: Run `pnpm quality` to verify TypeScript compilation
- **Import validation**: Verify existing `Conversation` imports still work through backward compatibility

## Acceptance Criteria

### Functional Requirements

- ✅ Interface renamed from `Conversation` to `ConversationViewModel`
- ✅ Backward compatibility maintained with deprecated `Conversation` alias
- ✅ JSDoc updated to reflect ViewModel purpose and UI-specific nature
- ✅ All existing imports continue to work without modification

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ No TypeScript compilation errors
- ✅ Export structure supports both new and legacy names

### Documentation Requirements

- ✅ Interface documentation clearly indicates UI-specific nature
- ✅ Deprecation warning on legacy Conversation interface
- ✅ Clear migration guidance in comments

## Notes

- **Non-breaking change**: Existing code continues to work with Conversation import
- **Gradual migration**: Consuming code can be updated incrementally in future tasks
- **Future cleanup**: Remove deprecated Conversation interface after full migration

## Time Estimate

**Total: 30 minutes**

- Interface renaming and documentation: 15 minutes
- Build validation and testing: 15 minutes

### Log
