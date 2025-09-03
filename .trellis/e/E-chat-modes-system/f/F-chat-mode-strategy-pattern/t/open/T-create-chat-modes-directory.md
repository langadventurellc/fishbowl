---
id: T-create-chat-modes-directory
title: Create chat-modes directory structure and run quality checks
status: open
priority: low
parent: F-chat-mode-strategy-pattern
prerequisites:
  - T-create-factory-function-and
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-09-03T20:26:15.135Z
updated: 2025-09-03T20:26:15.135Z
---

# Create Chat-Modes Directory Structure and Run Quality Checks

## Context

Ensure the complete chat-modes module is properly integrated into the ui-shared package, with correct directory structure and all quality checks passing. This task validates that the implementation meets repository standards and is ready for integration.

## Technical Approach

1. Verify directory structure is correct
2. Run comprehensive quality checks
3. Update package exports if needed
4. Validate build process works correctly

## Detailed Implementation Requirements

### Directory Structure Validation

Ensure the following structure exists in `packages/ui-shared/src/chat-modes/`:

```
packages/ui-shared/src/chat-modes/
├── ChatModeHandler.ts              # Interface only
├── ChatModeIntent.ts               # Intent type only
├── ManualChatMode.ts               # Manual mode class only
├── RoundRobinChatMode.ts           # Round robin class only
├── index.ts                        # Factory and exports
└── __tests__/
    ├── ManualChatMode.test.ts
    ├── RoundRobinChatMode.test.ts
    └── factory.test.ts
```

### Package Integration Steps

1. **Verify Package Exports** (packages/ui-shared/src/index.ts):

   ```typescript
   // Add to existing exports if not already present
   export * from "./chat-modes";
   ```

2. **Run Quality Checks**:

   ```bash
   # From project root
   pnpm build:libs
   pnpm quality
   pnpm test:unit packages/ui-shared
   ```

3. **Validate Import Paths**:
   ```typescript
   // Test these imports work correctly after build
   import {
     createChatModeHandler,
     ChatModeHandler,
   } from "@fishbowl-ai/ui-shared";
   ```

## Acceptance Criteria

- [ ] **Directory Structure**: All files created in correct locations
- [ ] **File Separation**: Each file contains only one export per repository rules
- [ ] **Build Success**: `pnpm build:libs` completes without errors
- [ ] **Linting Passes**: `pnpm lint` passes for all new files
- [ ] **Type Checking**: `pnpm type-check` passes with no errors
- [ ] **Tests Pass**: All unit tests pass with >95% coverage
- [ ] **Package Integration**: Exports work correctly from @fishbowl-ai/ui-shared
- [ ] **Import Validation**: All imports resolve correctly after build

## Commands to Run

Execute these commands from the project root directory:

```bash
# 1. Build shared packages first
pnpm build:libs

# 2. Run all quality checks
pnpm quality

# 3. Run specific unit tests for chat-modes
pnpm test:unit -- packages/ui-shared/src/chat-modes

# 4. Verify no regressions in shared package
pnpm test:unit packages/ui-shared
```

## Expected Outcomes

### Build Output

- No TypeScript compilation errors
- All imports resolve correctly
- Package builds successfully

### Quality Checks

- ESLint passes for all files (no multiple export violations)
- Prettier formatting applied consistently
- No type errors in strict mode

### Test Results

- All unit tests pass
- Code coverage >95% for new modules
- No test failures or timeout issues

### Integration Validation

- Imports work from other packages
- Types are properly exported
- Factory function creates handlers correctly

## Troubleshooting Common Issues

### Build Errors

- Ensure ConversationAgent type is imported correctly from @fishbowl-ai/shared
- Check that shared package was built before ui-shared
- Verify all import paths use correct relative paths

### Linting Violations

- Each file should export exactly one main thing
- Use `export type` for type-only exports
- Ensure consistent naming conventions

### Test Failures

- Verify mock ConversationAgent objects have all required fields
- Check that test timeouts are sufficient for performance tests
- Ensure test isolation (no shared state between tests)

## Dependencies

- All previous tasks completed (T-create-chatmodehandler, T-implement-manualchatmode, T-implement-roundrobinchatmode, T-create-factory-function-and)
- ConversationAgent type from @fishbowl-ai/shared available
- Shared package built and ready

## Success Metrics

- [ ] Build completes in <30 seconds
- [ ] All 20+ unit tests pass
- [ ] Linting shows 0 violations
- [ ] Type checking shows 0 errors
- [ ] Code coverage >95%
- [ ] No console warnings during build

## Post-Task Validation

After completing this task, verify:

```typescript
// This should work from any other package
import {
  createChatModeHandler,
  ChatModeHandler,
  ChatModeIntent,
} from "@fishbowl-ai/ui-shared";

const handler = createChatModeHandler("manual");
console.log(handler.name); // Should output: "manual"
```

## Out of Scope

- Integration with conversation store (separate feature)
- UI components (separate epic)
- State management integration (separate feature)
- Performance optimization beyond basic requirements
