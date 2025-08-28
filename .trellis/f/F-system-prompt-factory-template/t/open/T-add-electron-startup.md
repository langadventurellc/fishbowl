---
id: T-add-electron-startup
title: Add Electron startup ensureSystemPromptTemplate
status: open
priority: high
parent: F-system-prompt-factory-template
prerequisites:
  - T-author-desktop-system-prompt
  - T-include-template-in-packaged
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T00:24:19.755Z
updated: 2025-08-28T00:24:19.755Z
---

Context
Add a startup step in the Electron main process to copy `system-prompt.txt` into the user data directory for dev, packaged, and test runs, mirroring the pattern used by `ensurePersonalityDefinitions.ts`.

References

- Feature spec
- Existing startup file: `apps/desktop/src/electron/startup/ensurePersonalityDefinitions.ts` (follow structure and logging)
- Electron APIs: `app.isPackaged`, `app.getAppPath()`, `app.getPath('userData')`, `process.resourcesPath`

Implementation Requirements

- Add file: `apps/desktop/src/electron/startup/ensureSystemPromptTemplate.ts`
  - Resolve source template path:
    - Packaged: `path.join(process.resourcesPath, 'system-prompt.txt')`
    - Dev/test: `path.join(app.getAppPath(), 'apps/desktop/system-prompt.txt')`
  - Resolve destination dir: `path.join(app.getPath('userData'), 'system-prompts')`
  - Ensure destination dir exists
  - Copy if missing or if source mtime is newer than destination
  - Log actions using shared logger
- Wire into main startup flow alongside other ensure steps (where `ensurePersonalityDefinitions` is called)
- Extract any pure helper (e.g., `shouldCopy(source, dest)`) to enable unit testing

Acceptance Criteria

- File compiles and is invoked during app startup
- In dev runs, the file is copied to userData/system-prompts on first run, no-ops on subsequent runs unless updated
- In packaged runs, path resolution targets `process.resourcesPath`
- Unit test covers `shouldCopy` helper with scenarios (missing dest, older dest, same mtime)

Security & Performance

- Avoid directory traversal; validate that source exists inside app path/resources
- Minimal I/O; idempotent behavior

Out of Scope

- Building the app; only code and unit test implementation
