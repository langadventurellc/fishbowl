---
kind: project
id: P-agent-configuration-and
title: Agent Configuration and Management System
status: in-progress
priority: normal
prerequisites: []
created: "2025-07-26T13:08:46.238972"
updated: "2025-07-26T13:08:46.238972"
schema_version: "1.1"
---

# Agent Configuration and Management System

## Executive Summary

The Agent Configuration and Management System provides the foundational layer for creating, managing, and configuring AI agents in the Fishbowl multi-agent collaboration platform. This system enables users to define agent personalities using the Big Five personality model with behavioral sliders, assign specialized roles, configure AI model providers, and save reusable agent templates. The implementation focuses on business logic validation and data management without UI components, using JSON-based configuration files for flexibility and unit tests for validation.

## Functional Requirements

### 1. Personality Configuration System

#### Big Five Personality Model

- **Openness**: Creativity and willingness to explore new ideas (0-100 integer)
- **Conscientiousness**: Attention to detail and methodical approach (0-100 integer)
- **Extraversion**: Verbosity and enthusiasm in responses (0-100 integer)
- **Agreeableness**: Supportiveness versus critical analysis (0-100 integer)
- **Neuroticism**: Confidence versus cautiousness in responses (0-100 integer)

#### Behavioral Trait Sliders (14 traits, all 0-100 integers)

- **Formality**: Professional to casual communication style
- **Humor**: Serious to playful responses
- **Assertiveness**: Suggestive to directive communication
- **Empathy**: Logical to emotionally aware responses
- **Storytelling**: Factual to narrative-driven explanations
- **Brevity**: Concise to detailed responses
- **Imagination**: Practical to creative suggestions
- **Playfulness**: Task-focused to spontaneous interactions
- **Dramaticism**: Matter-of-fact to theatrical expressions
- **AnalyticalDepth**: Surface-level to comprehensive analysis
- **Contrarianism**: Consensus-building to challenging assumptions
- **Encouragement**: Neutral to supportive feedback
- **Curiosity**: Direct answers to exploratory questions
- **Patience**: Direct to accommodating explanations

#### Custom Instructions

- Free-form text field for personality overrides and augmentation
- No length restrictions
- Optional field that complements slider-based configuration

#### Personality Data Model

```typescript
interface PersonalityConfiguration {
  id: string;
  name: string;
  description?: string;

  // Big Five Traits (required, 0-100 integers)
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;

  // Behavioral Sliders (required, 0-100 integers)
  formality: number;
  humor: number;
  assertiveness: number;
  empathy: number;
  storytelling: number;
  brevity: number;
  imagination: number;
  playfulness: number;
  dramaticism: number;
  analyticalDepth: number;
  contrarianism: number;
  encouragement: number;
  curiosity: number;
  patience: number;

  // Custom instructions (optional)
  customInstructions?: string;

  // Metadata
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Role Configuration System

#### Predefined Roles

- **Technical Advisor**: Provide technical expertise and implementation guidance
- **Project Manager**: Focus on timelines, coordination, and project management
- **Creative Director**: Guide creative vision and artistic decisions
- **Storyteller**: Craft narratives and engaging content
- **Analyst**: Data-driven insights and logical reasoning
- **Coach**: Personal development and goal achievement
- **Critic**: Identify weaknesses and potential issues
- **Business Strategist**: Market and business insights
- **Financial Advisor**: Financial planning and budget guidance
- **Generalist**: Versatile contributor across multiple domains

#### Custom Roles

- User-defined roles with custom system prompts and behavior descriptions
- Flexible role creation for specialized use cases

#### Role Data Model

```typescript
interface RoleConfiguration {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  focusAreas: string[];
  isTemplate: boolean; // true for predefined, false for custom
  createdAt: string;
  updatedAt: string;
}
```

### 3. Agent Configuration System

#### Agent Definition

- Combines personality, role, and model configuration into complete agent specification
- Unique identification and naming for agent instances
- Support for agent templates and user-created configurations

#### Agent Data Model

```typescript
interface AgentConfiguration {
  id: string;
  name: string;
  description?: string;

  // Configuration References
  personalityId: string;
  roleId: string;
  modelConfig: AgentModelConfig;

  // Display Properties
  color: string; // Hex color for UI theming

  // Metadata
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgentModelConfig {
  provider: string; // "openai", "anthropic", "google"
  modelId: string; // e.g., "gpt-4-turbo-preview"
  parameters: {
    temperature: number; // 0.0-2.0, default: 0.7
    maxTokens?: number; // Maximum response length
    topP?: number; // Nucleus sampling 0.0-1.0
    frequencyPenalty?: number; // -2.0 to 2.0
    presencePenalty?: number; // -2.0 to 2.0
  };
}
```

### 4. Configuration Management Service

#### CRUD Operations

- **Create**: Generate new personality, role, or agent configurations
- **Read**: Load configurations by ID or retrieve all configurations
- **Update**: Modify existing configurations with validation
- **Delete**: Remove configurations with dependency checking

#### File-Based Storage

- JSON files for configuration persistence
- Structured file organization in `app-data/config/` directory
- Atomic write operations to prevent corruption

#### Service Interface

```typescript
interface ConfigurationService {
  // Personality Management
  createPersonality(
    config: Omit<PersonalityConfiguration, "id" | "createdAt" | "updatedAt">,
  ): Promise<PersonalityConfiguration>;
  getPersonality(id: string): Promise<PersonalityConfiguration | null>;
  getAllPersonalities(): Promise<PersonalityConfiguration[]>;
  updatePersonality(
    id: string,
    updates: Partial<PersonalityConfiguration>,
  ): Promise<PersonalityConfiguration>;
  deletePersonality(id: string): Promise<void>;

  // Role Management
  createRole(
    config: Omit<RoleConfiguration, "id" | "createdAt" | "updatedAt">,
  ): Promise<RoleConfiguration>;
  getRole(id: string): Promise<RoleConfiguration | null>;
  getAllRoles(): Promise<RoleConfiguration[]>;
  updateRole(
    id: string,
    updates: Partial<RoleConfiguration>,
  ): Promise<RoleConfiguration>;
  deleteRole(id: string): Promise<void>;

  // Agent Management
  createAgent(
    config: Omit<AgentConfiguration, "id" | "createdAt" | "updatedAt">,
  ): Promise<AgentConfiguration>;
  getAgent(id: string): Promise<AgentConfiguration | null>;
  getAllAgents(): Promise<AgentConfiguration[]>;
  updateAgent(
    id: string,
    updates: Partial<AgentConfiguration>,
  ): Promise<AgentConfiguration>;
  deleteAgent(id: string): Promise<void>;
}
```

## Technical Requirements

### Technology Stack Alignment

- **Language**: TypeScript 5.8+ with strict mode and `noUncheckedIndexedAccess`
- **Validation**: Zod 4.0+ for runtime schema validation
- **Testing**: Jest 30.0+ for unit and integration testing
- **Package Location**: `packages/shared/src/` for business logic
- **File System**: Node.js fs operations with platform abstraction

### Architecture Patterns

- **Domain-Oriented Modules**: Separate modules for personalities, roles, agents, and configuration management
- **Composition Over Inheritance**: Favor configuration composition over complex inheritance hierarchies
- **Bridge Pattern**: Abstract file system operations for platform compatibility
- **Dependency Injection**: Configurable file paths and storage backends

### File Structure

```
packages/shared/src/
├── types/
│   ├── personality.ts          # PersonalityConfiguration interface
│   ├── role.ts                 # RoleConfiguration interface
│   ├── agent.ts                # AgentConfiguration interface
│   └── index.ts                # Barrel exports
├── validation/
│   ├── personality.schema.ts   # Zod schemas for personality validation
│   ├── role.schema.ts          # Zod schemas for role validation
│   ├── agent.schema.ts         # Zod schemas for agent validation
│   └── index.ts                # Barrel exports
├── services/
│   ├── configuration/
│   │   ├── personality.service.ts    # Personality CRUD operations
│   │   ├── role.service.ts          # Role CRUD operations
│   │   ├── agent.service.ts         # Agent CRUD operations
│   │   ├── file.service.ts          # File system operations
│   │   └── index.ts                 # ConfigurationService implementation
│   └── index.ts                # Service barrel exports
├── utils/
│   ├── id-generation.ts        # UUID generation utilities
│   ├── validation.ts           # Common validation helpers
│   └── index.ts                # Barrel exports
└── __tests__/
    ├── personality.test.ts     # Personality service tests
    ├── role.test.ts            # Role service tests
    ├── agent.test.ts           # Agent service tests
    └── integration.test.ts     # Cross-service integration tests
```

### Storage Architecture

#### File Organization

```
app-data/
├── config/
│   ├── personalities.json     # Personality configurations
│   ├── roles.json             # Role configurations
│   ├── agents.json            # Agent configurations
│   └── models.json            # Model provider configurations (existing)
├── data/
│   └── conversations.db       # SQLite database (existing)
└── logs/
    └── config-errors.log      # Configuration error logging
```

#### JSON File Structure Examples

**personalities.json**

```json
{
  "personalities": [
    {
      "id": "default-balanced",
      "name": "Balanced Assistant",
      "description": "Well-rounded personality with neutral traits",
      "openness": 50,
      "conscientiousness": 50,
      "extraversion": 50,
      "agreeableness": 50,
      "neuroticism": 50,
      "formality": 50,
      "humor": 50,
      "assertiveness": 50,
      "empathy": 50,
      "storytelling": 50,
      "brevity": 50,
      "imagination": 50,
      "playfulness": 50,
      "dramaticism": 50,
      "analyticalDepth": 50,
      "contrarianism": 50,
      "encouragement": 50,
      "curiosity": 50,
      "patience": 50,
      "isTemplate": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**roles.json**

```json
{
  "roles": [
    {
      "id": "technical-advisor",
      "name": "Technical Advisor",
      "description": "Provides technical expertise and implementation guidance",
      "systemPrompt": "You are a Technical Advisor with deep expertise in software development, architecture, and engineering best practices. Focus on providing technical solutions, identifying implementation approaches, and offering guidance on technical feasibility.",
      "focusAreas": [
        "software architecture",
        "code review",
        "technical feasibility",
        "implementation planning"
      ],
      "isTemplate": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Validation Requirements

#### Schema Validation

- All configuration objects validated against Zod schemas
- Runtime type checking for configuration integrity
- Validation error collection and reporting

#### Business Logic Validation

- Personality trait values within 0-100 range
- Required field presence validation
- Cross-reference validation (personality/role ID existence for agents)
- Circular dependency detection for complex configurations

#### Error Handling Strategy

- Log all configuration errors with structured logging
- Throw exceptions for critical failures (file corruption, invalid schemas)
- Provide detailed error messages for validation failures
- Graceful degradation for non-critical configuration issues

## Integration Requirements

### AI Service Integration

- Agent configurations integrate with existing `AIService` class
- Model configuration validation against available providers
- Provider capability checking (streaming support, parameter constraints)
- No API validation during configuration (deferred to runtime usage)

### Database Integration

- Agent configurations referenced in conversation database
- Personality and role IDs stored as foreign references
- Migration support for configuration format changes

### Platform Bridge Integration

- File system operations abstracted through bridge pattern
- Platform-specific secure storage for sensitive configuration data
- Cross-platform compatibility for configuration file formats

## Non-Functional Requirements

### Performance Requirements

- Configuration loading under 100ms for typical file sizes
- Batch operations support for multiple configuration changes
- Memory-efficient JSON parsing and serialization
- Lazy loading of configuration data when possible

### Reliability Requirements

- Atomic file write operations to prevent corruption
- Configuration backup and recovery mechanisms
- Validation of configuration integrity on service startup
- Graceful handling of malformed configuration files

### Security Requirements

- No sensitive data in configuration files (API keys stored separately)
- Input sanitization for custom instructions and descriptions
- File system permission validation
- Prevention of directory traversal attacks in file operations

### Maintainability Requirements

- Clear separation of concerns between configuration types
- Comprehensive unit test coverage (>90%)
- Integration test coverage for cross-service operations
- Documentation for configuration file formats and service APIs

## Acceptance Criteria

### Personality Configuration Acceptance Criteria

**AC-1.1: Create Personality Configuration**

- Given: Valid personality data with all required fields (Big Five + 14 behavioral traits)
- When: `createPersonality()` is called
- Then:
  - Personality is saved to `personalities.json` with unique ID
  - All trait values are validated as 0-100 integers
  - Timestamp fields are automatically generated
  - Created personality can be retrieved by ID

**AC-1.2: Personality Validation**

- Given: Invalid personality data (missing fields, out-of-range values)
- When: `createPersonality()` or `updatePersonality()` is called
- Then:
  - Zod validation throws descriptive error
  - No partial data is saved to file system
  - Error includes specific field validation failures

**AC-1.3: Personality CRUD Operations**

- Given: Existing personality configurations
- When: CRUD operations are performed
- Then:
  - `getPersonality(id)` returns correct configuration or null
  - `getAllPersonalities()` returns all configurations
  - `updatePersonality(id, changes)` modifies existing configuration
  - `deletePersonality(id)` removes configuration and updates file

### Role Configuration Acceptance Criteria

**AC-2.1: Predefined Role Loading**

- Given: Initial system startup
- When: Role service initializes
- Then:
  - All 10 predefined roles are available
  - Each role has proper systemPrompt and focusAreas
  - Predefined roles are marked with `isTemplate: true`
  - Cannot delete predefined roles

**AC-2.2: Custom Role Management**

- Given: Valid custom role data
- When: `createRole()` is called
- Then:
  - Role is saved with `isTemplate: false`
  - SystemPrompt is stored as provided
  - Role can be updated and deleted (unlike predefined roles)

### Agent Configuration Acceptance Criteria

**AC-3.1: Agent Creation with Valid References**

- Given: Valid personalityId, roleId, and model configuration
- When: `createAgent()` is called
- Then:
  - Agent configuration is saved with proper references
  - PersonalityId and roleId are validated to exist
  - Model configuration follows provider-specific format
  - Agent receives unique color for UI theming

**AC-3.2: Agent Reference Validation**

- Given: Agent configuration with invalid personalityId or roleId
- When: `createAgent()` or `updateAgent()` is called
- Then:
  - Validation error is thrown with specific reference failure
  - No agent configuration is saved
  - Error message indicates which reference is invalid

**AC-3.3: Agent Model Configuration**

- Given: Agent with model configuration
- When: Model parameters are set
- Then:
  - Temperature is validated within 0.0-2.0 range
  - Optional parameters (topP, penalties) have proper ranges
  - Provider and modelId are string validated
  - Configuration is serializable to JSON

### Configuration Service Acceptance Criteria

**AC-4.1: File System Operations**

- Given: Configuration service with file system access
- When: CRUD operations are performed
- Then:
  - JSON files are atomically written (no partial updates)
  - File corruption is prevented through backup-and-replace strategy
  - File system errors are caught and logged
  - Service gracefully handles missing configuration files

**AC-4.2: Cross-Service Integration**

- Given: Agent configuration requiring personality and role data
- When: Agent is created or loaded
- Then:
  - Personality configuration is successfully resolved by ID
  - Role configuration is successfully resolved by ID
  - Missing references throw appropriate errors
  - Service maintains data consistency across configuration types

**AC-4.3: Error Handling and Logging**

- Given: Various error conditions (file errors, validation failures)
- When: Operations are attempted
- Then:
  - Errors are logged with structured format
  - Critical errors are thrown to calling code
  - Non-critical errors allow graceful degradation
  - Error messages provide actionable debugging information

### Testing Requirements Acceptance Criteria

**AC-5.1: Unit Test Coverage**

- Given: All service methods and validation logic
- When: Unit tests are run
- Then:
  - Test coverage exceeds 90% for business logic
  - All CRUD operations have corresponding tests
  - Edge cases and error conditions are tested
  - Tests run in isolation without file system dependencies

**AC-5.2: Integration Test Coverage**

- Given: Configuration service interactions
- When: Integration tests are run
- Then:
  - Cross-service reference validation is tested
  - File system operations are tested with temporary directories
  - Service initialization and cleanup are tested
  - Real JSON serialization/deserialization is validated

## Future Extensibility

### Planned Enhancements

- **Template System**: Pre-built agent templates for common use cases
- **Configuration Validation**: Advanced validation rules and constraints
- **Import/Export**: Bulk operations for configuration sharing
- **Version Control**: Configuration change tracking and rollback
- **Real-time Sync**: Multi-device configuration synchronization

### Architecture Considerations

- Service interfaces designed for future caching layer
- Configuration format versioning for migration support
- Plugin architecture for custom personality/role types
- Event system for configuration change notifications

## Success Metrics

### Functional Success Metrics

- All CRUD operations complete successfully under normal conditions
- Configuration validation catches 100% of invalid data before persistence
- Service initialization completes within performance requirements
- Integration with existing AI service architecture functions correctly

### Quality Success Metrics

- Unit test coverage >90% for core business logic
- Integration tests cover all cross-service interactions
- Zero configuration file corruption incidents during testing
- All acceptance criteria pass automated testing

### Development Success Metrics

- Clear separation of concerns enables parallel UI development
- Service interfaces support future enhancement without breaking changes
- Code follows established monorepo architectural patterns
- Documentation enables other developers to extend system functionality

### Log
