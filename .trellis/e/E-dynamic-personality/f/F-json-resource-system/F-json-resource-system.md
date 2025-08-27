---
id: F-json-resource-system
title: JSON Resource System Foundation
status: done
priority: medium
parent: E-dynamic-personality
prerequisites: []
affectedFiles:
  apps/desktop/package.json:
    Added personality_definitions.json to extraResources
    configuration with proper from/to mapping
  packages/shared/src/types/personality/PersonalityValueMeta.ts:
    Created interface for personality value metadata containing short
    description, optional prompt text, and optional numeric values
  packages/shared/src/types/personality/PersonalityTraitDef.ts:
    Created interface for personality trait definitions with stable ID, display
    name, and discrete value metadata
  packages/shared/src/types/personality/PersonalitySectionDef.ts:
    Created interface for personality sections containing related traits with
    optional descriptions
  packages/shared/src/types/personality/PersonalityDefinitions.ts:
    Created main interface for complete personality definitions loaded from JSON
    resources
  packages/shared/src/types/personality/PersonalityValues.ts: Created type alias
    for personality values using trait IDs as keys and discrete values
  packages/shared/src/types/personality/PersonalityError.ts:
    Created abstract base
    class for all personality-related errors with JSON serialization support
  packages/shared/src/types/personality/PersonalityParseError.ts: Created specific error class for JSON parsing failures with parsing context
  packages/shared/src/types/personality/PersonalityFileAccessError.ts:
    Created specific error class for file access failures without exposing
    sensitive paths
  packages/shared/src/types/personality/PersonalityValidationError.ts:
    Created specific error class for schema validation failures with detailed
    context
  packages/shared/src/services/PersonalityDefinitionsService.ts:
    Created service interface for loading and accessing personality definitions
    with platform abstraction
  packages/shared/src/types/personality/index.ts: Created barrel export file for all personality types and error classes
  packages/shared/src/types/index.ts: Added personality types to main types barrel export
  packages/shared/src/services/index.ts: Added PersonalityDefinitionsService interface to services exports
  packages/shared/src/types/personality/__tests__/personalityTypes.test.ts:
    Created comprehensive unit tests covering type exports, discrete value
    constraints, error functionality, and serialization
  apps/desktop/src/electron/services/DesktopPersonalityDefinitionsService.ts:
    Created main process personality definitions service implementing the shared
    interface. Handles file I/O, JSON parsing, Zod validation, memory caching,
    and environment-specific path resolution using app.isPackaged for dev vs
    prod builds.
  apps/desktop/src/electron/main.ts:
    Added call to ensurePersonalityDefinitions()
    in the app initialization sequence before services startup; Added import and
    registration call for setupPersonalityDefinitionsHandlers in
    setupPersonalitiesIpcHandlers function
  apps/desktop/src/electron/startup/ensurePersonalityDefinitions.ts:
    Created new helper module containing the first-run copy logic with proper
    error handling, path validation, and logging
  apps/desktop/src/shared/ipc/personalityDefinitions/getDefinitionsRequest.ts:
    Created request type interface for personality definitions IPC calls (empty
    interface for GET operation)
  apps/desktop/src/shared/ipc/personalityDefinitions/getDefinitionsResponse.ts:
    Created response type interface extending IPCResponse with
    PersonalityDefinitions data type
  apps/desktop/src/shared/ipc/personalityDefinitionsConstants.ts:
    Created IPC channel constants defining 'personality:get-definitions' channel
    and type definitions
  apps/desktop/src/electron/handlers/personalityDefinitionsHandlers.ts:
    Implemented main IPC handler with setupPersonalityDefinitionsHandlers
    function, proper error handling, logging, and integration with
    DesktopPersonalityDefinitionsService
  apps/desktop/src/electron/handlers/__tests__/personalityDefinitionsHandlers.test.ts:
    Created comprehensive unit tests covering handler registration, success
    response, error handling, and service availability scenarios
  apps/desktop/src/shared/ipc/index.ts:
    Added exports for personality definitions
    constants and request/response types to main IPC index
  apps/desktop/src/electron/preload.ts: Added personalityDefinitions API to
    electronAPI with getDefinitions method and proper error handling
  apps/desktop/src/types/electron.d.ts:
    Added personalityDefinitions interface to
    ElectronAPI type definition with getDefinitions method
  apps/desktop/src/renderer/services/personalityDefinitionsClient.ts:
    Created renderer proxy service with memory caching, IPC communication,
    helper methods for trait value lookups, and comprehensive error handling
  apps/desktop/src/renderer/services/RendererProcessServices.ts:
    Integrated PersonalityDefinitionsClient into dependency injection pattern
    with constructor initialization
  apps/desktop/src/renderer/services/index.ts: Added PersonalityDefinitionsClient export to services barrel file
log:
  - "Auto-completed: All child tasks are complete"
schema: v1.0
childrenIds:
  - T-add-discrete-value-utilities
  - T-add-personality-definitions
  - T-create-ipc-handler-for
  - T-define-shared-personality
  - T-implement-desktop-main
  - T-implement-first-run-copy
  - T-implement-renderer-process
created: 2025-08-27T05:13:31.791Z
updated: 2025-08-27T05:13:31.791Z
---

# JSON Resource System Foundation

## Overview

Establish the foundational infrastructure for loading personality definitions from JSON resources, including build system integration, first‑run copy, environment‑specific path resolution, and platform abstraction (shared interface + desktop main implementation + renderer proxy via IPC).

## Purpose

Implement the resource loading system following the Platform Abstraction Pattern:

- Define a shared interface for loading personality definitions (no fs access in shared)
- Implement desktop main process service that performs file IO and validation
- Expose a single IPC endpoint the renderer uses to fetch parsed definitions
- Handle dev vs prod resolution and first‑run copying

## Key Components to Implement

### Build System Integration

- Add `resources/personality_definitions.json` to `apps/desktop/package.json -> build.extraResources`
- Ensure JSON file is bundled with desktop application builds
- Use a specific mapping so at runtime it is available at `path.join(process.resourcesPath, 'personality_definitions.json')`

### Resource Path Resolution

- Use `app.isPackaged` to detect production builds
- Development: read directly from `path.join(process.env.APP_ROOT, 'resources', 'personality_definitions.json')`
- Production: read from `path.join(app.getPath('userData'), 'personality_definitions.json')` after first‑run copy
- Bundle source path for copy: `path.join(process.resourcesPath, 'personality_definitions.json')`

### First-Run Copy Mechanism (Main Process)

- Detect when `userData/personality_definitions.json` does not exist
- Copy JSON from `process.resourcesPath/personality_definitions.json` into `userData` on first application startup
- Do not overwrite an existing `userData` copy (no silent updates)
- Handle file system permissions and errors with logs; fail closed with structured error to renderer

### Personality Definitions Service (Platform Abstraction)

- Shared: define `PersonalityDefinitionsService` interface and types in `packages/shared` (no fs access)
- Desktop Main: implement `DesktopPersonalityDefinitionsService` that performs file IO, JSON parsing, and Zod validation; cache in memory
- IPC: add `ipcMain.handle('personality:get-definitions')` to return parsed definitions or structured error
- Renderer: add a thin proxy function that calls IPC and caches in memory for the session

## Detailed Acceptance Criteria

### Build Integration

- [ ] `resources/personality_definitions.json` added to `extraResources` in `apps/desktop/package.json`
- [ ] Desktop build includes personality JSON file in app bundle
- [ ] JSON file accessible at `path.join(process.resourcesPath, 'personality_definitions.json')` in packaged builds

### Path Resolution Logic

- [ ] Development mode loads from repo `resources/` path using `process.env.APP_ROOT`
- [ ] Production mode loads from `userData` after first‑run copy
- [ ] `app.isPackaged` used for environment detection
- [ ] On failure, return a structured error to renderer (no hardcoded fallback)

### First-Run Initialization

- [ ] At startup, main process checks for `userData/personality_definitions.json`
- [ ] If missing, copies from `process.resourcesPath/personality_definitions.json`
- [ ] Copy operation handles file system errors gracefully with logging
- [ ] Subsequent runs read from userData copy, not bundle

### Personality Definitions Service

- [ ] Shared interface and types defined (no platform code in shared)
- [ ] Desktop main implementation loads/parses/validates JSON and caches results
- [ ] IPC handler returns parsed definitions or structured error
- [ ] Renderer proxy fetches via IPC and caches in memory
- [ ] Malformed JSON results in a structured error; UI disables dynamic form
- [ ] No fallback to hardcoded defaults

### Error Handling & Logging

- [ ] JSON parsing errors logged with descriptive messages in main
- [ ] File system errors during copy operations logged appropriately
- [ ] Missing resource files handled without crashes; renderer receives error state
- [ ] Development‑friendly error messages for debugging

### Performance Requirements

- [ ] JSON loading completes within 100ms on typical devices
- [ ] Memory caching prevents redundant file system operations
- [ ] Startup time impact kept under 200ms additional delay

## Implementation Guidance

### Technical Approach

- Use Electron's `app.isPackaged`, `process.resourcesPath` and `app.getPath('userData')`
- Perform all IO and copy logic in main process; expose a single IPC endpoint
- Implement singleton for main service caching; renderer keeps a session cache
- Use Zod to validate essential JSON structure only (sections/traits/values)

### File Structure

```
packages/shared/src/services/
├── PersonalityDefinitionsService.ts      # interface + types only
└── __tests__/ (types-only tests if any)

apps/desktop/src/electron/
├── services/
│   └── DesktopPersonalityDefinitionsService.ts  # main-process implementation
├── handlers/
│   └── personalityDefinitionsHandlers.ts        # ipcMain.handle registration
├── preload.ts                                   # expose typed IPC bridge if needed
└── main.ts                                      # wire first-run copy + handler setup

apps/desktop/src/renderer/
├── services/
│   └── personalityDefinitionsClient.ts          # renderer proxy calling IPC
└── ...
```

### Dependencies

- No prerequisites - this is the foundation feature
- Electron APIs (main) for resource paths and userData
- Node.js filesystem APIs for copy/read (main only)
- Zod for JSON validation (main)

## Testing Requirements

### Unit Tests (Main)

- Path resolution for dev vs prod (`app.isPackaged`)
- First‑run copy logic and error cases
- JSON loading and Zod validation (valid/invalid)
- Caching behavior and reset for tests

## Security Considerations

- Validate JSON structure before processing to prevent injection attacks
- Sanitize/construct paths; avoid user‑controlled paths
- Limit file size of personality definitions to prevent DoS attacks
- Read‑only access in renderer; IO confined to main process

## Error Recovery

- Fail closed: return structured error to renderer; disable dynamic form
- Log specific error conditions in main for troubleshooting
- No application crashes due to resource loading failures
