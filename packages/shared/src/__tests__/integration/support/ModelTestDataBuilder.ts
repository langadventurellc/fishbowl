/**
 * @fileoverview Model Test Data Builder
 *
 * Builder pattern for creating model configuration test data with comprehensive scenarios.
 * Supports model capabilities, constraints, and compatibility testing.
 */

import type {
  ModelConfiguration,
  ModelCapabilities,
  ModelConstraints,
  CompatibilityResult,
} from "../../../types/model";

/**
 * Model Test Data Builder
 * Provides fluent API for building test model configuration data
 */
export class ModelTestDataBuilder {
  /**
   * Create a valid basic model configuration
   */
  static createValidModelConfig(
    overrides: Partial<ModelConfiguration> = {},
  ): ModelConfiguration {
    const defaultModel: ModelConfiguration = {
      id: "test-model-001",
      name: "Test Model Standard",
      provider: "test",
      version: "1.0.0",
      description: "A standard test model for general testing scenarios",
      isAvailable: true,
      tier: "standard",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    };
    return { ...defaultModel, ...overrides };
  }

  /**
   * Create a high-performance model configuration
   */
  static createHighPerformanceModel(): ModelConfiguration {
    return this.createValidModelConfig({
      id: "test-high-performance-001",
      name: "High Performance Test Model",
      provider: "test",
      version: "2.0.0",
      description: "High-performance model for demanding computational tasks",
      tier: "premium",
      createdAt: new Date("2025-01-15T00:00:00.000Z"),
      updatedAt: new Date("2025-01-15T00:00:00.000Z"),
    });
  }

  /**
   * Create a constrained model with limited capabilities
   */
  static createConstrainedModel(): ModelConfiguration {
    return this.createValidModelConfig({
      id: "test-constrained-001",
      name: "Constrained Test Model",
      provider: "test",
      version: "1.5.0",
      description: "Model with operational constraints for testing limitations",
      tier: "basic",
      isAvailable: true,
    });
  }

  /**
   * Create an unavailable model for error testing
   */
  static createUnavailableModel(): ModelConfiguration {
    return this.createValidModelConfig({
      id: "test-unavailable-001",
      name: "Unavailable Test Model",
      provider: "test",
      version: "0.9.0",
      description: "Model marked as unavailable for error scenario testing",
      isAvailable: false,
      tier: "basic",
    });
  }

  /**
   * Create comprehensive model capabilities
   */
  static createModelCapabilities(
    overrides: Partial<ModelCapabilities> = {},
  ): ModelCapabilities {
    const defaultCapabilities: ModelCapabilities = {
      maxContextLength: 16384,
      maxOutputLength: 4096,
      inputModalities: ["text"],
      outputModalities: ["text"],
      supportsFunctionCalling: true,
      supportsStreaming: true,
      performance: {
        avgResponseTime: 1500,
        rpmLimit: 1000,
        tpmLimit: 50000,
      },
      cost: {
        inputTokenCost: 0.005,
        outputTokenCost: 0.015,
        currency: "USD",
      },
      specializations: ["general", "analysis"],
    };
    return { ...defaultCapabilities, ...overrides };
  }

  /**
   * Create limited model capabilities for basic models
   */
  static createLimitedCapabilities(): ModelCapabilities {
    return this.createModelCapabilities({
      maxContextLength: 4096,
      maxOutputLength: 1024,
      inputModalities: ["text"],
      outputModalities: ["text"],
      supportsFunctionCalling: false,
      supportsStreaming: false,
      performance: {
        avgResponseTime: 800,
        rpmLimit: 5000,
        tpmLimit: 100000,
      },
      cost: {
        inputTokenCost: 0.001,
        outputTokenCost: 0.002,
        currency: "USD",
      },
      specializations: ["general"],
    });
  }

  /**
   * Create advanced model capabilities for premium models
   */
  static createAdvancedCapabilities(): ModelCapabilities {
    return this.createModelCapabilities({
      maxContextLength: 200000,
      maxOutputLength: 8192,
      inputModalities: ["text", "image", "audio"],
      outputModalities: ["text", "image"],
      supportsFunctionCalling: true,
      supportsStreaming: true,
      performance: {
        avgResponseTime: 3500,
        rpmLimit: 500,
        tpmLimit: 40000,
      },
      cost: {
        inputTokenCost: 0.015,
        outputTokenCost: 0.075,
        currency: "USD",
      },
      specializations: [
        "general",
        "analysis",
        "creative",
        "reasoning",
        "multimodal",
      ],
    });
  }

  /**
   * Create model constraints for operational limitations
   */
  static createModelConstraints(
    overrides: Partial<ModelConstraints> = {},
  ): ModelConstraints {
    const defaultConstraints: ModelConstraints = {
      maxCostPerInteraction: 1.0,
      maxResponseTime: 5000,
      requiredInputModalities: ["text"],
      requiredOutputModalities: ["text"],
      minContextLength: 1000,
      requiredSpecializations: ["general"],
      security: {
        requireOnPremise: false,
        requireDataRetention: false,
        allowedRegions: ["us-east-1", "us-west-2", "eu-west-1"],
      },
    };
    return { ...defaultConstraints, ...overrides };
  }

  /**
   * Create strict security constraints
   */
  static createSecurityConstraints(): ModelConstraints {
    return this.createModelConstraints({
      maxCostPerInteraction: 0.5,
      maxResponseTime: 3000,
      requiredInputModalities: ["text"],
      requiredOutputModalities: ["text"],
      minContextLength: 2000,
      requiredSpecializations: ["general", "analysis"],
      security: {
        requireOnPremise: true,
        requireDataRetention: true,
        allowedRegions: ["us-gov-east-1"],
      },
    });
  }

  /**
   * Create performance-focused constraints
   */
  static createPerformanceConstraints(): ModelConstraints {
    return this.createModelConstraints({
      maxCostPerInteraction: 5.0,
      maxResponseTime: 10000,
      requiredInputModalities: ["text", "image"],
      requiredOutputModalities: ["text"],
      minContextLength: 8000,
      requiredSpecializations: ["general", "analysis", "reasoning"],
    });
  }

  /**
   * Create compatibility test data for model-personality matching
   */
  static createCompatibilityTestData(): CompatibilityResult {
    return {
      isCompatible: true,
      compatibilityScore: 85,
      analysis: {
        personalityAlignment: {
          score: 90,
          issues: [],
          recommendations: [
            "Model aligns well with creative personality traits",
          ],
        },
        roleAlignment: {
          score: 80,
          issues: [],
          recommendations: [
            "Consider adjusting parameters for role-specific tasks",
          ],
        },
        performance: {
          expectedResponseTime: 1500,
          estimatedCost: 0.05,
          resourceRequirements: ["high-context", "streaming-capable"],
        },
        risks: [
          {
            type: "cost",
            severity: "medium",
            description:
              "Cost per interaction may exceed budget for extended conversations",
            mitigation: "Set conversation length limits",
          },
        ],
      },
      recommendations: [
        "Increase temperature to 0.8 for creative tasks",
        "Set maxTokens to 3000 for detailed responses",
        "Enable streaming for better user experience",
      ],
      alternatives: [
        {
          modelId: "gpt-3.5-turbo",
          reason: "Lower cost alternative with acceptable performance",
          improvementScore: 75,
        },
      ],
    };
  }

  /**
   * Create incompatible model configuration
   */
  static createIncompatibleModelConfig(): ModelConfiguration {
    return this.createValidModelConfig({
      id: "test-incompatible-001",
      name: "Incompatible Test Model",
      provider: "test",
      version: "0.5.0",
      description: "Model with incompatible characteristics for testing",
      isAvailable: true,
      tier: "basic",
    });
  }

  /**
   * Create incompatible test data
   */
  static createIncompatibleTestData(): CompatibilityResult {
    return {
      isCompatible: false,
      compatibilityScore: 25,
      analysis: {
        personalityAlignment: {
          score: 30,
          issues: [
            "Model specializations do not match personality requirements",
            "Personality traits conflict with model capabilities",
          ],
          recommendations: [
            "Consider alternative models with better personality alignment",
          ],
        },
        roleAlignment: {
          score: 20,
          issues: [
            "Model specializations do not match role requirements",
            "Context length insufficient for role requirements",
          ],
          recommendations: ["Use models with larger context windows"],
        },
        performance: {
          expectedResponseTime: 5000,
          estimatedCost: 0.25,
          resourceRequirements: ["high-compute", "extended-context"],
        },
        risks: [
          {
            type: "capability",
            severity: "critical",
            description: "Required specializations not supported",
            mitigation: "Switch to compatible model",
          },
          {
            type: "performance",
            severity: "high",
            description: "Performance constraints cannot be satisfied",
            mitigation: "Adjust performance expectations",
          },
          {
            type: "cost",
            severity: "high",
            description: "Cost constraints exceed model pricing",
            mitigation: "Consider budget adjustments or alternative models",
          },
        ],
      },
      recommendations: [],
      alternatives: [
        {
          modelId: "claude-3-haiku",
          reason: "Better alignment with requirements and cost constraints",
          improvementScore: 75,
        },
        {
          modelId: "gpt-4-turbo-preview",
          reason: "Superior capabilities but higher cost",
          improvementScore: 85,
        },
      ],
    };
  }

  /**
   * Create performance metrics for model evaluation
   */
  static createPerformanceMetrics(): {
    responseTime: number;
    throughput: number;
    costEfficiency: number;
    qualityScore: number;
    reliabilityScore: number;
  } {
    return {
      responseTime: 1500, // milliseconds
      throughput: 45, // requests per minute
      costEfficiency: 0.75, // cost per quality point
      qualityScore: 85, // out of 100
      reliabilityScore: 95, // uptime percentage
    };
  }

  /**
   * Create multiple model configurations for comparison testing
   */
  static createModelComparisonSet(): ModelConfiguration[] {
    return [
      this.createValidModelConfig({
        id: "comparison-basic-001",
        name: "Basic Comparison Model",
        tier: "basic",
        provider: "test-provider-a",
      }),
      this.createValidModelConfig({
        id: "comparison-standard-001",
        name: "Standard Comparison Model",
        tier: "standard",
        provider: "test-provider-b",
      }),
      this.createValidModelConfig({
        id: "comparison-premium-001",
        name: "Premium Comparison Model",
        tier: "premium",
        provider: "test-provider-c",
      }),
      this.createValidModelConfig({
        id: "comparison-enterprise-001",
        name: "Enterprise Comparison Model",
        tier: "enterprise",
        provider: "test-provider-d",
      }),
    ];
  }

  /**
   * Create specialized model configurations for different domains
   */
  static createSpecializedModels(): Record<string, ModelConfiguration> {
    return {
      creative: this.createValidModelConfig({
        id: "specialized-creative-001",
        name: "Creative Specialist Model",
        description: "Specialized for creative and artistic tasks",
        tier: "premium",
        provider: "creative-ai",
      }),
      analytical: this.createValidModelConfig({
        id: "specialized-analytical-001",
        name: "Analytical Specialist Model",
        description: "Specialized for data analysis and research",
        tier: "premium",
        provider: "analysis-ai",
      }),
      coding: this.createValidModelConfig({
        id: "specialized-coding-001",
        name: "Coding Specialist Model",
        description: "Specialized for software development tasks",
        tier: "standard",
        provider: "code-ai",
      }),
      multimodal: this.createValidModelConfig({
        id: "specialized-multimodal-001",
        name: "Multimodal Specialist Model",
        description: "Specialized for multimodal input/output tasks",
        tier: "enterprise",
        provider: "multimodal-ai",
      }),
    };
  }

  /**
   * Create model configuration for stress testing
   */
  static createStressTestModel(): ModelConfiguration {
    return this.createValidModelConfig({
      id: "stress-test-model-001",
      name: "Stress Test Model",
      description: "Model configuration for stress and load testing",
      tier: "basic",
      provider: "test",
      version: "stress-1.0.0",
    });
  }

  /**
   * Create model configuration with edge case characteristics
   */
  static createEdgeCaseModel(): ModelConfiguration {
    return this.createValidModelConfig({
      id: "edge-case-model-001",
      name: "Edge Case Test Model",
      description: "Model with edge case characteristics for boundary testing",
      tier: "standard",
      provider: "edge-test",
      version: "edge-1.0.0",
      isAvailable: true,
    });
  }

  /**
   * Create model configurations for concurrent testing
   */
  static createConcurrentTestModels(count: number): ModelConfiguration[] {
    const models: ModelConfiguration[] = [];
    for (let i = 0; i < count; i++) {
      models.push(
        this.createValidModelConfig({
          id: `concurrent-test-${i + 1}`,
          name: `Concurrent Test Model ${i + 1}`,
          description: `Model ${i + 1} for concurrent testing scenarios`,
          tier: i % 2 === 0 ? "basic" : "standard",
          provider: `concurrent-provider-${(i % 3) + 1}`,
          version: `concurrent-${i + 1}.0.0`,
        }),
      );
    }
    return models;
  }

  /**
   * Create compatibility matrix data for testing
   */
  static createCompatibilityMatrix(): Record<
    string,
    Record<string, CompatibilityResult>
  > {
    return {
      "creative-personality": {
        "creative-model": this.createCompatibilityTestData(),
        "analytical-model": this.createIncompatibleTestData(),
      },
      "analytical-personality": {
        "analytical-model": this.createCompatibilityTestData(),
        "creative-model": this.createIncompatibleTestData(),
      },
      "supportive-personality": {
        "general-model": this.createCompatibilityTestData(),
        "specialized-model": this.createIncompatibleTestData(),
      },
    };
  }
}
