---
kind: task
id: T-create-agent-reference
title: Create agent reference validation fixture data
status: open
priority: normal
prerequisites: []
created: "2025-07-27T17:59:16.520957"
updated: "2025-07-27T17:59:16.520957"
schema_version: "1.1"
parent: F-agent-configuration-references
---

# Agent Reference Validation Fixture Data

## Context

Create comprehensive fixture data for agent reference validation testing, following established patterns from existing fixture files. This data will support all reference validation scenarios including cross-service validation, dependency tracking, integrity enforcement, and resolution workflows.

## Technical Approach

Follow the established fixture data patterns observed in existing files like `agent-creation-scenarios.json` and other fixture files in the `packages/shared/src/__tests__/integration/fixtures/` directory.

### Implementation Requirements

1. **Fixture File Creation**: Create fixture files in the directory structure specified by the feature:

   ```
   packages/shared/src/__tests__/integration/fixtures/agent-references/
   ├── reference-validation-scenarios.json
   ├── dependency-graph-examples.json
   ├── circular-reference-cases.json
   └── integrity-constraint-tests.json
   ```

2. **Reference Validation Scenarios**: `reference-validation-scenarios.json`
   - Valid cross-service reference scenarios (personality, role, model)
   - Invalid reference scenarios with expected error responses
   - Service unavailability simulation scenarios
   - Performance testing scenarios with complex references

3. **Dependency Graph Examples**: `dependency-graph-examples.json`
   - Simple dependency chains (A→B→C)
   - Complex multi-service dependency networks
   - Valid dependency resolution order examples
   - Performance test scenarios for large dependency graphs

4. **Circular Reference Cases**: `circular-reference-cases.json`
   - Direct circular references (A→B→A)
   - Indirect circular references (A→B→C→A)
   - Multi-service circular references spanning service boundaries
   - Complex circular dependency detection scenarios

5. **Integrity Constraint Tests**: `integrity-constraint-tests.json`
   - Component deletion scenarios with existing dependencies
   - Orphaned reference scenarios and cleanup workflows
   - Component update compatibility scenarios
   - Integrity violation resolution guidance scenarios

## Detailed Acceptance Criteria

### Fixture Data Completeness

- ✅ Valid reference scenarios covering all service combinations (personality, role, model)
- ✅ Invalid reference scenarios with detailed error expectations
- ✅ Complex dependency graph scenarios for performance and resolution testing
- ✅ Circular reference detection scenarios covering direct and indirect cases

### Data Structure Consistency

- ✅ JSON structure follows established patterns from existing fixture files
- ✅ Metadata sections include version, description, and usage instructions
- ✅ Each scenario includes expected outcomes and validation checks
- ✅ Error scenarios include detailed error type and message expectations

### Test Coverage Support

- ✅ Fixture data supports all test scenarios in the four integration test files
- ✅ Performance testing scenarios with realistic data volumes
- ✅ Security testing scenarios with authorization and access control cases
- ✅ Error handling scenarios with comprehensive edge cases

## Security Considerations

- Fixture data includes authorization scenarios with proper access controls
- Reference validation scenarios respect security boundaries
- Test data includes security violation scenarios with expected error responses
- Authorization context preserved in cross-service reference scenarios

## Dependencies

- **Internal**: None (can be developed in parallel with test files)
- **External**: Understanding of PersonalityService, RoleService, ModelService data structures
- **Test Infrastructure**: JSON fixture loading patterns from existing tests

## File Structure

```
packages/shared/src/__tests__/integration/fixtures/
├── agent-references/
│   ├── reference-validation-scenarios.json (NEW)
│   ├── dependency-graph-examples.json (NEW)
│   ├── circular-reference-cases.json (NEW)
│   └── integrity-constraint-tests.json (NEW)
```

## Testing Requirements

Include validation that fixture data is properly formatted and loadable:

- JSON structure validation for all fixture files
- Required field validation for each scenario type
- Consistency validation across related fixture files
- Performance validation for large dataset scenarios

## Implementation Notes

- Follow JSON structure patterns from `agent-creation-scenarios.json`
- Include comprehensive metadata sections for each fixture file
- Provide clear scenario categorization (success, validation failure, error handling)
- Include performance testing scenarios with realistic data volumes
- Ensure fixture data supports all planned integration test scenarios
- Use realistic UUIDs and identifiers consistent with existing patterns

### Log
