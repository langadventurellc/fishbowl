---
id: T-remove-agents-subsections
title: Remove Agents Subsections from SettingsSidebar
status: open
priority: high
parent: F-remove-agent-defaults-and
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-20T18:27:45.166Z
updated: 2025-08-20T18:27:45.166Z
---

## Context

Update the `SettingsSidebar` component to remove the subsections under the "Agents" navigation item. Currently, the sidebar shows "Agents" with subsections for "Agents" and "Defaults", but since defaults functionality is being removed, only the main "Agents" section should remain without any subsections.

**Related Feature**: F-remove-agent-defaults-and  
**File Location**: `apps/desktop/src/components/Settings/sidebar/SettingsSidebar.tsx`

## Implementation Requirements

### Primary Deliverables

1. **Remove Agents Subsections**
   - Remove the `subsections` array from the agents section configuration
   - Ensure "Agents" appears as a single navigation item without sub-items
   - Maintain the existing icon (Users) and functionality

2. **Update Component with Unit Tests**
   - Add unit tests to verify agents section has no subsections
   - Test that sidebar navigation structure is correct
   - Verify clicking agents still navigates properly

### Technical Approach

**Current Structure (from research):**

```typescript
const sections: SettingsSection[] = [
  {
    id: "general",
    title: "General",
    icon: Settings2,
  },
  {
    id: "agents",
    title: "Agents",
    icon: Users,
    subsections: [
      { id: "agents", title: "Agents" },
      { id: "defaults", title: "Defaults" },
    ],
  },
  // ... other sections
];
```

**Target Structure:**

```typescript
const sections: SettingsSection[] = [
  {
    id: "general",
    title: "General",
    icon: Settings2,
  },
  {
    id: "agents",
    title: "Agents",
    icon: Users,
  },
  // ... other sections
];
```

### Step-by-Step Implementation

**Step 1: Locate and Update Configuration**

1. Find the `sections` array in `SettingsSidebar.tsx`
2. Locate the agents section object
3. Remove the entire `subsections` property
4. Verify the agents section only has `id`, `title`, and `icon` properties

**Step 2: Test Navigation Behavior**

- Ensure clicking "Agents" still navigates to the agents management interface
- Verify no sub-navigation items appear
- Check that navigation state management still works correctly

**Step 3: Create/Update Unit Tests**
Create test file: `apps/desktop/src/components/Settings/sidebar/__tests__/SettingsSidebar.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { SettingsSidebar } from '../SettingsSidebar';

describe('SettingsSidebar', () => {
  it('displays agents section without subsections', () => {
    render(<SettingsSidebar />);

    // Verify main agents section exists
    expect(screen.getByText('Agents')).toBeInTheDocument();

    // Verify no "Defaults" subsection exists
    expect(screen.queryByText('Defaults')).not.toBeInTheDocument();
  });

  it('maintains proper section structure', () => {
    render(<SettingsSidebar />);

    // Verify general section still exists
    expect(screen.getByText('General')).toBeInTheDocument();

    // Verify agents section exists as top-level item
    expect(screen.getByText('Agents')).toBeInTheDocument();
  });

  it('renders agents section with proper icon', () => {
    render(<SettingsSidebar />);

    // Verify Users icon is rendered (test implementation may vary based on icon component structure)
    const agentsSection = screen.getByText('Agents').closest('[role="button"]') || screen.getByText('Agents').parentElement;
    expect(agentsSection).toBeDefined();
  });
});
```

## Acceptance Criteria

### Functional Requirements

- [ ] Agents section appears as single navigation item without subsections
- [ ] No "Defaults" subsection visible in sidebar
- [ ] Agents section maintains existing navigation functionality
- [ ] Other sections (General, etc.) remain unaffected

### User Interface Requirements

- [ ] Sidebar navigation under "Agents" shows no sub-items
- [ ] Clicking "Agents" navigates directly to agents management
- [ ] Visual styling remains consistent with other top-level sections
- [ ] No layout issues or visual artifacts from removed subsections

### Technical Requirements

- [ ] subsections property completely removed from agents configuration
- [ ] TypeScript compilation succeeds without errors
- [ ] Component renders without warnings or errors
- [ ] Navigation state management works correctly

### Testing Requirements

- [ ] Unit test verifies no agents subsections present
- [ ] Unit test confirms agents section navigation works
- [ ] Unit test validates overall sidebar structure
- [ ] Tests pass with `pnpm test` command

## Files to Modify

1. **Primary File**: `apps/desktop/src/components/Settings/sidebar/SettingsSidebar.tsx`
2. **Test File**: `apps/desktop/src/components/Settings/sidebar/__tests__/SettingsSidebar.test.tsx` (create if doesn't exist)

## Dependencies

**Prerequisites**: None - this task can be completed independently

**Blocks**:

- Overall settings navigation improvements
- Settings UI consistency updates

## Security Considerations

No security implications - this is a navigation UI simplification task.

## Testing Strategy

**Unit Testing Approach:**

- Test sidebar renders without agents subsections
- Verify agents section maintains navigation functionality
- Confirm other sections remain unaffected
- Test overall sidebar structure integrity

**Manual Testing:**

1. Open Settings modal
2. Verify "Agents" appears in sidebar without subsections
3. Click "Agents" to confirm navigation works
4. Verify no "Defaults" option appears

**Test Commands:**

```bash
# Run specific component tests
pnpm test SettingsSidebar

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## Implementation Notes

- Focus on removing only the subsections property from agents configuration
- Do not modify other section structures or navigation logic
- Maintain existing styling and icon usage
- Ensure navigation state management continues to work
- Preserve any existing accessibility attributes

## Success Criteria

1. **Simplified Navigation**: Agents appears as single sidebar item without subsections
2. **Clean Configuration**: subsections property removed from agents section
3. **Functional Navigation**: Clicking agents still navigates correctly
4. **No Defaults References**: All defaults subsection references eliminated
5. **Test Coverage**: Unit tests verify simplified sidebar behavior
6. **Quality Checks**: TypeScript and ESLint pass without errors

This task completes the settings navigation simplification by removing the defaults subsection and presenting a cleaner, more focused navigation structure.
