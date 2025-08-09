---
id: T-investigate-mobile-app-shared
title: Investigate mobile app shared package integration
status: done
priority: high
prerequisites: []
affectedFiles: {}
log:
  - >-
    # Mobile App Shared Package Integration Analysis - COMPLETE


    ## Executive Summary


    **CRITICAL FINDING**: The mobile app is currently a bare-bones prototype
    that completely ignores the intended monorepo architecture. It implements
    basic functionality without using any shared business logic, creating
    significant architectural drift from the intended design.


    ## Current State Analysis


    ### Mobile App Current Architecture (Actual)

    - **Entry Point**: Basic React Navigation with two simple screens
    (Dashboard, Settings)  

    - **Business Logic**: Each screen implements its own primitive logger
    (console.log wrapper)

    - **State Management**: None - no shared stores, no authentication

    - **Provider System**: Exists but completely unused (all files in
    `apps/mobile/src/providers/*`)

    - **Shared Package Usage**: Zero - despite having `@fishbowl-ai/shared`
    dependency

    - **Theme Integration**: Zero - despite having `@fishbowl-ai/ui-theme`
    dependency


    ### Intended Architecture (Per docs/architecture/monorepo.md)

    The mobile app SHOULD have:

    - Provider system with DatabaseProvider, SecureStorageProvider,
    AIServiceProvider

    - Authentication using `useAuthStore` from shared package

    - Login/Dashboard/Settings/Chat screens with proper navigation

    - Full integration with shared business logic

    - Proper theme system integration


    ### Desktop App Reference Pattern (Works Correctly)

    - Extensive usage of `@fishbowl-ai/shared` (50+ import locations)

    - Uses `createLoggerSync` consistently across all components

    - Imports shared types: `PersistedSettingsData`, `LlmConfig`, `Provider`,
    etc.

    - Uses shared services: `SettingsRepository`, validation, error handling

    - Implements proper business logic separation


    ## Integration Gaps Identified


    ### 1. **Logging System**

    - **Problem**: Mobile screens implement basic console.log wrapper

    - **Solution**: Should use `createLoggerSync` from
    `@fishbowl-ai/shared/logging`

    - **Benefit**: Structured logging with context, platform detection, multiple
    transports


    ### 2. **Provider System** 

    - **Problem**: Comprehensive provider files exist but are completely unused

    - **Status**: All providers are placeholder implementations with "future
    task" comments

    - **Assessment**: These are incomplete stubs, not functional implementations


    ### 3. **State Management**

    - **Problem**: No shared state management (authentication, app state)

    - **Should Use**: Zustand stores from shared package (like desktop does)


    ### 4. **Business Logic**

    - **Problem**: Mobile implements no business logic - just basic UI

    - **Should Use**: API services, validation, repositories from shared package


    ### 5. **Theme System**

    - **Problem**: `@fishbowl-ai/ui-theme` package is nearly empty (just
    comments)

    - **Assessment**: Theme system not yet implemented in the monorepo


    ## Root Cause Analysis


    **The mobile app appears to be an early prototype that was never properly
    integrated with the shared architecture.** Evidence:


    1. **Provider Placeholders**: All providers have "Placeholder for future"
    comments

    2. **Minimal Functionality**: Only basic navigation and static content

    3. **No Authentication**: Missing core application features

    4. **Divergent Patterns**: Reimplements functionality that exists in shared
    packages


    ## Risk Assessment


    ### High Risk Issues

    1. **Architecture Drift**: Mobile and desktop codebases are diverging

    2. **Code Duplication**: Mobile reimplements what shared packages provide

    3. **Feature Parity**: Mobile lacks authentication, proper logging, business
    logic

    4. **Maintenance Burden**: Changes must be made in multiple places


    ### Medium Risk Issues  

    1. **Bundle Size**: Unused dependencies increase mobile app size

    2. **Development Confusion**: Unclear which packages mobile should use

    3. **Testing Gaps**: Mobile tests assume different architecture than
    intended


    ## Recommendations


    ### Option A: Complete Integration (Recommended)

    **Priority: High | Effort: Medium | Impact: High**


    1. **Phase 1 - Immediate Integration**
       - Replace mobile logger implementations with `createLoggerSync` from shared
       - Remove unused provider files (they're just placeholders)
       - Update mobile App.tsx to match intended architecture from docs

    2. **Phase 2 - Core Features**  
       - Implement authentication using shared stores
       - Add proper screen routing with auth guards
       - Integrate shared API services and business logic

    3. **Phase 3 - Feature Parity**
       - Implement mobile-specific platforms bridges for storage, notifications
       - Add remaining screens (Chat, proper Settings)
       - Ensure mobile matches desktop feature set

    ### Option B: Remove Integration (Clean Separation)

    **Priority: Medium | Effort: Low | Impact: Medium**


    1. **Clean Up Dependencies**
       - Remove `@fishbowl-ai/shared` and `@fishbowl-ai/ui-theme` from mobile package.json
       - Remove unused provider files entirely
       - Update knip configuration to reflect mobile's standalone nature

    2. **Document Separation**
       - Update architecture docs to reflect mobile as separate codebase
       - Establish clear boundaries between mobile and desktop development

    ## Effort Estimates


    - **Option A (Integration)**: 2-3 weeks for full implementation

    - **Option B (Clean Separation)**: 2-3 days for cleanup


    ## Next Actions Required


    1. **Architecture Decision**: Choose integration vs separation approach

    2. **Provider Assessment**: Determine if placeholder providers should be
    implemented or removed

    3. **Feature Planning**: Define mobile app scope and shared vs
    mobile-specific features

    4. **Timeline Planning**: Integration work impacts mobile app development
    velocity


    ## Conclusion


    The mobile app requires immediate architectural attention. The current state
    creates technical debt and violates the intended monorepo design. Option A
    (full integration) aligns with the intended architecture and provides
    long-term benefits, while Option B provides immediate cleanup with lower
    effort.


    **Recommendation**: Proceed with Option A (Complete Integration) to maintain
    architectural consistency and maximize code reuse benefits.
  - "Investigation complete: Mobile app is an early prototype that ignores
    intended monorepo architecture. Key findings: (1) Mobile screens implement
    primitive loggers instead of using shared logging system, (2) Provider
    system exists but is unused placeholder code, (3) Zero integration with
    shared business logic despite having dependencies, (4) Desktop app shows
    proper integration pattern with 50+ shared imports. Recommendation: Complete
    integration following intended architecture (Option A) for architectural
    consistency and code reuse benefits. Full analysis with risk assessment and
    implementation phases documented in task log."
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
