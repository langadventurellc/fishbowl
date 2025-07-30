---
kind: task
id: T-rename-agent-interface-to
status: done
title: Rename Agent interface to AgentViewModel with backward compatibility
priority: high
prerequisites: []
created: "2025-07-30T01:45:42.098484"
updated: "2025-07-30T11:41:28.434693"
schema_version: "1.1"
---

# Rename Agent Interface to AgentViewModel with Backward Compatibility

## Context and Purpose

Rename the `Agent` interface in `packages/shared/src/types/ui/core/Agent.ts` to `AgentViewModel` to establish clear architectural boundaries between UI presentation types and business domain types. This prevents naming conflicts and makes the UI-specific nature explicit.

## Implementation Steps

### 1. Update the interface definition

**File**: `packages/shared/src/types/ui/core/Agent.ts`

- **Rename interface**: Change `Agent` to `AgentViewModel`
- **Update JSDoc**: Update documentation to reflect ViewModel purpose
- **Add backward compatibility**: Add deprecated alias for gradual migration

```typescript
/**
 * Agent View Model for conversation UI system.
 *
 * UI-specific type for agent display in conversation interface.
 * Optimized for presentation layer with display-specific properties.
 */
export interface AgentViewModel {
  // ... existing properties unchanged
}

/** @deprecated Use AgentViewModel instead */
export interface Agent extends AgentViewModel {}
```

### 2. Update export barrel files

**File**: `packages/shared/src/types/ui/core/index.ts`

```typescript
// Update to export both names
export * from "./Agent"; // This exports both AgentViewModel and Agent
```

### 3. Validate no breaking changes

- **Build check**: Run `pnpm build:libs` to ensure shared package builds
- **Type check**: Run `pnpm quality` to verify TypeScript compilation
- **Import validation**: Verify existing `Agent` imports still work through backward compatibility

## Acceptance Criteria

### Functional Requirements

- ✅ Interface renamed from `Agent` to `AgentViewModel`
- ✅ Backward compatibility maintained with deprecated `Agent` alias
- ✅ JSDoc updated to reflect ViewModel purpose and UI-specific nature
- ✅ All existing imports continue to work without modification

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ No TypeScript compilation errors
- ✅ Export structure supports both new and legacy names

### Documentation Requirements

- ✅ Interface documentation clearly indicates UI-specific nature
- ✅ Deprecation warning on legacy Agent interface
- ✅ Clear migration guidance in comments

## Notes

- **Non-breaking change**: Existing code continues to work with Agent import
- **Gradual migration**: Consuming code can be updated incrementally in future tasks
- **Future cleanup**: Remove deprecated Agent interface after full migration

## Time Estimate

**Total: 30 minutes**

- Interface renaming and documentation: 15 minutes
- Build validation and testing: 15 minutes

### Log
