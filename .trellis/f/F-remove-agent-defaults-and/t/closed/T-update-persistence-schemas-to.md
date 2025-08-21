---
id: T-update-persistence-schemas-to
title: Update Persistence Schemas to Remove Defaults and Support New Personality
  Behaviors
status: done
priority: high
parent: F-remove-agent-defaults-and
prerequisites:
  - T-update-agent-types-to-remove
affectedFiles:
  packages/shared/src/types/agents/persistedAgentsSettingsSchema.ts:
    Added PersonalityBehaviorsSchema with full validation for all 7 personality
    behaviors (including new responseLength, randomness, focus). Updated
    persistedAgentSchema to include personalityBehaviors field. Schema validates
    behavior values in -100 to 100 range with clear error messages.
  packages/shared/src/types/agents/__tests__/persistedAgentsSettingsSchema.test.ts:
    "Added comprehensive unit tests for PersonalityBehaviorsSchema and updated
    persistedAgentsSettingsSchema tests. Added 8 new test cases covering all
    validation scenarios: full behaviors, partial behaviors, empty behaviors,
    out-of-range values, non-numeric values, boundary values, and agent schema
    validation with personality behaviors."
log:
  - Analyzing task requirements against current codebase state. Found that most
    persistence schema work has already been completed according to the
    feature's affected files list. The persistedAgentsSettingsSchema.ts has
    already been updated to remove AgentDefaultsSchema and LLM parameters.
    Checking if any additional schema creation is needed.
  - Successfully updated persistence schemas to remove agent defaults
    functionality and support new personality behaviors. Added
    PersonalityBehaviorsSchema with comprehensive validation for all 7 behavior
    types (humor, formality, brevity, assertiveness, responseLength, randomness,
    focus) with proper range validation (-100 to 100). Updated
    persistedAgentSchema to include personalityBehaviors field. Created
    extensive unit tests covering all validation scenarios including
    positive/negative cases, boundary values, partial behaviors, and empty
    states. All tests pass (16/16) and quality checks succeed. Schema now
    properly validates the simplified agent data structure without LLM
    parameters while supporting enhanced personality customization.
schema: v1.0
childrenIds: []
created: 2025-08-20T18:30:24.522Z
updated: 2025-08-20T18:30:24.522Z
---

## Context

Update the persistence schemas to remove agent defaults functionality and support the three new personality behaviors. This involves removing `AgentDefaultsSchema` completely, updating `AgentsDataSchema` to exclude defaults, and ensuring `AgentSchema` supports the enhanced personality configuration.

**Related Feature**: F-remove-agent-defaults-and  
**File Location**: `packages/shared/src/schemas/persistence/agentsSchema.ts`

## Implementation Requirements

### Primary Deliverables

1. **Remove AgentDefaultsSchema**
   - Remove the entire `AgentDefaultsSchema` Zod schema definition
   - Remove the exported `AgentDefaults` type derived from the schema
   - Clean up any imports or exports related to defaults

2. **Update AgentsDataSchema**
   - Remove `defaultAgentSettings` field from `AgentsDataSchema`
   - Simplify schema to include only the `agents` array
   - Update schema validation to work with simplified structure

3. **Update AgentSchema for New Personality Behaviors**
   - Remove temperature, maxTokens, topP fields from `AgentSchema`
   - Ensure personalityBehaviors field supports new behavior types (responseLength, randomness, focus)
   - Update schema validation for personality behaviors

4. **Add Unit Tests for Schema Validation**
   - Test AgentsDataSchema validates without defaults field
   - Test AgentSchema excludes removed LLM parameters
   - Test personality behaviors schema includes all 7 behaviors
   - Test schema validation with new personality behavior values

### Technical Approach

**Current Schema Structure (from research):**

```typescript
export const AgentDefaultsSchema = z.object({
  llmProviderId: z.string().nullable().optional(),
  modelId: z.string().nullable().optional(),
  systemPrompt: z.string().nullable().optional(),
  temperature: z.number().nullable().optional(),
  maxTokens: z.number().nullable().optional(),
  topP: z.number().nullable().optional(),
});

export type AgentDefaults = z.infer<typeof AgentDefaultsSchema>;

export const AgentsDataSchema = z.object({
  agents: z.array(AgentSchema),
  defaultAgentSettings: AgentDefaultsSchema.nullable().optional(),
});
```

**Target Schema Structure:**

```typescript
// Remove AgentDefaultsSchema entirely

export const AgentsDataSchema = z.object({
  agents: z.array(AgentSchema),
});

// Update AgentSchema to remove LLM parameters and support new personality behaviors
export const PersonalityBehaviorsSchema = z
  .object({
    humor: z.number().optional(),
    formality: z.number().optional(),
    brevity: z.number().optional(),
    assertiveness: z.number().optional(),
    responseLength: z.number().optional(),
    randomness: z.number().optional(),
    focus: z.number().optional(),
  })
  .optional();

// Update AgentSchema to use new PersonalityBehaviorsSchema and exclude LLM params
```

### Step-by-Step Implementation

**Step 1: Remove AgentDefaultsSchema**

1. Delete the entire `AgentDefaultsSchema` definition (lines ~45-52)
2. Remove the `AgentDefaults` type export
3. Remove any imports related to defaults functionality

**Step 2: Update AgentsDataSchema**

1. Modify `AgentsDataSchema` to remove `defaultAgentSettings` field
2. Simplify to only include `agents: z.array(AgentSchema)`

**Step 3: Update AgentSchema**

1. Remove temperature, maxTokens, topP fields from `AgentSchema`
2. Ensure personalityBehaviors field uses updated schema
3. Add PersonalityBehaviorsSchema if it doesn't exist

**Step 4: Create/Update Unit Tests**
Create test file: `packages/shared/src/schemas/persistence/__tests__/agentsSchema.test.ts`

```typescript
import { z } from "zod";
import {
  AgentsDataSchema,
  AgentSchema,
  PersonalityBehaviorsSchema,
} from "../agentsSchema";

describe("Agents Schema", () => {
  describe("AgentsDataSchema", () => {
    it("validates agents data without defaults field", () => {
      const validData = {
        agents: [
          {
            id: "test-id",
            name: "Test Agent",
            description: "Test description",
          },
        ],
      };

      expect(() => AgentsDataSchema.parse(validData)).not.toThrow();
    });

    it("rejects data with defaultAgentSettings field", () => {
      const invalidData = {
        agents: [],
        defaultAgentSettings: {
          temperature: 0.7,
          maxTokens: 4096,
        },
      };

      expect(() => AgentsDataSchema.parse(invalidData)).toThrow();
    });
  });

  describe("AgentSchema", () => {
    it("validates agent without LLM parameters", () => {
      const validAgent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        personalityBehaviors: {
          humor: 25,
          formality: -10,
          responseLength: 50,
          randomness: 0,
          focus: 75,
        },
      };

      expect(() => AgentSchema.parse(validAgent)).not.toThrow();
    });

    it("rejects agent with LLM parameters", () => {
      const invalidAgent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1,
      };

      expect(() => AgentSchema.parse(invalidAgent)).toThrow();
    });
  });

  describe("PersonalityBehaviorsSchema", () => {
    it("validates all 7 personality behaviors", () => {
      const validBehaviors = {
        humor: -100,
        formality: 100,
        brevity: 0,
        assertiveness: 50,
        responseLength: -50,
        randomness: 75,
        focus: -25,
      };

      expect(() =>
        PersonalityBehaviorsSchema?.parse(validBehaviors),
      ).not.toThrow();
    });

    it("validates partial personality behaviors", () => {
      const partialBehaviors = {
        humor: 50,
        responseLength: -30,
        focus: 100,
      };

      expect(() =>
        PersonalityBehaviorsSchema?.parse(partialBehaviors),
      ).not.toThrow();
    });

    it("validates empty personality behaviors object", () => {
      const emptyBehaviors = {};

      expect(() =>
        PersonalityBehaviorsSchema?.parse(emptyBehaviors),
      ).not.toThrow();
    });

    it("rejects invalid behavior values", () => {
      const invalidBehaviors = {
        humor: "invalid", // Should be number
        formality: 150, // Should be -100 to 100 range if validation exists
      };

      expect(() =>
        PersonalityBehaviorsSchema?.parse(invalidBehaviors),
      ).toThrow();
    });
  });
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] AgentDefaultsSchema completely removed from schema file
- [ ] AgentsDataSchema excludes defaultAgentSettings field
- [ ] AgentSchema excludes temperature, maxTokens, topP fields
- [ ] PersonalityBehaviorsSchema supports all 7 behavior types
- [ ] Schema validation works with simplified data structure

### Technical Requirements

- [ ] Zod schema compilation succeeds without errors
- [ ] TypeScript compilation succeeds without errors
- [ ] All schema exports are valid and importable
- [ ] No references to removed AgentDefaults type

### Testing Requirements

- [ ] Unit test verifies AgentsDataSchema rejects defaults field
- [ ] Unit test confirms AgentSchema excludes LLM parameters
- [ ] Unit test validates PersonalityBehaviorsSchema includes all 7 behaviors
- [ ] Unit test checks schema validation with new personality values
- [ ] Tests pass with `pnpm test` command

## Files to Modify

1. **Primary File**: `packages/shared/src/schemas/persistence/agentsSchema.ts`
2. **Test File**: `packages/shared/src/schemas/persistence/__tests__/agentsSchema.test.ts` (create if doesn't exist)

## Dependencies

**Prerequisites**:

- T-update-agent-types-to-remove (Agent types must be updated first)

**Blocks**:

- Store updates that use these schemas
- Data persistence and validation throughout the application

## Security Considerations

**Input Validation**: Ensure personality behavior values are properly validated to prevent invalid data storage. Consider adding range validation (e.g., -100 to 100) for behavior values.

## Testing Strategy

**Unit Testing Approach:**

- Test schema validation with valid and invalid data
- Verify removed fields are rejected by schema
- Test new personality behavior validation
- Confirm schema compilation and type generation

**Schema Testing:**

- Use Zod's built-in validation testing
- Test both positive cases (valid data) and negative cases (invalid data)
- Verify TypeScript type inference works correctly

**Test Commands:**

```bash
# Run specific schema tests
pnpm test agentsSchema

# Run type checking (important for schema types)
pnpm type-check

# Test schema compilation
pnpm build:libs
```

## Implementation Notes

- Completely remove AgentDefaultsSchema - don't leave commented out
- Update any JSDoc comments that reference removed schemas
- Consider adding range validation for personality behaviors (-100 to 100)
- Ensure PersonalityBehaviorsSchema uses .optional() for all behavior fields
- Test schema changes don't break existing data structures

## Success Criteria

1. **Clean Removal**: AgentDefaultsSchema and related types completely eliminated
2. **Simplified Structure**: AgentsDataSchema only includes agents array
3. **Updated Validation**: AgentSchema excludes LLM parameters and supports new behaviors
4. **Schema Integrity**: All Zod schemas compile and validate correctly
5. **Type Generation**: Schema-derived TypeScript types are accurate
6. **Test Coverage**: Unit tests verify all schema validation requirements
7. **Quality Checks**: TypeScript compilation and linting pass without errors

This task establishes the data validation foundation for the simplified agent configuration system while supporting enhanced personality customization options.
