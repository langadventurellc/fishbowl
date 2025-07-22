---
kind: task
id: T-update-build-scripts-and
status: done
title: Update build scripts and development commands for Electron
priority: high
prerequisites:
- T-create-electron-hello-world
created: '2025-07-21T22:49:17.366638'
updated: '2025-07-21T23:42:40.872954'
schema_version: '1.1'
worktree: null
---
Update package.json scripts and build configuration to work with Electron instead of Tauri.

**Detailed Context:**
The current build system is configured for Tauri with Rust compilation and specific development workflows. This needs to be replaced with Electron-based build scripts that handle both main and renderer processes.

**Current Build Scripts (to replace):**

- `dev`: `tauri dev` → Electron development mode
- `build`: `tsc && vite build && tauri build` → Electron build process
- `dev:container` and `build:container`: Container-specific builds
- `clean`: Remove Tauri targets → Remove Electron build artifacts

**Reference Documentation:**
Use context7 MCP tool to research:

- electron-builder configuration best practices
- Development workflow with concurrent main/renderer processes
- Cross-platform build configuration

**Specific Implementation Requirements:**

1. Update apps/desktop/package.json scripts:
   - Replace tauri dev with electron development workflow
   - Replace tauri build with electron-builder
   - Update clean script for Electron artifacts
   - Add concurrent development for main/renderer processes
2. Create Vite configuration for Electron
3. Configure electron-builder for packaging
4. Update root package.json scripts to work with new Electron commands
5. Ensure development hot reload works for both processes

**Technical Approach:**

1. Install additional development dependencies:
   - concurrently (run main/renderer in parallel)
   - wait-on (ensure renderer ready before starting main)
   - nodemon (restart main process on changes)
2. Configure Vite for Electron renderer build
3. Set up TypeScript compilation for main process
4. Create electron-builder configuration
5. Update all package.json scripts in both apps/desktop and root

**New Script Structure:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "wait-on http://localhost:5173 && nodemon --exec electron src/electron/main.js",
    "build": "npm run build:renderer && npm run build:main && electron-builder",
    "build:renderer": "vite build",
    "build:main": "tsc src/electron/main.ts --outDir dist/electron",
    "clean": "rm -rf dist out node_modules/.vite"
  }
}
```

**Detailed Acceptance Criteria:**

- Development command starts both main and renderer processes
- Hot reload works for renderer (React) changes
- Main process restarts on TypeScript changes
- Build command produces distributable Electron app
- Container builds work without GUI dependencies
- Clean script removes all build artifacts
- Root-level commands (pnpm dev:desktop) work correctly
- Cross-platform build configuration (Windows, macOS, Linux)

**Dependencies on Other Tasks:**

- Must complete T-create-electron-hello-world before starting
- Enables proper development workflow for subsequent tasks

**Security Considerations:**

- Ensure build process doesn't include development dependencies in production
- Configure electron-builder with proper code signing placeholders
- Set up secure update configuration framework

**Testing Requirements:**

- Development workflow starts without errors
- Hot reload functional for both processes
- Build produces working executable
- Clean command removes all generated files
- Scripts work across different platforms (test in container)

### Log

**2025-07-22T04:47:39.679053Z** - Successfully updated all build scripts and development commands for Electron. Implemented concurrent development workflow with hot reload for both main and renderer processes using nodemon and Vite. Added container support for headless CI/CD development. Updated clean scripts to handle Electron artifacts. All quality checks pass - build system produces working DMG packages for both x64 and arm64 architectures.
- filesChanged: ["apps/desktop/package.json", "package.json"]