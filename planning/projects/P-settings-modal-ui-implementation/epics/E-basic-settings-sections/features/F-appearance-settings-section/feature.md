---
kind: feature
id: F-appearance-settings-section
title: Appearance Settings Section Implementation
status: done
priority: normal
prerequisites: []
created: "2025-07-27T16:37:38.269268"
updated: "2025-07-28T03:13:19.578360+00:00"
schema_version: "1.1"
parent: E-basic-settings-sections
---

# Appearance Settings Section Implementation

## Purpose and Goals

Replace the placeholder mockups in the Appearance Settings section with fully functional theme controls, display settings, and chat customization options. Implement theme preview, live font size adjustment, and interactive message spacing controls with immediate visual feedback.

## Key Components to Implement

### Theme Selection System

- **Theme Radio Group**: Light, Dark, and System options with vertical layout
- **Theme Preview Area**: 200x100px live preview showing current theme colors
- **System Theme Integration**: Proper detection and switching of system preferences

### Display Settings

- **Message Timestamps**: Radio group for Always/On Hover/Never options
- **Conversation List Options**: Toggle switches for activity time and compact mode
- **Responsive Layout**: Proper grouping and spacing of display options

### Chat Display Settings

- **Font Size Slider**: 12px-18px range with live preview text
- **Message Spacing**: Radio group for Compact/Normal/Relaxed options with visual examples
- **Live Preview**: Real-time feedback for font and spacing changes

## Detailed Acceptance Criteria

### Visual Requirements

- [ ] Section title: "Appearance" with exact 24px font and 20px margin-bottom
- [ ] Section description: "Customize the appearance and theme of the application"
- [ ] Three distinct setting groups with proper visual separation
- [ ] Consistent typography and spacing throughout the section

### Theme Selection Group

- [ ] Group title: "Theme" with 18px font, semi-bold weight
- [ ] Vertical radio button layout with proper spacing
- [ ] Three theme options:
  - [ ] "Light" radio button with proper label
  - [ ] "Dark" radio button with proper label
  - [ ] "System" radio button with proper label and description
- [ ] Theme preview area:
  - [ ] Exactly 200px width × 100px height
  - [ ] Live preview showing current theme colors
  - [ ] Background, text, and accent color representation
  - [ ] Smooth transitions when theme changes
  - [ ] Border and styling to indicate preview area

### Display Settings Group

- [ ] Group title: "Display Settings" with consistent styling
- [ ] Message timestamps radio group:
  - [ ] Label: "Show Timestamps"
  - [ ] Three options: "Always", "On Hover", "Never"
  - [ ] Vertical layout with proper spacing
  - [ ] Single selection enforcement
- [ ] Conversation list toggles:
  - [ ] "Show last activity time" toggle switch
  - [ ] "Compact conversation list" toggle switch
  - [ ] Proper toggle switch styling and behavior
  - [ ] Helper text for each option

### Chat Display Settings Group

- [ ] Group title: "Chat Display" with consistent styling
- [ ] Font size slider:
  - [ ] Label: "Message Font Size"
  - [ ] Range: 12px to 18px with step=1
  - [ ] Live value display showing current size
  - [ ] Live preview text below slider
  - [ ] Preview text updates in real-time as slider moves
  - [ ] Default value: 14px
- [ ] Message spacing radio group:
  - [ ] Label: "Message Spacing"
  - [ ] Three options: "Compact", "Normal", "Relaxed"
  - [ ] Visual examples or indicators for each spacing option
  - [ ] Single selection enforcement
  - [ ] Horizontal layout for spacing options

### Live Preview Functionality

- [ ] Theme preview updates immediately when selection changes
- [ ] Font size preview text adjusts in real-time with slider
- [ ] Preview text content: "This is how your messages will appear"
- [ ] Smooth transitions for all preview updates
- [ ] No delays or lag in preview updates

### Accessibility Requirements

- [ ] All radio groups have proper ARIA attributes
- [ ] Toggle switches have descriptive labels
- [ ] Slider has ARIA label and value announcements
- [ ] Theme preview has appropriate ARIA description
- [ ] Keyboard navigation works throughout all controls
- [ ] Focus indicators are visible and consistent
- [ ] Screen reader compatibility for all interactive elements

## Implementation Guidance

### Technical Approach

- Use shadcn/ui RadioGroup for theme selection and spacing options
- Use shadcn/ui Toggle for conversation list settings
- Use shadcn/ui Slider for font size with controlled state
- Implement live preview with CSS custom properties
- Use CSS-in-JS or CSS variables for theme switching
- Connect to existing theme context/store

### Component Architecture

```tsx
// Theme selection with live preview
<FormGroup title="Theme">
  <RadioGroupField
    name="theme"
    options={[
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System" }
    ]}
    layout="vertical"
  />
  <ThemePreview currentTheme={selectedTheme} />
</FormGroup>

// Font size with live preview
<FormGroup title="Chat Display">
  <SliderField
    name="fontSize"
    min={12}
    max={18}
    step={1}
    label="Message Font Size"
    valueDisplay={(value) => `${value}px`}
  />
  <LivePreview fontSize={currentFontSize} />
</FormGroup>
```

### Theme Preview Component

```tsx
const ThemePreview: React.FC<{ currentTheme: string }> = ({ currentTheme }) => (
  <div
    className="w-[200px] h-[100px] border rounded p-3 transition-colors"
    data-theme={currentTheme}
    aria-label="Theme preview"
  >
    <div className="text-sm font-medium">Preview</div>
    <div className="text-xs text-muted-foreground">Sample text</div>
    <div className="mt-2 w-full h-2 bg-primary rounded" />
  </div>
);
```

### State Management

```tsx
interface AppearanceState {
  theme: "light" | "dark" | "system";
  showTimestamps: "always" | "hover" | "never";
  showActivityTime: boolean;
  compactList: boolean;
  fontSize: number; // 12-18
  messageSpacing: "compact" | "normal" | "relaxed";
}
```

### Validation Schema

```tsx
const AppearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  showTimestamps: z.enum(["always", "hover", "never"]),
  showActivityTime: z.boolean(),
  compactList: z.boolean(),
  fontSize: z.number().min(12).max(18),
  messageSpacing: z.enum(["compact", "normal", "relaxed"]),
});
```

## Testing Requirements

### Functional Testing

- [ ] Theme selection updates preview immediately
- [ ] Font size slider updates preview text in real-time
- [ ] Toggle switches change state correctly
- [ ] Radio groups allow single selection only
- [ ] Preview areas show correct visual representation
- [ ] System theme option detects OS preference

### Visual Testing

- [ ] Theme preview shows accurate colors for each theme
- [ ] Font size preview demonstrates actual size changes
- [ ] Message spacing options show visual differences
- [ ] Preview area maintains exact 200x100px dimensions
- [ ] All components match design specifications
- [ ] Responsive behavior works on mobile devices

### Accessibility Testing

- [ ] Screen reader announces theme changes
- [ ] Slider value changes are announced properly
- [ ] Toggle state changes are communicated clearly
- [ ] Keyboard navigation works throughout all controls
- [ ] Focus management is proper for radio groups
- [ ] Color contrast meets standards in all themes

### Performance Testing

- [ ] Preview updates respond within 50ms
- [ ] Slider movement is smooth without lag
- [ ] Theme transitions complete within 300ms
- [ ] No unnecessary re-renders during interactions
- [ ] Memory usage stays consistent during preview updates

## Security Considerations

### Theme Security

- Validate theme values to prevent injection
- Sanitize CSS custom property values
- Secure theme persistence mechanism

### Input Validation

- Range validation for font size slider
- Enum validation for radio group selections
- Type safety with TypeScript and Zod schemas

## Performance Requirements

- [ ] Theme preview renders in under 100ms
- [ ] Font size slider responds within 50ms
- [ ] Theme switching completes within 300ms
- [ ] Preview updates are smooth and immediate
- [ ] No layout shifts during theme changes
- [ ] Efficient re-rendering with proper memoization

## Dependencies

- shadcn/ui RadioGroup, Toggle, Slider components
- shadcn/ui Form components for validation
- Existing theme context/provider system
- CSS custom properties for theme implementation
- React Hook Form for state management
- Zod for validation schemas

## Integration Points

- Integrates with existing theme system and context
- Uses established form patterns from other sections
- Connects to settings store for persistence
- Maintains consistency with modal accessibility patterns
- Works with responsive layout system

## Live Preview Implementation

### Theme Preview Features

- Real-time color updates based on selected theme
- Representation of background, text, and accent colors
- Smooth CSS transitions between themes
- Proper contrast demonstration

### Font Size Preview Features

- Live text sample that updates as slider moves
- Demonstrates actual font size in context
- Sample text: "This is how your messages will appear"
- Maintains proper line height and spacing

### Message Spacing Preview Features

- Visual indicators or examples for each spacing option
- Demonstrates actual spacing differences
- Helps users understand the impact of their choice
- Clear visual differentiation between options

## Responsive Design Considerations

- [ ] Theme selection works properly on mobile devices
- [ ] Preview areas scale appropriately on smaller screens
- [ ] Touch interactions work correctly for sliders and toggles
- [ ] Radio groups maintain proper spacing on mobile
- [ ] Font size preview remains readable on all screen sizes

### Log
