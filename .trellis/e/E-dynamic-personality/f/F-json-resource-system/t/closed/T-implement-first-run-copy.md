---
id: T-implement-first-run-copy
title: Implement first-run copy mechanism for personality definitions
status: done
priority: high
parent: F-json-resource-system
prerequisites:
  - T-implement-desktop-main
affectedFiles:
  apps/desktop/src/electron/main.ts:
    Added call to ensurePersonalityDefinitions()
    in the app initialization sequence before services startup
  apps/desktop/src/electron/startup/ensurePersonalityDefinitions.ts:
    Created new helper module containing the first-run copy logic with proper
    error handling, path validation, and logging
log:
  - Successfully implemented first-run copy mechanism for personality
    definitions. The system now detects when
    userData/personality_definitions.json is missing on packaged app startup and
    copies it from the bundle resources. This ensures users can customize
    personality definitions without affecting future app updates. The
    implementation follows security best practices with path validation,
    graceful error handling, and never overwrites existing user files.
schema: v1.0
childrenIds: []
created: 2025-08-27T15:41:47.202Z
updated: 2025-08-27T15:41:47.202Z
---

# Implement first-run copy mechanism for personality definitions

## Context

Create the first-run initialization system that detects when the personality definitions file is missing from userData and copies it from the bundled resources. This ensures users can modify their personality definitions without affecting future app updates.

## Implementation Requirements

### Copy Logic Implementation

- Detect when `userData/personality_definitions.json` does not exist at app startup
- Copy from `process.resourcesPath/personality_definitions.json` to userData directory
- Never overwrite existing userData copy (preserves user modifications)
- Handle file system permissions and errors gracefully

### Integration Points

- Wire into main process startup sequence in `apps/desktop/src/electron/main.ts`
- Integrate with the desktop personality definitions service
- Log copy operations and any errors that occur

### Error Handling

- Handle missing source file (bundle resource not found)
- Handle destination write permissions
- Handle partial copy failures
- Log specific error conditions for troubleshooting
- Fail gracefully without crashing the application

### Files to Modify/Create

- `apps/desktop/src/electron/main.ts` - Implement/wire first-run copy at startup
- `apps/desktop/src/electron/startup/ensurePersonalityDefinitions.ts` - Optional small helper for copy logic
- Unit tests for first-run copy logic

### Technical Approach

1. Implement `ensureUserDataCopy()` as a small main-process helper (not part of the service)
2. Check for existence of userData file using Node.js `fs.existsSync()`
3. Copy from resourcesPath using `fs.copyFileSync()` with error handling
4. Call during app startup before registering IPC handlers
5. Use the logger for tracking copy operations and errors

## Acceptance Criteria

- [ ] At startup, main process checks for `userData/personality_definitions.json`
- [ ] If missing, copies from `process.resourcesPath/personality_definitions.json`
- [ ] Copy operation handles file system errors gracefully with logging
- [ ] Subsequent runs read from userData copy, not bundle
- [ ] Never overwrites existing userData file (preserves user customizations)
- [ ] Copy failures logged with specific error messages for debugging
- [ ] Startup time impact kept under 200ms additional delay

## Testing Requirements

### Unit Tests

- First-run copy logic and error cases
- File system error handling (permissions, missing source)
- Preservation of existing userData files
- Startup integration testing

## Security Considerations

- Validate source and destination paths to prevent path traversal
- Handle file system permissions safely
- Ensure copy operation cannot be exploited for arbitrary file operations
- Log errors without exposing sensitive file system paths

## Dependencies

- Requires desktop main service implementation from T-implement-desktop-main
- Node.js file system APIs
- Electron app lifecycle events

## Out of Scope

- IPC handler implementation (separate task)
- Renderer proxy (separate task)
- UI error handling (separate task)
