---
kind: task
id: T-migrate-messagecontent-component
title: Migrate MessageContent component inline styles to Tailwind utilities
status: open
priority: normal
prerequisites:
  - T-migrate-messageitem-component
created: "2025-07-25T21:39:11.208585"
updated: "2025-07-25T21:39:11.208585"
schema_version: "1.1"
parent: F-css-in-js-to-tailwind-migration
---

# Migrate MessageContent Component Inline Styles to Tailwind Utilities

## Context

Convert the MessageContent component from CSS-in-JS inline styles to Tailwind utility classes. This component handles message content display with expansion states, text formatting, code highlighting, and interactive content expansion that must maintain perfect readability and user interaction patterns.

## Detailed Implementation Requirements

### Files to Modify

- `apps/desktop/src/components/chat/MessageContent.tsx` - Message content display component
- Related message content styling and interaction files

### Current CSS-in-JS Patterns to Migrate

#### Content Display Styles

- Main content area styling with proper typography and spacing
- Text formatting for different content types (plain text, markdown, code)
- Line height and font size management for optimal readability
- Text color management with theme integration

#### Expansion State Styles

- Collapsed state with content preview and truncation
- Expanded state with full content display
- Expansion toggle button styling with opacity changes on hover
- Smooth transitions between collapsed and expanded states

#### Interactive Element Styles

- Expansion toggle button with hover states (`opacity: 0.7` on hover)
- Click areas with proper cursor styling and accessibility
- Focus states for keyboard navigation
- Role and tabindex management for screen reader accessibility

#### Content Type Handling

- Different styling for various content types
- Code block formatting and syntax highlighting integration
- Markdown rendering with appropriate spacing and typography
- Link styling and interactive elements within content

### Technical Approach

1. **Analyze Content Structure**: Study the content display patterns and expansion logic
2. **Convert Typography**: Transform text styling to Tailwind typography utilities
3. **Migrate Expansion States**: Convert collapsed/expanded states to Tailwind utilities
4. **Handle Interactive Elements**: Convert expansion controls to Tailwind interactive variants
5. **Preserve Content Behavior**: Maintain exact content readability and expansion functionality

### Specific Migration Patterns

#### Content Container

- Use appropriate typography utilities: `text-base`, `leading-relaxed` for readability
- Apply `text-foreground` for main content color
- Handle content width and max-width with responsive utilities
- Use proper spacing utilities for content padding and margins

#### Expansion Toggle Button

- Apply `hover:opacity-70` for hover state (matches original `opacity: 0.7`)
- Use `cursor-pointer` for interactive indication
- Add `transition-opacity duration-150` for smooth hover transitions
- Handle `focus:outline-none focus:ring-2 focus:ring-ring` for accessibility

#### Content State Management

- Use conditional classes for collapsed vs expanded states
- Apply `line-clamp-*` utilities for content truncation in collapsed state
- Handle height transitions with appropriate transition utilities
- Manage overflow with `overflow-hidden` in collapsed state

#### Interactive Accessibility

- Ensure `role="button"` and `tabIndex={0}` work with Tailwind styling
- Handle keyboard event styling with focus states
- Apply appropriate ARIA attributes with visual state changes

### Detailed Acceptance Criteria

#### Visual Parity Requirements

✅ **Content Typography**: Text rendering matches original font size, line height, and spacing
✅ **Expansion States**: Collapsed and expanded states appear identical to original
✅ **Interactive Elements**: Expansion toggle button styling and hover effects preserved
✅ **Content Formatting**: All content types (text, code, markdown) formatted identically
✅ **Color Integration**: All text colors work correctly with theme system

#### Interaction Requirements

✅ **Expansion Toggle**: Click and keyboard activation work exactly as before
✅ **Hover Effects**: Toggle button hover opacity changes work smoothly
✅ **State Transitions**: Smooth transitions between collapsed and expanded states
✅ **Focus Management**: Keyboard focus provides clear visual indication
✅ **Screen Reader**: Content expansion announced correctly to screen readers

#### Content Requirements

✅ **Text Readability**: All content remains highly readable with proper typography
✅ **Content Truncation**: Collapsed state truncates content appropriately
✅ **Content Expansion**: Expanded state shows full content without layout issues
✅ **Content Types**: Different content types render correctly with appropriate styling
✅ **Responsive Behavior**: Content adapts correctly to different message widths

### Dependencies and Integration Points

- **MessageItem Component**: Content must integrate correctly with migrated MessageItem
- **MessageHeader Component**: Content must work correctly with message header layout
- **Theme System**: Full integration with CSS variable theme system
- **Typography System**: Content must use consistent typography patterns
- **Accessibility System**: Content expansion must work with screen readers and keyboard navigation

### Testing Requirements

#### Unit Testing

- Verify content renders with correct Tailwind typography classes
- Test expansion state changes apply correct utilities
- Confirm interactive toggle works with Tailwind hover and focus variants
- Validate theme switching updates content colors correctly

#### Visual Regression Testing

- Screenshot comparison of content in collapsed and expanded states
- Test content appearance in light and dark modes
- Capture expansion toggle button states and hover effects
- Verify content typography and formatting accuracy

#### Integration Testing

- Test content within full message context
- Verify content expansion works within message layout constraints
- Confirm content works with different message types and lengths
- Test content responsive behavior at different message widths

#### Accessibility Testing

- Verify screen reader announces content expansion correctly
- Test keyboard navigation works through expansion controls
- Confirm focus indicators are visible and accessible
- Validate content expansion with assistive technologies

### Performance Considerations

- **Text Rendering**: Content should render efficiently with Tailwind typography
- **Expansion Performance**: State transitions should be smooth without layout thrashing
- **Content Layout**: Expanded content should not cause performance issues
- **Memory Usage**: Reduced style object creation compared to CSS-in-JS

### Security Considerations

- **Content Safety**: Message content does not affect component styling security
- **XSS Prevention**: All styling through safe Tailwind utilities
- **CSP Compliance**: No inline styles violate Content Security Policy
- **Content Isolation**: Content expansion does not expose sensitive information

### Content Type Considerations

#### Text Content

- Plain text formatting with proper line height and spacing
- Text wrapping and overflow handling
- Link styling within content if applicable

#### Code Content

- Code block formatting with monospace fonts
- Syntax highlighting integration if applicable
- Proper spacing and indentation for code readability

#### Markdown Content

- Markdown rendering with appropriate heading, list, and emphasis styling
- Consistent spacing between markdown elements
- Integration with application theme system

This task ensures message content remains perfectly readable and interactive while working seamlessly with the Tailwind utility system and maintaining exact expansion behavior.

### Log
