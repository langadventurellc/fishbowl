---
kind: task
id: T-implement-custom-role-crud
title: Implement custom role CRUD operations integration tests with service coordination
status: open
priority: high
prerequisites: []
created: "2025-07-26T21:40:25.385110"
updated: "2025-07-26T21:40:25.385110"
schema_version: "1.1"
parent: F-role-management-custom-roles
---

# Custom Role CRUD Operations Integration Tests

Create comprehensive BDD integration tests for custom role CRUD operations focusing on Create, Read, Update, and Delete functionality through service layer integration with persistence, validation, and error handling.

## Context and References

- **Parent Feature**: F-role-management-custom-roles (Role Management Custom Roles Integration Tests)
- **Related Tests**: See existing pattern in `packages/shared/src/__tests__/integration/features/role-management/role-predefined-loading.integration.spec.ts`
- **Service Dependencies**: RoleService, PersistenceService, ValidationService integration
- **Test Framework**: Jest with BDD Given-When-Then structure

## Implementation Requirements

### File Location

Create: `packages/shared/src/__tests__/integration/features/role-management/role-custom-crud.integration.spec.ts`

### Test Structure

Follow existing BDD pattern with:

- Feature description with service integration focus
- Scenario groups for each CRUD operation
- Given-When-Then structure with detailed comments
- 30-second test timeout for integration operations
- Service mock setup and cleanup between tests

### CRUD Operations Coverage

#### Create Operations

- **Scenario**: Creating new custom role with complete validation
- **Given**: Valid custom role data with capabilities and constraints
- **When**: RoleService.createCustomRole() called with service integration
- **Then**: Role is validated, persisted, and accessible with proper metadata

#### Read Operations

- **Scenario**: Retrieving custom roles with data integrity
- **Given**: Existing custom roles in persistence layer
- **When**: RoleService.getCustomRoleById() and bulk retrieval operations
- **Then**: Complete role data returned with proper transformation and metadata

#### Update Operations

- **Scenario**: Modifying custom role with validation and versioning
- **Given**: Existing custom role ready for modification
- **When**: RoleService.updateCustomRole() with change validation
- **Then**: Changes validated, persisted, and version tracking maintained

#### Delete Operations

- **Scenario**: Removing custom roles with dependency checking
- **Given**: Custom roles with potential dependencies
- **When**: RoleService.deleteCustomRole() with dependency validation
- **Then**: Dependencies checked, cleanup performed, role removed safely

## Technical Approach

### Service Integration Pattern

```typescript
describe("Feature: Custom Role CRUD Operations Integration", () => {
  let roleService: jest.Mocked<RoleService>;
  let persistenceService: jest.Mocked<PersistenceService>;
  let validationService: jest.Mocked<ValidationService>;

  describe("Scenario: Creating custom role with validation", () => {
    it.skip("should create custom role through service integration", async () => {
      // Given - Valid custom role data and configured services
      // When - Creating through RoleService with validation
      // Then - Role created, validated, and persisted correctly
    });
  });
});
```

### Service Mock Setup

- Configure RoleService with persistence and validation dependencies
- Mock PersistenceService for storage operations and data retrieval
- Mock ValidationService for custom role validation and business rules
- Setup temporary data structures for test isolation

### Performance Requirements

- **Create operations**: Complete within 500ms including validation
- **Read operations**: Individual access within 50ms, bulk within 200ms
- **Update operations**: Complete within 500ms with change validation
- **Delete operations**: Complete within 300ms including dependency checks

## Security and Validation

### Input Validation

- Test custom role data validation against schema requirements
- Verify capability definitions meet system constraints
- Validate constraint definitions don't exceed security boundaries
- Test role name and description sanitization

### Access Control Testing

- Verify role creation respects user permissions and authorization
- Test role modification only by authorized users
- Validate role deletion follows proper authorization workflows
- Test audit logging for all CRUD operations

## Acceptance Criteria

### Functional Requirements

- ✅ Custom role creation validates data and persists successfully
- ✅ Custom role reading retrieves complete data with proper formatting
- ✅ Custom role updates validate changes and maintain data integrity
- ✅ Custom role deletion handles dependencies and performs cleanup
- ✅ All operations integrate correctly with service layer coordination

### Integration Requirements

- ✅ RoleService coordinates with PersistenceService for data operations
- ✅ ValidationService processes custom role data during CRUD operations
- ✅ Service boundaries maintained with clean interface contracts
- ✅ Error propagation works correctly across service boundaries
- ✅ Service coordination handles both success and failure scenarios

### Performance Requirements

- ✅ CRUD operations meet specified performance benchmarks
- ✅ Service integration doesn't introduce performance bottlenecks
- ✅ Memory usage remains stable during operations
- ✅ Concurrent operations handled efficiently

## Dependencies and Prerequisites

- Service mock factories available in test infrastructure
- Custom role fixture data and builders (separate task)
- Temporary directory management for test isolation
- Service interface definitions for proper mocking

## Testing Strategy

- Include unit tests within CRUD implementation tasks
- Focus on service integration scenarios for this file
- Test error conditions and edge cases thoroughly
- Validate service coordination and data flow patterns

### Log
