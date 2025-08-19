---
id: T-add-character-counters-for
title: Add character counters for name and system prompt fields
status: open
priority: medium
parent: F-agent-form-simplification
prerequisites:
  - T-set-up-react-hook-form-with
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-19T18:25:11.185Z
updated: 2025-08-19T18:25:11.185Z
---

# Add character counters for name and system prompt fields

## Context

Implement real-time character counters for the name field (2-100 characters) and system prompt field (max 5000 characters) using the existing CharacterCounter component. The counters should update as the user types and provide visual feedback when approaching limits.

## Detailed Implementation Requirements

### Character Counter Integration

- Use the existing CharacterCounter component from `../CharacterCounter`
- Follow patterns from PersonalityNameInput and AgentNameInput components
- Display counters using the form's watch functionality for real-time updates
- Position counters appropriately within FormItem layout

### Name Field Implementation

```typescript
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <div className="flex items-center justify-between">
        <FormLabel>Agent Name</FormLabel>
        <CharacterCounter
          current={form.watch("name")?.length || 0}
          max={100}
        />
      </div>
      <FormControl>
        <Input
          {...field}
          placeholder="Enter agent name"
          maxLength={100}
          disabled={isSubmitting || isLoading}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### System Prompt Field Implementation

```typescript
<FormField
  control={form.control}
  name="systemPrompt"
  render={({ field }) => (
    <FormItem>
      <div className="flex items-center justify-between">
        <FormLabel>System Prompt (Optional)</FormLabel>
        <CharacterCounter
          current={field.value?.length || 0}
          max={5000}
        />
      </div>
      <FormControl>
        <Textarea
          {...field}
          placeholder="Enter custom system prompt..."
          maxLength={5000}
          className="min-h-[100px]"
          disabled={isSubmitting || isLoading}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Visual Feedback Implementation

- Character counter should change color when approaching limit (e.g., 90% of max)
- Use existing CharacterCounter styling and behavior
- Prevent input beyond maximum length with `maxLength` attribute
- Update counters immediately as user types

## Technical Implementation

### Files to Modify

- `apps/desktop/src/components/settings/agents/AgentForm.tsx`

### Dependencies

- CharacterCounter component from `../CharacterCounter`
- Input and Textarea from shadcn/ui
- Form watch functionality for real-time updates
- Existing patterns from AgentNameInput and PersonalityNameInput

### Key Implementation Steps

1. Import CharacterCounter component
2. Add character counter to name field with 100 character limit
3. Add character counter to system prompt field with 5000 character limit
4. Use form.watch() for real-time counter updates
5. Add maxLength attributes to prevent over-typing
6. Position counters in the label row using flex layout
7. Test counter updates and limit enforcement

## Acceptance Criteria

### Character Counter Display

- ✅ Name field shows "current/100" character count
- ✅ System prompt field shows "current/5000" character count
- ✅ Counters update in real-time as user types
- ✅ Counters positioned in top-right of field labels

### Visual Feedback

- ✅ Character counter changes appearance when approaching limit
- ✅ Input fields prevent typing beyond maximum length
- ✅ Counter styling matches existing CharacterCounter component
- ✅ Layout remains clean and uncluttered

### Form Integration

- ✅ Counters work correctly with form validation
- ✅ Character limits enforced by both counter and validation schema
- ✅ Counter updates work with form reset and programmatic changes
- ✅ No performance issues with real-time updates

### Accessibility

- ✅ Screen readers can access character count information
- ✅ Character limits are communicated clearly
- ✅ Focus management not disrupted by counter updates
- ✅ Error messages work alongside character counters

### Unit Testing Requirements

- Test character counter updates with typing
- Test character counter with form reset
- Test maxLength enforcement
- Test counter styling at different character levels
- Test counter behavior with long initial values

## Dependencies

- Requires T-set-up-react-hook-form-with to be completed
- Uses existing CharacterCounter component
- Follows patterns from AgentNameInput and PersonalityNameInput

## Security Considerations

- Validate character limits on both client and server side
- Prevent buffer overflow from extremely long inputs
- Sanitize text content to prevent injection attacks
- Ensure counter accuracy matches actual character count

## Performance Considerations

- Use form.watch() efficiently to avoid unnecessary re-renders
- Character counter updates should be smooth and responsive
- No lag when typing in text fields
- Counter component is lightweight and optimized
