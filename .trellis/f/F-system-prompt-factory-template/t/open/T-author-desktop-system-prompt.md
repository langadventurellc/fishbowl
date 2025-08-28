---
id: T-author-desktop-system-prompt
title: Author desktop system prompt template file
status: open
priority: medium
parent: F-system-prompt-factory-template
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-28T00:24:03.762Z
updated: 2025-08-28T00:24:03.762Z
---

Context
Create the human-readable template used by the renderer, seeded from `docs/specifications/system-prompt-template-prototype.txt` but with dynamic tokens.

References

- Feature spec template location
- Prototype: `docs/specifications/system-prompt-template-prototype.txt`
- Token list: {{agentName}}, {{roleName}}, {{personalityName}}, {{behaviors}}, {{tools}}, {{constraints}}, {{memoryGuidance}}

Implementation Requirements

- Add text file: `apps/desktop/system-prompt.txt`
- Adapt the prototype:
  - Replace static behavior enumerations with `{{behaviors}}`
  - Insert placeholders where appropriate per spec (names, role, etc.)
  - Keep concise, instruction-first formatting suitable for LLM system prompts
- Include a short comment header with a version tag, e.g., `# system-prompt template v1` and guidance not to edit at runtime

Acceptance Criteria

- File exists at `apps/desktop/system-prompt.txt`
- Placeholders match renderer expectations exactly
- Content follows prototype guidance and is clear, succinct

Security & Performance

- No secrets; plain text only

Out of Scope

- Packaging and runtime copying (handled by separate tasks)
