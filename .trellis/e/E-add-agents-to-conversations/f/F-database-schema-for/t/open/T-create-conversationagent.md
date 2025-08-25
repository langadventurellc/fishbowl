---
id: T-create-conversationagent
title: Create ConversationAgent interface and related types
status: open
priority: high
parent: F-database-schema-for
prerequisites:
  - T-create-database-migration
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-25T03:06:19.511Z
updated: 2025-08-25T03:06:19.511Z
---

# Create ConversationAgent Interface and Related Types

## Context

Create comprehensive TypeScript type definitions for the ConversationAgent domain, following established patterns in the conversations types directory. These types provide the foundation for type-safe database operations and service layer interactions.

**Related Issues:**

- Parent Feature: F-database-schema-for
- Parent Epic: E-add-agents-to-conversations
- Prerequisite: T-create-database-migration (database schema must be defined first)

## Technical Requirements

### Directory Structure

Follow existing pattern from `packages/shared/src/types/conversations/`:

```
packages/shared/src/types/conversationAgents/
├── ConversationAgent.ts              # Core interface
├── CreateConversationAgentInput.ts   # Input type for creation
├── UpdateConversationAgentInput.ts   # Input type for updates
├── ConversationAgentResult.ts        # Result type for operations
├── index.ts                          # Barrel exports
├── schemas/
│   ├── conversationAgentSchema.ts           # Zod schema
│   ├── createConversationAgentInputSchema.ts # Input validation
│   ├── updateConversationAgentInputSchema.ts # Update validation
│   ├── index.ts                            # Schema barrel exports
│   └── __tests__/
│       ├── conversationAgentSchema.test.ts
│       ├── createConversationAgentInputSchema.test.ts
│       └── updateConversationAgentInputSchema.test.ts
├── errors/
│   ├── ConversationAgentNotFoundError.ts
│   ├── ConversationAgentValidationError.ts
│   ├── index.ts
│   └── __tests__/
│       ├── ConversationAgentNotFoundError.test.ts
│       └── ConversationAgentValidationError.test.ts
└── __tests__/
    ├── exports.test.ts
    └── types.test.ts
```

## Core Type Definitions

### ConversationAgent Interface

```typescript
/**
 * Represents a conversation-agent association entity
 * Links configured agents to specific conversations for multi-agent interactions
 */
export interface ConversationAgent {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Foreign key reference to conversation */
  conversationId: string;
  /** Configuration ID referencing agent settings (NOT a database foreign key) */
  agentId: string;
  /** ISO 8601 timestamp when agent was added to conversation */
  addedAt: string;
  /** Whether this agent association is currently active */
  isActive: boolean;
  /** Display ordering for UI presentation (future enhancement) */
  displayOrder: number;
}
```

### Input Types

```typescript
// CreateConversationAgentInput.ts
export interface CreateConversationAgentInput {
  conversationId: string;
  agentId: string;
  displayOrder?: number;
}

// UpdateConversationAgentInput.ts
export interface UpdateConversationAgentInput {
  isActive?: boolean;
  displayOrder?: number;
}
```

### Result Types

```typescript
// ConversationAgentResult.ts
export interface ConversationAgentResult {
  success: boolean;
  data?: ConversationAgent;
  error?: string;
}
```

## Validation Schemas

### Zod Schemas

Create comprehensive validation schemas following existing patterns:

```typescript
// schemas/conversationAgentSchema.ts
export const conversationAgentSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  agentId: z.string().min(1, "Agent ID is required"),
  addedAt: z.string().datetime(),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0),
});

// schemas/createConversationAgentInputSchema.ts
export const createConversationAgentInputSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation ID format"),
  agentId: z.string().min(1, "Agent ID is required"),
  displayOrder: z.number().int().min(0).optional(),
});

// schemas/updateConversationAgentInputSchema.ts
export const updateConversationAgentInputSchema = z
  .object({
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
```

## Error Types

### Custom Error Classes

```typescript
// errors/ConversationAgentNotFoundError.ts
export class ConversationAgentNotFoundError extends Error {
  constructor(id: string) {
    super(`Conversation agent not found: ${id}`);
    this.name = "ConversationAgentNotFoundError";
  }
}

// errors/ConversationAgentValidationError.ts
export class ConversationAgentValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(`Conversation agent validation failed: ${message}`);
    this.name = "ConversationAgentValidationError";
  }
}
```

## Implementation Details

### JSDoc Documentation

- All interfaces must include comprehensive JSDoc comments
- Document the purpose and relationship of agent_id to configuration system
- Explain the non-foreign-key nature of agent_id field
- Include usage examples where appropriate

### Type Safety Features

- All string fields that represent UUIDs should be typed as strings with UUID validation
- Use optional fields appropriately in input types
- Provide union types where multiple states are possible
- Include proper null/undefined handling

### Consistency with Existing Code

- Follow exact naming conventions from conversations types
- Use same file structure and organization
- Match comment styles and formatting
- Follow same export patterns and barrel file structure

## Acceptance Criteria

### Type Definition Requirements

- [ ] Core `ConversationAgent` interface created with all required fields
- [ ] Input types created for create and update operations
- [ ] Result types created for consistent operation responses
- [ ] All types include comprehensive JSDoc documentation
- [ ] Field types match database schema exactly

### Validation Schema Requirements

- [ ] Zod schemas created for all core types and inputs
- [ ] Validation rules match business requirements
- [ ] Error messages are user-friendly and actionable
- [ ] Schemas handle edge cases and validation scenarios
- [ ] Schema tests cover all validation paths

### Error Handling Requirements

- [ ] Custom error classes created for domain-specific errors
- [ ] Error inheritance structure follows existing patterns
- [ ] Error messages provide clear context for debugging
- [ ] Error types exported correctly from error barrel

### Code Quality Requirements

- [ ] All files follow established TypeScript formatting standards
- [ ] Consistent naming conventions with existing codebase
- [ ] Proper barrel file exports for clean importing
- [ ] Complete test coverage for all types and schemas
- [ ] Files organized following established directory structure

### Integration Requirements

- [ ] Types integrate seamlessly with existing conversation types
- [ ] No circular dependencies or import conflicts
- [ ] Schemas work correctly with existing validation patterns
- [ ] Error types integrate with existing error handling

## Testing Strategy

### Unit Tests Required

- Schema validation tests (success and failure cases)
- Error class instantiation and message formatting
- Type exports and barrel file functionality
- Input validation edge cases
- Integration with existing type system

### Test Files Structure

```
__tests__/
├── conversationAgentSchema.test.ts     # Core schema validation
├── createConversationAgentInputSchema.test.ts  # Input validation
├── updateConversationAgentInputSchema.test.ts  # Update validation
├── ConversationAgentNotFoundError.test.ts      # Error classes
├── ConversationAgentValidationError.test.ts    # Error classes
├── exports.test.ts                     # Barrel exports
└── types.test.ts                       # Type structure
```

## Dependencies

- **Prerequisite**: T-create-database-migration (database schema)
- **External**: zod (for validation schemas)
- **Patterns**: Follow `packages/shared/src/types/conversations/` structure

## Files to Create

- 15+ TypeScript files across the full directory structure
- Comprehensive test suite with 100% coverage
- Proper barrel file exports for clean imports

## Integration Points

- Must integrate with existing conversation types
- Will be consumed by ConversationAgentsRepository
- Used by service layer for validation
- Exported from main shared package barrel

## Reference Materials

- Existing pattern: `packages/shared/src/types/conversations/`
- Database schema: `migrations/002_create_conversation_agents.sql`
- Validation patterns: existing schema files in conversations types
