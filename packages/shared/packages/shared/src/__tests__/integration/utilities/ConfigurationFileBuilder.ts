/**
 * @fileoverview Configuration File Builder for Test Data Generation
 *
 * Provides a fluent API for building test configuration data with various
 * scenarios including valid configurations, invalid data, and edge cases.
 */

import { ConfigurationData } from "./TemporaryDirectoryManager";

/**
 * Types of invalid configurations that can be generated
 */
export type InvalidationType =
  | "missing-required-fields"
  | "invalid-trait-values"
  | "circular-references"
  | "invalid-model-config"
  | "malformed-structure"
  | "invalid-references"
  | "invalid-metadata";

/**
 * Atomic operation scenario types
 */
export type AtomicScenarioType =
  | "successful-write"
  | "staging-failure"
  | "commit-failure"
  | "validation-failure"
  | "concurrent-access"
  | "large-file"
  | "permission-error";

/**
 * Agent configuration interface for type safety
 */
interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  personalityId: string;
  roleId: string;
  modelConfig: {
    provider: string;
    modelId: string;
    parameters: {
      temperature: number;
      maxTokens?: number;
      topP?: number;
      frequencyPenalty?: number;
      presencePenalty?: number;
    };
  };
  color?: string;
  isTemplate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Personality configuration interface for type safety
 */
interface PersonalityConfig {
  id: string;
  name: string;
  description?: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
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
  customInstructions?: string;
  isTemplate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Role configuration interface for type safety
 */
interface RoleConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  focusAreas: string[];
  isTemplate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Builder for creating test configuration file data
 */
export class ConfigurationFileBuilder {
  private config: Partial<ConfigurationData>;

  constructor() {
    this.config = {
      version: "1.0.0",
      format: "json",
      encoding: "utf8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-suite",
      },
      data: {
        agents: [],
        personalities: [],
        roles: [],
      },
    };
  }

  /**
   * Set the configuration version
   */
  withVersion(version: string): ConfigurationFileBuilder {
    this.config.version = version;
    return this;
  }

  /**
   * Set the configuration format
   */
  withFormat(format: string): ConfigurationFileBuilder {
    this.config.format = format;
    return this;
  }

  /**
   * Set the file encoding
   */
  withEncoding(encoding: string): ConfigurationFileBuilder {
    this.config.encoding = encoding;
    return this;
  }

  /**
   * Add metadata to the configuration
   */
  withMetadata(
    metadata: Partial<ConfigurationData["metadata"]>,
  ): ConfigurationFileBuilder {
    this.config.metadata = {
      ...this.config.metadata!,
      ...metadata,
    };
    return this;
  }

  /**
   * Add description to metadata
   */
  withDescription(description: string): ConfigurationFileBuilder {
    if (!this.config.metadata) {
      this.config.metadata = {
        createdAt: new Date().toISOString(),
        createdBy: "test-suite",
      };
    }
    this.config.metadata.description = description;
    return this;
  }

  /**
   * Create a minimal valid configuration
   */
  withMinimalValidConfiguration(): ConfigurationFileBuilder {
    this.config.data = {
      agents: [],
      personalities: [],
      roles: [],
    };
    return this;
  }

  /**
   * Create a complete valid configuration with sample data
   */
  withCompleteValidConfiguration(): ConfigurationFileBuilder {
    const personality: PersonalityConfig = {
      id: "test-personality-balanced",
      name: "Balanced Test Personality",
      description: "A balanced personality for testing",
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
      formality: 50,
      humor: 50,
      assertiveness: 50,
      empathy: 50,
      storytelling: 50,
      brevity: 50,
      imagination: 50,
      playfulness: 50,
      dramaticism: 50,
      analyticalDepth: 50,
      contrarianism: 50,
      encouragement: 50,
      curiosity: 50,
      patience: 50,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const role: RoleConfig = {
      id: "test-role-advisor",
      name: "Test Technical Advisor",
      description: "Technical advisor role for testing",
      systemPrompt:
        "You are a technical advisor providing implementation guidance.",
      focusAreas: [
        "software architecture",
        "code review",
        "technical feasibility",
      ],
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const agent: AgentConfig = {
      id: "test-agent-complete",
      name: "Complete Test Agent",
      description: "A complete agent configuration for testing",
      personalityId: personality.id,
      roleId: role.id,
      modelConfig: {
        provider: "openai",
        modelId: "gpt-4-turbo-preview",
        parameters: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9,
        },
      },
      color: "#3B82F6",
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.config.data = {
      agents: [agent] as Record<string, unknown>[],
      personalities: [personality] as Record<string, unknown>[],
      roles: [role] as Record<string, unknown>[],
    };

    return this;
  }

  /**
   * Create configuration with multiple agents for testing
   */
  withMultipleAgents(count: number): ConfigurationFileBuilder {
    const agents: AgentConfig[] = [];
    const personalities: PersonalityConfig[] = [];
    const roles: RoleConfig[] = [];

    for (let i = 0; i < count; i++) {
      const personalityId = `test-personality-${i}`;
      const roleId = `test-role-${i}`;
      const agentId = `test-agent-${i}`;

      personalities.push({
        id: personalityId,
        name: `Test Personality ${i}`,
        openness: 50 + ((i * 5) % 50),
        conscientiousness: 50 + ((i * 7) % 50),
        extraversion: 50 + ((i * 3) % 50),
        agreeableness: 50 + ((i * 4) % 50),
        neuroticism: 50 + ((i * 6) % 50),
        formality: 50,
        humor: 50,
        assertiveness: 50,
        empathy: 50,
        storytelling: 50,
        brevity: 50,
        imagination: 50,
        playfulness: 50,
        dramaticism: 50,
        analyticalDepth: 50,
        contrarianism: 50,
        encouragement: 50,
        curiosity: 50,
        patience: 50,
        isTemplate: false,
      });

      roles.push({
        id: roleId,
        name: `Test Role ${i}`,
        description: `Test role ${i} for testing`,
        systemPrompt: `You are test role ${i}.`,
        focusAreas: [`test-area-${i}`],
        isTemplate: false,
      });

      agents.push({
        id: agentId,
        name: `Test Agent ${i}`,
        personalityId,
        roleId,
        modelConfig: {
          provider: "openai",
          modelId: "gpt-4",
          parameters: {
            temperature: 0.5 + i * 0.1,
          },
        },
      });
    }

    this.config.data = {
      agents: agents as Record<string, unknown>[],
      personalities: personalities as Record<string, unknown>[],
      roles: roles as Record<string, unknown>[],
    };

    return this;
  }

  /**
   * Create invalid configuration based on specified type
   */
  withInvalidConfiguration(type: InvalidationType): ConfigurationFileBuilder {
    switch (type) {
      case "missing-required-fields":
        this.config.data = {
          agents: [
            {
              id: "agent-missing-fields",
              personalityId: "missing-personality",
              roleId: "missing-role",
              // Missing required fields like name, modelConfig
            },
          ] as Record<string, unknown>[],
          personalities: [],
          roles: [],
        };
        break;

      case "invalid-trait-values":
        this.config.data = {
          agents: [],
          personalities: [
            {
              id: "personality-invalid-traits",
              name: "Invalid Traits Personality",
              openness: 150, // Invalid: > 100
              conscientiousness: -20, // Invalid: < 0
              extraversion: "not-a-number", // Invalid: not a number
              agreeableness: null, // Invalid: null
              neuroticism: undefined, // Invalid: undefined
              // Missing other required traits
              isTemplate: false,
            },
          ] as Record<string, unknown>[],
          roles: [],
        };
        break;

      case "circular-references":
        this.config.data = {
          agents: [
            {
              id: "agent-circular-1",
              name: "Circular Agent 1",
              personalityId: "personality-test",
              roleId: "role-test",
              dependencies: ["agent-circular-2"],
            },
            {
              id: "agent-circular-2",
              name: "Circular Agent 2",
              personalityId: "personality-test",
              roleId: "role-test",
              dependencies: ["agent-circular-1"],
            },
          ] as Record<string, unknown>[],
          personalities: [],
          roles: [],
        };
        break;

      case "invalid-model-config":
        this.config.data = {
          agents: [
            {
              id: "agent-invalid-model",
              name: "Invalid Model Agent",
              personalityId: "personality-test",
              roleId: "role-test",
              modelConfig: {
                provider: "unsupported-provider",
                modelId: "",
                parameters: {
                  temperature: 3.0, // Invalid: > 2.0
                  maxTokens: -1000, // Invalid: negative
                  topP: 2.5, // Invalid: > 1.0
                  frequencyPenalty: 5.0, // Invalid: > 2.0
                  presencePenalty: -10.0, // Invalid: < -2.0
                },
              },
            },
          ] as Record<string, unknown>[],
          personalities: [],
          roles: [],
        };
        break;

      case "malformed-structure":
        this.config.data = {
          agents: "this-should-be-an-array" as unknown as Record<
            string,
            unknown
          >[],
          personalities: { this: "should-be-an-array" } as unknown as Record<
            string,
            unknown
          >[],
          roles: null as unknown as Record<string, unknown>[],
        };
        break;

      case "invalid-references":
        this.config.data = {
          agents: [
            {
              id: "agent-invalid-refs",
              name: "Invalid References Agent",
              personalityId: "non-existent-personality",
              roleId: "non-existent-role",
              modelConfig: {
                provider: "openai",
                modelId: "gpt-4",
                parameters: { temperature: 0.7 },
              },
            },
          ] as Record<string, unknown>[],
          personalities: [],
          roles: [],
        };
        break;

      case "invalid-metadata":
        this.config.version = "unsupported-version";
        this.config.format = "xml";
        this.config.encoding = "invalid-encoding";
        this.config.metadata = {
          createdAt: "not-a-valid-date",
          createdBy: "",
          lastModified: null as unknown as string,
        };
        break;
    }

    return this;
  }

  /**
   * Configure for atomic operation scenario
   */
  withAtomicOperationScenario(
    scenario: AtomicScenarioType,
  ): ConfigurationFileBuilder {
    switch (scenario) {
      case "successful-write":
        this.withCompleteValidConfiguration();
        this.withMetadata({ operation: "atomic-write-success" });
        break;

      case "staging-failure":
        this.withMinimalValidConfiguration();
        this.withMetadata({ operation: "atomic-write-staging-failure" });
        break;

      case "commit-failure":
        this.withMinimalValidConfiguration();
        this.withMetadata({ operation: "atomic-write-commit-failure" });
        break;

      case "validation-failure":
        this.withInvalidConfiguration("invalid-references");
        this.withMetadata({ operation: "atomic-write-validation-failure" });
        break;

      case "concurrent-access":
        this.withCompleteValidConfiguration();
        this.withMetadata({ operation: "concurrent-access-test" });
        break;

      case "large-file":
        this.withMultipleAgents(100);
        this.withMetadata({ operation: "large-file-test" });
        break;

      case "permission-error":
        this.withMinimalValidConfiguration();
        this.withMetadata({ operation: "permission-error-test" });
        break;
    }

    return this;
  }

  /**
   * Add custom agent to the configuration
   */
  withAgent(agent: Partial<AgentConfig>): ConfigurationFileBuilder {
    const fullAgent: AgentConfig = {
      id: agent.id || `agent-${Date.now()}`,
      name: agent.name || "Test Agent",
      personalityId: agent.personalityId || "default-personality",
      roleId: agent.roleId || "default-role",
      modelConfig: agent.modelConfig || {
        provider: "openai",
        modelId: "gpt-4",
        parameters: { temperature: 0.7 },
      },
      ...agent,
    };

    if (!this.config.data) {
      this.config.data = { agents: [], personalities: [], roles: [] };
    }

    this.config.data.agents.push(fullAgent as Record<string, unknown>);
    return this;
  }

  /**
   * Add custom personality to the configuration
   */
  withPersonality(
    personality: Partial<PersonalityConfig>,
  ): ConfigurationFileBuilder {
    const fullPersonality: PersonalityConfig = {
      id: personality.id || `personality-${Date.now()}`,
      name: personality.name || "Test Personality",
      openness: personality.openness ?? 50,
      conscientiousness: personality.conscientiousness ?? 50,
      extraversion: personality.extraversion ?? 50,
      agreeableness: personality.agreeableness ?? 50,
      neuroticism: personality.neuroticism ?? 50,
      formality: personality.formality ?? 50,
      humor: personality.humor ?? 50,
      assertiveness: personality.assertiveness ?? 50,
      empathy: personality.empathy ?? 50,
      storytelling: personality.storytelling ?? 50,
      brevity: personality.brevity ?? 50,
      imagination: personality.imagination ?? 50,
      playfulness: personality.playfulness ?? 50,
      dramaticism: personality.dramaticism ?? 50,
      analyticalDepth: personality.analyticalDepth ?? 50,
      contrarianism: personality.contrarianism ?? 50,
      encouragement: personality.encouragement ?? 50,
      curiosity: personality.curiosity ?? 50,
      patience: personality.patience ?? 50,
      isTemplate: personality.isTemplate ?? false,
      ...personality,
    };

    if (!this.config.data) {
      this.config.data = { agents: [], personalities: [], roles: [] };
    }

    this.config.data.personalities.push(
      fullPersonality as Record<string, unknown>,
    );
    return this;
  }

  /**
   * Add custom role to the configuration
   */
  withRole(role: Partial<RoleConfig>): ConfigurationFileBuilder {
    const fullRole: RoleConfig = {
      id: role.id || `role-${Date.now()}`,
      name: role.name || "Test Role",
      description: role.description || "A test role",
      systemPrompt: role.systemPrompt || "You are a helpful assistant.",
      focusAreas: role.focusAreas || ["general"],
      isTemplate: role.isTemplate ?? false,
      ...role,
    };

    if (!this.config.data) {
      this.config.data = { agents: [], personalities: [], roles: [] };
    }

    this.config.data.roles.push(fullRole as Record<string, unknown>);
    return this;
  }

  /**
   * Build and return the configuration data
   */
  build(): ConfigurationData {
    return {
      ...this.config,
      data: this.config.data || { agents: [], personalities: [], roles: [] },
    } as ConfigurationData;
  }

  /**
   * Build and return the configuration as a JSON string
   */
  buildAsJsonString(indent: number = 2): string {
    return JSON.stringify(this.build(), null, indent);
  }

  /**
   * Create a copy of the builder for variations
   */
  clone(): ConfigurationFileBuilder {
    const clone = new ConfigurationFileBuilder();
    clone.config = JSON.parse(JSON.stringify(this.config));
    return clone;
  }

  /**
   * Reset the builder to default state
   */
  reset(): ConfigurationFileBuilder {
    this.config = {
      version: "1.0.0",
      format: "json",
      encoding: "utf8",
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: "test-suite",
      },
      data: {
        agents: [],
        personalities: [],
        roles: [],
      },
    };
    return this;
  }
}
