# Feature Implementation Plan: Zustand State Management

_Generated: 2025-07-10_
_Based on Feature Specification: [20250710-zustand-state-management-feature.md](./20250710-zustand-state-management-feature.md)_

## Architecture Overview

This implementation establishes Zustand as the primary state management solution for the Fishbowl application, replacing React Context providers while preserving the existing IPC hook architecture. The approach uses a single combined store with multiple slices, selective persistence for UI preferences, and integration with existing error handling patterns.

### System Architecture

```mermaid
graph TB
    subgraph "Renderer Process"
        subgraph "React Components"
            UI[UI Components]
            Theme[Theme Components]
            Settings[Settings Components]
        end

        subgraph "Zustand Store"
            Store[Combined Store]
            ThemeSlice[Theme Slice]
            UISlice[UI Slice]
            SettingsSlice[Settings Slice]
            ConversationSlice[Conversation Slice]
            AgentSlice[Agent Slice]
        end

        subgraph "IPC Hooks Layer"
            ThemeHook[useTheme Hook]
            AgentHook[useAgents Hook]
            ConversationHook[useConversations Hook]
            MessageHook[useMessages Hook]
        end

        subgraph "Persistence Layer"
            LocalStorage[localStorage]
            Devtools[Redux DevTools]
        end
    end

    subgraph "Main Process"
        IPC[IPC Handlers]
        Database[SQLite Database]
        SecureStorage[Keytar Storage]
    end

    UI --> Store
    Theme --> Store
    Settings --> Store

    Store --> ThemeSlice
    Store --> UISlice
    Store --> SettingsSlice
    Store --> ConversationSlice
    Store --> AgentSlice

    ThemeSlice --> LocalStorage
    UISlice --> LocalStorage
    SettingsSlice --> LocalStorage

    Store --> Devtools

    ThemeHook --> Store
    AgentHook --> Store
    ConversationHook --> Store
    MessageHook --> Store

    ThemeHook --> IPC
    AgentHook --> IPC
    ConversationHook --> IPC
    MessageHook --> IPC

    IPC --> Database
    IPC --> SecureStorage
```

### Data Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant S as Zustand Store
    participant H as IPC Hook
    participant I as IPC Handler
    participant D as Database

    Note over C,D: Theme Change Flow
    C->>S: toggleTheme()
    S->>S: Update theme slice
    S->>H: Theme updated
    H->>I: Save theme preference
    I->>D: Persist to config

    Note over C,D: Data Fetch Flow
    C->>H: Load conversations
    H->>I: IPC request
    I->>D: Query database
    D->>I: Return data
    I->>H: Return response
    H->>S: Update store
    S->>C: Component re-renders
```

### Security Architecture

```mermaid
graph LR
    subgraph "Persisted State (localStorage)"
        ThemeData[Theme Preferences]
        UIData[UI State]
        SettingsData[App Settings]
    end

    subgraph "Non-Persisted State"
        ConversationData[Conversation Cache]
        AgentData[Agent Cache]
        MessageData[Message Cache]
    end

    subgraph "Secure Storage (Keytar)"
        APIKeys[API Keys]
        Credentials[Credentials]
    end

    subgraph "Database (SQLite)"
        PersistentData[Persistent App Data]
    end

    ThemeData -.-> UIData
    UIData -.-> SettingsData

    ConversationData --> PersistentData
    AgentData --> PersistentData
    MessageData --> PersistentData

    APIKeys --> Credentials
```

## Technology Stack

### Core Technologies

- **Language/Runtime:** TypeScript (strict mode), React 18+
- **State Management:** Zustand with middleware stack
- **Build System:** Vite for renderer process
- **Database:** SQLite via better-sqlite3 (main process)
- **Persistence:** localStorage for UI preferences
- **IPC:** Electron IPC with type-safe wrappers

### Libraries & Dependencies

- **State Management:** `zustand` (to be installed)
- **Persistence:** Zustand's built-in `persist` middleware
- **Development:** Redux DevTools integration
- **Type Safety:** TypeScript with comprehensive interfaces
- **Validation:** Zod schemas for state validation
- **Error Handling:** Existing globalErrorTracker integration

### Patterns & Approaches

- **Architectural Patterns:** Single combined store with slices pattern
- **Persistence Strategy:** Selective persistence by slice (UI only)
- **IPC Integration:** Hook-level integration preserving existing patterns
- **Error Handling:** Centralized in IPC hooks, store receives clean data
- **Development Tools:** Environment-based conditional devtools
- **File Organization:** One export per file (enforced by linting)

### External Integrations

- **IPC Services:** Existing database hooks (useAgents, useConversations, useMessages)
- **Secure Storage:** Keytar for API keys (no change to existing pattern)
- **Theme System:** CSS custom properties and data attributes
- **Configuration:** localStorage for UI state, SQLite for app data

## Security Considerations

- **No Sensitive Data in Persisted State:** API keys remain in keytar secure storage
- **State Validation on Hydration:** Validate persisted state structure before application
- **Selective Persistence:** Only UI-related slices persist to localStorage
- **IPC Data Sanitization:** Existing hook validation patterns preserved
- **Error Boundary Integration:** Maintain existing error handling patterns

## Relevant Files

### New Store Files (to be created)

- `src/renderer/store/index.ts` - Main store configuration and export
- `src/renderer/store/types.ts` - Store-wide type definitions
- `src/renderer/store/slices/theme.ts` - Theme state slice
- `src/renderer/store/slices/ui.ts` - UI state slice
- `src/renderer/store/slices/settings.ts` - Settings state slice
- `src/renderer/store/slices/conversation.ts` - Conversation state slice
- `src/renderer/store/slices/agents.ts` - Agent state slice
- `src/renderer/store/slices/index.ts` - Slice barrel exports

### Updated Hook Files (to be modified)

- `src/renderer/hooks/useTheme.hook.ts` - Update to use Zustand store
- `src/renderer/hooks/useAgents.ts` - Add Zustand store updates
- `src/renderer/hooks/useConversations.ts` - Add Zustand store updates
- `src/renderer/hooks/useMessages.ts` - Add Zustand store updates

### Files to Remove (after migration)

- `src/renderer/hooks/ThemeProvider.tsx` - Replace with Zustand
- `src/renderer/hooks/ThemeContext.ts` - Replace with Zustand

### Test Files (to be created)

- `tests/store/slices/theme.test.ts` - Theme slice tests
- `tests/store/slices/ui.test.ts` - UI slice tests
- `tests/store/slices/settings.test.ts` - Settings slice tests
- `tests/store/integration.test.ts` - Store integration tests
- `tests/hooks/useTheme.test.ts` - Updated theme hook tests

## Implementation Notes

- Follow Research → Plan → Implement workflow for each task
- Install zustand dependency before starting core store implementation
- Use environment-based conditional loading for devtools middleware
- Preserve existing error handling patterns in IPC hooks
- One export per file rule enforced by linting
- Run quality checks (lint, format, type-check) after each sub-task
- Tests should be written in the same task as implementation
- After completing a parent task, stop and await user confirmation to proceed

## Task Execution Reminders

When executing tasks, remember to:

1. **Research first** - Never jump straight to coding
2. **Install dependencies** - Add zustand to package.json first
3. **Check existing patterns** - Search codebase for similar implementations
4. **Validate persistence** - Ensure only UI state persists to localStorage
5. **Write tests immediately** - In the same task as implementation
6. **Run quality checks** - Format, lint, test after each sub-task
7. **One export per file** - This is enforced by linting

## Implementation Tasks

- [x] 1.0 Project Setup and Dependencies
  - [x] 1.1 Install Zustand dependency with TypeScript support
  - [x] 1.2 Create project structure directories (store, slices, types)
  - [x] 1.3 Set up test directory structure for store tests
  - [x] 1.4 Configure TypeScript paths for store imports
  - [x] 1.5 Add Zustand to existing import patterns documentation
  - [x] 1.6 Write initial store configuration test setup

  ### Files modified with description of changes
  - `package.json` - Added zustand v5.0.6 dependency
  - `src/renderer/store/` - Created store directory structure
  - `src/renderer/store/slices/` - Created slices directory for store modules
  - `tests/unit/renderer/store/` - Created test directory structure for store tests
  - `tests/unit/renderer/store/slices/` - Created test directory for slice tests
  - `tsconfig.renderer.json` - Added @store/\* path alias for clean imports
  - `vite.config.ts` - Added @store path alias for Vite build system
  - `docs/technical/coding-standards.md` - Added Store Import Patterns section with examples
  - `tests/unit/renderer/store/store.test.ts` - Created initial store configuration test setup

  ### Quality checks completed
  - ✅ Format: All files formatted correctly with Prettier
  - ✅ Lint: No ESLint errors or warnings
  - ✅ Type Check: All TypeScript checks passed across all tsconfig files
  - ✅ Test: Store configuration tests pass (5 tests passed)

  ### Summary

  Successfully set up Zustand project foundation with dependency installation, directory structure, TypeScript configuration, comprehensive documentation, and initial test setup. All quality checks pass and the project is ready for core store implementation.

- [x] 2.0 Core Store Infrastructure
  - [x] 2.1 Create store type definitions with AppState interface
  - [x] 2.2 Set up core store with immer middleware configuration
  - [x] 2.3 Configure persistence middleware with selective partializing
  - [x] 2.4 Add environment-based devtools middleware integration
  - [x] 2.5 Create store barrel export with proper TypeScript typing
  - [x] 2.6 Write tests for store middleware configuration
  - [x] 2.7 Add store initialization validation and error handling

  ### Files modified with description of changes
  - `src/renderer/store/index.ts` - Main store configuration with immer, persistence, and devtools middleware
  - `src/renderer/store/types/` - Comprehensive type system split into individual files following one-export-per-file rule:
    - `Theme.ts` - Theme type definition
    - `ThemeSlice.ts` - Theme slice interface
    - `UISlice.ts` - UI state slice interface
    - `SettingsSlice.ts` - Settings slice interface
    - `Agent.ts` - Agent data structure
    - `AgentSlice.ts` - Agent slice interface
    - `Conversation.ts` - Conversation data structure
    - `ConversationSlice.ts` - Conversation slice interface
    - `app-state.ts` - Combined AppState interface
    - `store-slice.ts` - Store slice creator type
    - `PersistConfig.ts` - Persistence configuration
    - `DevToolsConfig.ts` - DevTools configuration
    - `StoreConfig.ts` - Store configuration options
    - `index.ts` - Barrel exports for all types
  - `src/renderer/store/types.ts` - Re-export compatibility layer
  - `src/renderer/store/slices/` - All store slices with proper typing:
    - `theme.ts` - Theme slice implementation
    - `ui.ts` - UI slice implementation
    - `settings.ts` - Settings slice implementation
    - `agents.ts` - Agent slice implementation
    - `conversation.ts` - Conversation slice implementation
    - `index.ts` - Slice barrel exports
  - `tests/unit/renderer/store/store-middleware.test.ts` - Comprehensive middleware tests (15 tests)
  - `package.json` - Added immer and @redux-devtools/extension dependencies

  ### Quality checks completed
  - ✅ Format: All files formatted correctly with Prettier
  - ✅ Lint: No ESLint errors, only acceptable warnings for `any` types in PersistConfig
  - ✅ Type Check: All TypeScript checks passed across all tsconfig files
  - ✅ Test: Store middleware tests pass (15/15 tests passed)

  ### Summary

  Successfully implemented complete Core Store Infrastructure with Zustand, including:
  - **Middleware Stack**: Immer for immutable updates, persistence for selective localStorage, devtools for debugging
  - **Type Safety**: Comprehensive TypeScript interfaces following one-export-per-file rule
  - **Security**: Only UI state persisted to localStorage, sensitive data excluded
  - **Error Handling**: Store initialization validation and corruption recovery
  - **Testing**: 15 comprehensive tests covering all middleware functionality
  - **Performance**: Environment-based devtools, optimized persistence, memoized selectors

  The store is fully functional and ready for slice implementation and theme migration.

- [x] 3.0 Theme State Slice Implementation
  - [x] 3.1 Create theme slice with light/dark/system support
  - [x] 3.2 Implement theme persistence matching current localStorage pattern
  - [x] 3.3 Add theme actions for toggle and direct setting
  - [x] 3.4 Implement document attribute application for theme changes
  - [x] 3.5 Add theme selector functions for component consumption
  - [x] 3.6 Write comprehensive tests for theme slice functionality
  - [x] 3.7 Add system theme detection and preference following

  ### Files modified with description of changes
  - `src/renderer/store/selectors/` - Created theme selector functions split into individual files following one-export-per-file rule:
    - `selectTheme.ts` - Selects current theme setting
    - `selectSystemTheme.ts` - Selects current system theme
    - `selectEffectiveTheme.ts` - Selects resolved theme for display
    - `selectIsSystemTheme.ts` - Checks if theme is system-managed
    - `selectIsDarkTheme.ts` - Checks if effective theme is dark
    - `selectIsLightTheme.ts` - Checks if effective theme is light
    - `selectToggleTheme.ts` - Selects theme toggle action
    - `selectSetTheme.ts` - Selects theme setter action
    - `selectThemeState.ts` - Selects comprehensive theme state and actions
    - `index.ts` - Barrel exports for all theme selectors
  - `src/renderer/store/utils/` - Enhanced system theme detection utilities split into individual files:
    - `SystemThemeDetector.ts` - Robust system theme detection class with error handling
    - `systemThemeDetectorInstance.ts` - Singleton instance of system theme detector
    - `getCurrentSystemTheme.ts` - Convenience function to get current system theme
    - `isSystemThemeSupported.ts` - Function to check system theme detection support
    - `index.ts` - Barrel exports for all store utilities
  - `src/renderer/store/index.ts` - Updated store initialization to use enhanced system theme detection with fallback handling and cleanup functionality
  - `tests/unit/renderer/store/slices/theme.test.ts` - Comprehensive theme slice tests covering:
    - Theme state management (setting light/dark/system themes)
    - Theme toggle functionality (all combinations)
    - System theme detection and following
    - Document attribute application
    - Theme selector functions
    - Theme persistence to localStorage
    - Edge cases and error scenarios
    - 27 tests total, all passing

  ### Quality checks completed
  - ✅ Format: All files formatted correctly with Prettier
  - ✅ Lint: No ESLint errors, follows one-export-per-file rule strictly
  - ✅ Type Check: All TypeScript checks passed across all tsconfig files
  - ✅ Test: Theme slice tests pass (27/27 tests passed)

  ### Summary

  Successfully completed Theme State Slice Implementation with enhanced functionality beyond the existing theme slice:
  - **Enhanced System Theme Detection**: Robust system theme detection with proper error handling, fallback support, and cleanup capabilities
  - **Comprehensive Selector Functions**: Nine individual selector functions for efficient component consumption following one-export-per-file rule
  - **Extensive Test Coverage**: 27 comprehensive tests covering all theme functionality including edge cases and error scenarios
  - **Improved Architecture**: Better separation of concerns with utilities split into focused modules
  - **Full Compatibility**: Maintains backward compatibility with existing theme API while adding enhanced features
  - **Error Resilience**: Graceful degradation when system theme detection is not supported

  The theme slice is now production-ready with comprehensive testing, enhanced system theme support, optimized selectors, and robust error handling. Ready for integration with existing components and migration from React Context.

- [x] 4.0 UI State Slice Implementation
  - [x] 4.1 Create UI slice with sidebar collapse state management
  - [x] 4.2 Implement modal and dialog visibility state management
  - [x] 4.3 Add window dimensions and layout preference storage
  - [x] 4.4 Create UI actions for state updates and toggles
  - [x] 4.5 Add UI selector functions for component consumption
  - [x] 4.6 Write tests for UI slice functionality and persistence
  - [x] 4.7 Add general UI preferences and customization support

  ### Files modified with description of changes
  - `src/renderer/store/selectors/` - Created comprehensive UI selector functions split into individual files following one-export-per-file rule:
    - `selectSidebarCollapsed.ts` - Selects sidebar collapse state
    - `selectActiveModal.ts` - Selects current active modal
    - `selectWindowDimensions.ts` - Selects window dimensions
    - `selectLayoutPreferences.ts` - Selects layout preferences
    - `selectSetSidebarCollapsed.ts` - Selects sidebar collapsed setter action
    - `selectToggleSidebar.ts` - Selects sidebar toggle action
    - `selectSetActiveModal.ts` - Selects active modal setter action
    - `selectSetWindowDimensions.ts` - Selects window dimensions setter
    - `selectSetLayoutPreferences.ts` - Selects layout preferences setter
    - `selectUIState.ts` - Selects comprehensive UI state and actions
  - `src/renderer/store/selectors/index.ts` - Updated barrel exports to include all new UI selectors with organized sections
  - `tests/unit/renderer/store/slices/ui.test.ts` - Comprehensive UI slice tests covering:
    - UI state initialization with proper defaults
    - Sidebar state management (collapse/expand/toggle functionality)
    - Modal state management (setting active modal, clearing, switching)
    - Window dimensions management with input validation
    - Layout preferences management with partial updates and merging
    - UI selector functions testing
    - UI state persistence functionality
    - Edge cases and error scenarios (rapid toggles, invalid inputs, floating point values)
    - 31 tests total, all passing

  ### Quality checks completed
  - ✅ Format: All files formatted correctly with Prettier
  - ✅ Lint: No ESLint errors, follows one-export-per-file rule strictly
  - ✅ Type Check: All TypeScript checks passed across all tsconfig files
  - ✅ Test: All tests pass (578/578 tests passed including 31 new UI slice tests)

  ### Summary

  Successfully completed UI State Slice Implementation by adding the missing components to the already-implemented UI slice:
  - **Enhanced Selector Functions**: Ten individual selector functions for efficient component consumption following established theme selector patterns
  - **Comprehensive Test Coverage**: 31 comprehensive tests covering all UI functionality including edge cases, error scenarios, input validation, and persistence
  - **Full API Coverage**: Complete testing of sidebar management, modal state, window dimensions, layout preferences, and all selector functions
  - **Quality Assurance**: All quality checks pass, maintaining project standards for code formatting, linting, type safety, and testing
  - **Architecture Consistency**: Follows established patterns from theme slice implementation, maintaining consistency across the store architecture

  The UI slice is now production-ready with comprehensive testing, complete selector API, robust input validation, and full integration with the existing Zustand store infrastructure. Ready for component integration and usage throughout the application.

- [ ] 5.0 Settings State Slice Implementation
  - [ ] 5.1 Create settings slice with application configuration management
  - [ ] 5.2 Implement settings persistence across application restarts
  - [ ] 5.3 Add settings validation and default value handling
  - [ ] 5.4 Create settings actions for updates and resets
  - [ ] 5.5 Add settings selector functions for component consumption
  - [ ] 5.6 Write tests for settings slice functionality
  - [ ] 5.7 Prepare settings import/export functionality foundation

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 6.0 Conversation State Slice Foundation
  - [ ] 6.1 Create conversation slice with active conversation tracking
  - [ ] 6.2 Implement conversation list state management and caching
  - [ ] 6.3 Add conversation metadata storage and retrieval
  - [ ] 6.4 Create conversation actions for CRUD operations
  - [ ] 6.5 Add conversation selector functions for component consumption
  - [ ] 6.6 Write tests for conversation slice functionality
  - [ ] 6.7 Add conversation loading and error state management

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 7.0 Agent State Slice Foundation
  - [ ] 7.1 Create agent slice with agent list state management
  - [ ] 7.2 Implement agent status and participation tracking
  - [ ] 7.3 Add agent metadata caching and retrieval
  - [ ] 7.4 Create agent actions for management operations
  - [ ] 7.5 Add agent selector functions for component consumption
  - [ ] 7.6 Write tests for agent slice functionality
  - [ ] 7.7 Add agent loading and error state management

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 8.0 IPC Hook Integration
  - [ ] 8.1 Update useTheme hook to integrate with Zustand store
  - [ ] 8.2 Modify useAgents hook to update Zustand store alongside local state
  - [ ] 8.3 Update useConversations hook to sync with Zustand store
  - [ ] 8.4 Modify useMessages hook to update Zustand store
  - [ ] 8.5 Create store update utilities for IPC hook integration
  - [ ] 8.6 Write tests for IPC hook and store integration
  - [ ] 8.7 Add error handling validation for store updates

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 9.0 ThemeProvider Migration
  - [ ] 9.1 Update useTheme hook to use Zustand selectors
  - [ ] 9.2 Maintain existing theme API for component compatibility
  - [ ] 9.3 Update ThemeToggle component to use new hook
  - [ ] 9.4 Test theme functionality end-to-end with Zustand
  - [ ] 9.5 Remove ThemeProvider component after validation
  - [ ] 9.6 Remove ThemeContext files after validation
  - [ ] 9.7 Update component imports to use new theme hook

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 10.0 Component Integration and Testing
  - [ ] 10.1 Update components to use Zustand store instead of Context
  - [ ] 10.2 Test theme changes persist correctly across app restarts
  - [ ] 10.3 Validate UI state persistence functionality
  - [ ] 10.4 Test settings state management and persistence
  - [ ] 10.5 Verify conversation and agent state caching
  - [ ] 10.6 Write end-to-end integration tests for full store functionality
  - [ ] 10.7 Add performance testing for store operations

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 11.0 Security Hardening and Validation
  - [ ] 11.1 Validate state persistence excludes sensitive data
  - [ ] 11.2 Add state validation on hydration from localStorage
  - [ ] 11.3 Implement state corruption recovery with defaults
  - [ ] 11.4 Add security audit for persisted state contents
  - [ ] 11.5 Test persistence failure graceful degradation
  - [ ] 11.6 Write security-focused tests for state management
  - [ ] 11.7 Add development error feedback for state issues

  ### Files modified with description of changes
  - (to be filled in after task completion)

- [ ] 12.0 Performance Optimization and Monitoring
  - [ ] 12.1 Implement memoized selectors for performance
  - [ ] 12.2 Add performance monitoring for state operations
  - [ ] 12.3 Optimize persistence operations for non-blocking behavior
  - [ ] 12.4 Add memory usage optimization for state management
  - [ ] 12.5 Create performance benchmarks for store operations
  - [ ] 12.6 Write performance tests for state update scenarios
  - [ ] 12.7 Add DevTools integration for performance debugging

  ### Files modified with description of changes
  - (to be filled in after task completion)

## Task Sizing Guidelines

Each sub-task is designed to be completed in 1-2 hours and includes:

- **Implementation:** The actual feature work
- **Testing:** Unit and integration tests
- **Validation:** Input validation and error handling
- **Documentation:** Code comments and type definitions
- **Quality Checks:** Linting, formatting, and type checking

## File Naming Convention

This implementation plan follows the established naming pattern and is saved as:
`20250710-zustand-state-management-tasks.md`

## Target Audience

This plan is designed for development teams implementing Zustand state management while preserving existing IPC architecture, error handling patterns, and security practices. Each task includes specific implementation guidance and maintains compatibility with existing code patterns.

## Quality Standards

- **Granularity:** Tasks are small enough to complete in 1-2 hours
- **Completeness:** All major implementation aspects covered including security and performance
- **Clarity:** Unambiguous task descriptions and success criteria
- **Logical Flow:** Tasks ordered by dependencies and development sequence
- **Visual Support:** Architecture diagrams clarify system relationships
- **Actionability:** Each task represents concrete development work
- **Security-First:** Security considerations integrated throughout
- **Testability:** Explicit test-writing tasks included in each parent task

## Success Metrics

### Functional Completeness

- All existing theme functionality preserved after migration
- UI preferences persist correctly across application restarts
- State operations complete successfully without errors
- Integration with IPC services maintains data consistency

### Performance Benchmarks

- State updates complete within 16ms for 60fps rendering
- Application startup time not increased by more than 100ms
- Memory usage for state management under 10MB
- Persistence operations complete within 100ms

### Quality Metrics

- 100% test coverage for all state slices and actions
- Zero ESLint violations in state management code
- TypeScript strict mode compliance throughout
- All existing functionality tests continue to pass

### Developer Experience

- DevTools provide clear state debugging information
- State operations are type-safe and discoverable
- Error messages are clear and actionable
- API remains consistent with existing patterns
