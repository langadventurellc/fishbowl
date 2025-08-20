---
id: T-update-agent-types-to-remove
title: Update Agent Types to Remove LLM Parameters and Add New Personality Behaviors
status: open
priority: high
parent: F-remove-agent-defaults-and
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T18:29:43.781Z
updated: 2025-08-20T18:29:43.781Z
---

## Context

Update the `Agent` type definition and related interfaces to remove LLM parameters (temperature, maxTokens, topP) and add the three new personality behaviors (responseLength, randomness, focus). This provides the foundational type structure for the simplified agent configuration.

**Related Feature**: F-remove-agent-defaults-and  
**File Location**: `packages/shared/src/types/agent.ts`

## Implementation Requirements

### Primary Deliverables

1. **Update PersonalityBehaviors Type**
   - Add `responseLength?: number` to PersonalityBehaviors interface
   - Add `randomness?: number` to PersonalityBehaviors interface
   - Add `focus?: number` to PersonalityBehaviors interface
   - Maintain existing behaviors (humor, formality, brevity, assertiveness)

2. **Update Agent Interface**
   - Remove `temperature?: number` from Agent interface
   - Remove `maxTokens?: number` from Agent interface
   - Remove `topP?: number` from Agent interface
   - Ensure PersonalityBehaviors includes new behavior types

3. **Add Unit Tests for Type Definitions**
   - Test PersonalityBehaviors type includes all 7 behaviors
   - Test Agent type excludes removed LLM parameters
   - Verify type compatibility with form structures

### Technical Approach

**Current PersonalityBehaviors Type (from research):**

```typescript
export type PersonalityBehaviors = {
  humor?: number;
  formality?: number;
  brevity?: number;
  assertiveness?: number;
};
```

**Target PersonalityBehaviors Type:**

```typescript
export type PersonalityBehaviors = {
  humor?: number;
  formality?: number;
  brevity?: number;
  assertiveness?: number;
  responseLength?: number;
  randomness?: number;
  focus?: number;
};
```

**Agent Interface Updates:**

```typescript
// Remove from Agent interface:
temperature?: number;
maxTokens?: number;
topP?: number;

// Ensure Agent interface includes:
personalityBehaviors?: PersonalityBehaviors;
```

### Step-by-Step Implementation

**Step 1: Update PersonalityBehaviors Type**

1. Locate the `PersonalityBehaviors` type in `packages/shared/src/types/agent.ts`
2. Add the three new behavior properties:
   - `responseLength?: number;`
   - `randomness?: number;`
   - `focus?: number;`
3. Maintain existing behavior properties

**Step 2: Update Agent Interface**

1. Locate the `Agent` interface in the same file
2. Remove temperature, maxTokens, and topP properties
3. Verify personalityBehaviors property uses updated PersonalityBehaviors type

**Step 3: Check for Related Types**

1. Look for any other interfaces that reference the removed LLM parameters
2. Update or remove those references as needed
3. Ensure no broken type references remain

**Step 4: Create/Update Unit Tests**
Create test file: `packages/shared/src/types/__tests__/agent.test.ts`

```typescript
import { PersonalityBehaviors, Agent } from "../agent";

describe("Agent Types", () => {
  describe("PersonalityBehaviors", () => {
    it("includes all 7 personality behavior types", () => {
      const behaviors: PersonalityBehaviors = {
        // Existing behaviors
        humor: 0,
        formality: 0,
        brevity: 0,
        assertiveness: 0,
        // New behaviors
        responseLength: 0,
        randomness: 0,
        focus: 0,
      };

      // TypeScript will catch if any required properties are missing
      expect(behaviors).toBeDefined();
    });

    it("allows partial personality behavior objects", () => {
      const partialBehaviors: PersonalityBehaviors = {
        humor: 50,
        responseLength: -30,
      };

      expect(partialBehaviors).toBeDefined();
    });

    it("accepts valid number ranges for behaviors", () => {
      const behaviors: PersonalityBehaviors = {
        humor: -100,
        formality: 100,
        brevity: 0,
        assertiveness: 75,
        responseLength: -50,
        randomness: 25,
        focus: -75,
      };

      expect(behaviors).toBeDefined();
    });
  });

  describe("Agent Interface", () => {
    it("does not include removed LLM parameters", () => {
      const agent: Agent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        // Verify these don't exist on Agent type (TypeScript will catch if they do)
        // temperature: 0.7,     // Should cause TypeScript error
        // maxTokens: 4096,     // Should cause TypeScript error
        // topP: 1,             // Should cause TypeScript error
      };

      // This test mainly serves as TypeScript validation
      expect(agent).toBeDefined();
    });

    it("supports personality behaviors with new types", () => {
      const agent: Agent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        personalityBehaviors: {
          humor: 25,
          formality: -10,
          brevity: 50,
          assertiveness: 0,
          responseLength: 75,
          randomness: -25,
          focus: 100,
        },
      };

      expect(agent.personalityBehaviors).toBeDefined();
      expect(agent.personalityBehaviors?.responseLength).toBe(75);
      expect(agent.personalityBehaviors?.randomness).toBe(-25);
      expect(agent.personalityBehaviors?.focus).toBe(100);
    });

    it("allows agents without personality behaviors", () => {
      const agent: Agent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
      };

      expect(agent.personalityBehaviors).toBeUndefined();
    });
  });
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] PersonalityBehaviors type includes responseLength, randomness, focus properties
- [ ] PersonalityBehaviors type maintains existing humor, formality, brevity, assertiveness properties
- [ ] Agent interface excludes temperature, maxTokens, topP properties
- [ ] Agent interface supports updated PersonalityBehaviors type

### Technical Requirements

- [ ] TypeScript compilation succeeds without errors
- [ ] No broken type references to removed LLM parameters
- [ ] PersonalityBehaviors properties are optional (number | undefined)
- [ ] Type definitions support both full and partial personality behavior objects

### Testing Requirements

- [ ] Unit test verifies PersonalityBehaviors includes all 7 behavior types
- [ ] Unit test confirms Agent type excludes LLM parameters
- [ ] Unit test validates personality behavior type compatibility
- [ ] Unit test checks partial personality behavior objects work
- [ ] Tests pass with `pnpm test` command

## Files to Modify

1. **Primary File**: `packages/shared/src/types/agent.ts`
2. **Test File**: `packages/shared/src/types/__tests__/agent.test.ts` (create if doesn't exist)

## Dependencies

**Prerequisites**: None - this task can be completed independently

**Blocks**:

- Schema updates that depend on type definitions
- Store updates that use Agent types
- Form components that use PersonalityBehaviors types

## Security Considerations

**Type Safety**: Removing LLM parameters from type definitions prevents accidental inclusion of these values in data processing, improving type safety.

## Testing Strategy

**Unit Testing Approach:**

- Test type definitions with TypeScript compiler
- Verify complete and partial PersonalityBehaviors objects
- Confirm Agent interface excludes removed parameters
- Test type compatibility with expected use cases

**TypeScript Testing:**
The tests primarily serve as TypeScript validation - if the types are incorrect, the tests won't compile.

**Test Commands:**

```bash
# Run specific type tests
pnpm test agent.test.ts

# Run type checking (most important for this task)
pnpm type-check

# Run linting
pnpm lint
```

## Implementation Notes

- Use exact property names to match PersonalityForm behavior IDs
- Maintain optional (?) properties for all personality behaviors
- Ensure no breaking changes to existing Agent interface usage
- Remove LLM parameters completely - don't mark as optional or deprecated
- Follow existing type definition patterns in the file

## Success Criteria

1. **Complete Type Updates**: PersonalityBehaviors includes all 7 behavior types
2. **Clean Removal**: Agent interface completely excludes LLM parameters
3. **Type Safety**: TypeScript compilation succeeds without errors
4. **Backward Compatible**: Existing Agent usage continues to work
5. **Test Coverage**: Unit tests verify type definition correctness
6. **Quality Checks**: TypeScript and ESLint pass without errors

This task establishes the foundational type system for the simplified agent configuration, ensuring type safety throughout the application while supporting enhanced personality customization.
