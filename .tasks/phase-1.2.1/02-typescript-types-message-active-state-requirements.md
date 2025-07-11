# Feature: TypeScript Types for Message Active State

**Implementation Order: 02**

This feature updates all TypeScript interfaces, validation schemas, and type definitions to support the new `isActive` property on messages, ensuring type safety throughout the application.

## Feature Components

- **Database Schema Types**: Update DatabaseMessage interface to include `isActive` field
- **Application Types**: Update shared Message interface for renderer/main communication
- **Validation Schemas**: Update Zod schemas for message validation and IPC communication
- **Type Consistency**: Ensure all message-related types are consistent across the codebase

## User Stories

- As a developer, I want TypeScript to catch type errors related to message active state so that I can identify issues at compile time
- As a developer, I want consistent type definitions across the application so that I can work with messages confidently
- As a developer, I want Zod validation to enforce the active state field so that invalid data is caught at runtime
- As a system, I want type safety for IPC communication so that message data is properly validated

## Functional Requirements

### Core Functionality

- FR-1: Add `isActive: boolean` property to DatabaseMessage interface
- FR-2: Add `isActive: boolean` property to shared Message interface
- FR-3: Update CreateMessageData to include optional `isActive` field with default true
- FR-4: Update all message-related TypeScript interfaces consistently

### Data Management

- FR-5: Update MessageSchema Zod validation to include `isActive` boolean field
- FR-6: Update CreateMessageSchema to include optional `isActive` field with default true
- FR-7: Update SanitizedCreateMessageSchema to include `isActive` validation
- FR-8: Ensure all message validation schemas are consistent

### Integration Points

- FR-9: Update IPC schema validation for message operations
- FR-10: Update database query type definitions to handle active state
- FR-11: Ensure type compatibility between database and application layers

## Technical Requirements

### Technology Stack

- TR-1: Use TypeScript strict mode for all type definitions
- TR-2: Follow existing Zod validation patterns from database-schema.ts
- TR-3: Maintain compatibility with better-sqlite3 database types
- TR-4: Use consistent naming conventions (isActive, not is_active) in TypeScript

### Performance & Scalability

- TR-5: Ensure type definitions don't impact bundle size significantly
- TR-6: Use efficient Zod validation patterns for performance
- TR-7: Maintain compile-time type checking performance

### Security & Compliance

- TR-8: Validate `isActive` field against boolean type injection
- TR-9: Ensure Zod schemas prevent malicious data from bypassing validation
- TR-10: Add proper type guards for message active state

## Architecture Context

### System Integration

- AC-1: Integrates with existing type system in src/shared/types/
- AC-2: Updates database schema types in src/main/database/schema/
- AC-3: Maintains consistency between database and application type layers

### Technical Patterns

- AC-4: Follows existing interface naming patterns (DatabaseMessage, Message)
- AC-5: Uses Zod validation schema pattern for runtime type checking
- AC-6: Maintains separation between database and application type definitions

### File Structure Implications

- AC-7: Updates src/main/database/schema/DatabaseMessage.ts
- AC-8: Updates src/shared/types/index.ts for Message interface
- AC-9: Updates src/shared/types/validation/database-schema.ts for Zod schemas

## Acceptance Criteria

### Functional Acceptance

- [ ] AC-1: DatabaseMessage interface includes `is_active: number` field (SQLite INTEGER)
- [ ] AC-2: Message interface includes `isActive: boolean` field (application layer)
- [ ] AC-3: CreateMessageData includes optional `isActive` field with default true
- [ ] AC-4: All message-related interfaces compile without TypeScript errors
- [ ] AC-5: Zod validation accepts valid message data with isActive field

### Technical Acceptance

- [ ] AC-6: TypeScript strict mode compilation passes
- [ ] AC-7: All existing message-related code compiles with new types
- [ ] AC-8: Zod validation rejects invalid isActive values
- [ ] AC-9: Type definitions are consistent across all layers
- [ ] AC-10: No breaking changes to existing API contracts

### Quality Gates

- [ ] AC-11: Type coverage remains at 100% for message-related code
- [ ] AC-12: All validation schemas have corresponding TypeScript types
- [ ] AC-13: Database-to-application type mapping is consistent
- [ ] AC-14: No TypeScript any types introduced

## Implementation Hints

Guidance for the planning phase to create appropriate tasks:

### Suggested Task Groupings

1. **Database Schema Types** (3-4 tasks)
   - Update DatabaseMessage interface with is_active field
   - Update database schema exports
   - Add type guards for database message validation
   - Test database type compatibility

2. **Application Types** (4-5 tasks)
   - Update shared Message interface with isActive field
   - Update CreateMessageData interface
   - Update message-related type exports
   - Add type utilities for message active state

3. **Validation Schemas** (5-7 tasks)
   - Update MessageSchema Zod validation
   - Update CreateMessageSchema with optional isActive
   - Update SanitizedCreateMessageSchema
   - Add validation tests for isActive field
   - Update IPC validation schemas
   - Test validation edge cases

4. **Type Consistency and Testing** (3-4 tasks)
   - Verify type consistency across all layers
   - Update type tests
   - Add integration tests for type validation
   - Document type mapping conventions

### Critical Implementation Notes

- Start with DatabaseMessage interface as it's the foundation
- Maintain careful distinction between database (is_active: number) and application (isActive: boolean) types
- Use proper type mapping between database and application layers
- Test validation schemas thoroughly to ensure they catch edge cases

## Constraints & Assumptions

### Technical Constraints

- CA-1: Must maintain compatibility with SQLite INTEGER type for database layer
- CA-2: Cannot introduce breaking changes to existing message interfaces
- CA-3: Must work with existing Zod validation patterns

### Business Constraints

- CA-4: Type changes must not break existing functionality
- CA-5: Migration from old to new types must be seamless

### Assumptions

- CA-6: Database migration will be completed before type updates are used
- CA-7: All message-related code will be updated to use new types
- CA-8: Type checking will catch integration issues during development

## Risks & Mitigation

### Technical Risks

- Risk 1: Type mismatch between database and application layers - Mitigation: Implement proper type mapping functions
- Risk 2: Breaking changes to existing code - Mitigation: Comprehensive testing of all message-related functionality
- Risk 3: Validation schema conflicts - Mitigation: Careful testing of all validation scenarios

### Schedule Risks

- Risk 4: Complex type dependencies cause delays - Mitigation: Start with foundational types and work outward

## Dependencies

### Upstream Dependencies

- Requires completion of: Database migration for is_active field
- Needs output from: Updated database schema structure

### Downstream Impact

- Blocks: Message state management implementation
- Enables: IPC handler updates for message active state

## See Also

### Specifications

- `docs/specifications/implementation-plan.md` - Phase 1.2.1 details
- `docs/specifications/chat-room-mechanics-spec.md` - Message active state requirements

### Technical Documentation

- `CLAUDE.md` - TypeScript coding standards
- `docs/technical/coding-standards.md`
- `src/shared/types/` - Current type definitions

### Related Features

- `.tasks/phase-1.2.1/01-database-migration-message-active-state-requirements.md`
- `.tasks/phase-1.2.1/03-message-active-state-management-requirements.md`
