---
id: T-include-template-in-packaged
title: Include template in packaged desktop build (extraResources)
status: open
priority: medium
parent: F-system-prompt-factory-template
prerequisites:
  - T-author-desktop-system-prompt
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T00:24:10.165Z
updated: 2025-08-28T00:24:10.165Z
---

Context
Ensure the system prompt template is bundled with the packaged Electron app so it can be copied to user data at startup.

References

- Feature spec: add to electron-builder `extraResources` in `apps/desktop/package.json`
- Current desktop packaging config in `apps/desktop/package.json`

Implementation Requirements

- Update `apps/desktop/package.json` build config to include `system-prompt.txt` as an extra resource.
  - Example (electron-builder):
    - `build.extraResources`: add entry for `system-prompt.txt` at project root of the desktop app
- Verify path correctness for dev vs packaged resolution in later task
- Add a lightweight doc comment in package.json (if allowed) or in commit/PR description describing why it’s included

Acceptance Criteria

- Running a dry packaging config validation shows `system-prompt.txt` included (no actual build required per repo rules)
- Path does not inadvertently include extra files

Security & Performance

- Scope the pattern specifically to the one file to avoid shipping unintended resources

Out of Scope

- Startup copy logic (handled separately)
