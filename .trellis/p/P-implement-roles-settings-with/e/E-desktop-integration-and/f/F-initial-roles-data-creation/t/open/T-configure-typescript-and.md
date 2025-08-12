---
id: T-configure-typescript-and
title: Configure TypeScript and build to support JSON imports
status: open
priority: high
parent: F-initial-roles-data-creation
prerequisites:
  - T-create-default-roles-json
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T04:17:57.368Z
updated: 2025-08-12T04:17:57.368Z
---

# Configure TypeScript and Build for JSON Imports

## Context

Enable TypeScript to import JSON files and ensure the build process includes the JSON file in the shared package. This is required for the `createDefaultRolesSettings` function to import the default roles JSON.

## Implementation Requirements

### 1. Update TypeScript Configuration

**Target File**: `packages/shared/tsconfig.json`

**Required Changes**:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
    // ... existing options
  }
}
```

**Verification**: Ensure this is added to the compilerOptions if not already present.

### 2. Update Package Configuration

**Target File**: `packages/shared/package.json`

**Required Changes**:
Ensure JSON files are included in the package files or build output. Check existing `files` array and add if needed:

```json
{
  "files": ["dist", "src/**/*.json"]
}
```

**Alternative**: If using a build step, ensure the build process copies JSON files to the dist directory.

### 3. Create TypeScript Declaration for JSON

**Target File**: `packages/shared/src/types/json.d.ts` (create if needed)

**Content**:

```typescript
declare module "*.json" {
  const value: any;
  export default value;
}
```

**Purpose**: Provides TypeScript type definitions for JSON imports to avoid compilation errors.

## Acceptance Criteria

- [ ] TypeScript compiler can import JSON files without errors
- [ ] `resolveJsonModule` is enabled in tsconfig.json
- [ ] JSON files are included in the package build/distribution
- [ ] Type declaration exists for JSON module imports
- [ ] Build process completes without errors when importing JSON
- [ ] Package can be imported by desktop app with JSON data available

## Technical Verification

### TypeScript Compilation Test

Create a simple test file to verify JSON import works:

```typescript
// Test file (can be temporary)
import testJson from "../data/defaultRoles.json";
console.log(testJson.schemaVersion); // Should compile without errors
```

### Build Verification

- Run `pnpm build:libs` to ensure shared package builds successfully
- Verify JSON file exists in the dist output
- Confirm no TypeScript compilation errors related to JSON imports

## Testing Requirements

- Add a simple test that imports the JSON file and verifies it loads
- Test that the build process includes the JSON file in output
- Verify TypeScript compilation succeeds with JSON imports

## Build Integration

### Development

- Ensure the development build picks up JSON file changes
- Hot reloading should work with JSON modifications

### Production

- JSON file must be available in the built package
- Import paths must resolve correctly in the built version

## Dependencies

- Depends on: T-create-default-roles-json (JSON file must exist to test imports)
- Required by: T-update-createdefaultrolessetti (needs JSON imports to work)
- Related to: Shared package build configuration
