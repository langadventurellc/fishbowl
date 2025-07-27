---
kind: task
id: T-implement-display-settings
title: Implement display settings section with timestamp and conversation list controls
status: open
priority: high
prerequisites:
  - T-replace-appearancesettings
created: "2025-07-27T18:45:52.964285"
updated: "2025-07-27T18:45:52.964285"
schema_version: "1.1"
parent: F-appearance-settings-section
---

# Implement Display Settings Section

## Context

Add the Display Settings section to the AppearanceSettings component with timestamp controls and conversation list toggles. This builds on the theme selection UI to create the second major section of appearance settings.

## Implementation Requirements

### Display Settings Group Structure

- Group title: "Display Settings" with consistent 18px font styling
- Two main control areas: timestamp settings and conversation list options
- Proper visual separation and spacing between controls

### Message Timestamps Control

- Label: "Show Timestamps"
- Use shadcn/ui RadioGroup component with vertical layout
- Three options with single selection:
  - "Always" - timestamps always visible
  - "On Hover" - timestamps show on message hover
  - "Never" - timestamps hidden
- Local state management for UX demonstration

### Conversation List Toggle Controls

- "Show last activity time" toggle switch with helper text
- "Compact conversation list" toggle switch with helper text
- Use shadcn/ui Switch component for toggle controls
- Proper labels and descriptions for each toggle
- Independent state management for each toggle

### Technical Implementation

```tsx
// Import required components
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Local state for UX demonstration
const [showTimestamps, setShowTimestamps] = useState<
  "always" | "hover" | "never"
>("hover");
const [showActivityTime, setShowActivityTime] = useState(true);
const [compactList, setCompactList] = useState(false);

// Follow form patterns from GeneralSettings component
```

### Styling Requirements

- Follow spacing patterns from existing form groups in GeneralSettings
- Use consistent typography hierarchy (18px group titles, proper spacing)
- Ensure proper visual separation between timestamp and conversation settings
- Responsive layout that works on mobile devices
- Maintain consistency with theme selection section above

### Accessibility Requirements

- Proper ARIA attributes for radio groups and switches
- Descriptive labels for all interactive elements
- Helper text for toggle switches explaining functionality
- Keyboard navigation support throughout controls
- Screen reader compatibility for all form elements

### Unit Tests

Include basic functionality tests:

- Radio group renders with correct options
- Toggle switches render with proper initial states
- State updates work correctly for all controls
- Accessibility attributes are properly applied
- Helper text displays correctly

## Files to Modify

- `apps/desktop/src/components/settings/SettingsContent.tsx` - Extend AppearanceSettings component

## Acceptance Criteria

- [ ] Display Settings group title renders with proper styling
- [ ] Timestamp radio group displays with three options (Always/On Hover/Never)
- [ ] Single selection works correctly for timestamp options
- [ ] Activity time toggle switch renders with descriptive label
- [ ] Compact list toggle switch renders with descriptive label
- [ ] Helper text displays for toggle switches
- [ ] Local state management works for all controls
- [ ] Visual spacing and hierarchy matches design requirements
- [ ] Responsive behavior functions on mobile devices
- [ ] Basic unit tests pass for all controls and state management
- [ ] Accessibility attributes present and functional for all form elements

## Dependencies

- Completion of theme selection UI task (T-replace-appearancesettings)
- Existing shadcn/ui Switch and RadioGroup components
- Form styling patterns from GeneralSettings component

### Log
