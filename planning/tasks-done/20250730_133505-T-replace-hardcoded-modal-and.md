---
kind: task
id: T-replace-hardcoded-modal-and
status: done
title: Replace hardcoded modal and layout values with design tokens
priority: high
prerequisites:
  - T-create-design-token-foundation
created: "2025-07-30T12:57:50.918348"
updated: "2025-07-30T13:28:41.320230"
schema_version: "1.1"
worktree: null
---

## Context

Replace the most critical hardcoded values in modal and core layout components with design tokens from the foundation system.

## Target Components

- `SettingsModal.tsx` - Modal dimensions, shadows, responsive behavior
- `SettingsContent.tsx` - Content container widths and padding
- `ModalHeader.tsx` - Header height and padding
- `ModalFooter.tsx` - Footer height, padding, and button gaps

## Implementation Requirements

1. **Replace modal hardcoded values**:
   - `w-[80vw] h-[80vh] max-w-[1200px] max-h-[700px]` → design tokens
   - `min-w-[800px] min-h-[500px]` → design tokens
   - `shadow-[0_10px_25px_rgba(0,0,0,0.3)]` → design token
   - Responsive breakpoint overrides

2. **Update content layout values**:
   - `min-[1000px]:p-[30px]` → design token
   - `max-[999px]:p-[20px]` → design token
   - `max-w-[900px]` content constraints → design token

3. **Standardize header/footer**:
   - `h-[50px]` and `h-[60px]` → consistent design tokens
   - `px-5` padding → design token
   - `gap-2.5` button spacing → design token

## Technical Approach

1. Use design tokens created in foundation task
2. Update component class names to use token-based utilities
3. Maintain existing responsive behavior with token-based breakpoints
4. Test visual consistency across different screen sizes

## Acceptance Criteria

- [ ] All modal dimension hardcoded values replaced with design tokens
- [ ] Content padding and layout uses consistent token system
- [ ] Header and footer heights use standardized token values
- [ ] Responsive behavior maintained with no visual regressions
- [ ] Shadow values use design token system
- [ ] Component spacing follows token hierarchy

## Testing Requirements

- Test modal rendering at different screen sizes (desktop, tablet, mobile)
- Verify shadow and spacing appear identical to current implementation
- Validate responsive breakpoints function correctly
- Check accessibility of modal dimensions

### Log

**2025-07-30T18:35:05.229591Z** - Successfully replaced all hardcoded modal and layout values with design tokens from the foundation system. All modal dimensions, shadows, responsive behavior, content padding, header/footer heights, and button spacing now use standardized design tokens. Implementation maintains exact visual consistency while improving maintainability and design system adherence. All quality checks and tests pass successfully.

- filesChanged: ["apps/desktop/src/styles/design-tokens.css", "apps/desktop/src/components/settings/SettingsModal.tsx", "apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/ModalHeader.tsx", "apps/desktop/src/components/settings/ModalFooter.tsx"]
