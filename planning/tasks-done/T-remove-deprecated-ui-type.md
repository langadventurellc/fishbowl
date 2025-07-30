---
kind: task
id: T-remove-deprecated-ui-type
title: Remove deprecated UI type aliases after ViewModel migration
status: done
priority: normal
prerequisites:
  - T-final-validation-and
created: "2025-07-30T01:53:09.060203"
updated: "2025-07-30T01:53:09.060203"
schema_version: "1.1"
---

# Remove Deprecated UI Type Aliases After ViewModel Migration

## Context and Purpose

Remove all temporary deprecated aliases that were created during the ViewModel naming migration. This completes the refactoring by cleaning up the backward compatibility code and enforcing the new ViewModel naming convention.

## Implementation Steps

### 1. Remove deprecated Agent alias

**File**: `packages/shared/src/types/ui/core/Agent.ts`

Remove the deprecated alias:

```typescript
// Remove this line
/** @deprecated Use AgentViewModel instead */
export interface Agent extends AgentViewModel {}
```

### 2. Remove deprecated Message alias

**File**: `packages/shared/src/types/ui/core/Message.ts`

Remove the deprecated alias:

```typescript
// Remove this line
/** @deprecated Use MessageViewModel instead */
export interface Message extends MessageViewModel {}
```

### 3. Remove deprecated Conversation alias

**File**: `packages/shared/src/types/ui/core/Conversation.ts`

Remove the deprecated alias:

```typescript
// Remove this line
/** @deprecated Use ConversationViewModel instead */
export interface Conversation extends ConversationViewModel {}
```

### 4. Update export barrel files

**File**: `packages/shared/src/types/ui/core/index.ts`

Ensure only ViewModel names are exported:

```typescript
// Should only export ViewModel names now
export * from "./Message"; // exports MessageViewModel only
export * from "./Agent"; // exports AgentViewModel only
export * from "./Conversation"; // exports ConversationViewModel only
```

### 5. Verify no legacy imports remain

**Search for any remaining legacy imports**:

```bash
# These should return no results after migration
grep -r "import.*Agent.*from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/ packages/
grep -r "import.*Message.*from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/ packages/
grep -r "import.*Conversation.*from.*@fishbowl-ai/shared" --include="*.ts" --include="*.tsx" apps/ packages/

# These should also return no results
grep -r ": Agent\b" --include="*.ts" --include="*.tsx" apps/ packages/
grep -r ": Message\b" --include="*.ts" --include="*.tsx" apps/ packages/
grep -r ": Conversation\b" --include="*.ts" --include="*.tsx" apps/ packages/
```

### 6. Build and validate changes

- Run `pnpm build:libs` to rebuild shared package
- Run `pnpm quality` to verify no TypeScript errors
- Run `pnpm test` to ensure all tests still pass
- **Expect**: Build should still pass since all code should be using ViewModel names

## Acceptance Criteria

### Functional Requirements

- ✅ All deprecated type aliases removed from source files
- ✅ Only ViewModel names are exported from type files
- ✅ No legacy type names remain in codebase
- ✅ All functionality remains unchanged

### Technical Requirements

- ✅ Build passes (`pnpm build:libs`)
- ✅ Quality checks pass (`pnpm quality`)
- ✅ All tests pass (`pnpm test`)
- ✅ TypeScript compilation succeeds across all packages

### Code Quality Requirements

- ✅ Clean, explicit ViewModel naming throughout
- ✅ No deprecated code remaining
- ✅ Consistent architectural pattern enforced
- ✅ Export structure is clean and minimal

### Validation Requirements

- ✅ Search queries return no results for legacy type usage
- ✅ IDE autocomplete only suggests ViewModel names
- ✅ No deprecation warnings in code or IDE

## Error Handling

**If build fails after removing aliases**:

- This indicates incomplete migration in previous tasks
- Must identify and fix any remaining legacy type usage
- Do not proceed until all legacy usage is eliminated

**If tests fail**:

- Check for test files that weren't updated in migration
- Update any remaining test code to use ViewModel names
- Ensure test data builders use ViewModel types

## Time Estimate

**Total: 30 minutes**

- Remove deprecated aliases: 10 minutes
- Build validation: 15 minutes
- Search verification: 5 minutes

## Notes

- **Point of no return**: Once aliases are removed, any remaining legacy usage will cause build failures
- **Validation critical**: Previous tasks must be completely successful before running this
- **Clean architecture**: Completes the explicit ViewModel naming pattern

### Log
