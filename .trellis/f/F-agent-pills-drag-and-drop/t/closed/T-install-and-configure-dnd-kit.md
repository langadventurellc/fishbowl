---
id: T-install-and-configure-dnd-kit
title: Install and configure dnd-kit dependencies for agent pills
status: done
priority: high
parent: F-agent-pills-drag-and-drop
prerequisites: []
affectedFiles:
  apps/desktop/package.json: "Added three @dnd-kit dependencies: @dnd-kit/core
    (^6.3.1), @dnd-kit/sortable (^8.0.0), and @dnd-kit/utilities (^3.2.2) to
    enable drag-and-drop functionality for agent pills"
log:
  - Successfully installed and configured @dnd-kit dependencies for agent pills
    drag-and-drop functionality. Added @dnd-kit/core (^6.3.1), @dnd-kit/sortable
    (^8.0.0), and @dnd-kit/utilities (^3.2.2) to desktop application
    dependencies. All packages installed successfully with TypeScript
    compatibility confirmed. No TypeScript errors when importing dnd-kit
    components. All quality checks (linting, formatting, type-checking) and unit
    tests pass. The foundational dependencies are now ready for implementing
    drag-and-drop reordering in the AgentLabelsContainerDisplay component.
schema: v1.0
childrenIds: []
created: 2025-09-06T02:18:48.983Z
updated: 2025-09-06T02:18:48.983Z
---

# Install and configure dnd-kit dependencies for agent pills

## Context

Install the necessary dnd-kit packages to enable drag-and-drop functionality for agent pills in the AgentLabelsContainerDisplay component. This is a prerequisite for implementing the reordering feature.

## Specific Requirements

- Install `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` packages
- Add dependencies to desktop application (apps/desktop/package.json)
- Verify installation works with basic import test

## Technical Approach

1. Add packages to apps/desktop/package.json dependencies
2. Run `pnpm install` to install new dependencies
3. Create a simple test import to verify packages work correctly
4. Ensure TypeScript types are available and working

## Acceptance Criteria

- [ ] @dnd-kit/core package installed and importable
- [ ] @dnd-kit/sortable package installed and importable
- [ ] @dnd-kit/utilities package installed and importable
- [ ] No TypeScript errors when importing dnd-kit components
- [ ] Dependencies added to correct package.json (desktop app)
- [ ] Unit test verifies packages can be imported successfully

## Dependencies

None - this is the first task for the feature

## Out of Scope

- Do not implement any drag-and-drop logic yet
- Do not modify existing components
- Do not create new components
