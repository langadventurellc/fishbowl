---
kind: task
id: T-set-up-shadcn-ui-cli-and
parent: F-shadcn-ui-component-integration
status: done
title: Set up shadcn/ui CLI and initialize configuration
priority: high
prerequisites: []
created: "2025-07-25T18:20:21.741985"
updated: "2025-07-25T18:25:47.354521"
schema_version: "1.1"
worktree: null
---

# Set up shadcn/ui CLI and Initialize Configuration

## Context

This task establishes the foundation for shadcn/ui integration by setting up the CLI tool and creating the initial configuration. No existing shadcn/ui setup exists in the project.

## Implementation Requirements

- Run `npx shadcn@latest init` in the desktop app directory (`apps/desktop/`)
- Configure with "new-york" style for modern appearance
- Enable CSS variables to integrate with existing theme system
- Enable TypeScript support for type safety
- Set up proper path aliases to match existing project structure

## Detailed Steps

1. Navigate to `apps/desktop/` directory
2. Run `npx shadcn@latest init` and select:
   - Style: "new-york"
   - Base color: "neutral" (to work with existing theme)
   - CSS variables: Yes
   - TypeScript: Yes
   - Import alias: "@" (to match existing structure)
   - Components path: "src/components/ui"
   - Utils path: "src/lib/utils"
3. Verify `components.json` is created with correct configuration
4. Check that utils directory and cn utility function are created
5. Ensure existing CSS variables remain intact

## Acceptance Criteria

✅ `components.json` file created in `apps/desktop/` with correct paths and aliases  
✅ `src/lib/utils.ts` created with cn utility function  
✅ `src/components/ui` directory created and ready for components  
✅ TypeScript configuration compatible with shadcn/ui  
✅ Existing CSS variables and theme system unaffected  
✅ Build process runs without errors after setup

## Technical Notes

- The setup must work with the existing Tailwind CSS v4 configuration
- Path aliases should integrate with existing TypeScript paths
- CSS variables approach ensures seamless theme integration

## Testing

- Verify `pnpm quality` passes after setup
- Check that TypeScript compilation succeeds
- Confirm existing components still render correctly

### Log

**2025-07-25T23:41:51.615219Z** - Successfully set up shadcn/ui CLI with Tailwind CSS v4 integration. Used canary version to support v4, configured with "new-york" style and "neutral" base color with CSS variables enabled. Created components.json with correct paths and aliases, generated cn utility function, and established @theme inline configuration that bridges existing CSS custom properties with Tailwind utilities. All quality checks pass.

- filesChanged: ["apps/desktop/components.json", "apps/desktop/src/lib/utils.ts", "apps/desktop/src/globals.css", "apps/desktop/package.json"]
