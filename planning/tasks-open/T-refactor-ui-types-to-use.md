---
kind: task
id: T-refactor-ui-types-to-use
title: Refactor UI types to use explicit ViewModel naming convention
status: open
priority: normal
prerequisites: []
created: "2025-07-27T13:28:02.177015"
updated: "2025-07-27T13:28:02.177015"
schema_version: "1.1"
---

# Refactor UI Types to Use Explicit ViewModel Naming Convention

## Context and Purpose

Currently, UI-specific types in the `packages/shared/src/types/ui/` directory use generic names that can conflict with domain model types. This task implements explicit ViewModel naming to create clear architectural boundaries between UI presentation types and business domain types.

**Architectural Goal**: Establish clear separation between:

- **ViewModels**: UI-specific types optimized for presentation (`AgentViewModel`, `ConversationViewModel`)
- **Domain Models**: Business logic types with full data structures (`Agent`, `Conversation`)

## Implementation Approach

### Phase 1: Discovery and Cataloging

**Step 1: Analyze Current UI Type Structure**

Examine the current state of `packages/shared/src/types/ui/` directory:

```bash
# Discover all UI type files
find packages/shared/src/types/ui -name "*.ts" -type f | grep -E "(\.ts$)" | sort
```

**Step 2: Identify View Model Candidates**

Look for types that are clearly UI-specific by examining:

- **File location**: Types in `packages/shared/src/types/ui/`
- **Purpose**: Types used for UI rendering, display state, or presentation logic
- **Content**: Types containing UI-specific fields like colors, display states, theming
- **Usage**: Types primarily imported by UI components

**Current Known Patterns** (as reference, but discover actual current state):

- `packages/shared/src/types/ui/core/Agent.ts` - UI agent with display properties
- `packages/shared/src/types/ui/core/Message.ts` - UI message representation
- `packages/shared/src/types/ui/core/Conversation.ts` - UI conversation display
- Component prop types in `packages/shared/src/types/ui/components/`

**Step 3: Create Comprehensive Catalog**

Document all UI types to be renamed:

```typescript
// Create a mapping document
interface ViewModelRefactorPlan {
  originalName: string;
  newName: string;
  filePath: string;
  referencingFiles: string[];
  hasConflictingDomainType: boolean;
}
```

### Phase 2: Systematic Renaming

**Step 4: Rename Type Files and Interfaces**

For each identified UI type:

1. **Rename the interface/type**:

   ```typescript
   // Before
   export interface Agent { ... }

   // After
   export interface AgentViewModel { ... }
   ```

2. **Update file documentation**:

   ```typescript
   /**
    * @fileoverview Agent View Model
    *
    * UI-specific type for agent display in conversation interface.
    * Optimized for presentation layer with display-specific properties.
    */
   ```

3. **Add backward compatibility** (temporary):

   ```typescript
   export interface AgentViewModel { ... }

   /** @deprecated Use AgentViewModel instead */
   export interface Agent extends AgentViewModel {}
   ```

**Step 5: Update Export Structures**

Modify barrel exports to include both new and legacy names:

```typescript
// packages/shared/src/types/ui/core/index.ts
export type { AgentViewModel } from "./Agent";
export type { Agent } from "./Agent"; // Legacy - mark for removal

// packages/shared/src/types/ui/index.ts
export type { AgentViewModel, Agent } from "./core";
```

### Phase 3: Update All References

**Step 6: Find and Update Import Statements**

Search for all files importing the renamed types:

```bash
# Find all TypeScript files that import UI types
grep -r "from.*types/ui" --include="*.ts" --include="*.tsx" packages/ apps/

# Find specific type imports
grep -r "import.*Agent.*from" --include="*.ts" --include="*.tsx" packages/ apps/
```

**Step 7: Update Component Files**

For each referencing file:

1. **Update import statements**:

   ```typescript
   // Before
   import { Agent } from "@fishbowl-ai/shared";

   // After
   import { AgentViewModel } from "@fishbowl-ai/shared";
   ```

2. **Update type annotations**:

   ```typescript
   // Before
   const agents: Agent[] = [];

   // After
   const agents: AgentViewModel[] = [];
   ```

3. **Update component props**:

   ```typescript
   // Before
   interface AgentPillProps {
     agent: Agent;
   }

   // After
   interface AgentPillProps {
     agent: AgentViewModel;
   }
   ```

## Testing Strategy

### Unit Test Updates

**Step 8: Update Test Files**

1. **Find all test files** using the renamed types:

   ```bash
   grep -r "Agent\|Message\|Conversation" --include="*.test.ts" --include="*.test.tsx" packages/ apps/
   ```

2. **Update test imports and type annotations**:

   ```typescript
   // Before
   import { Agent } from "@fishbowl-ai/shared";

   // After
   import { AgentViewModel } from "@fishbowl-ai/shared";
   ```

3. **Update test data builders**:

   ```typescript
   // Before
   const createTestAgent = (): Agent => ({ ... });

   // After
   const createTestAgentViewModel = (): AgentViewModel => ({ ... });
   ```

### Integration Testing

**Step 9: Verify No Breaking Changes**

1. **Build verification**:

   ```bash
   pnpm build:libs
   pnpm quality
   pnpm test
   ```

2. **Import verification**: Ensure all imports resolve correctly
3. **Type safety verification**: Confirm TypeScript compilation succeeds
4. **Component rendering verification**: Test UI components still render correctly

## Quality Assurance

### Step 10: Documentation Updates

1. **Update JSDoc comments** to reflect ViewModel purpose
2. **Update architecture documentation** to explain ViewModel pattern
3. **Create migration guide** for future developers

### Step 11: Remove Deprecated Types (Future Task)

Plan for cleanup after migration period:

```typescript
// Remove these after confirmed migration
/** @deprecated Use AgentViewModel instead */
export interface Agent extends AgentViewModel {}
```

## Acceptance Criteria

### Functional Requirements

- ✅ All UI types in `packages/shared/src/types/ui/` have explicit ViewModel naming
- ✅ All import statements updated to use new ViewModel names
- ✅ All type annotations updated in components and tests
- ✅ Backward compatibility maintained through deprecated aliases
- ✅ No TypeScript compilation errors after changes

### Technical Requirements

- ✅ All builds pass (`pnpm build:libs`)
- ✅ All quality checks pass (`pnpm quality`)
- ✅ All tests pass (`pnpm test`)
- ✅ No runtime errors in UI components
- ✅ Import paths resolve correctly across all packages

### Documentation Requirements

- ✅ JSDoc updated to reflect ViewModel purpose and usage
- ✅ Architecture documentation updated to explain pattern
- ✅ File comments clearly indicate UI-specific nature
- ✅ Migration notes documented for team reference

### Pattern Consistency

- ✅ Consistent ViewModel suffix applied to all UI types
- ✅ Clear distinction between ViewModels and domain models
- ✅ Export structure supports both new and legacy imports temporarily
- ✅ Naming follows established TypeScript conventions

## Implementation Notes

### File Organization

Maintain current file structure in `packages/shared/src/types/ui/` but enhance naming:

- Keep existing directory organization (`core/`, `components/`, etc.)
- Rename types within files, not file names themselves (initially)
- Use consistent ViewModel suffix across all UI types

### Migration Strategy

1. **Non-breaking approach**: Add ViewModel names alongside existing names
2. **Deprecation warnings**: Mark old names as deprecated with ESLint rules
3. **Gradual migration**: Update consuming code incrementally
4. **Future cleanup**: Remove deprecated names in separate task after migration

### Error Prevention

- **Search comprehensively**: Use multiple search patterns to find all references
- **Test incrementally**: Build and test after each major change
- **Validate imports**: Ensure all import paths remain valid
- **Check component rendering**: Verify UI functionality unchanged

## Dependencies

- **Prerequisites**: None (standalone refactoring task)
- **Blocking**: No other tasks depend on this initially
- **Coordination**: Communicate with team about import name changes

## Time Estimate

**Total: 1.5-2 hours**

- Discovery and cataloging: 30 minutes
- Type renaming and updates: 45 minutes
- Reference updates: 30 minutes
- Testing and verification: 15 minutes

## Security Considerations

- **No security impact**: Pure refactoring with no functional changes
- **Type safety maintained**: All TypeScript type checking preserved
- **Import validation**: Ensure no unauthorized type imports possible

### Log
