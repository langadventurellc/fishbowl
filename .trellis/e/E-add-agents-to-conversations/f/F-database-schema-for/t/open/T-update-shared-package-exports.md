---
id: T-update-shared-package-exports
title: Update shared package exports and integrate new types
status: open
priority: low
parent: F-database-schema-for
prerequisites:
  - T-add-comprehensive-unit-tests
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T03:08:54.769Z
updated: 2025-08-25T03:08:54.769Z
---

# Update Shared Package Exports and Integrate New Types

## Context

Complete the integration of the new ConversationAgent types and repository into the shared package's export structure. This ensures clean, organized imports for consuming applications and maintains consistency with existing export patterns.

**Related Issues:**

- Parent Feature: F-database-schema-for
- Parent Epic: E-add-agents-to-conversations
- Prerequisite: T-add-comprehensive-unit-tests (all implementation complete)

## Technical Requirements

### Package Export Structure

Update the shared package's main barrel file and ensure proper export organization:

```typescript
// packages/shared/src/index.ts
export * from "./types/conversationAgents";
export * from "./repositories/conversationAgents";
```

### Type Exports Integration

Update type exports to include new conversation agent types alongside existing conversation types:

```typescript
// packages/shared/src/types/index.ts
export * from "./conversations";
export * from "./conversationAgents"; // New addition
export * from "./agents";
export * from "./llm";
```

### Repository Exports Integration

Ensure repository exports include the new ConversationAgentsRepository:

```typescript
// packages/shared/src/repositories/index.ts
export * from "./conversations";
export * from "./conversationAgents"; // New addition
export * from "./llmConfig";
```

## Verification Tasks

### Import Path Validation

Verify that the new types can be imported cleanly from the main shared package:

```typescript
// Test imports in a verification file
import {
  ConversationAgent,
  CreateConversationAgentInput,
  UpdateConversationAgentInput,
  ConversationAgentResult,
  ConversationAgentNotFoundError,
  ConversationAgentValidationError,
  ConversationAgentsRepository,
  conversationAgentSchema,
  createConversationAgentInputSchema,
  updateConversationAgentInputSchema,
} from "@fishbowl-ai/shared";
```

### Export Conflict Resolution

Ensure no naming conflicts exist between new exports and existing ones:

- Check for duplicate export names
- Verify barrel file organization doesn't create circular imports
- Test that tree-shaking works correctly with new exports

### TypeScript Build Integration

Verify that the shared package builds correctly with new types:

- Run `pnpm build:libs` to ensure clean compilation
- Check that generated .d.ts files include new types
- Verify no TypeScript errors in consuming applications

## Documentation Updates

### README Updates

Update any relevant README files to reflect new types:

- Document the ConversationAgent type structure
- Explain the relationship between agents and conversations
- Include usage examples for the repository

### JSDoc Documentation

Ensure all exported interfaces and classes have comprehensive JSDoc:

- Document the purpose of ConversationAgent types
- Explain the non-foreign-key nature of agent_id
- Include usage examples where appropriate

## Integration Points

### Desktop Application Integration

Prepare for future consumption by desktop application:

- Verify types work with existing desktop type structure
- Ensure no conflicts with renderer/main process type usage
- Test that repository can be instantiated in main process services

### Mobile Application Integration

Ensure types are compatible with future mobile integration:

- Verify React Native compatibility of type definitions
- Check that no Node.js-specific types leak into shared interfaces
- Test compatibility with Expo build pipeline

## Performance Considerations

### Bundle Size Impact

Monitor the impact of new exports on package size:

- Check that tree-shaking works correctly
- Verify only used types are included in consuming bundles
- Document any significant size increases

### Build Time Impact

Assess impact on compilation times:

- Measure shared package build time changes
- Monitor impact on consuming application build times
- Document any significant performance regressions

## Acceptance Criteria

### Export Structure Requirements

- [ ] All new types exported from main shared package barrel file
- [ ] Repository exported from repositories barrel file
- [ ] No export naming conflicts with existing code
- [ ] Barrel file organization follows established patterns

### Build System Requirements

- [ ] Shared package builds successfully with `pnpm build:libs`
- [ ] Generated type definition files include new types
- [ ] No TypeScript compilation errors in shared package
- [ ] No circular import issues detected

### Import Validation Requirements

- [ ] New types can be imported individually from `@fishbowl-ai/shared`
- [ ] Bulk imports work correctly from main barrel
- [ ] Tree-shaking functions properly for unused exports
- [ ] Import paths are consistent with existing patterns

### Documentation Requirements

- [ ] JSDoc documentation complete for all exported interfaces
- [ ] Usage examples provided for complex types
- [ ] README files updated to reflect new functionality
- [ ] Export structure documented for future developers

### Integration Compatibility Requirements

- [ ] Types compatible with existing desktop application structure
- [ ] No Node.js-specific dependencies in shared types
- [ ] Mobile compatibility verified (React Native safe)
- [ ] No conflicts with existing type usage patterns

### Quality Assurance Requirements

- [ ] All new exports covered by unit tests
- [ ] Export structure tested in test files
- [ ] No dead code or unused exports
- [ ] Code style consistent with existing exports

## Testing Strategy

### Export Integration Tests

```typescript
// packages/shared/src/__tests__/exports.test.ts
describe("Shared Package Exports", () => {
  it("should export all ConversationAgent types", () => {
    const exports = require("../index");

    expect(exports.ConversationAgent).toBeDefined();
    expect(exports.CreateConversationAgentInput).toBeDefined();
    expect(exports.ConversationAgentsRepository).toBeDefined();
    // ... verify all expected exports
  });

  it("should not have circular imports", () => {
    // Test that importing all exports doesn't cause circular dependency errors
    expect(() => require("../index")).not.toThrow();
  });
});
```

### Build Integration Tests

```bash
# Verify package builds correctly
pnpm build:libs

# Test consuming applications can still build
pnpm build:desktop --dry-run
```

## Files to Modify

- `packages/shared/src/index.ts`
- `packages/shared/src/types/index.ts`
- `packages/shared/src/repositories/index.ts`
- `packages/shared/src/__tests__/exports.test.ts`
- `packages/shared/README.md` (if applicable)

## Dependencies

- **Prerequisite**: T-add-comprehensive-unit-tests (all implementation complete)
- **Build System**: TypeScript compilation, package build process
- **Quality**: Existing export test patterns, linting rules

## Verification Steps

1. Update all barrel files to include new exports
2. Run `pnpm build:libs` to verify compilation
3. Run shared package tests to ensure no regressions
4. Test imports in consuming applications
5. Verify tree-shaking and bundle size impact
6. Update documentation and examples

## Reference Materials

- **Existing Patterns**: Current shared package export structure
- **Type Organization**: Conversations types barrel file structure
- **Repository Exports**: Existing repository export patterns
- **Build Process**: Shared package build configuration

## Success Metrics

- Zero TypeScript compilation errors
- No increase in bundle size for unused exports
- Clean import paths for all new types
- Documentation complete and accurate
- No breaking changes to existing exports

This completes the foundational database schema infrastructure, making ConversationAgent types and repository available for use by higher-level services and UI components in subsequent feature implementations.
