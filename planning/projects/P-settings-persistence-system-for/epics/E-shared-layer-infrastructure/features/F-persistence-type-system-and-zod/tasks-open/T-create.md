---
kind: task
id: T-create
title: Create PersistedAppearanceSettings interface and schema
status: open
priority: high
prerequisites: []
created: "2025-07-31T12:34:07.360246"
updated: "2025-07-31T12:34:07.360246"
schema_version: "1.1"
parent: F-persistence-type-system-and-zod
---

# Create PersistedAppearanceSettings Interface and Schema

## Context

Create the persistence type definitions and Zod validation schema for appearance and theme settings. This handles all UI customization preferences that need to persist across application sessions.

Based on analysis of `AppearanceSettings.tsx`, the following properties need persistence:

- **Theme**: selectedTheme ("light" | "dark" | "system")
- **Display Settings**: showTimestamps ("always" | "hover" | "never"), showActivityTime (boolean), compactList (boolean)
- **Chat Display**: fontSize (number 12-18), messageSpacing ("compact" | "normal" | "relaxed")

## Implementation Requirements

### File Location

- Create in `packages/shared/src/types/settings/persistedAppearanceSettings.ts`
- Maintains separation from UI concerns in ui-shared package

### Type Definition

```typescript
interface PersistedAppearanceSettings {
  // Theme Selection
  theme: "light" | "dark" | "system";

  // Display Settings
  showTimestamps: "always" | "hover" | "never";
  showActivityTime: boolean;
  compactList: boolean;

  // Chat Display Settings
  fontSize: number; // 12-18px
  messageSpacing: "compact" | "normal" | "relaxed";
}
```

### Zod Schema Implementation

Create `appearanceSettingsSchema` with:

- Enum validation for theme, timestamps, and message spacing options
- Font size validation with 12-18px range
- Boolean validation for toggles
- Default values matching current UI defaults
- Security validation for font size limits
- Clear error messages for invalid enum values

### Validation Rules

- **theme**: enum ["light", "dark", "system"] with default "system"
- **showTimestamps**: enum ["always", "hover", "never"] with default "hover"
- **showActivityTime**: boolean with default true
- **compactList**: boolean with default false
- **fontSize**: number 12-18, integer, default 14
- **messageSpacing**: enum ["compact", "normal", "relaxed"] with default "normal"

### Security Considerations

- Font size limits prevent CSS injection or layout breaking
- Enum validation prevents invalid values that could break theme system
- No custom CSS or URL inputs to prevent XSS
- String length limits on theme names prevent buffer issues

## Acceptance Criteria

- ✓ Interface defines exact structure optimized for JSON persistence
- ✓ All enum values match exactly with UI component options
- ✓ Font size validation prevents values that break UI layout
- ✓ Schema accepts undefined and applies appropriate defaults
- ✓ Invalid enum values rejected with suggestions for valid options
- ✓ Default values match current UI behavior and user expectations
- ✓ Schema evolution support for future theme/appearance options
- ✓ Unit tests cover all valid enum combinations
- ✓ Security validation prevents malicious font size values
- ✓ Cross-platform compatibility for theme resolution

## Testing Requirements

- Test all valid theme combinations (light/dark/system)
- Test all valid timestamp display options
- Test font size boundaries (12, 18, out-of-range values)
- Test invalid enum values throw descriptive errors
- Test boolean toggles accept true/false correctly
- Test default value application for partial/undefined inputs
- Test schema parsing with malformed appearance data

### Log
