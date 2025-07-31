---
kind: task
id: T-create-persistedadvancedsettings
title: Create PersistedAdvancedSettings interface and schema
status: open
priority: high
prerequisites: []
created: "2025-07-31T12:34:22.884581"
updated: "2025-07-31T12:34:22.884581"
schema_version: "1.1"
parent: F-persistence-type-system-and-zod
---

# Create PersistedAdvancedSettings Interface and Schema

## Context

Create the persistence type definitions and Zod validation schema for advanced power-user settings. These settings control developer options and experimental features that need to persist across sessions.

Based on analysis of `AdvancedSettings.tsx`, the following properties need persistence:

- **Developer Options**: debugMode (boolean) - enables detailed logging in developer console
- **Experimental Features**: experimentalFeatures (boolean) - access to features in development with instability risk

## Implementation Requirements

### File Location

- Create in `packages/shared/src/types/settings/persistedAdvancedSettings.ts`
- Maintains separation from UI concerns in ui-shared package

### Type Definition

```typescript
interface PersistedAdvancedSettings {
  // Developer Options
  debugMode: boolean; // Enable debug logging

  // Experimental Features
  experimentalFeatures: boolean; // Enable unstable features
}
```

### Zod Schema Implementation

Create `advancedSettingsSchema` with:

- Boolean validation for both toggles
- Conservative defaults (both false for stability)
- Clear validation error messages
- Security consideration that experimental features are opt-in only
- Schema evolution support for future advanced options

### Validation Rules

- **debugMode**: boolean with default false (off by default for performance)
- **experimentalFeatures**: boolean with default false (off by default for stability)

### Security Considerations

- Both options default to false to prevent accidental activation
- Debug mode could expose sensitive information, so explicit opt-in required
- Experimental features may introduce security vulnerabilities, so careful validation
- No string inputs that could contain malicious code
- Simple boolean flags reduce attack surface

## Acceptance Criteria

- ✓ Interface defines minimal structure for advanced power-user settings
- ✓ Both settings default to false for security and stability
- ✓ Boolean validation prevents non-boolean values
- ✓ Schema handles undefined input by applying secure defaults
- ✓ Clear error messages for invalid boolean values
- ✓ Schema evolution support for future advanced/experimental options
- ✓ Unit tests cover boolean validation and default application
- ✓ Security validation ensures experimental features require explicit opt-in
- ✓ Documentation explains the risks of enabling experimental features
- ✓ Compatible with future addition of more advanced settings

## Testing Requirements

- Test valid boolean inputs (true/false) for both settings
- Test invalid inputs (strings, numbers, objects) throw validation errors
- Test undefined input correctly applies default values (false, false)
- Test partial objects correctly fill missing values with defaults
- Test schema parsing with various malformed inputs
- Test type inference produces correct TypeScript boolean types
- Test that defaults prioritize security (both false)

### Log
