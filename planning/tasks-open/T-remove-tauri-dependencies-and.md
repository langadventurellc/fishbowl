---
kind: task
id: T-remove-tauri-dependencies-and
title: Remove Tauri dependencies and configuration files
status: open
priority: high
prerequisites: []
created: '2025-07-21T22:48:27.799171'
updated: '2025-07-21T22:48:27.799171'
schema_version: '1.1'
---
Remove all Tauri-related dependencies, configuration files, and build artifacts from the desktop application.

**Detailed Context:**
This task involves cleaning up all Tauri infrastructure to prepare for migration to Electron. The current Tauri setup includes Rust code, configuration files, and Node.js dependencies that need to be completely removed.

**Current Tauri Setup:**
- Dependencies in apps/desktop/package.json: @tauri-apps/api, @tauri-apps/cli
- Rust codebase in apps/desktop/src-tauri/ directory
- Build scripts configured for Tauri in package.json
- Tauri configuration files (tauri.conf.json, Cargo.toml, etc.)

**Specific Implementation Requirements:**
1. Remove Tauri dependencies from apps/desktop/package.json:
   - @tauri-apps/api (runtime dependency)
   - @tauri-apps/cli (dev dependency)
2. Delete entire src-tauri directory and all contents
3. Remove Tauri-specific scripts from package.json
4. Clean any cached build artifacts

**Technical Approach:**
1. Edit apps/desktop/package.json to remove Tauri dependencies
2. Remove src-tauri directory: `rm -rf apps/desktop/src-tauri`
3. Update package.json scripts to remove Tauri commands
4. Verify no Tauri references remain in configuration files

**Detailed Acceptance Criteria:**
- All @tauri-apps/* packages removed from package.json dependencies
- src-tauri directory completely deleted
- No Tauri-related scripts in package.json (dev, build, tauri commands)
- No build artifacts or cached files remain
- Package manager lockfiles updated (pnpm-lock.yaml)
- No import statements referencing @tauri-apps/* in TypeScript files

**Security Considerations:**
- Ensure no sensitive configuration is lost during removal
- Verify no hardcoded paths or references break other functionality

**Testing Requirements:**
- Verify clean npm install/pnpm install works without errors
- Confirm no TypeScript compilation errors from missing Tauri types
- Test that build process doesn't fail due to missing Tauri CLI

### Log

