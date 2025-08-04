---
kind: task
id: T-polish-card-layout-and
parent: F-dynamic-api-management
status: done
title: Polish card layout and interaction states
priority: low
prerequisites:
  - T-update-llmprovidercard-component
  - T-implement-dynamic-display
created: "2025-08-04T13:38:38.728422"
updated: "2025-08-04T14:35:53.853892"
schema_version: "1.1"
worktree: null
---

## Context

Final polish pass to ensure the LlmProviderCard components have proper styling, hover states, and handle edge cases like long text gracefully. This task focuses on visual refinement and user experience details.

## Implementation Requirements

- Ensure consistent card padding and spacing
- Add proper hover states for interactive elements
- Handle text overflow for long custom names
- Apply destructive styling to delete button
- Ensure touch-friendly button sizing
- Match existing card patterns from the codebase

## Technical Approach

1. Card container styling:
   - Use Card component from shadcn/ui
   - Apply consistent padding (p-4 or p-6)
   - Full-width layout (w-full)
   - Proper border and shadow following existing patterns

2. Text layout:
   - Custom name: `text-base font-semibold` with truncation
   - Provider type: `text-sm text-muted-foreground`
   - Use flexbox for proper alignment

3. Button styling:
   - Edit button: `variant="ghost" size="icon"`
   - Delete button: `variant="ghost" size="icon"` with destructive hover
   - Proper spacing between buttons
   - Touch targets minimum 44x44px

4. Handle edge cases:
   - Long custom names: `truncate` class for ellipsis
   - Many cards: Natural scrolling in parent container
   - Rapid interactions: Debounce if needed

## Visual Specifications

```typescript
// Card structure
<Card className="w-full">
  <CardContent className="p-4 flex items-center justify-between">
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-semibold truncate">{customName}</h3>
      <p className="text-sm text-muted-foreground">{providerLabel}</p>
    </div>
    <div className="flex items-center gap-2 ml-4">
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete}
              className="hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>
```

## Acceptance Criteria

- ✓ Cards have consistent padding and borders
- ✓ Custom names truncate with ellipsis when too long
- ✓ Provider type uses muted text color
- ✓ Edit button has proper ghost hover state
- ✓ Delete button has destructive hover state (red tint)
- ✓ Buttons maintain 44px touch targets
- ✓ Proper spacing between text and buttons
- ✓ Cards respond well to different viewport sizes

## Dependencies

- Requires T-update-llmprovidercard-component as base
- Requires T-implement-dynamic-display for layout context

## File Location

- Update: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`

## Testing Considerations

- Test with very long custom names
- Test with 10+ configured APIs
- Test rapid clicking of buttons
- Test on mobile viewport sizes

### Log

**2025-08-04T19:38:38.828596Z** - Polished LlmProviderCard layout and interaction states. Updated card padding to p-4, implemented proper text truncation with min-w-0 and truncate classes, changed text sizing to text-base, converted buttons to icon-only variants with proper touch targets, added destructive hover state for delete button, and improved spacing. All quality checks pass and component now matches design specifications exactly.

- filesChanged: ["apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx"]
