---
id: T-create-example-roles
title: Create Example Roles Definition with Validation
status: open
priority: high
parent: F-initial-roles-data-creation
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T01:23:35.239Z
updated: 2025-08-12T01:23:35.239Z
---

# Create Example Roles Definition with Validation

## Context and Purpose

Create a comprehensive set of 3-5 example roles that demonstrate diverse use cases and best practices for prompt engineering. This task establishes the foundation data that new users will see when they first use the roles feature.

## Detailed Implementation Requirements

### File Location and Structure

Create `apps/desktop/src/data/initialization/defaultRoles.ts` with:

### Example Roles to Define

1. **Project Manager Role**
   - Name: "Project Coordinator" (~20 chars)
   - Description: "Focuses on timeline management, team coordination, and project planning" (~80 chars)
   - System Prompt: Comprehensive prompt about project management techniques, stakeholder communication, and deliverable tracking (1000-1500 chars)

2. **Technical Reviewer Role**
   - Name: "Code Reviewer" (~15 chars)
   - Description: "Specializes in code quality, architecture review, and technical best practices" (~80 chars)
   - System Prompt: Detailed prompt about code review principles, security considerations, and maintainability (1000-1500 chars)

3. **Creative Director Role**
   - Name: "Creative Strategist" (~20 chars)
   - Description: "Expert in brainstorming, ideation, and creative problem-solving approaches" (~75 chars)
   - System Prompt: Rich prompt about creative thinking techniques, design thinking, and innovation methods (1000-1500 chars)

4. **Data Analyst Role**
   - Name: "Data Insights Specialist" (~25 chars)
   - Description: "Focuses on data interpretation, statistical analysis, and actionable insights" (~80 chars)
   - System Prompt: Comprehensive prompt about data analysis methodologies, visualization, and reporting (1000-1500 chars)

5. **Technical Writer Role**
   - Name: "Documentation Expert" (~20 chars)
   - Description: "Specializes in clear technical communication and comprehensive documentation" (~80 chars)
   - System Prompt: Detailed prompt about technical writing principles, user-focused documentation, and clarity (1000-1500 chars)

### Implementation Approach

```typescript
import type { PersistedRoleData } from "@fishbowl-ai/shared";

export const DEFAULT_ROLES: PersistedRoleData[] = [
  {
    id: "role-project-coordinator",
    name: "Project Coordinator",
    description:
      "Focuses on timeline management, team coordination, and project planning",
    systemPrompt: `You are an experienced project coordinator with expertise in...`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ... other roles
];

export const INITIAL_ROLES_METADATA = {
  isInitialData: true,
  initialDataVersion: "1.0.0",
  createdBy: "system",
};
```

### Schema Compliance Requirements

- All roles must validate against existing `PersistedRoleData` schema
- Field length constraints must be respected
- Required fields must be present
- Timestamps must be valid ISO strings

## Acceptance Criteria

- [ ] **Five High-Quality Example Roles Created**:
  - Each role represents a distinct use case
  - Names are professional and descriptive (under 100 chars)
  - Descriptions clearly explain the role's purpose (under 500 chars)
  - System prompts are well-crafted and demonstrate best practices (1000-1500 chars each)

- [ ] **Schema Validation Passes**:
  - All roles validate against `PersistedRoleData` schema
  - Field length constraints respected
  - All required fields present with correct types
  - Proper TypeScript typing throughout

- [ ] **Professional Content Quality**:
  - System prompts demonstrate different prompting techniques
  - Content is professional and production-ready
  - No placeholder text or low-quality examples
  - Prompts provide clear instruction and context setting

- [ ] **Unit Tests Written and Passing**:
  - Test each example role validates against schema
  - Test field length constraints
  - Test data structure integrity
  - Test TypeScript type compliance
  - Achieve 100% test coverage for the constants

- [ ] **Documentation and Export Structure**:
  - Clean barrel exports from index.ts
  - JSDoc comments explaining the purpose
  - TypeScript types properly exported
  - Constants properly typed and immutable

## Testing Requirements

### Unit Tests (`__tests__/defaultRoles.test.ts`)

1. **Schema Validation Tests**:

   ```typescript
   describe("Default Roles Schema Validation", () => {
     test("all roles validate against PersistedRoleData schema", () => {
       DEFAULT_ROLES.forEach((role) => {
         expect(() => PersistedRoleDataSchema.parse(role)).not.toThrow();
       });
     });
   });
   ```

2. **Content Quality Tests**:
   - Test each role has unique ID
   - Test name length constraints (1-100 chars)
   - Test description length constraints (max 500 chars)
   - Test system prompt length (1000-2000 chars)
   - Test no duplicate names or descriptions

3. **Data Structure Tests**:
   - Test array contains exactly 5 roles
   - Test metadata structure is correct
   - Test all timestamps are valid ISO strings
   - Test TypeScript types are correct

## Security Considerations

- No sensitive information in example content
- Sanitize any dynamic content (none expected)
- Professional content appropriate for all users
- No external URLs or references that could be compromised

## Performance Requirements

- Constant-time access to example data
- Minimal memory footprint
- No dynamic generation overhead
- Fast validation during tests

## Dependencies

- Import types from `@fishbowl-ai/shared`
- Use existing schema validation utilities
- Follow established project patterns for constants

## File Structure to Create

```
apps/desktop/src/data/initialization/
├── defaultRoles.ts              # Main implementation
├── __tests__/
│   └── defaultRoles.test.ts     # Unit tests
└── index.ts                     # Barrel exports
```

## Success Metrics

- All 5 example roles demonstrate diverse, professional use cases
- 100% schema validation compliance
- Unit test coverage at 100%
- Professional content quality suitable for production
- Clean, maintainable code structure
