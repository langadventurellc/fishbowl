---
id: T-clean-up-unused-exports
title: Clean up unused exports identified by Knip analysis
status: done
priority: low
prerequisites: []
affectedFiles:
  apps/desktop/src/adapters/desktopAgentsAdapter.ts:
    Removed 'export' keyword from
    DesktopAgentsAdapter class while keeping instance export
  apps/desktop/src/components/settings/index.ts: Removed ConfigurationSlider export from barrel file
  apps/desktop/src/components/settings/ConfigurationSlider.tsx: Deleted unused ConfigurationSlider component file
  packages/ui-shared/src/types/settings/index.ts: Removed ConfigurationSliderProps export from barrel file
  packages/ui-shared/src/types/settings/ConfigurationSliderProps.ts: Deleted unused ConfigurationSliderProps type definition file
log:
  - Successfully cleaned up unused exports identified by Knip analysis. Removed
    the DesktopAgentsAdapter class export while preserving the instance export
    that's actually used. Completely removed the unused ConfigurationSlider
    component and its associated type definition. All quality checks (linting,
    formatting, type checking) pass after the changes. This cleanup reduces code
    clutter and eliminates false positives in future Knip analyses.
schema: v1.0
childrenIds: []
created: 2025-08-21T18:08:23.869Z
updated: 2025-08-21T18:08:23.869Z
---

# Clean Up Unused Exports - Knip Cleanup

## Context

Knip identified 97 unused exports throughout the codebase. While many are false positives (UI components, context exports, barrel files), there are genuinely unused exports that can be safely removed to reduce code clutter.

## Implementation Requirements

### Exports to Remove (Focus Areas)

**Adapter Classes:**

- `DesktopAgentsAdapter` class export in `apps/desktop/src/adapters/desktopAgentsAdapter.ts`
  - Keep the instance export `desktopAgentsAdapter`, remove the class export
  - Only the instance is actually imported and used

**UI Components:**

- `ConfigurationSlider` component in `apps/desktop/src/components/settings/ConfigurationSlider.tsx`
  - Verify it's truly unused before removing

**Test Utilities:**

- Review test helper exports in `tests/desktop/helpers/index.ts`
  - Remove exports for helpers that are genuinely unused
  - Validate against actual test files to avoid breaking active tests

**Context/Provider Exports:**

- Carefully review context exports that may appear unused but are actually used by React
  - Focus only on clearly unused utility functions or classes

### Exports to Keep (False Positives)

**Do NOT remove:**

- **Barrel file exports** (`index.ts` files) - As specified by user
- **shadcn/ui component parts** - Standard practice to export all dropdown/select parts
- **React context exports** - Knip doesn't detect React context usage well
- **Active test helper exports** - Verify before removing

## Technical Approach

1. **Systematic review**: Go through the unused exports list methodically
2. **Verify usage**: Double-check each export isn't used via grep/search before removing
3. **Safe removal**: Remove exports in small batches, testing after each batch
4. **Focus on high-impact items**: Prioritize class exports and large components
5. **Leave complex cases**: Skip exports where usage is unclear or risky

## Acceptance Criteria

- [ ] Remove genuinely unused exports (estimated 10-15 items)
- [ ] Preserve all barrel file exports (index.ts files)
- [ ] Preserve all shadcn/ui component exports
- [ ] Preserve React context and hook exports
- [ ] No build errors or test failures after removal
- [ ] `pnpm quality` passes after all changes
- [ ] Reduced noise in future Knip analyses

## Verification Steps

1. Run `grep -r "ExportName" src/` before removing each export to verify it's unused
2. Run `pnpm quality` after each batch of removals
3. Run tests to ensure no functionality is broken
4. Re-run `pnpm knip` to verify the export cleanup reduced warnings

## Priority Guidelines

- **High priority**: Large class exports, clearly unused components
- **Medium priority**: Utility functions and helper exports
- **Low priority/Skip**: Context exports, complex dependency chains, barrel files

## Security Considerations

- Ensure removed exports weren't providing any security utilities
- Verify no exports being used in dynamic imports or string-based references
