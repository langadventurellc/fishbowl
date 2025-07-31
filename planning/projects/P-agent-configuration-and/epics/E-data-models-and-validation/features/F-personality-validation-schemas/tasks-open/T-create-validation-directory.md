---
kind: task
id: T-create-validation-directory
title: Create validation directory structure and base schemas
status: open
priority: high
prerequisites: []
created: "2025-07-30T19:22:32.004931"
updated: "2025-07-30T19:22:32.004931"
schema_version: "1.1"
parent: F-personality-validation-schemas
---

# Create Validation Directory Structure and Base Schemas

## Purpose

Set up the foundational structure for personality validation schemas following established codebase patterns.

## Context

Based on existing validation patterns in `packages/shared/src/types/role/` and `packages/shared/src/types/agent/`, establish consistent structure for personality validation schemas.

## Implementation Requirements

### Directory Structure

Create `packages/shared/src/types/personality/validation/` directory with:

- Index file for barrel exports
- Individual schema files following naming convention

### Base Utility Functions

- Create `TraitRangeValidator` helper for 0-100 integer validation
- Implement reusable error message constants
- Set up performance-optimized schema compilation patterns

## Acceptance Criteria

- [ ] Directory `packages/shared/src/types/personality/validation/` exists
- [ ] Base utility functions for trait validation (0-100 range)
- [ ] Error message constants defined for reuse
- [ ] Follows existing codebase validation file structure patterns
- [ ] Ready for individual schema implementations

## Technical Approach

1. Create validation directory under personality types
2. Follow patterns from `packages/shared/src/types/agent/AgentSchema.ts`
3. Use Zod v4+ with custom error messages
4. Implement trait range validation utility (0-100 integers)
5. Set up barrel exports preparation

## Files to Create

- `packages/shared/src/types/personality/validation/index.ts`
- `packages/shared/src/types/personality/validation/utils.ts`
- `packages/shared/src/types/personality/validation/constants.ts`

### Log
