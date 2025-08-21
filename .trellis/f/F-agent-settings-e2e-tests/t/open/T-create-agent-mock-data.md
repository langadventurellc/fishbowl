---
id: T-create-agent-mock-data
title: Create Agent Mock Data Generators
status: open
priority: medium
parent: F-agent-settings-e2e-tests
prerequisites:
  - T-create-agent-test-infrastructu
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-21T00:29:02.507Z
updated: 2025-08-21T00:29:02.507Z
---

# Create Agent Mock Data Generators

## Context

Create mock data generation utilities for agent settings tests, following established patterns from existing settings test helpers. These utilities provide consistent test data for various agent testing scenarios including valid agents, invalid agents, and edge cases.

## Implementation Requirements

### Files to Create

1. **`tests/desktop/helpers/settings/createMockAgentData.ts`**
   - Generate valid agent data for creation tests
   - Support multiple agent variations
   - Provide realistic agent configurations

2. **`tests/desktop/helpers/settings/createInvalidAgentData.ts`**
   - Generate invalid agent data for validation tests
   - Cover various validation error scenarios
   - Support testing different validation rules

3. **`tests/desktop/helpers/settings/MockAgentData.ts`**
   - Define TypeScript interfaces for mock agent data
   - Ensure type safety across test files
   - Match actual agent data structures

## Technical Approach

### createMockAgentData.ts Implementation

```typescript
import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createMockAgentData = (
  overrides: Partial<AgentFormData> = {},
): AgentFormData => {
  return {
    name: "Test Agent",
    role: "analyst", // Use actual role ID from system
    personality: "professional", // Use actual personality ID from system
    model: "claude-3-sonnet", // Use actual model from system
    description: "A test agent for automated testing",
    ...overrides,
  };
};

export const createMockAnalystAgent = (): AgentFormData => {
  return createMockAgentData({
    name: "Research Analyst",
    role: "analyst",
    personality: "analytical",
    description: "Specialized in data analysis and research",
  });
};

export const createMockWriterAgent = (): AgentFormData => {
  return createMockAgentData({
    name: "Content Writer",
    role: "writer",
    personality: "creative",
    description: "Creative writing and content generation specialist",
  });
};

export const createMockTechnicalAgent = (): AgentFormData => {
  return createMockAgentData({
    name: "Technical Expert",
    role: "technical",
    personality: "logical",
    description: "Technical problem solving and system analysis",
  });
};

// Generate agent with long name for testing limits
export const createLongNameAgentData = (): AgentFormData => {
  return createMockAgentData({
    name: "A".repeat(100), // Test name length limits
  });
};

// Generate agent with special characters for testing validation
export const createSpecialCharAgentData = (): AgentFormData => {
  return createMockAgentData({
    name: "Agent with Special @#$% Characters",
    description: "Testing special character handling in descriptions",
  });
};
```

### createInvalidAgentData.ts Implementation

```typescript
import type { AgentFormData } from "@fishbowl-ai/ui-shared";

export const createInvalidAgentData = (
  type: "empty-name" | "duplicate-name" | "invalid-role" | "missing-fields",
): Partial<AgentFormData> => {
  switch (type) {
    case "empty-name":
      return {
        name: "",
        role: "analyst",
        personality: "professional",
        model: "claude-3-sonnet",
        description: "Agent with empty name",
      };

    case "duplicate-name":
      return {
        name: "Existing Agent", // Should match an existing agent name in tests
        role: "analyst",
        personality: "professional",
        model: "claude-3-sonnet",
        description: "Agent with duplicate name",
      };

    case "invalid-role":
      return {
        name: "Invalid Role Agent",
        role: "non-existent-role",
        personality: "professional",
        model: "claude-3-sonnet",
        description: "Agent with invalid role",
      };

    case "missing-fields":
      return {
        name: "Incomplete Agent",
        // Missing required fields
      };

    default:
      throw new Error(`Invalid agent data type: ${type}`);
  }
};

export const createDuplicateNameAgentData = (
  existingName: string,
): AgentFormData => {
  return {
    name: existingName,
    role: "analyst",
    personality: "professional",
    model: "claude-3-sonnet",
    description: "Agent with duplicate name for testing validation",
  };
};

export const createMinimalAgentData = (): Partial<AgentFormData> => {
  return {
    name: "Minimal Agent",
    // Only include minimum required fields for testing
  };
};
```

### MockAgentData.ts Implementation

```typescript
// Re-export types from shared package for consistency
export type {
  AgentFormData,
  AgentCard as AgentCardType,
} from "@fishbowl-ai/ui-shared";

// Additional mock-specific types if needed
export interface MockAgentConfig {
  name: string;
  role: string;
  personality: string;
  model: string;
  description?: string;
}

export interface MockAgentVariant {
  type:
    | "basic"
    | "analyst"
    | "writer"
    | "technical"
    | "long-name"
    | "special-chars";
  data: AgentFormData;
}
```

## Integration with Existing Patterns

### Follow Established Mock Data Patterns

- Study `/tests/desktop/helpers/settings/createMockRoleData.ts`
- Study `/tests/desktop/helpers/settings/createMockPersonalityData.ts`
- Study `/tests/desktop/helpers/settings/MockRoleData.ts`
- Follow consistent naming conventions and data structures

### Data Realism

- Use realistic agent names and descriptions
- Reference actual roles and personalities from the system
- Ensure model names match available AI models
- Include variety for comprehensive testing coverage

## Acceptance Criteria

### Functional Requirements

- ✅ createMockAgentData generates valid agent data structures
- ✅ Supports overrides for customizing specific fields
- ✅ Provides variety of agent types (analyst, writer, technical)
- ✅ createInvalidAgentData covers all validation error scenarios
- ✅ Generates data that triggers specific validation rules
- ✅ MockAgentData types match actual agent data structures

### Technical Requirements

- ✅ Follow exact patterns from existing mock data generators
- ✅ Use proper TypeScript types from @fishbowl-ai/ui-shared
- ✅ Export functions in consistent format
- ✅ Include JSDoc documentation for complex functions
- ✅ Handle edge cases like very long names and special characters

### Integration Requirements

- ✅ Works seamlessly with agent form components
- ✅ Integrates with test infrastructure and helpers
- ✅ Supports all planned test scenarios
- ✅ Can be imported cleanly via index.ts barrel exports

## Implementation Guidance

### File Locations

- `tests/desktop/helpers/settings/createMockAgentData.ts`
- `tests/desktop/helpers/settings/createInvalidAgentData.ts`
- `tests/desktop/helpers/settings/MockAgentData.ts`

### Dependencies to Study

- `/tests/desktop/helpers/settings/createMockRoleData.ts`
- `/tests/desktop/helpers/settings/createMockPersonalityData.ts`
- `/tests/desktop/helpers/settings/MockRoleData.ts`
- `@fishbowl-ai/ui-shared` types for AgentFormData

### Data Considerations

- Ensure agent names are unique within test scenarios
- Use realistic role and personality combinations
- Include edge cases for comprehensive validation testing
- Support both positive and negative test scenarios

## Security Considerations

- No sensitive data in mock agents
- Use test-safe descriptions and names
- Avoid any real user information or API keys

## Testing Strategy

- Mock data should support creation, editing, and validation tests
- Provide enough variety for comprehensive test coverage
- Include edge cases and boundary conditions
- Support both individual and bulk test scenarios

## Notes

These mock data generators enable consistent, reliable test data across all agent test files. The data must be realistic enough to test actual functionality while being clearly identifiable as test data.
