---
id: T-update-conversationagent
title: Update ConversationAgent types and schemas with color field
status: done
priority: high
parent: F-agent-color-assignment-system
prerequisites:
  - T-create-database-migration-for
affectedFiles:
  packages/shared/src/types/conversationAgents/ConversationAgent.ts: "Added required color: string field with JSDoc documentation"
  packages/shared/src/types/conversationAgents/AddAgentToConversationInput.ts: "Added required color: string field for input validation"
  packages/shared/src/types/conversationAgents/schemas/conversationAgentSchema.ts:
    Added color field validation with regex pattern for CSS variables (--agent-1
    through --agent-8)
  packages/shared/src/types/conversationAgents/schemas/addAgentToConversationInputSchema.ts: Added required color field validation matching main schema
  packages/shared/src/repositories/conversationAgents/ConversationAgentsRepository.ts:
    Updated ConversationAgentRow interface, SQL queries, and parameter arrays to
    include color field
  packages/shared/src/types/conversationAgents/schemas/__tests__/conversationAgentSchema.test.ts:
    Added comprehensive test cases for color field validation including valid
    patterns and error cases
  packages/shared/src/types/conversationAgents/schemas/__tests__/addAgentToConversationInputSchema.test.ts: Added test cases for color field validation and missing field scenarios
  packages/shared/src/repositories/conversationAgents/__tests__/ConversationAgentsRepository.test.ts:
    Updated test fixtures and mock setup to include color field and fix test
    isolation issues
log:
  - Successfully updated ConversationAgent types and schemas with required color
    field validation. Added comprehensive TypeScript interfaces, Zod schemas
    with CSS variable pattern validation (--agent-1 through --agent-8), and
    complete test coverage. Updated all repository methods, SQL queries, and
    test fixtures to include the new color field. All quality checks pass and
    shared packages build successfully.
schema: v1.0
childrenIds: []
created: 2025-09-11T19:05:20.776Z
updated: 2025-09-11T19:05:20.776Z
---

## Context

This task updates the TypeScript types and validation schemas to include the new `color` field for conversation agents, ensuring type safety and validation consistency across the application.

Reference: F-agent-color-assignment-system
Prerequisite: T-create-database-migration-for

## Specific Implementation Requirements

Update multiple type definition and schema files to include the `color` field with proper validation for CSS variable format.

**Files to Modify:**

- `/packages/shared/src/types/conversationAgents/ConversationAgent.ts`
- `/packages/shared/src/types/conversationAgents/schemas/conversationAgentSchema.ts`
- `/packages/shared/src/types/conversationAgents/schemas/addAgentToConversationInputSchema.ts`

**Technical Approach:**

1. Add required `color: string` field to ConversationAgent interface
2. Update Zod schemas with validation for CSS variable pattern
3. Add JSDoc comments explaining color format and usage
4. Include unit tests for schema validation

## Detailed Acceptance Criteria

**Interface Updates:**

- ✅ `ConversationAgent` interface includes required `color: string` field
- ✅ JSDoc comments explain CSS variable format (--agent-1 through --agent-8)
- ✅ Field is marked as required (not optional)

**Schema Validation:**

- ✅ `conversationAgentSchema` includes color field validation
- ✅ `addAgentToConversationInputSchema` includes optional color field
- ✅ Validation accepts CSS variable pattern: `--agent-[1-8]`
- ✅ Validation rejects invalid formats (wrong pattern, numbers outside 1-8)
- ✅ Clear error messages for invalid color values

**Type Safety:**

- ✅ All existing TypeScript code compiles without errors
- ✅ Color field is properly typed throughout the application
- ✅ No any types introduced

## Testing Requirements

**Unit Tests:**
Write unit tests in existing test files:

- Update `/packages/shared/src/types/conversationAgents/schemas/__tests__/conversationAgentSchema.test.ts`

**Test Cases:**

- Valid CSS variable formats (--agent-1, --agent-2, etc.)
- Invalid formats (missing dashes, wrong numbers, extra characters)
- Edge cases (--agent-9, --agent-0, empty string)
- Schema parsing with and without color field

**Expected Validation Pattern:**

```typescript
z.string().regex(
  /^--agent-[1-8]$/,
  "Color must be a valid agent CSS variable (--agent-1 through --agent-8)",
);
```

## Security Considerations

- Validate CSS variable pattern to prevent injection
- Ensure color values cannot contain malicious CSS
- Restrict to known safe color variable names

## Dependencies

- Database migration must complete before type updates
- Existing ConversationAgent usage throughout codebase

## Out of Scope

- Repository implementation changes (handled in subsequent task)
- IPC type updates (handled in subsequent task)
- UI component updates (handled in subsequent tasks)
