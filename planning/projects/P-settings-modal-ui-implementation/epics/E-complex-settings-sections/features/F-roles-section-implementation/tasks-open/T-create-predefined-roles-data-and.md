---
kind: task
id: T-create-predefined-roles-data-and
title: Create predefined roles data and configuration
status: open
priority: high
prerequisites:
  - T-create-role-interfaces-and
created: "2025-07-29T10:59:41.597924"
updated: "2025-07-29T10:59:41.597924"
schema_version: "1.1"
parent: F-roles-section-implementation
---

# Create Predefined Roles Data and Configuration

## Context

Implement the predefined roles data based on the product specification. These are read-only role templates that provide quick-start options for users, each with specific expertise areas and descriptions that match the product's role system.

## Technical Approach

### 1. Create Predefined Roles Data

**File: `packages/shared/src/data/predefinedRoles.ts`**

Create comprehensive predefined roles based on product spec:

```typescript
export const PREDEFINED_ROLES: PredefinedRole[] = [
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Focus on timelines, coordination, and project organization",
    icon: "💼",
    category: "management",
  },
  {
    id: "technical-advisor",
    name: "Technical Advisor",
    description: "Provide technical expertise and implementation guidance",
    icon: "📊",
    category: "technical",
  },
  // ... continue with all roles from product spec
];
```

### 2. Include All Product Specification Roles

Based on docs/fishbowl-product-description.md, implement:

- Project Manager (💼) - Timelines and coordination
- Technical Advisor (📊) - Technical expertise
- Creative Director (🎨) - Creative vision guidance
- Storyteller (📚) - Narratives and engaging content
- Analyst (📈) - Data-driven insights and logical reasoning
- Coach (🤝) - Personal development and goal achievement
- Critic (🔍) - Identify weaknesses and potential issues
- Business Strategist (💡) - Market and business insights
- Financial Advisor (💰) - Financial planning guidance
- Generalist (⚡) - Versatile contributor

### 3. Create Role Utilities

**File: `packages/shared/src/utils/roleUtils.ts`**

- `getRoleById(id: string): PredefinedRole | undefined` - Find role by ID
- `getRolesByCategory(category?: string): PredefinedRole[]` - Filter by category
- `isPredefinedRole(roleId: string): boolean` - Check if role is predefined
- Include unit tests for all utility functions

### 4. Create Role Constants

**File: `packages/shared/src/constants/roles.ts`**

- Export role categories as constants
- Export validation constants (max name length, etc.)
- Export UI constants (grid columns, card dimensions)

### 5. Update Exports

**File: `packages/shared/src/index.ts`**

- Export predefined roles data
- Export role utilities
- Export role constants

## Detailed Acceptance Criteria

### Data Completeness

- [ ] All 10 predefined roles from product spec implemented with correct icons
- [ ] Each role has meaningful description matching product specification
- [ ] Role IDs use consistent kebab-case naming convention
- [ ] Categories logically group similar roles (management, technical, creative, etc.)

### Icon Selection

- [ ] Icons are professional and immediately recognizable for each role
- [ ] Icons use standard emoji that render consistently across platforms
- [ ] Icon choices align with role descriptions and common associations

### Data Quality

- [ ] Descriptions are 50-80 characters, informative but concise
- [ ] All role names are unique and professionally formatted
- [ ] Category groupings make logical sense for UI organization
- [ ] Data follows TypeScript interfaces exactly

### Utility Functions

- [ ] `getRoleById` handles invalid IDs gracefully by returning undefined
- [ ] `getRolesByCategory` returns all roles when no category specified
- [ ] `isPredefinedRole` correctly identifies predefined vs custom roles
- [ ] All utility functions have comprehensive unit tests

### Testing Requirements

- [ ] Unit tests verify all predefined roles have required fields
- [ ] Tests ensure role IDs are unique across the dataset
- [ ] Tests validate icon fields contain single emoji characters
- [ ] Tests check description length constraints
- [ ] Utility function tests cover edge cases and error conditions

## Implementation Notes

- Focus on professional, commonly understood role archetypes
- Ensure descriptions help users understand when to use each role
- Keep role names concise but descriptive
- Consider future extensibility for additional predefined roles

## Dependencies

- Requires: T-create-role-interfaces-and (role type definitions)

## Security Considerations

- Static data with no user input - minimal security concerns
- Ensure emoji icons don't cause rendering issues
- Validate all data matches TypeScript interfaces

### Log
