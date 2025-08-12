---
id: T-update-role-schema-to-match
title: Update role schema to match feature requirements
status: open
priority: high
parent: F-role-creation-form
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-12T21:37:20.601Z
updated: 2025-08-12T21:37:20.601Z
---

# Update Role Schema to Match Feature Requirements

## Context

The current `roleSchema` in `packages/ui-shared/src/schemas/roleSchema.ts` has inconsistencies with the feature specification:

- `systemPrompt` field is marked as optional but should be required
- Maximum length is 2000 characters but feature spec requires 5000 characters
- Field requirements don't match the comprehensive feature specification

## Implementation Requirements

### Schema Updates Required

1. **System Prompt Field**: Change from optional to required with proper validation
2. **Character Limits**: Update to match feature specification (5000 chars for systemPrompt)
3. **Validation Messages**: Ensure error messages are clear and helpful

### Specific Changes to `roleSchema.ts`

```typescript
systemPrompt: z.string()
  .min(1, "System prompt is required")
  .max(5000, "System prompt must be 5000 characters or less")
  .refine(
    (val) => val.trim().length > 0,
    "System prompt cannot be only whitespace",
  );
// Remove .optional() to make it required
```

### Technical Approach

1. Open `packages/ui-shared/src/schemas/roleSchema.ts`
2. Modify the `systemPrompt` field validation rules
3. Remove the `.optional()` modifier to make it required
4. Update character limit from 2000 to 5000
5. Ensure validation messages are consistent with other fields

## Acceptance Criteria

- [ ] System prompt field is required (validation fails if empty/whitespace)
- [ ] Maximum character limit is 5000 characters
- [ ] Validation error messages are clear and helpful
- [ ] Schema changes don't break existing TypeScript compilation
- [ ] All existing tests continue to pass
- [ ] Schema validation works correctly in development

## Dependencies

- None - this is a foundational change needed for other form tasks

## Security Considerations

- Validate input length limits to prevent oversized data
- Ensure sanitization of user input through Zod validation
- Character limit enforcement protects against potential memory issues

## Testing Requirements

- Verify schema validation with valid system prompt (1-5000 chars)
- Test validation failure with empty system prompt
- Test validation failure with system prompt over 5000 chars
- Confirm TypeScript types are updated correctly
