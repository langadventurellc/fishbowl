---
id: T-create-custom-error-classes
title: Create custom error classes
status: done
priority: medium
parent: F-conversation-types-and
prerequisites:
  - T-create-core-conversation
affectedFiles:
  packages/shared/src/types/conversations/errors/ConversationNotFoundError.ts:
    Created ConversationNotFoundError class extending Error with conversationId
    property and toJSON serialization method
  packages/shared/src/types/conversations/errors/ConversationValidationError.ts:
    Created ConversationValidationError class extending Error with validation
    error details array and toJSON serialization method
  packages/shared/src/types/conversations/errors/index.ts: Created barrel export file for both error classes
  packages/shared/src/types/conversations/errors/__tests__/ConversationNotFoundError.test.ts:
    Comprehensive test suite covering constructor, inheritance, serialization,
    and error properties for ConversationNotFoundError
  packages/shared/src/types/conversations/errors/__tests__/ConversationValidationError.test.ts:
    Complete test coverage for ConversationValidationError including
    single/multiple errors, inheritance, serialization, and edge cases
log:
  - Implemented custom error classes for conversation-related failures. Created
    ConversationNotFoundError and ConversationValidationError classes following
    existing error patterns in the codebase. Both errors extend base Error class
    with proper prototype chain maintenance, include serialization methods for
    IPC transport, and have comprehensive test coverage. All quality checks
    pass.
schema: v1.0
childrenIds: []
created: 2025-08-23T06:29:43.227Z
updated: 2025-08-23T06:29:43.227Z
---

# Create Custom Error Classes

## Context

Implement custom error classes for conversation-related failures. These errors must be serializable for IPC communication and follow existing error patterns in the codebase.

Reference existing patterns:

- `packages/shared/src/services/database/types/DatabaseError.ts` for base error patterns
- `packages/shared/src/services/storage/errors/` for error class organization

## Implementation Requirements

### 1. Create ConversationNotFoundError

File: `packages/shared/src/types/conversations/errors/ConversationNotFoundError.ts`

```typescript
/**
 * Error thrown when a conversation cannot be found
 */
export class ConversationNotFoundError extends Error {
  readonly conversationId: string;

  constructor(conversationId: string) {
    super(`Conversation not found: ${conversationId}`);
    this.name = "ConversationNotFoundError";
    this.conversationId = conversationId;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ConversationNotFoundError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      conversationId: this.conversationId,
      stack: this.stack,
    };
  }
}
```

### 2. Create ConversationValidationError

File: `packages/shared/src/types/conversations/errors/ConversationValidationError.ts`

```typescript
interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Error thrown when conversation data fails validation
 */
export class ConversationValidationError extends Error {
  readonly errors: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    const message = `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`;
    super(message);
    this.name = "ConversationValidationError";
    this.errors = errors;

    Object.setPrototypeOf(this, ConversationValidationError.prototype);
  }

  /**
   * Serialize error for IPC transport
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors,
      stack: this.stack,
    };
  }
}
```

### 3. Create Error Barrel Export

File: `packages/shared/src/types/conversations/errors/index.ts`

```typescript
export { ConversationNotFoundError } from "./ConversationNotFoundError";
export { ConversationValidationError } from "./ConversationValidationError";
```

## Technical Approach

1. Extend base Error class
2. Set proper prototype chain for instanceof checks
3. Include serialization method for IPC
4. Store relevant context (ID, validation errors)
5. Provide clear error messages

## Acceptance Criteria

- ✓ Both error classes extend Error properly
- ✓ Prototype chain maintained for instanceof checks
- ✓ toJSON() method for IPC serialization
- ✓ Clear, informative error messages
- ✓ Proper TypeScript typing
- ✓ Barrel export file created

## Testing Requirements

Create unit tests for each error class:

File: `packages/shared/src/types/conversations/errors/__tests__/ConversationNotFoundError.test.ts`

- Test error construction with ID
- Test error message format
- Test instanceof Error and ConversationNotFoundError
- Test toJSON serialization
- Test stack trace preservation

File: `packages/shared/src/types/conversations/errors/__tests__/ConversationValidationError.test.ts`

- Test error construction with validation details
- Test message formatting with multiple errors
- Test instanceof checks
- Test toJSON serialization
- Test empty errors array handling

## Security Considerations

- Don't expose sensitive data in error messages
- Sanitize conversation IDs in error messages
- Ensure stack traces don't leak implementation details
- Keep error messages user-friendly
