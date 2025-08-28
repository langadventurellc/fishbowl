---
id: T-docs-usage-guidance-and
title: "Docs: usage guidance and manual verification steps"
status: open
priority: low
parent: F-system-prompt-factory-template
prerequisites:
  - T-implement-systempromptfactory
  - T-add-electron-startup
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T00:24:25.675Z
updated: 2025-08-28T00:24:25.675Z
---

Context
Provide concise developer guidance for using the factory in shared code and verifying the desktop startup copy behavior locally.

References

- Feature spec
- Files added by prior tasks

Implementation Requirements

- Add a short README section or doc under `docs/` (e.g., `docs/architecture/system-prompt-factory.md`) covering:
  - How to construct `SystemPromptFactory` (constructor params)
  - Where the template file lives in the desktop app and how it’s copied to user data
  - How to run unit tests for the shared module and the startup helper
  - Manual verification steps: check `app.getPath('userData')/system-prompts/system-prompt.txt` after starting the app in dev/test; packaged verification via artifact inspection
- Cross-link to the feature spec if appropriate

Acceptance Criteria

- Documentation file exists with clear, step-by-step guidance
- No contradictions with implementation

Security & Performance

- Avoid exposing local paths beyond userData path examples

Out of Scope

- Full user-facing documentation; this is developer-oriented
