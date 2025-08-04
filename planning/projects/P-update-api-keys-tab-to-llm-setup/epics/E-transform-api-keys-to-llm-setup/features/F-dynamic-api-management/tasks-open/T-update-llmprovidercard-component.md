---
kind: task
id: T-update-llmprovidercard-component
title: Update LlmProviderCard component with edit and delete actions
status: open
priority: high
prerequisites: []
created: "2025-08-04T13:36:29.051178"
updated: "2025-08-04T13:36:29.051178"
schema_version: "1.1"
parent: F-dynamic-api-management
---

## Context

The LlmProviderCard component needs to be updated to display configured API information with edit and delete action buttons. The component already exists at `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx` and follows the design patterns from the existing ProviderCard component.

## Implementation Requirements

- Update the component to display custom name prominently
- Show provider type (OpenAI/Anthropic) below the name
- Add Edit button with Pencil icon (Edit2 from lucide-react)
- Add Delete button with Trash icon (Trash2 from lucide-react)
- Ensure full-width card layout with proper spacing
- Follow existing button patterns from ProviderCard

## Technical Approach

1. Update the existing LlmProviderCard component interface to include all required fields
2. Implement the card layout with:
   - Custom name as primary text (font-semibold)
   - Provider type as secondary text (text-muted-foreground)
   - Action buttons aligned to the right
3. Use existing Button component with ghost variant for actions
4. Apply hover states and proper touch targets
5. Ensure responsive design following existing patterns

## Component Props

```typescript
interface LlmProviderCardProps {
  api: {
    id: string;
    customName: string;
    provider: "openai" | "anthropic";
    apiKey: string;
    baseUrl: string;
    useAuthHeader: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}
```

## Acceptance Criteria

- ✓ Card displays custom name as primary text
- ✓ Provider type shown below name with muted styling
- ✓ Edit button with Pencil icon on the right
- ✓ Delete button with Trash icon and destructive hover state
- ✓ Full-width card layout matching existing patterns
- ✓ Proper spacing and padding (p-4 or p-6)
- ✓ Hover states on interactive elements
- ✓ Buttons use ghost variant with proper touch targets

## File Location

- Update: `apps/desktop/src/components/settings/llm-setup/LlmProviderCard.tsx`

### Log
