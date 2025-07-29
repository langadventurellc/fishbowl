/**
 * @fileoverview File Lifecycle Test Data Builder
 *
 * Fluent builder for creating test data for file lifecycle operations
 * following the established test data builder patterns in the project.
 */

import type { ConfigurationData } from "../../../types/configuration/ConfigurationData";

/**
 * File Lifecycle Test Data Builder
 * Provides fluent interface for creating configuration data for lifecycle tests
 */
export class FileLifecycleTestDataBuilder {
  private configData: ConfigurationData = {
    version: "1.0",
    format: "json",
    encoding: "utf-8",
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: "test-builder",
      operation: "create",
    },
    data: {
      agents: [],
      personalities: [],
      roles: [],
    },
  };

  /**
   * Set the version of the configuration
   */
  withVersion(version: string): FileLifecycleTestDataBuilder {
    this.configData.version = version;
    return this;
  }

  /**
   * Set the format of the configuration
   */
  withFormat(format: string): FileLifecycleTestDataBuilder {
    this.configData.format = format;
    return this;
  }

  /**
   * Set the encoding of the configuration
   */
  withEncoding(encoding: string): FileLifecycleTestDataBuilder {
    this.configData.encoding = encoding;
    return this;
  }

  /**
   * Set the creation timestamp
   */
  withCreatedAt(createdAt: string): FileLifecycleTestDataBuilder {
    this.configData.metadata.createdAt = createdAt;
    return this;
  }

  /**
   * Set the creator identifier
   */
  withCreatedBy(createdBy: string): FileLifecycleTestDataBuilder {
    this.configData.metadata.createdBy = createdBy;
    return this;
  }

  /**
   * Set the last modified timestamp
   */
  withLastModified(lastModified: string): FileLifecycleTestDataBuilder {
    this.configData.metadata.lastModified = lastModified;
    return this;
  }

  /**
   * Set the description
   */
  withDescription(description: string): FileLifecycleTestDataBuilder {
    this.configData.metadata.description = description;
    return this;
  }

  /**
   * Set the operation type
   */
  withOperation(operation: string): FileLifecycleTestDataBuilder {
    this.configData.metadata.operation = operation;
    return this;
  }

  /**
   * Add an agent to the configuration data
   */
  withAgent(agent: Record<string, unknown>): FileLifecycleTestDataBuilder {
    this.configData.data.agents.push(agent);
    return this;
  }

  /**
   * Add multiple agents to the configuration data
   */
  withAgents(agents: Record<string, unknown>[]): FileLifecycleTestDataBuilder {
    this.configData.data.agents.push(...agents);
    return this;
  }

  /**
   * Add a personality to the configuration data
   */
  withPersonality(
    personality: Record<string, unknown>,
  ): FileLifecycleTestDataBuilder {
    this.configData.data.personalities.push(personality);
    return this;
  }

  /**
   * Add multiple personalities to the configuration data
   */
  withPersonalities(
    personalities: Record<string, unknown>[],
  ): FileLifecycleTestDataBuilder {
    this.configData.data.personalities.push(...personalities);
    return this;
  }

  /**
   * Add a role to the configuration data
   */
  withRole(role: Record<string, unknown>): FileLifecycleTestDataBuilder {
    this.configData.data.roles.push(role);
    return this;
  }

  /**
   * Add multiple roles to the configuration data
   */
  withRoles(roles: Record<string, unknown>[]): FileLifecycleTestDataBuilder {
    this.configData.data.roles.push(...roles);
    return this;
  }

  /**
   * Build the configuration data
   */
  build(): ConfigurationData {
    return { ...this.configData };
  }

  /**
   * Build configuration data for file creation scenarios
   */
  buildForCreation(): ConfigurationData {
    return this.withOperation("create")
      .withCreatedAt(new Date().toISOString())
      .build();
  }

  /**
   * Build configuration data for file update scenarios
   */
  buildForUpdate(): ConfigurationData {
    return this.withOperation("update")
      .withLastModified(new Date().toISOString())
      .build();
  }

  /**
   * Build configuration data for file deletion scenarios
   */
  buildForDeletion(): ConfigurationData {
    return this.withOperation("delete")
      .withLastModified(new Date().toISOString())
      .build();
  }

  /**
   * Build configuration data for file restore scenarios
   */
  buildForRestore(): ConfigurationData {
    return this.withOperation("restore")
      .withLastModified(new Date().toISOString())
      .build();
  }

  /**
   * Create a new builder instance
   */
  static create(): FileLifecycleTestDataBuilder {
    return new FileLifecycleTestDataBuilder();
  }

  /**
   * Create builder with sample agent data
   */
  static withSampleAgent(): FileLifecycleTestDataBuilder {
    return new FileLifecycleTestDataBuilder().withAgent({
      id: "sample-agent-1",
      name: "Sample Agent",
      role: "assistant",
      capabilities: ["chat", "analysis"],
    });
  }

  /**
   * Create builder with sample personality data
   */
  static withSamplePersonality(): FileLifecycleTestDataBuilder {
    return new FileLifecycleTestDataBuilder().withPersonality({
      id: "sample-personality-1",
      name: "Sample Personality",
      traits: {
        openness: 75,
        conscientiousness: 85,
        extraversion: 60,
        agreeableness: 70,
        neuroticism: 30,
      },
    });
  }

  /**
   * Create builder with sample role data
   */
  static withSampleRole(): FileLifecycleTestDataBuilder {
    return new FileLifecycleTestDataBuilder().withRole({
      id: "sample-role-1",
      name: "Sample Role",
      description: "A sample role for testing",
      capabilities: ["basic-interaction"],
      constraints: [],
    });
  }

  /**
   * Create builder with complete sample data (agent, personality, role)
   */
  static withCompleteData(): FileLifecycleTestDataBuilder {
    return new FileLifecycleTestDataBuilder()
      .withAgent({
        id: "complete-agent-1",
        name: "Complete Agent",
        role: "assistant",
        personalityId: "complete-personality-1",
      })
      .withPersonality({
        id: "complete-personality-1",
        name: "Complete Personality",
        traits: {
          openness: 80,
          conscientiousness: 90,
          extraversion: 70,
          agreeableness: 85,
          neuroticism: 25,
        },
      })
      .withRole({
        id: "complete-role-1",
        name: "Complete Role",
        description: "A complete role for comprehensive testing",
        capabilities: ["chat", "analysis", "planning"],
        constraints: ["no-external-access"],
      });
  }
}
