---
kind: task
id: T-implement-library-tab-with
title: Implement Library tab with search and agent cards display
status: open
priority: high
prerequisites:
  - T-create-agentssection-main
created: "2025-07-29T16:16:09.153034"
updated: "2025-07-29T16:16:09.153034"
schema_version: "1.1"
parent: F-agents-section-implementation
---

# Implement Library Tab with Search and Agent Cards

## Context

Create the Library tab component with interactive search functionality and agent card display. This component belongs in the **desktop project** (`apps/desktop/src/`), while shared interfaces belong in the **shared package**.

**Important**: This is UI/UX development only - use hardcoded mock data within the component for immediate demonstration. No backend integration required.

## Implementation Requirements

### 1. Component Creation

Create `apps/desktop/src/components/settings/agents/LibraryTab.tsx`:

- Search bar with "Search agents..." placeholder
- Real-time filtering of hardcoded agent list
- Agent cards in scrollable container
- Empty state handling
- "Create New Agent" button

### 2. Hardcoded Mock Data

Include realistic mock data directly in component:

```typescript
const mockAgents: AgentCard[] = [
  {
    id: "1",
    name: "Research Assistant",
    model: "Claude 3.5 Sonnet",
    role: "Research and Analysis",
    icon: "BookOpen",
  },
  {
    id: "2",
    name: "Code Reviewer",
    model: "GPT-4",
    role: "Code Analysis",
    icon: "Code",
  },
  // Add 8-10 more realistic examples
];
```

### 3. Search Functionality

- Debounced search input (300ms delay)
- Case-insensitive filtering across name, model, role
- Real-time results update
- Clear search functionality
- Empty results state with helpful message

### 4. Agent Cards Design

- Use shadcn/ui Card component
- Display: agent icon (Lucide React), name, model, role
- Edit and delete buttons (styled but non-functional)
- Hover states with subtle elevation
- Consistent spacing and visual hierarchy
- Loading skeleton states

### 5. Layout & Interaction

- Scrollable card container with proper spacing
- Responsive grid/list layout
- Smooth animations for card interactions
- Empty state: "No agents configured. Create your first agent!"
- Primary styled "Create New Agent" button

## Acceptance Criteria

- [ ] Search bar filters agents in real-time (300ms debounce)
- [ ] Agent cards display all required information clearly
- [ ] Edit/delete buttons present and styled (non-functional as specified)
- [ ] Empty state shows when no results found
- [ ] "Create New Agent" button styled as primary action
- [ ] Cards have proper hover states and animations
- [ ] Component is fully responsive
- [ ] Search works across name, model, and role fields
- [ ] Unit tests cover search functionality and rendering

## Technical Approach

1. Create LibraryTab component with useState for search and filtering
2. Implement debounced search using useCallback and useEffect
3. Create AgentCard sub-component for individual cards
4. Add hardcoded mock data with realistic agent examples
5. Style using shadcn/ui components and Tailwind classes
6. Include unit tests for search and rendering logic
7. Add proper TypeScript typing throughout

## UI/UX Focus

- Search feels immediate and responsive
- Cards provide clear visual hierarchy
- Hover states give appropriate feedback
- Empty states guide users effectively
- Loading states don't block interactions
- All interactions feel polished and intentional

## Testing Requirements

- Unit tests for search filtering logic
- Component rendering with mock data
- Search debouncing functionality
- Empty state display conditions
- Responsive layout verification

### Log
