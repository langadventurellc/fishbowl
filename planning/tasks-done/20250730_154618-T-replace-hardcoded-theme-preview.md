---
kind: task
id: T-replace-hardcoded-theme-preview
status: done
title: Replace hardcoded theme preview colors with design tokens
priority: normal
prerequisites:
  - T-create-design-token-foundation
created: "2025-07-30T12:58:59.328388"
updated: "2025-07-30T15:37:31.787380"
schema_version: "1.1"
worktree: null
---

## Context

Replace hardcoded RGB color values in theme preview components with design tokens that properly reflect the actual theme system colors.

## Target Values in SettingsContent.tsx

**Dark theme hardcoded colors:**

- `background: "rgb(44, 40, 37)"`
- `foreground: "rgb(226, 232, 240)"`
- `border: "rgb(58, 54, 51)"`
- `primary: "rgb(129, 140, 248)"`
- `accent: "rgb(72, 68, 65)"`

**Light theme hardcoded colors:**

- `background: "rgb(245, 245, 244)"`
- `foreground: "rgb(30, 41, 59)"`
- `border: "rgb(214, 211, 209)"`
- `primary: "rgb(99, 102, 241)"`
- `accent: "rgb(214, 211, 209)"`

**Additional hardcoded values:**

- `w-[200px] h-[100px]` theme preview dimensions
- `transition-colors duration-200 ease-in-out` animation

## Implementation Requirements

1. **Reference actual theme system**:
   - Research current theme implementation in the codebase
   - Ensure preview colors match actual applied theme colors
   - Use CSS custom properties that reflect real theme values

2. **Create theme preview tokens**:
   - Theme preview dimensions (currently 200x100px)
   - Theme transition duration and easing
   - Color mapping that connects to actual theme system

3. **Dynamic color connection**:
   - Ensure theme preview updates when theme system changes
   - Avoid duplication between theme system and preview colors
   - Use CSS custom properties or theme system references

## Technical Approach

1. Investigate existing theme system implementation (CSS variables, Tailwind config)
2. Create design tokens that reference actual theme colors
3. Replace hardcoded RGB values with dynamic theme references
4. Update theme preview dimensions with design tokens
5. Test theme preview accuracy against actual applied themes

## Acceptance Criteria

- [ ] All hardcoded RGB values replaced with theme-connected design tokens
- [ ] Theme preview colors accurately reflect actual theme implementation
- [ ] Preview dimensions use design token system
- [ ] Theme preview updates dynamically when theme system changes
- [ ] No color duplication between theme system and preview
- [ ] Transition animations use design token timing values

## Testing Requirements

- Verify theme preview colors match actual applied themes in both light and dark modes
- Test theme switching to ensure preview updates correctly
- Check theme preview rendering consistency across different displays
- Validate theme preview accessibility (sufficient contrast ratios)

### Log

**2025-07-30T20:46:18.812787Z** - Successfully replaced all hardcoded RGB color values in ThemePreview component with design tokens that dynamically reference the actual theme system. The theme preview now automatically matches actual theme colors and updates when theme selection changes. Implemented CSS-based solution using custom properties for perfect color accuracy and eliminated JavaScript color duplication. All hardcoded dimensions and animations now use design token system. Updated corresponding tests to match new implementation.

- filesChanged: ["apps/desktop/src/styles/design-tokens.css", "apps/desktop/src/components/settings/SettingsContent.tsx", "apps/desktop/src/components/settings/__tests__/AppearanceSettings.test.tsx"]
