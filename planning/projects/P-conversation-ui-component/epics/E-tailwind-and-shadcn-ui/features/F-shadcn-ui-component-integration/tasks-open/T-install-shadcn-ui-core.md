---
kind: task
id: T-install-shadcn-ui-core
title: Install shadcn/ui core dependencies and setup utilities
status: open
priority: high
prerequisites:
  - T-set-up-shadcn-ui-cli-and
created: "2025-07-25T18:21:01.540026"
updated: "2025-07-25T18:21:01.540026"
schema_version: "1.1"
parent: F-shadcn-ui-component-integration
---

# Install shadcn/ui Core Dependencies and Setup Utilities

## Context

Install the essential packages required for shadcn/ui components to function properly within the desktop app. These dependencies provide the foundation for component styling, icon system, and utility functions.

## Implementation Requirements

- Install core shadcn/ui dependencies via npm/pnpm
- Set up Lucide React icon system
- Configure class variance authority for component variants
- Ensure compatibility with existing build system

## Detailed Steps

1. Install core dependencies in `apps/desktop/`:
   ```bash
   pnpm add class-variance-authority clsx tailwind-merge lucide-react
   ```
2. Verify installations in `package.json`
3. Test that utilities work with existing components
4. Update any import paths if needed for monorepo structure
5. Ensure TypeScript types are available for all dependencies

## Acceptance Criteria

✅ All core dependencies installed: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`  
✅ Dependencies appear in `apps/desktop/package.json`  
✅ TypeScript recognizes all dependency types  
✅ No conflicts with existing dependencies  
✅ Build process succeeds with new dependencies  
✅ `cn` utility function works correctly with tailwind-merge

## Technical Notes

- Use pnpm to maintain consistency with project setup
- Verify compatibility with existing Tailwind CSS v4 setup
- Ensure dependencies don't conflict with Electron build process

## Security Considerations

- Verify package integrity and authenticity
- Check for any known vulnerabilities in installed packages
- Confirm packages are from official npm registry

## Testing

- Run `pnpm quality` to ensure no linting/type errors
- Test that build process completes successfully
- Verify that existing components continue to work

### Log
