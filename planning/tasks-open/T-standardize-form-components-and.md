---
kind: task
id: T-standardize-form-components-and
title: Standardize form components and touch targets with design tokens
status: open
priority: normal
prerequisites:
  - T-create-design-token-foundation
created: "2025-07-30T12:58:41.492407"
updated: "2025-07-30T12:58:41.492407"
schema_version: "1.1"
---

## Context

Replace hardcoded form component sizes and touch target values with design tokens to ensure consistent accessibility and usability standards.

## Target Components and Values

- `AgentForm.tsx` - `min-w-[120px]` button width
- `FormActions.tsx` - `min-w-[120px]` form action buttons
- `CreateRoleForm.tsx` - `min-w-[120px]` form buttons
- `SettingsContent.tsx` - `min-h-[44px] py-1` touch-friendly radio buttons
- `ProviderCard.tsx` - Complex touch target combinations:
  - `min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]` toggle buttons
  - `w-20 h-9 sm:w-[80px] sm:h-10 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]` test buttons
  - `p-2 sm:p-1 min-h-[44px] sm:min-h-auto` collapsible triggers

## Implementation Requirements

1. **Form button standardization**:
   - Create consistent minimum width token for form action buttons
   - Standardize button height for form interactions
   - Ensure buttons meet accessibility touch target guidelines

2. **Touch target accessibility**:
   - Standardize 44px minimum touch targets for mobile accessibility
   - Create responsive touch target tokens (44px mobile, smaller desktop where appropriate)
   - Simplify complex responsive touch target combinations

3. **Radio button and form controls**:
   - Standardize radio button touch areas
   - Create consistent form control sizing
   - Ensure form elements are accessible across devices

## Technical Approach

1. Define accessibility-focused design tokens for minimum touch targets
2. Create form component tokens for consistent button sizing
3. Simplify complex responsive combinations with clear token hierarchy
4. Maintain WCAG accessibility compliance for touch targets
5. Test form usability across devices

## Acceptance Criteria

- [ ] All form buttons use consistent minimum width design tokens
- [ ] Touch targets meet 44px minimum accessibility standard on mobile
- [ ] Complex responsive touch target combinations simplified with tokens
- [ ] Radio buttons and form controls use standardized sizing
- [ ] Form interactions remain accessible across desktop and mobile
- [ ] No visual regressions in form component layout or spacing

## Security Considerations

- Ensure form accessibility standards don't compromise security UX patterns

## Testing Requirements

- Test form interactions on both desktop and mobile devices
- Verify touch targets are easily accessible with finger navigation
- Check form button consistency across different form contexts
- Validate accessibility compliance with automated testing tools
- Test form usability with keyboard navigation

### Log
