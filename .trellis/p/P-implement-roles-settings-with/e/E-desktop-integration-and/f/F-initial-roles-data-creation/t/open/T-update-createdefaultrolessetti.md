---
id: T-update-createdefaultrolessetti
title: Update createDefaultRolesSettings to load from JSON file
status: open
priority: high
parent: F-initial-roles-data-creation
prerequisites:
  - T-create-default-roles-json
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T04:17:38.435Z
updated: 2025-08-12T04:17:38.435Z
---

# Update createDefaultRolesSettings Function

## Context

Modify the `createDefaultRolesSettings()` function to load default roles from the static JSON file instead of returning an empty roles array. This function is called when the app needs default roles configuration.

## Implementation Requirements

### Target File

Modify: `packages/shared/src/types/settings/createDefaultRolesSettings.ts`

### Current Implementation

```typescript
export const createDefaultRolesSettings = (): PersistedRolesSettingsData => ({
  schemaVersion: CURRENT_ROLES_SCHEMA_VERSION,
  roles: [],
  lastUpdated: new Date().toISOString(),
});
```

### Required Changes

1. **Add JSON Import**

   ```typescript
   import defaultRolesJson from "../../data/defaultRoles.json";
   ```

2. **Add Schema Import**

   ```typescript
   import { persistedRolesSettingsSchema } from "./rolesSettingsSchema";
   ```

3. **Update Function Implementation**

   ```typescript
   export const createDefaultRolesSettings = (): PersistedRolesSettingsData => {
     // Parse and validate the default roles JSON
     const result = persistedRolesSettingsSchema.safeParse({
       ...defaultRolesJson,
       lastUpdated: new Date().toISOString(),
     });

     if (!result.success) {
       // This should never happen in production as the JSON is validated at build time
       throw new Error(
         `Invalid default roles configuration: ${result.error.message}`,
       );
     }

     return result.data;
   };
   ```

4. **Add JSDoc Documentation**
   ```typescript
   /**
    * Creates default roles settings configuration with predefined roles from JSON.
    *
    * Loads initial roles from a static JSON file and validates them against
    * the schema. Adds current timestamp for lastUpdated field.
    *
    * @returns A valid default roles settings configuration with initial roles
    * @throws {Error} If the default roles JSON is invalid against the schema
    */
   ```

## Acceptance Criteria

- [ ] Function loads default roles from JSON file instead of empty array
- [ ] JSON data is validated against `persistedRolesSettingsSchema`
- [ ] Current timestamp is added to `lastUpdated` field
- [ ] Error handling for invalid JSON with descriptive error message
- [ ] Proper JSDoc documentation explaining the new behavior
- [ ] Function maintains same return type `PersistedRolesSettingsData`
- [ ] All imports are properly added

## Technical Considerations

### Validation Approach

- Use `safeParse()` for schema validation to get detailed error information
- Throw descriptive error if validation fails (should never happen in production)
- Preserve existing API contract (same return type)

### Error Handling

- Schema validation failures should include the validation error details
- Make error messages helpful for debugging
- Document that errors indicate a build-time issue

## Testing Requirements

- Create unit test that verifies function returns valid roles data
- Test that returned data matches the JSON file content
- Test that `lastUpdated` timestamp is current (within reasonable time window)
- Test error case with invalid JSON (mock the import)
- Verify schema validation is applied

## Dependencies

- Depends on: T-create-default-roles-json (JSON file must exist)
- Uses: `persistedRolesSettingsSchema` for validation
- Related to: `packages/shared/tsconfig.json` (will need JSON module resolution)
