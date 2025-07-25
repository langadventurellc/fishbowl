---
kind: task
id: T-install-tailwind-css-v4-and-vite
title: Install Tailwind CSS v4 and Vite plugin dependencies
status: open
priority: high
prerequisites: []
created: "2025-07-25T16:59:57.399155"
updated: "2025-07-25T16:59:57.399155"
schema_version: "1.1"
parent: F-tailwind-css-v4-setup-and
---

# Install Tailwind CSS v4 and Vite Plugin Dependencies

## Context

Install the latest Tailwind CSS v4 packages and Vite integration plugin to enable modern CSS features and build pipeline processing. This establishes the foundation for all subsequent Tailwind v4 capabilities.

## Implementation Requirements

### Package Installation

- Install `tailwindcss@latest` for core Tailwind CSS v4 functionality
- Install `@tailwindcss/vite@latest` for optimized Vite build integration
- Add packages to `apps/desktop/package.json` as devDependencies
- Use `pnpm install` to update workspace dependencies

### Commands to Execute

```bash
cd apps/desktop
pnpm add -D tailwindcss@latest @tailwindcss/vite@latest
```

## Detailed Acceptance Criteria

### Installation Verification

✅ **Package.json Updated**: Both packages appear in `apps/desktop/package.json` devDependencies  
✅ **Version Compatibility**: Latest v4+ versions installed (verify with `pnpm list tailwindcss`)  
✅ **Workspace Integrity**: No breaking changes to existing workspace dependencies  
✅ **Lock File Updated**: `pnpm-lock.yaml` properly updated with new package versions

### Dependency Validation

✅ **No Conflicts**: Installation completes without peer dependency warnings  
✅ **Build Compatibility**: Packages compatible with existing Vite and React setup  
✅ **Development Ready**: Packages available for subsequent configuration tasks

## Testing Requirements

### Installation Testing

- **Package verification**: Run `pnpm list tailwindcss @tailwindcss/vite` to confirm versions
- **Workspace validation**: Ensure `pnpm install` completes successfully in root
- **Build preparation**: Verify packages are ready for Vite configuration

### Unit Tests

- No unit tests required for dependency installation
- Validation through successful package manager operations

## Security Considerations

### Package Security

- **Official packages**: Only install verified Tailwind Labs packages
- **Version validation**: Ensure installing legitimate v4+ versions
- **Dependency audit**: Run `pnpm audit` after installation to check for vulnerabilities

## Performance Requirements

### Installation Performance

- **Download time**: Package installation should complete within reasonable time
- **Workspace impact**: Minimal impact on overall project dependency resolution
- **Build preparation**: Packages ready for efficient Vite processing

## Dependencies

- **Prerequisites**: None - this is the foundation task
- **Blocks**: All other Tailwind v4 setup tasks depend on this installation

## Technical Notes

- Use latest versions to access all v4 features including @theme inline and modern CSS
- Vite plugin provides optimized build performance compared to PostCSS approach
- Installation in desktop app only - mobile app will be handled separately if needed

### Log
