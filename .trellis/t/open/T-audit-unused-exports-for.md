---
id: T-audit-unused-exports-for
title: Audit unused exports for cleanup opportunities
status: open
priority: low
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T17:04:17.853Z
updated: 2025-08-09T17:04:17.853Z
---

# Audit Unused Exports for Cleanup Opportunities

## Context

Knip analysis identified 100+ unused exports across the codebase. While many may be legitimate (public APIs, future features, dynamic imports), this presents an opportunity to clean up truly unused code and identify over-exported modules.

## Specific Implementation Requirements

Systematically audit unused exports in categories:

**UI Components (High Volume):**

- shadcn/ui components: Many Select, Tooltip, and other UI component exports
- Desktop UI components that may be over-exported
- Shared UI types and interfaces

**Business Logic:**

- Validation functions and business rules
- Settings and configuration utilities
- Service layer exports

**Type Definitions:**

- Interface types that may be over-exported
- Type utilities that aren't used externally
- IPC and shared types

## Technical Approach

1. Group unused exports by module/package for systematic review
2. For each export category:
   - Verify it's truly unused (not just missed by static analysis)
   - Check if it's part of a public API that should be preserved
   - Determine if it represents incomplete features vs obsolete code
3. Create removal plan prioritizing:
   - Clearly obsolete exports first
   - Over-exported internal utilities
   - Incomplete feature artifacts
4. Preserve legitimate public API exports and document reasoning

## Detailed Acceptance Criteria

- All unused exports categorized by type and risk level
- Documentation of which exports to keep and why (public API, future features)
- Safe exports removed without breaking functionality
- Reduced export surface area for better maintainability
- No broken internal imports after export cleanup
- Updated barrel exports (index.ts files) reflect actual usage

## Analysis Categories

**Keep (Document why):**

- Public API exports for external consumption
- Component libraries with intended API surface
- Incomplete features under active development
- Dynamic imports not caught by static analysis

**Remove:**

- Internal utilities mistakenly exported
- Obsolete functions from removed features
- Over-exported types that should be internal
- Test utilities exported from production modules

## Testing Requirements

- Build verification after export cleanup: `pnpm build:libs`
- Type checking passes: `pnpm type-check`
- No broken imports in any package
- Runtime testing of affected components
- Verify public APIs still work as expected

## Documentation Requirements

- Document decisions for preserved exports
- Update API documentation if export surface changes
- Note any breaking changes for future reference

## Dependencies

Should be done after other cleanup tasks to avoid conflicts with file removals and dependency changes.
