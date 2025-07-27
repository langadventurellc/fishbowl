---
kind: task
id: T-enhance-aria-attributes-for
parent: F-keyboard-navigation-and
status: done
title: Enhance ARIA attributes for screen reader support
priority: normal
prerequisites: []
created: "2025-07-27T11:57:10.107110"
updated: "2025-07-27T13:28:42.950160"
schema_version: "1.1"
worktree: null
---

# Enhance ARIA Attributes for Screen Reader Support

## Context and Purpose

Enhance the settings modal with comprehensive ARIA attributes, live regions, and screen reader announcements to ensure full compatibility with assistive technologies. This includes proper dialog structure, navigation landmarks, and dynamic content announcements.

**Reference**: Feature F-keyboard-navigation-and specifies comprehensive screen reader support with proper ARIA implementation for WCAG 2.1 AA compliance.

**Related Components**: All settings modal components, with focus on:

- `apps/desktop/src/components/settings/SettingsModal.tsx` (main dialog structure)
- `apps/desktop/src/components/settings/SettingsNavigation.tsx` (navigation landmarks)
- `apps/desktop/src/components/settings/SettingsContent.tsx` (content regions)

## Technical Implementation

### Create Accessibility Utils: `apps/desktop/src/utils/accessibility.ts`

```typescript
interface AriaAnnouncementOptions {
  priority?: 'polite' | 'assertive';
  clear?: boolean;
  delay?: number;
}

interface DialogAriaAttributes {
  titleId: string;
  descriptionId: string;
  labelledBy: string;
  describedBy: string;
}

// Utility functions for ARIA management
export const announceToScreenReader = (message: string, options?: AriaAnnouncementOptions) => { ... };
export const generateDialogAriaIds = (prefix: string): DialogAriaAttributes => { ... };
export const getAccessibleDescription = (section: string): string => { ... };
```

### Core Implementation Requirements

- **Dialog Structure**: Enhance modal with proper dialog ARIA pattern
- **Navigation Landmarks**: Add navigation role and proper labeling
- **Live Regions**: Implement ARIA live regions for dynamic announcements
- **Section Descriptions**: Provide accessible descriptions for each settings section
- **State Announcements**: Announce navigation changes and content updates
- **Error Handling**: Proper ARIA for validation messages and errors

## Detailed Acceptance Criteria

### Dialog ARIA Enhancement

- [ ] Modal has `role="dialog"` with proper `aria-labelledby` and `aria-describedby`
- [ ] Hidden screen reader title and description elements provide context
- [ ] `aria-modal="true"` indicates modal nature to assistive technology
- [ ] Proper dialog structure announced when modal opens
- [ ] Modal closing announced appropriately to screen readers

### Navigation ARIA Enhancement

- [ ] Navigation container has `role="navigation"` with descriptive `aria-label`
- [ ] Navigation items use `aria-current="page"` for active section
- [ ] Sub-navigation tabs have proper `role="tablist"` and `role="tab"` structure
- [ ] Navigation changes announced with section context
- [ ] Navigation structure announced with item count when focused

### Content ARIA Enhancement

- [ ] Main content area has `role="main"` with appropriate labeling
- [ ] Section headers have proper heading hierarchy (h1, h2, h3)
- [ ] Form elements have associated labels and help text via `aria-describedby`
- [ ] Error messages use `aria-live="assertive"` for immediate announcement
- [ ] Loading states announced via `aria-live="polite"`

### Live Region Implementation

- [ ] Dedicated live region for navigation announcements
- [ ] Separate live region for content changes and status updates
- [ ] Live region for error messages and validation feedback
- [ ] Proper cleanup of live region content to prevent announcement buildup
- [ ] Configurable announcement priorities (polite vs assertive)

## Testing Requirements

### Unit Test File: `apps/desktop/src/utils/__tests__/accessibility.test.ts`

**Required Test Cases:**

- [ ] `announceToScreenReader` creates proper live region announcements
- [ ] `generateDialogAriaIds` creates unique, valid IDs
- [ ] `getAccessibleDescription` returns appropriate descriptions for all sections
- [ ] Live region cleanup works correctly
- [ ] Multiple announcements queued properly
- [ ] ARIA ID generation avoids conflicts

### Integration Test File: `apps/desktop/src/components/settings/__tests__/SettingsModal.accessibility.test.ts`

**Required Test Cases:**

- [ ] Modal structure has all required ARIA attributes
- [ ] Navigation landmarks properly structured
- [ ] Screen reader receives navigation change announcements
- [ ] Content changes announced appropriately
- [ ] Error states announced correctly
- [ ] Tab navigation announces tab changes
- [ ] Modal opening/closing announced

### Accessibility Testing Tools Integration

```typescript
// Test helper for ARIA validation
const validateAriaStructure = (container: HTMLElement) => {
  // Check for required ARIA attributes
  // Validate proper role usage
  // Ensure proper labeling relationships
};

// Screen reader simulation
const simulateScreenReaderNavigation = () => {
  // Simulate common screen reader navigation patterns
  // Verify announcements are correct
};
```

## Component Enhancement Details

### SettingsModal.tsx Enhancements

- [ ] Add comprehensive ARIA structure with unique IDs
- [ ] Implement live regions for announcements
- [ ] Add proper dialog labeling and description
- [ ] Enhance focus management integration with ARIA state

```typescript
// Enhanced ARIA structure
<Dialog
  role="dialog"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
  aria-modal="true"
>
  <DialogContent>
    {/* Hidden descriptive content for screen readers */}
    <div id={titleId} className="sr-only">Settings</div>
    <div id={descriptionId} className="sr-only">
      Configure application settings including general preferences, API keys,
      appearance, agents, personalities, roles, and advanced options.
    </div>

    {/* Live regions for announcements */}
    <div
      id="navigation-announcements"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
    <div
      id="content-announcements"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
    <div
      id="error-announcements"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    />
  </DialogContent>
</Dialog>
```

### SettingsNavigation.tsx Enhancements

- [ ] Add navigation role and proper labeling
- [ ] Implement section count announcements
- [ ] Add navigation change announcements
- [ ] Enhance sub-navigation ARIA structure

```typescript
<nav
  role="navigation"
  aria-label="Settings sections"
  aria-describedby="nav-description"
>
  <div id="nav-description" className="sr-only">
    Navigate between {sections.length} settings sections using arrow keys
  </div>

  {sections.map((section) => (
    <NavigationItem
      key={section.id}
      aria-current={activeSection === section.id ? "page" : undefined}
      aria-describedby={`${section.id}-description`}
      // ... other props
    />
  ))}
</nav>
```

### SettingsContent.tsx Enhancements

- [ ] Add main content role and labeling
- [ ] Implement proper heading hierarchy
- [ ] Add section change announcements
- [ ] Enhance form accessibility

```typescript
<main
  role="main"
  aria-labelledby="content-title"
  aria-live="polite"
>
  <h1 id="content-title">{getSectionTitle(activeSection)}</h1>
  <p className="sr-only">{getAccessibleDescription(activeSection)}</p>

  {/* Section content with proper structure */}
  <SectionComponent />
</main>
```

## Implementation Guidance

### ARIA Best Practices

- Use semantic HTML elements before adding ARIA roles
- Ensure all interactive elements have accessible names
- Maintain proper heading hierarchy throughout content
- Use landmark roles to define page structure
- Implement proper live region etiquette

### Screen Reader Announcements

- Announce navigation changes with context ("Now viewing General settings")
- Provide count information for lists and navigation ("3 of 7 sections")
- Announce loading and error states immediately
- Clear outdated announcements to prevent confusion
- Use appropriate announcement timing (immediate vs delayed)

### Performance Considerations

- Debounce rapid navigation changes to prevent announcement spam
- Clean up live region content after announcements
- Minimize DOM mutations that trigger screen reader updates
- Use aria-atomic efficiently to control announcement scope

## Security Considerations

### Content Security

- Sanitize announcement content to prevent XSS through ARIA
- Validate ARIA ID generation to prevent injection attacks
- Ensure announcement content doesn't leak sensitive information
- Protect against malicious content in live regions

### Privacy Considerations

- Don't announce sensitive settings values
- Provide option to disable announcements for privacy
- Ensure announcement content respects user privacy settings

## Dependencies

- React hooks for state management
- Existing modal and navigation components
- Jest and React Testing Library for testing
- axe-core for automated accessibility testing

## File Organization

```
apps/desktop/src/utils/
├── accessibility.ts
└── __tests__/
    └── accessibility.test.ts

apps/desktop/src/components/settings/
├── SettingsModal.tsx (enhanced)
├── SettingsNavigation.tsx (enhanced)
├── SettingsContent.tsx (enhanced)
└── __tests__/
    └── SettingsModal.accessibility.test.ts
```

## Success Metrics

- All ARIA attributes validate correctly with axe-core
- Screen reader testing passes with NVDA, JAWS, and VoiceOver
- Navigation structure announced correctly in all tested screen readers
- Content changes announced appropriately without overwhelming users
- Error states and form validation announced immediately and clearly
- WCAG 2.1 AA compliance verified through automated and manual testing

### Log

**2025-07-27T19:03:45.122266Z** - Enhanced settings modal with comprehensive ARIA attributes, live regions, and screen reader announcements for WCAG 2.1 AA compliance. Implemented complete accessibility infrastructure including navigation landmarks, content regions, and semantic structure with proper dialog patterns. Created robust accessibility utilities with 21 passing unit tests covering all functionality.

- filesChanged: ["apps/desktop/src/utils/index.ts", "apps/desktop/src/utils/types.ts", "apps/desktop/src/utils/announceToScreenReader.ts", "apps/desktop/src/utils/generateDialogAriaIds.ts", "apps/desktop/src/utils/getAccessibleDescription.ts", "apps/desktop/src/utils/useAccessibilityAnnouncements.ts", "apps/desktop/src/utils/__tests__/accessibility.test.ts", "apps/desktop/src/components/settings/SettingsModal.tsx", "apps/desktop/src/components/settings/SettingsNavigation.tsx", "apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/ModalHeader.tsx", "apps/desktop/src/components/settings/ModalFooter.tsx", "apps/desktop/src/components/settings/__tests__/SettingsModal.keyboard.test.tsx", "packages/shared/src/types/ui/components/ModalHeaderProps.ts"]
