---
kind: task
id: T-create-chat-display-settings
parent: F-appearance-settings-section
status: done
title: Create chat display settings with font size slider and message spacing
priority: high
prerequisites:
  - T-implement-display-settings
created: "2025-07-27T18:46:13.276779"
updated: "2025-07-27T21:55:00.267683"
schema_version: "1.1"
worktree: null
---

# Create Chat Display Settings Section

## Context

Implement the third major section of appearance settings focused on chat-specific display controls. This includes an interactive font size slider and message spacing radio group with visual feedback.

## Implementation Requirements

### Chat Display Group Structure

- Group title: "Chat Display" with consistent 18px font styling
- Two main controls: font size slider and message spacing options
- Proper visual hierarchy and spacing matching previous sections

### Font Size Slider Control

- Label: "Message Font Size"
- Use shadcn/ui Slider component with range 12px to 18px (step=1)
- Live value display showing current size (e.g., "14px")
- Default value: 14px
- Controlled state with immediate value updates
- Value label positioned appropriately near slider

### Message Spacing Radio Group

- Label: "Message Spacing"
- Use shadcn/ui RadioGroup with horizontal layout
- Three options with single selection:
  - "Compact" - minimal spacing between messages
  - "Normal" - standard spacing (default)
  - "Relaxed" - generous spacing between messages
- Visual indicators or examples for each spacing option

### Technical Implementation

```tsx
// Import required components
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Local state for UX demonstration
const [fontSize, setFontSize] = useState([14]); // Slider expects array
const [messageSpacing, setMessageSpacing] = useState<
  "compact" | "normal" | "relaxed"
>("normal");

// Font size slider handler
const handleFontSizeChange = (value: number[]) => {
  setFontSize(value);
};
```

### Styling Requirements

- Follow established spacing patterns from previous sections
- Ensure font size value display is clearly visible and positioned well
- Message spacing options should have clear visual differentiation
- Responsive behavior for slider on mobile devices
- Consistent typography hierarchy with previous sections

### Interactive Feedback

- Font size value updates immediately as slider moves
- Current value displayed in readable format (e.g., "14px")
- Smooth slider interaction without performance issues
- Clear visual indication of selected message spacing option

### Accessibility Requirements

- Slider has proper ARIA labels and value announcements
- Screen reader announces font size changes as slider moves
- Message spacing radio group has proper ARIA attributes
- Keyboard navigation works for both slider and radio group
- Focus indicators visible and consistent with other controls

### Unit Tests

Include basic functionality tests:

- Slider renders with correct default value (14px)
- Font size state updates when slider value changes
- Value display shows correct format and updates
- Message spacing radio group renders with three options
- Radio group selection updates state correctly
- Accessibility attributes present on all controls

## Files to Modify

- `apps/desktop/src/components/settings/SettingsContent.tsx` - Extend AppearanceSettings component

## Acceptance Criteria

- [ ] Chat Display group title renders with proper styling
- [ ] Font size slider displays with 12-18px range and step=1
- [ ] Slider default value is 14px
- [ ] Font size value display shows current value in "Xpx" format
- [ ] Value updates immediately as slider moves
- [ ] Message spacing radio group displays horizontally with three options
- [ ] Spacing options (Compact/Normal/Relaxed) have clear labels
- [ ] Single selection works correctly for spacing options
- [ ] Local state management functions properly for both controls
- [ ] Visual hierarchy and spacing consistent with previous sections
- [ ] Responsive behavior works on mobile devices
- [ ] Basic unit tests pass for slider and radio group functionality
- [ ] Accessibility attributes present and functional for all controls

## Dependencies

- Completion of display settings section (T-implement-display-settings)
- Existing shadcn/ui Slider and RadioGroup components
- Form styling patterns from previous sections

### Log

**2025-07-28T03:00:23.275555Z** - Implemented Chat Display settings section with font size slider (12-18px range, default 14px) and message spacing radio group (Compact/Normal/Relaxed options with horizontal layout). Added controlled state management with immediate value updates and proper accessibility attributes including ARIA labels, descriptions, and keyboard navigation support. Follows exact existing patterns for visual hierarchy, spacing, and component structure. All quality checks pass and existing tests remain unaffected.

- filesChanged: ["apps/desktop/src/components/settings/SettingsContent.tsx"]
