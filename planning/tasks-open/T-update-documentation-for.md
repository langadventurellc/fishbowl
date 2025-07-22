---
kind: task
id: T-update-documentation-for
title: Update documentation for Electron migration
status: open
priority: normal
prerequisites:
- T-update-build-scripts-and
created: '2025-07-21T22:49:35.653473'
updated: '2025-07-21T22:49:35.653473'
schema_version: '1.1'
---
Update all project documentation to reflect the migration from Tauri to Electron.

**Detailed Context:**
The project documentation currently references Tauri as the desktop framework and includes Tauri-specific build commands, architecture decisions, and development workflows. All documentation needs to be updated to reflect the new Electron-based approach.

**Documentation Files to Update:**
1. /CLAUDE.md - Project instructions and commands table
2. /docs/architecture/monorepo.md - Architecture documentation
3. Any README files that reference Tauri
4. Package.json description fields
5. Development workflow documentation

**Current References to Update in CLAUDE.md:**
- Technology Stack section mentions "Tauri (2.7+) with React (19.1+)"
- Commands table references tauri dev, tauri build
- Architecture section mentions "Tauri" and "tauri-plugin-sqlite"
- Testing mentions "tauri-driver"

**Specific Implementation Requirements:**
1. Update CLAUDE.md:
   - Replace Tauri references with Electron
   - Update commands table with new Electron scripts
   - Update technology stack section
   - Modify testing and development environment sections
   - Update architecture descriptions
2. Find and update architecture documentation
3. Search for any other files referencing Tauri
4. Update package descriptions to mention Electron

**Technical Approach:**
1. Search entire codebase for "tauri", "Tauri", and "TAURI" references
2. Use grep/ripgrep to find all documentation files with Tauri mentions
3. Update each file systematically
4. Review architecture documentation for accuracy
5. Ensure consistency across all documentation
6. Update version numbers and dependencies mentioned

**Files Requiring Updates:**
- /CLAUDE.md (main project instructions)
- /docs/architecture/monorepo.md (if exists)
- Any README.md files
- Package.json description fields
- Any architectural decision records (ADRs)

**Detailed Acceptance Criteria:**
- No references to Tauri remain in documentation
- All commands in CLAUDE.md work with new Electron setup
- Technology stack section accurately reflects Electron usage  
- Architecture documentation describes Electron instead of Tauri
- Development workflow instructions are accurate
- Testing documentation reflects new E2E setup (without tauri-driver)
- Command table shows correct Electron-based commands
- Package descriptions mention Electron framework

**Dependencies on Other Tasks:**
- Should complete T-update-build-scripts-and to ensure accurate command documentation
- Can be done in parallel with E2E testing updates

**Security Considerations:**
- Review any security documentation that was Tauri-specific
- Update any Tauri security configurations to Electron equivalents
- Ensure no outdated security advice remains

**Testing Requirements:**
- Verify all documented commands actually work
- Test development workflow as described in updated docs
- Confirm build commands match documentation
- Validate that new developers could follow updated instructions

### Log

