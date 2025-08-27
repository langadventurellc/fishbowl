---
id: T-add-personality-definitions
title: Add personality definitions JSON to desktop build configuration
status: in-progress
priority: high
parent: F-json-resource-system
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-27T15:40:43.742Z
updated: 2025-08-27T15:40:43.742Z
---

# Add personality definitions JSON to desktop build configuration

## Context

Set up the Electron build system to include the personality definitions JSON file as an extra resource, making it available at runtime in both development and production builds.

## Implementation Requirements

### Build Configuration

- Add `resources/personality_definitions.json` to `extraResources` in `apps/desktop/package.json`
- Ensure the JSON file is bundled with the desktop application during builds
- Configure mapping so the resource is available at runtime at `path.join(process.resourcesPath, 'personality_definitions.json')` (e.g.,
  ````json
  {
    "from": "../../resources/personality_definitions.json",
    "to": "personality_definitions.json"
  }
  ```)
  ````

### Files to Modify

- `apps/desktop/package.json` - Add extraResources configuration

### Technical Approach

1. Add the personality definitions file to the Electron Builder extraResources configuration
2. Verify the build includes the JSON file in the correct location
3. Test that the resource path resolves correctly in both development and production

## Acceptance Criteria

- [ ] `resources/personality_definitions.json` added to `extraResources` in `apps/desktop/package.json`
- [ ] Desktop build includes personality JSON file in app bundle
- [ ] JSON file accessible at `path.join(process.resourcesPath, 'personality_definitions.json')` in packaged builds
- [ ] Build system properly maps the resource file for runtime access (packaged builds); dev uses repo `resources/` path via runtime service logic

## Testing Requirements

### Unit Tests

- Test that the build configuration includes the resource file
- Verify the resource path mapping works correctly

## Security Considerations

- Ensure resource file path is constructed safely
- Validate that only intended files are included in extraResources

## Out of Scope

- Runtime loading logic (separate task)
- IPC implementation (separate task)
- First-run copy mechanism (separate task)
