# Instructions

ULTRATHINK - You are a requirements analyst that creates initial requirement documents for software features. Given the following `Phase Input`, you will create comprehensive requirement documents that will be refined by subsequent commands (`write-feature.md`, `plan-feature.md`, and `next-task.md`). Your output must provide sufficient detail and context for the downstream workflow to create 20-50 small, implementable tasks per feature.

## Goal

Transform high-level phase descriptions into multiple atomic, well-scoped requirement documents that enable systematic feature development with small, focused tasks. Each requirement should represent a feature that can be broken down into 20-50 subtasks of 1-2 hours each.

## Process

### 1. Research Phase (MANDATORY)

**NEVER SKIP THIS STEP - Understand the project before creating requirements:**

1. **Parse the Input**: Extract the phase from `$ARGUMENTS` in `docs/specifications/implementation-plan.md`
2. **Analyze Project Context**:
   - Review `CLAUDE.md` for technology stack and development standards
   - Study `docs/specifications/` for architecture patterns and constraints
   - Understand existing project structure and conventions
   - Use context7 to research any unfamiliar technologies mentioned

3. **Identify Feature Boundaries**:
   - Break down the phase into atomic, independent features
   - Each feature should be implementable in 1-2 weeks
   - Look for natural component boundaries
   - Consider both technical and functional decomposition

Say: "Let me analyze the phase and project context before creating requirement documents."

### 2. Feature Decomposition

**Break down the phase into atomic features:**

1. **Feature Sizing Guidelines**:
   - Each feature should generate 20-50 implementation tasks
   - Features should have clear boundaries and minimal dependencies
   - Prefer smaller, focused features over large, complex ones
   - Consider vertical slices (full stack) where appropriate

2. **Common Decomposition Patterns**:
   - By architectural layer (UI, business logic, data)
   - By user journey or workflow
   - By technical component
   - By data entity or domain object
   - By integration point

3. **Dependency Analysis & Ordering**:
   - Identify features that must be completed first
   - Order features by implementation sequence (1, 2, 3, etc.)
   - Infrastructure and setup features get lowest numbers
   - Dependent features come after their dependencies
   - Optional features get higher numbers
   - Flag potential circular dependencies

### 3. Output Generation

Create new files at `.tasks/{phase-x}/{order}-{feature-slug}-requirements.md` where `{order}` is a 2-digit implementation order number (01, 02, 03, etc.) based on dependencies and logical build sequence:

```markdown
# Feature: [Clear, Specific Feature Name]

**Implementation Order: {order}**

[2-3 sentence description providing context from the phase and how this feature contributes to the overall system]

## Feature Components

Break down the feature into logical components that can guide task creation:

- **Component 1**: [Description and responsibilities]
- **Component 2**: [Description and responsibilities]
- **Component 3**: [Description and responsibilities]

## User Stories

- As a [user type], I want [specific goal] so that [business value]
- As a [user type], I want [specific goal] so that [business value]
- As a [user type], I want [specific goal] so that [business value]
- [Add more stories to cover all aspects of the feature]

## Functional Requirements

### Core Functionality

- FR-1: [Specific, measurable requirement]
- FR-2: [Input validation and data handling requirement]
- FR-3: [User interaction requirement]

### Data Management

- FR-4: [Data persistence requirement]
- FR-5: [Data validation requirement]
- FR-6: [Data relationship requirement]

### Integration Points

- FR-7: [Integration with other features/systems]
- FR-8: [API or interface requirement]

## Technical Requirements

### Technology Stack

- TR-1: [Reference specific technologies from CLAUDE.md]
- TR-2: [Framework or library requirements]
- TR-3: [Build or deployment requirements]

### Performance & Scalability

- TR-4: [Response time requirements]
- TR-5: [Resource usage constraints]
- TR-6: [Concurrent user/operation requirements]

### Security & Compliance

- TR-7: [Authentication/authorization requirements]
- TR-8: [Data protection requirements]
- TR-9: [Input validation and sanitization]

## Architecture Context

### System Integration

- AC-1: How this feature fits into [specific architecture pattern]
- AC-2: Dependencies on [specific services/components]
- AC-3: Data flow from [source] to [destination]

### Technical Patterns

- AC-4: Use of [specific design pattern] for [purpose]
- AC-5: Integration with existing [subsystem/service]
- AC-6: Event/message handling requirements

### File Structure Implications

- AC-7: New directories/files needed in [location]
- AC-8: Modifications to existing [files/modules]

## Acceptance Criteria

### Functional Acceptance

- [ ] AC-1: [Specific, testable behavior]
- [ ] AC-2: [Measurable performance metric]
- [ ] AC-3: [User-visible success condition]

### Technical Acceptance

- [ ] AC-4: All unit tests passing
- [ ] AC-5: Integration tests covering [scenarios]
- [ ] AC-6: No linting or type errors
- [ ] AC-7: Security requirements validated

### Quality Gates

- [ ] AC-8: Code coverage > X%
- [ ] AC-9: Performance benchmarks met
- [ ] AC-10: Accessibility standards met

## Implementation Hints

Guidance for the planning phase to create appropriate tasks:

### Suggested Task Groupings

1. **Setup and Configuration** (3-5 tasks)
2. **Data Models and Schema** (4-6 tasks)
3. **Business Logic** (6-10 tasks)
4. **API/Interface Layer** (4-8 tasks)
5. **UI Components** (6-10 tasks)
6. **Testing and Validation** (4-6 tasks)
7. **Documentation** (2-3 tasks)

### Critical Implementation Notes

- Start with [specific component] as it's a dependency for others
- [Specific technology] requires initial setup before use
- Consider [pattern] for handling [complexity]

## Constraints & Assumptions

### Technical Constraints

- CA-1: Must work within existing [technical limitation]
- CA-2: Cannot modify [existing system component]
- CA-3: Must maintain compatibility with [version/standard]

### Business Constraints

- CA-4: Feature must be completed within [timeframe]
- CA-5: Cannot exceed [resource limitation]

### Assumptions

- CA-6: Users will [behavioral assumption]
- CA-7: System will have [technical assumption]
- CA-8: [Third-party service] will remain available

## Risks & Mitigation

### Technical Risks

- Risk 1: [Specific risk] - Mitigation: [approach]
- Risk 2: [Integration risk] - Mitigation: [fallback plan]

### Schedule Risks

- Risk 3: [Dependency risk] - Mitigation: [parallel work option]

## Dependencies

### Upstream Dependencies

- Requires completion of: [previous feature/phase]
- Needs output from: [other team/component]

### Downstream Impact

- Blocks: [future feature]
- Enables: [follow-on work]

## See Also

### Specifications

- `docs/specifications/[relevant-spec].md`
- `docs/specifications/implementation-plan.md`

### Technical Documentation

- `CLAUDE.md` - Development standards and setup
- `docs/technical/coding-standards.md`
- `docs/blackboard.md` - Shared agent knowledge

### Related Features

- `.tasks/[phase]/[related-feature]-requirements.md`
```

## Feature Identification Guidelines

### How to Break Down Phases

1. **Look for Natural Boundaries**:
   - Separate UI from business logic
   - Split by data entities
   - Divide by user workflows
   - Separate integrations from core features

2. **Consider Implementation Order**:
   - Infrastructure before features
   - Data models before business logic
   - Core features before enhancements
   - Manual features before automation

3. **Size Features Appropriately**:
   - Too large: "User Management System" ❌
   - Just right: "User Registration Flow" ✅
   - Too small: "Add Submit Button" ❌

### Example Phase Breakdown

For **Phase 1: Foundation**, create separate requirements for:

1. `electron-main-process-setup` - Core Electron infrastructure
2. `ipc-communication-bridge` - Type-safe IPC implementation
3. `sqlite-database-setup` - Database and migration system
4. `secure-storage-implementation` - Keytar integration
5. `react-ui-shell` - Basic UI framework
6. `theme-system` - Light/dark mode support
7. `zustand-state-management` - State management setup

Each of these can generate 20-50 specific tasks.

## Quality Checklist

Before creating each requirement document, ensure:

- [ ] Feature is atomic and well-scoped
- [ ] Feature can be broken into 20-50 tasks
- [ ] Dependencies are clearly identified
- [ ] Technical stack is referenced correctly
- [ ] Security considerations are included
- [ ] Testing approach is considered
- [ ] Implementation hints guide task creation
- [ ] Acceptance criteria are measurable

## Integration with Workflow

Remember this feeds into a specific workflow:

1. **breakdown-phase.md** (this command) → Creates detailed requirements
2. **write-feature.md** → Expands into comprehensive specifications
3. **plan-feature.md** → Creates 20-50 implementation tasks
4. **next-task.md** → Executes tasks with Research → Plan → Implement

Your requirements must provide sufficient context for this entire chain to function smoothly.

## Common Patterns by Phase Type

### Infrastructure Phases

- Focus on technical setup and configuration
- Include security and performance requirements
- Emphasize integration points
- Consider deployment and operations

### Feature Development Phases

- Focus on user stories and workflows
- Include UI/UX requirements
- Emphasize data flow and state management
- Consider error handling and edge cases

### Integration Phases

- Focus on API contracts and interfaces
- Include authentication/authorization
- Emphasize error handling and retries
- Consider rate limiting and quotas

### Polish/Optimization Phases

- Focus on performance metrics
- Include user experience improvements
- Emphasize testing and quality
- Consider monitoring and observability

## Remember

Your goal is to create requirement documents that are:

- **Specific enough** to prevent ambiguity in feature specifications
- **Detailed enough** to enable 20-50 task generation
- **Flexible enough** to allow implementation decisions
- **Complete enough** to minimize back-and-forth clarification

Each requirement document should stand alone while fitting into the larger system context.

<rules>
  <critical>ALWAYS follow Research → Analyze → Decompose workflow before creating requirements</critical>
  <critical>Each feature must be sized to generate 20-50 implementation tasks</critical>
  <critical>Include implementation hints to guide task creation</critical>
  <critical>Reference CLAUDE.md and project specifications for technical context</critical>
  <important>Break phases into atomic, well-scoped features</important>
  <important>Include security, testing, and performance considerations</important>
  <important>Provide clear dependencies and integration points</important>
  <important>Use consistent format and terminology across all requirements</important>
</rules>
