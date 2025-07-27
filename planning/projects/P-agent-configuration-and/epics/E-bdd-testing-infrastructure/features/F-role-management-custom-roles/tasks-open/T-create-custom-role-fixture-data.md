---
kind: task
id: T-create-custom-role-fixture-data
title: Create custom role fixture data and test builders for integration testing
status: open
priority: normal
prerequisites: []
created: "2025-07-26T21:42:36.696087"
updated: "2025-07-26T21:42:36.696087"
schema_version: "1.1"
parent: F-role-management-custom-roles
---

# Custom Role Fixture Data and Test Builders

Create comprehensive fixture data and test builders for custom role integration testing, providing reusable test data, custom role builders, and validation scenario fixtures to support all custom role integration test files.

## Context and References

- **Parent Feature**: F-role-management-custom-roles (Role Management Custom Roles Integration Tests)
- **Supporting Tasks**: This task provides test infrastructure for T-implement-custom-role-crud, T-implement-custom-role, T-implement-template-based-custom, T-implement-custom-role-validation
- **Existing Pattern**: Follow patterns from `packages/shared/src/__tests__/integration/helpers/roleFixtures.ts`
- **Test Framework**: Jest with fixture management and test data builders

## Implementation Requirements

### File Locations

Create fixture data and builders in:

- `packages/shared/src/__tests__/integration/fixtures/custom-roles/`
- `packages/shared/src/__tests__/integration/helpers/customRoleFixtures.ts`
- `packages/shared/src/__tests__/integration/helpers/customRoleBuilders.ts`

### Custom Role Fixture Data

#### Valid Custom Role Fixtures

Create JSON fixture files in `fixtures/custom-roles/`:

- `custom-role-valid.json` - Standard valid custom role with all fields
- `custom-role-template-based.json` - Custom role created from predefined template
- `custom-role-minimal.json` - Minimal valid custom role with required fields only
- `custom-role-complex-capabilities.json` - Custom role with complex capability definitions

#### Invalid Custom Role Fixtures

Create fixture files for testing validation scenarios:

- `custom-role-invalid-capabilities.json` - Custom role with invalid capability definitions
- `custom-role-missing-required.json` - Custom role missing required fields
- `custom-role-invalid-constraints.json` - Custom role with invalid constraint definitions
- `custom-role-business-rule-violations.json` - Custom role violating business rules

### Custom Role Fixture Manager

#### CustomRoleFixtureManager Class

```typescript
export class CustomRoleFixtureManager {
  static async loadAllCustomFixtures(): Promise<CustomRole[]>;
  static async loadCustomFixture(filename: string): Promise<CustomRole>;
  static async loadCustomFixturesByCategory(
    category: string,
  ): Promise<CustomRole[]>;
  static async getCustomFixtureById(id: string): Promise<CustomRole | null>;
  static async getCustomFixtureFiles(): Promise<string[]>;
  static clearCache(): void;
}
```

#### Fixture Categories

- **Valid Roles**: Complete, valid custom role definitions for positive testing
- **Invalid Roles**: Invalid custom role definitions for validation testing
- **Template-Based**: Custom roles derived from predefined templates
- **Complex Scenarios**: Advanced custom role scenarios for edge case testing

### Custom Role Test Data Builder

#### CustomRoleTestDataBuilder Class

```typescript
export class CustomRoleTestDataBuilder {
  static create(): CustomRoleTestDataBuilder;
  withId(id: string): CustomRoleTestDataBuilder;
  withName(name: string): CustomRoleTestDataBuilder;
  withDescription(description: string): CustomRoleTestDataBuilder;
  withCapabilities(capabilities: string[]): CustomRoleTestDataBuilder;
  withConstraints(constraints: string[]): CustomRoleTestDataBuilder;
  withTemplateReference(
    templateId: string,
    version: string,
  ): CustomRoleTestDataBuilder;
  withCategory(category: string): CustomRoleTestDataBuilder;
  withCustomMetadata(
    metadata: Partial<CustomRoleMetadata>,
  ): CustomRoleTestDataBuilder;
  withInvalidField(field: string, value: any): CustomRoleTestDataBuilder;
  build(): CustomRole;
  buildInvalid(): InvalidCustomRole;
}
```

#### Builder Usage Patterns

```typescript
// Valid custom role for testing
const customRole = CustomRoleTestDataBuilder.create()
  .withId("test-financial-analyst")
  .withName("Financial Data Analyst")
  .withDescription("Custom role for financial data analysis")
  .withCapabilities(["financial-modeling", "data-visualization"])
  .withConstraints(["audit-required", "no-external-apis"])
  .withTemplateReference("role-analyst", "1.0")
  .build();

// Invalid custom role for validation testing
const invalidRole = CustomRoleTestDataBuilder.create()
  .withId("invalid-role")
  .withInvalidField("capabilities", "not-an-array")
  .buildInvalid();
```

## Technical Approach

### Fixture Data Structure

Follow the custom role schema with complete metadata:

```json
{
  "id": "custom-financial-analyst",
  "name": "Financial Data Analyst",
  "description": "Specialized analyst for financial data and reporting",
  "capabilities": [
    "financial-modeling",
    "data-visualization",
    "report-generation",
    "risk-assessment"
  ],
  "constraints": [
    "audit-logging-required",
    "no-external-api-access",
    "senior-approval-required"
  ],
  "metadata": {
    "version": "1.0",
    "isPredefined": false,
    "isCustom": true,
    "category": "analytical",
    "created": "2025-01-15T10:30:00Z",
    "templateReference": {
      "templateId": "role-analyst",
      "templateVersion": "1.0",
      "customizations": ["additional-capabilities", "modified-constraints"]
    }
  }
}
```

### Template-Based Role Fixtures

Create custom roles derived from all 10 predefined templates:

- Analyst-based custom roles with specialized capabilities
- Creative-based custom roles with modified constraints
- Developer-based custom roles with additional technical capabilities
- Manager-based custom roles with leadership-specific modifications

### Validation Scenario Fixtures

Create comprehensive fixtures for testing various validation scenarios:

- Missing required fields (id, name, description)
- Invalid data types (capabilities not array, constraints not array)
- Business rule violations (conflicting capabilities, invalid constraints)
- Security boundary violations (excessive permissions, unauthorized capabilities)

### Performance and Caching

- Implement fixture caching similar to existing RoleFixtureManager
- Support cache clearing for test isolation
- Optimize fixture loading for integration test performance
- Provide lazy loading for large fixture sets

## Integration with Existing Infrastructure

### Temporary Directory Support

Extend `createRoleFixturesInTempDir` to include custom role fixtures:

```typescript
export const createCustomRoleFixturesInTempDir = async (
  tempDir: string,
): Promise<void> => {
  const customRolesDir = join(tempDir, "custom-roles");
  await fs.mkdir(customRolesDir, { recursive: true });
  // Copy custom role fixtures to temp directory
};
```

### Mock Service Integration

Create custom role fixture support for service mocks:

- PersistenceService mocks with custom role data
- ValidationService mocks with custom role validation scenarios
- TemplateService mocks with template-based creation scenarios

## Acceptance Criteria

### Fixture Data Quality

- ✅ All custom role fixtures contain complete, valid role definitions
- ✅ Invalid fixtures accurately represent specific validation failure scenarios
- ✅ Template-based fixtures maintain proper template reference metadata
- ✅ Fixture data covers comprehensive range of custom role scenarios

### Fixture Manager Functionality

- ✅ CustomRoleFixtureManager loads fixtures efficiently with caching
- ✅ Fixture filtering by category and attributes works correctly
- ✅ Fixture lookup by ID performs efficiently and accurately
- ✅ Cache management maintains test isolation and performance

### Test Data Builder

- ✅ CustomRoleTestDataBuilder creates valid custom roles with fluent API
- ✅ Builder supports comprehensive customization of role attributes
- ✅ Invalid role building for validation testing works correctly
- ✅ Builder integration with test scenarios is smooth and intuitive

### Integration Support

- ✅ Fixture data integrates seamlessly with integration test files
- ✅ Temporary directory support works correctly for test isolation
- ✅ Service mock integration provides realistic test scenarios
- ✅ Performance requirements met for fixture loading and caching

## Dependencies and Prerequisites

- Existing RoleFixtureManager pattern as reference implementation
- CustomRole type definitions and interfaces
- TemporaryDirectoryManager for test isolation
- Jest testing framework integration

## Testing Strategy

- Include unit tests for CustomRoleFixtureManager functionality
- Test CustomRoleTestDataBuilder with various configuration scenarios
- Validate fixture data quality and completeness
- Test integration with temporary directory management
- Focus on performance and caching behavior

### Log
