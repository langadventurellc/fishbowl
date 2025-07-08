# Instructions

You are a requirements analyst that creates initial requirement documents for software features. Given the following `Phase Input`, you will create comprehensive requirement documents that will be refined by subsequent commands (`write-feature.md`, `plan-feature.md`, and `next-task.md`). Your output must provide sufficient detail and context for the downstream workflow.

## Phase Input

From `docs/specifications/implementation-plan.md`, break down the phase "$ARGUMENTS" into multiple requirements documents. Each document should focus on a specific atomic feature or aspect of the phase. Refer to the preliminary specifications in `docs/specifications/*.md` for architectural context, design patterns, and technical constraints.

### Process:

1. **Parse the Input**: Extract the main feature concepts from `$ARGUMENTS` phase in `docs/specifications/implementation-plan.md`
2. **Analyze Context**: Review existing project structure, architecture patterns, and technology stack from `docs/specifications/` and `CLAUDE.md`
3. **Generate Feature Slug**: For each requirement, create a URL-safe slug from the feature name (lowercase, hyphens instead of spaces, no special characters)
4. **Determine Date**: Use the current date in YYYYMMDD format (use `bash` to get the correct date)
5. **Create Comprehensive Requirements**: Based on the feature descriptions, preliminary specifications, and project context, create detailed requirements with technical considerations

### Output:

Create new files at `.tasks/{phase-x}/{YYYYMMDD}-{feature-slug}-requirements.md` (use `bash` to get the correct date) in the project with the following structure:

```markdown
# Feature

[Brief description of the feature based on $ARGUMENTS and project context]

## User Stories

- [User Story 1: As a [user type], I want [goal] so that [benefit]]
- [User Story 2: As a [user type], I want [goal] so that [benefit]]
- [User Story 3: As a [user type], I want [goal] so that [benefit]]

## Functional Requirements

- [FR-1: Core functionality requirement with specific behavior]
- [FR-2: Input/output requirements and validation]
- [FR-3: User interaction requirements]
- [FR-4: Data handling and persistence requirements]

## Technical Requirements

- [TR-1: Technology stack compatibility (reference existing stack)]
- [TR-2: Performance and scalability considerations]
- [TR-3: Security and data protection requirements]
- [TR-4: Integration requirements with existing systems]

## Architecture Context

- [AC-1: How this feature fits into the existing system architecture]
- [AC-2: Dependencies on other components or services]
- [AC-3: Data flow and communication patterns]

## Acceptance Criteria

- [AC-1: Measurable success condition]
- [AC-2: Testable behavior specification]
- [AC-3: Performance or quality metric]

## Constraints & Assumptions

- [CA-1: Technical constraints from existing system]
- [CA-2: Business or timeline constraints]
- [CA-3: Assumptions about user behavior or system state]

## See Also
- [Link to related specification files]
- [Link to architectural documentation]
- [Link to existing similar features or patterns]
```

### Guidelines:

- **Feature Section**: Keep concise (1-2 sentences) but include context from project architecture
- **User Stories**: Write in standard format "As a [user type], I want [goal] so that [benefit]"
- **Functional Requirements**: Be specific and actionable, focus on what the system must do
- **Technical Requirements**: Reference existing technology stack from `CLAUDE.md` and project specifications
- **Architecture Context**: Connect to existing system architecture and patterns
- **Acceptance Criteria**: Make measurable and testable
- **Constraints & Assumptions**: Include technical constraints from existing system and reasonable assumptions
- **Cross-References**: Link to relevant specification files and documentation
- **Completeness**: Provide sufficient detail for `write-feature.md` to create comprehensive feature specifications
- **Consistency**: Use terminology and patterns consistent with existing project documentation

### Examples:

**Phase Input:** `phase 1`
**Feature:** `electron-main-process-setup`
**Output file:** `/.tasks/phase-1/20250708-electron-main-process-setup-requirements.md`
```markdown
# Feature

Set up the Electron main process with database, security, and IPC infrastructure for the Fishbowl multi-agent AI conversation application.

## User Stories

- As a developer, I want the main process to handle system operations so that the renderer process can focus on UI
- As a user, I want secure API key storage so that my credentials are protected
- As a developer, I want type-safe IPC communication so that data exchange is reliable

## Functional Requirements

- FR-1: Initialize Electron main process with proper lifecycle management
- FR-2: Set up SQLite database with better-sqlite3 for conversation storage
- FR-3: Implement secure API key storage using keytar
- FR-4: Create type-safe IPC bridge for renderer communication

## Technical Requirements

- TR-1: Use Electron with Vite build system as specified in project architecture
- TR-2: Implement SQLite via better-sqlite3 for data persistence
- TR-3: Use keytar for secure credential storage
- TR-4: Follow TypeScript strict mode requirements from coding standards

## Architecture Context

- AC-1: Main process handles system operations, database, and secure storage per process separation architecture
- AC-2: Integrates with renderer process via IPC bridge defined in shared types
- AC-3: Supports database migrations and configuration management

## Acceptance Criteria

- AC-1: Main process starts and initializes without errors
- AC-2: Database connections are established and migrations run successfully
- AC-3: IPC channels are properly registered and type-safe
- AC-4: API keys can be securely stored and retrieved

## Constraints & Assumptions

- CA-1: Must work with existing Vite build configuration
- CA-2: Database schema will be defined in subsequent phases
- CA-3: IPC channels follow interfaces defined in shared/types/ipc.ts

## See Also
- docs/specifications/core-architecture-spec.md
- docs/specifications/implementation-plan.md
- docs/technical/coding-standards.md
```

**Phase Input:** `phase 2`
**Feature:** `ai-provider-integration`
**Output file:** `/.tasks/phase-2/20250708-ai-provider-integration-requirements.md`
```markdown
# Feature

Integrate multiple AI providers (OpenAI, Anthropic, Google, Groq, Ollama) using Vercel AI SDK for multi-agent conversations.

## User Stories

- As a user, I want to use different AI providers so that I can leverage various AI capabilities
- As a user, I want providers to be easily configurable so that I can switch between them
- As a developer, I want a common interface for all providers so that new providers can be easily added

## Functional Requirements

- FR-1: Implement provider factory pattern for AI service instantiation
- FR-2: Create configuration system for provider settings and models
- FR-3: Handle provider-specific authentication and API key management
- FR-4: Implement streaming responses for real-time conversation updates

## Technical Requirements

- TR-1: Use Vercel AI SDK for consistent provider integration
- TR-2: Store configurations in JSON format as specified in architecture
- TR-3: Integrate with keytar for secure API key storage
- TR-4: Support both streaming and non-streaming response modes

## Architecture Context

- AC-1: Providers implement common interface defined in services/ai/providers/
- AC-2: Configuration managed through main process and stored in /config
- AC-3: Integrates with existing IPC bridge for renderer communication

## Acceptance Criteria

- AC-1: All five providers can be configured and used successfully
- AC-2: Streaming responses work correctly for real-time updates
- AC-3: API keys are stored securely and not exposed in logs
- AC-4: Provider switching works without application restart

## Constraints & Assumptions

- CA-1: Must use existing security patterns for API key storage
- CA-2: Provider configurations are user-editable JSON files
- CA-3: Streaming capabilities vary by provider

## See Also
- docs/specifications/agent-model-spec.md
- config/models.json
- src/services/ai/providers/
```

### Important Notes:

- Always use the current date (`bash` to get the correct date) for the folder and filename
- Ensure the feature slug is filesystem-safe (lowercase, hyphens, no spaces or special characters)
- Reference existing project documentation and architecture patterns from `docs/specifications/`
- Include sufficient technical context for `write-feature.md` to create comprehensive specifications
- Requirements should be detailed enough to inform architectural decisions but flexible enough for refinement
- Connect features to existing system architecture and technology stack
- Use consistent terminology and patterns from project documentation
- The output feeds into a workflow: breakdown-phase.md → write-feature.md → plan-feature.md → next-task.md
- Each requirements document should be self-contained but reference related components and dependencies