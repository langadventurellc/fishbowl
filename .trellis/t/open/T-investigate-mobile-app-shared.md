---
id: T-investigate-mobile-app-shared
title: Investigate mobile app shared package integration
status: open
priority: high
prerequisites: []
affectedFiles: {}
log: []
schema: v1.0
childrenIds: []
created: 2025-08-09T17:03:58.467Z
updated: 2025-08-09T17:03:58.467Z
---

# Investigate Mobile App Shared Package Integration

## Context

Knip analysis revealed concerning issues with the mobile app architecture:

- Mobile app has unused `@fishbowl-ai/shared` dependency (should contain business logic)
- Mobile app has unused `@fishbowl-ai/ui-theme` dependency
- Entire `apps/mobile/src/providers/*` system appears unused
- This suggests incomplete integration between mobile and shared packages

## Specific Implementation Requirements

Investigate and document:

1. Why mobile app isn't using `@fishbowl-ai/shared` for business logic
2. Current mobile app architecture vs intended monorepo structure
3. Status of provider system in mobile app (incomplete feature or obsolete code)
4. Integration gaps between mobile app and shared packages
5. Theme system integration status between mobile and shared packages

## Technical Approach

1. Examine mobile app source code structure and current architecture
2. Compare with desktop app's usage of shared packages for patterns
3. Review shared package exports to understand what should be used by mobile
4. Analyze provider files to understand their intended purpose
5. Check git history to understand when mobile/shared integration was intended
6. Document current state vs intended architecture
7. Create recommendations for next steps

## Detailed Acceptance Criteria

- Complete analysis of current mobile app architecture documented
- Comparison with intended monorepo structure (from docs/architecture/monorepo.md)
- Clear identification of integration gaps and missing connections
- Assessment of whether provider files are obsolete or incomplete features
- Recommendations for either:
  - Integrating shared packages properly, OR
  - Removing unused dependencies and cleaning up unused code
- Risk assessment of potential changes needed
- Estimate of effort required for proper integration

## Research Areas

- Review `docs/architecture/monorepo.md` for intended mobile architecture
- Examine how desktop app uses shared packages as reference pattern
- Check mobile app's current state management vs shared Zustand stores
- Analyze mobile app's current data layer vs shared business logic
- Understand theme system expectations for mobile

## Testing Requirements

- Document current mobile app functionality that works
- Identify any existing mobile features that should be using shared code
- Test current mobile app build and runtime behavior
- Verify what mobile-specific features exist vs shared logic

## Dependencies

None - this is primarily investigative work that can be done independently.

## Output Deliverables

- Detailed analysis report (can be added to task log or separate documentation)
- Specific recommendations for next steps
- Risk assessment for integration work
- Priority assessment (fix integration vs remove unused dependencies)
