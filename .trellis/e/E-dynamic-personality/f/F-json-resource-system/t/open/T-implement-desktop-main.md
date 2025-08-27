---
id: T-implement-desktop-main
title: Implement desktop main process personality definitions service
status: open
priority: high
parent: F-json-resource-system
prerequisites:
  - T-define-shared-personality
  - T-add-personality-definitions
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T15:41:28.723Z
updated: 2025-08-27T15:41:28.723Z
---

# Implement desktop main process personality definitions service

## Context

Create the main process implementation of the personality definitions service that handles file I/O, JSON parsing, Zod validation, and in-memory caching. This service will detect the runtime environment and load from the appropriate path.

## Implementation Requirements

### Service Implementation

- Implement `DesktopPersonalityDefinitionsService` class in `apps/desktop/src/electron/services/`
- Perform file I/O operations, JSON parsing, and Zod validation
- Cache parsed definitions in memory to avoid redundant file system operations
- Handle both development and production path resolution

### Path Resolution Logic

- Use `app.isPackaged` to detect production vs development builds
- Development: read from `path.join(process.env.APP_ROOT, 'resources', 'personality_definitions.json')`
- Production: read from `path.join(app.getPath('userData'), 'personality_definitions.json')`
- Return structured errors on failure, not hardcoded fallbacks

### Error Handling

- Handle file system errors (file not found, permission denied)
- Handle JSON parsing errors with descriptive messages
- Handle Zod validation errors for malformed JSON structure
- Log all errors appropriately for debugging
- Return structured error responses to renderer

### Files to Create

- `apps/desktop/src/electron/services/DesktopPersonalityDefinitionsService.ts`
- Unit tests: `apps/desktop/src/electron/services/__tests__/DesktopPersonalityDefinitionsService.test.ts`

### Technical Approach

1. Implement the shared interface from the previous task
2. Use Node.js `fs` module for file operations
3. Use Zod for JSON structure validation
4. Implement singleton pattern for memory caching
5. Follow existing patterns in `apps/desktop/src/electron/services/`

## Acceptance Criteria

- [ ] Desktop main implementation loads/parses/validates JSON and caches results
- [ ] Development mode loads from repo `resources/` path using `process.env.APP_ROOT`
- [ ] Production mode loads from `userData` path (after first-run copy)
- [ ] `app.isPackaged` used for environment detection
- [ ] JSON parsing errors logged with descriptive messages in main
- [ ] File system errors handled gracefully with logging
- [ ] Memory caching prevents redundant file system operations
- [ ] On failure, returns structured error (no hardcoded fallback)
- [ ] JSON loading completes within 100ms on typical devices

## Testing Requirements

### Unit Tests

- Path resolution for dev vs prod (`app.isPackaged`)
- JSON loading and Zod validation (valid/invalid cases)
- Caching behavior and cache invalidation
- Error handling for file access, JSON parsing, and validation
- Memory performance and loading time tests

## Security Considerations

- Validate JSON structure before processing to prevent injection attacks
- Sanitize/construct paths safely; avoid user-controlled paths
- Limit file size to prevent DoS attacks
- Handle file system permissions securely

## Dependencies

- Requires shared interface and types from T-define-shared-personality
- Requires build configuration from T-add-personality-definitions
- Zod validation library
- Node.js file system APIs

## Out of Scope

- First-run copy mechanism (separate task)
- IPC handler registration (separate task)
- Renderer proxy implementation (separate task)
