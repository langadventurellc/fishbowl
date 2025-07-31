---
kind: task
id: T-create-master-persistedsettings
parent: F-persistence-type-system-and-zod
status: done
title: Create master PersistedSettings union type and schema
priority: high
prerequisites:
  - T-create-persistedgeneralsettings
  - T-create
  - T-create-persistedadvancedsettings
created: "2025-07-31T12:34:44.918362"
updated: "2025-07-31T13:39:21.414953"
schema_version: "1.1"
worktree: null
---

# Create Master PersistedSettings Union Type and Schema

## Context

Create the master type that combines all settings categories into a single interface for JSON persistence, along with the comprehensive Zod schema that validates the complete settings structure. This serves as the primary interface for the settings persistence system.

This task depends on the completion of the individual settings interfaces (General, Appearance, Advanced) and combines them into the final persistent structure.

## Implementation Requirements

### File Location

- Create in `packages/shared/src/types/settings/persistedSettings.ts`
- This becomes the main export for all persistence type definitions

### Type Definition

```typescript
interface PersistedSettings {
  // Schema versioning for future migrations
  schemaVersion: string;

  // Settings categories
  general: PersistedGeneralSettings;
  appearance: PersistedAppearanceSettings;
  advanced: PersistedAdvancedSettings;

  // Metadata
  lastUpdated: string; // ISO timestamp
}
```

### Master Schema Implementation

Create `persistedSettingsSchema` that:

- Combines all category schemas using `z.object()`
- Includes schema versioning with current version default
- Adds timestamp metadata with automatic generation
- Supports partial updates for incremental saves
- Validates complete settings structure
- Provides `.safeParse()` for error handling
- Supports schema evolution with `.passthrough()` for unknown fields

### Schema Versioning Support

- Current version: "1.0.0"
- Version field enables future migration logic
- Unknown fields preserved during version transitions
- Clear upgrade path for schema changes

### Utility Types

Create additional utility types:

```typescript
type PartialPersistedSettings = Partial<PersistedSettings>;
type PersistedSettingsUpdate = Partial<
  Omit<PersistedSettings, "schemaVersion" | "lastUpdated">
>;
```

## Implementation Guidance

### Schema Composition Pattern

```typescript
const persistedSettingsSchema = z
  .object({
    schemaVersion: z.string().default("1.0.0"),
    general: generalSettingsSchema,
    appearance: appearanceSettingsSchema,
    advanced: advancedSettingsSchema,
    lastUpdated: z
      .string()
      .datetime()
      .default(() => new Date().toISOString()),
  })
  .passthrough(); // Allow unknown fields for schema evolution
```

### Default Value Generation

- Master schema should generate complete default settings object
- Each category uses its own defaults
- Timestamp automatically set to current time
- Schema version automatically set to current version

## Acceptance Criteria

- ✓ Master interface combines all settings categories into single structure
- ✓ Schema validates complete settings structure with all categories
- ✓ Schema versioning system supports future migrations
- ✓ Automatic timestamp generation for lastUpdated field
- ✓ Partial update support for incremental settings changes
- ✓ Default value generation creates complete valid settings object
- ✓ Unknown field preservation supports schema evolution gracefully
- ✓ Type exports provide clean interface for persistence layer
- ✓ Unit tests cover complete settings validation and defaults
- ✓ Integration tests verify compatibility with JSON serialization

## Testing Requirements

- Test complete settings object validation with all categories
- Test partial settings updates preserve existing values
- Test schema version validation and default assignment
- Test timestamp generation and ISO format validation
- Test unknown field preservation during parsing
- Test default generation creates valid complete settings
- Test JSON serialization/deserialization round-trip compatibility
- Test error handling for malformed settings data across categories

### Log

**2025-07-31T18:50:39.829526Z** - Implemented master PersistedSettings union type and schema that combines all three settings categories (General, Appearance, Advanced) into a unified structure for JSON persistence. Created comprehensive validation schema with versioning support, automatic timestamp generation, and schema evolution capabilities. Established complete type system with utility types for partial updates and individual category modifications. All quality checks pass and shared package successfully rebuilt.

- filesChanged: ["packages/shared/src/types/settings/PersistedSettings.ts", "packages/shared/src/types/settings/persistedSettingsSchema.ts", "packages/shared/src/types/settings/PersistedSettingsData.ts", "packages/shared/src/types/settings/createDefaultPersistedSettings.ts", "packages/shared/src/types/settings/PartialPersistedSettings.ts", "packages/shared/src/types/settings/PersistedSettingsUpdate.ts", "packages/shared/src/types/settings/GeneralSettingsUpdate.ts", "packages/shared/src/types/settings/AppearanceSettingsUpdate.ts", "packages/shared/src/types/settings/AdvancedSettingsUpdate.ts", "packages/shared/src/types/settings/index.ts"]
