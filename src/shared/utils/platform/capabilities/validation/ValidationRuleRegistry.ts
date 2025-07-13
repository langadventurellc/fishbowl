import type { ValidationRule } from './ValidationRule';
import type { ValidationRuleRegistryConfig } from './ValidationRuleRegistryConfig';
import type { ValidationRuleRegistryStats } from './ValidationRuleRegistryStats';
import { ValidationStage } from './ValidationStage';

/**
 * Registry for managing capability validation rules
 *
 * The ValidationRuleRegistry provides centralized management of validation rules,
 * allowing registration, retrieval, and organization of rules by capability type,
 * platform, and validation stage.
 */
export class ValidationRuleRegistry {
  private readonly rules = new Map<string, ValidationRule>();
  private readonly rulesByStage = new Map<ValidationStage, ValidationRule[]>();
  private readonly rulesByCapability = new Map<string, ValidationRule[]>();
  private readonly rulesByPlatform = new Map<string, ValidationRule[]>();
  private readonly config: ValidationRuleRegistryConfig;

  /**
   * Creates a new validation rule registry
   *
   * @param config - Configuration for the registry
   */
  constructor(config: Partial<ValidationRuleRegistryConfig> = {}) {
    this.config = {
      allowDuplicates: false,
      maxRulesPerCapability: 50,
      validateOnRegister: true,
      defaultPriority: 100,
      ...config,
    };

    // Initialize stage maps
    Object.values(ValidationStage).forEach(stage => {
      this.rulesByStage.set(stage, []);
    });
  }

  /**
   * Registers a validation rule
   *
   * @param rule - The validation rule to register
   * @throws Error if rule registration fails validation
   */
  registerRule(rule: ValidationRule): void {
    if (this.config.validateOnRegister) {
      this.validateRule(rule);
    }

    // Check for duplicates
    if (!this.config.allowDuplicates && this.rules.has(rule.id)) {
      throw new Error(`Validation rule with ID '${rule.id}' already exists`);
    }

    // Check capability limits
    for (const capabilityId of rule.applicableCapabilities) {
      const existing = this.rulesByCapability.get(capabilityId) ?? [];
      if (existing.length >= this.config.maxRulesPerCapability) {
        throw new Error(
          `Maximum rules per capability exceeded for '${capabilityId}' (${this.config.maxRulesPerCapability})`,
        );
      }
    }

    // Register the rule
    this.rules.set(rule.id, rule);

    // Index by stage
    const stageRules = this.rulesByStage.get(rule.stage) ?? [];
    stageRules.push(rule);
    stageRules.sort((a, b) => b.priority - a.priority); // Higher priority first
    this.rulesByStage.set(rule.stage, stageRules);

    // Index by capability
    for (const capabilityId of rule.applicableCapabilities) {
      const capabilityRules = this.rulesByCapability.get(capabilityId) ?? [];
      capabilityRules.push(rule);
      capabilityRules.sort((a, b) => b.priority - a.priority);
      this.rulesByCapability.set(capabilityId, capabilityRules);
    }

    // Index by platform
    for (const platform of rule.applicablePlatforms) {
      const platformRules = this.rulesByPlatform.get(platform) ?? [];
      platformRules.push(rule);
      platformRules.sort((a, b) => b.priority - a.priority);
      this.rulesByPlatform.set(platform, platformRules);
    }
  }

  /**
   * Unregisters a validation rule
   *
   * @param ruleId - The ID of the rule to unregister
   * @returns True if rule was found and removed
   */
  unregisterRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    // Remove from main registry
    this.rules.delete(ruleId);

    // Remove from stage index
    const stageRules = this.rulesByStage.get(rule.stage) ?? [];
    const stageIndex = stageRules.findIndex(r => r.id === ruleId);
    if (stageIndex >= 0) {
      stageRules.splice(stageIndex, 1);
    }

    // Remove from capability indices
    for (const capabilityId of rule.applicableCapabilities) {
      const capabilityRules = this.rulesByCapability.get(capabilityId) ?? [];
      const capabilityIndex = capabilityRules.findIndex(r => r.id === ruleId);
      if (capabilityIndex >= 0) {
        capabilityRules.splice(capabilityIndex, 1);
      }
    }

    // Remove from platform indices
    for (const platform of rule.applicablePlatforms) {
      const platformRules = this.rulesByPlatform.get(platform) ?? [];
      const platformIndex = platformRules.findIndex(r => r.id === ruleId);
      if (platformIndex >= 0) {
        platformRules.splice(platformIndex, 1);
      }
    }

    return true;
  }

  /**
   * Gets rules applicable for a specific validation stage
   *
   * @param stage - The validation stage
   * @param capabilityId - Optional capability ID to filter by
   * @param platformType - Optional platform type to filter by
   * @returns Array of applicable rules sorted by priority
   */
  getRulesForStage(
    stage: ValidationStage,
    capabilityId?: string,
    platformType?: string,
  ): ValidationRule[] {
    let rules = this.rulesByStage.get(stage) ?? [];

    // Filter by capability if specified
    if (capabilityId) {
      rules = rules.filter(
        rule =>
          rule.applicableCapabilities.length === 0 ||
          rule.applicableCapabilities.includes(capabilityId),
      );
    }

    // Filter by platform if specified
    if (platformType) {
      rules = rules.filter(
        rule =>
          rule.applicablePlatforms.length === 0 || rule.applicablePlatforms.includes(platformType),
      );
    }

    // Filter by applicability
    return rules.filter(rule => rule.isApplicable(capabilityId ?? '', platformType));
  }

  /**
   * Gets all rules applicable for a specific capability
   *
   * @param capabilityId - The capability ID
   * @param platformType - Optional platform type to filter by
   * @returns Array of applicable rules organized by stage
   */
  getRulesForCapability(
    capabilityId: string,
    platformType?: string,
  ): Record<ValidationStage, ValidationRule[]> {
    const result: Record<ValidationStage, ValidationRule[]> = {
      [ValidationStage.PRE_DETECTION]: [],
      [ValidationStage.DURING_DETECTION]: [],
      [ValidationStage.POST_DETECTION]: [],
    };

    for (const stage of Object.values(ValidationStage)) {
      result[stage] = this.getRulesForStage(stage, capabilityId, platformType);
    }

    return result;
  }

  /**
   * Gets a specific rule by ID
   *
   * @param ruleId - The rule ID
   * @returns The validation rule or undefined if not found
   */
  getRule(ruleId: string): ValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Gets all registered rule IDs
   *
   * @returns Array of rule IDs
   */
  getAllRuleIds(): string[] {
    return Array.from(this.rules.keys());
  }

  /**
   * Gets registry statistics
   *
   * @returns Statistics about registered rules
   */
  getStats(): ValidationRuleRegistryStats {
    const allRules = Array.from(this.rules.values());

    const rulesByStage: Record<ValidationStage, number> = {
      [ValidationStage.PRE_DETECTION]: 0,
      [ValidationStage.DURING_DETECTION]: 0,
      [ValidationStage.POST_DETECTION]: 0,
    };

    const rulesByCapability: Record<string, number> = {};
    const rulesByPlatform: Record<string, number> = {};
    let totalPriority = 0;
    let highestPriority = Number.MIN_SAFE_INTEGER;
    let lowestPriority = Number.MAX_SAFE_INTEGER;

    for (const rule of allRules) {
      // Count by stage
      rulesByStage[rule.stage]++;

      // Count by capability
      for (const capabilityId of rule.applicableCapabilities) {
        rulesByCapability[capabilityId] = (rulesByCapability[capabilityId] ?? 0) + 1;
      }

      // Count by platform
      for (const platform of rule.applicablePlatforms) {
        rulesByPlatform[platform] = (rulesByPlatform[platform] ?? 0) + 1;
      }

      // Track priority stats
      totalPriority += rule.priority;
      highestPriority = Math.max(highestPriority, rule.priority);
      lowestPriority = Math.min(lowestPriority, rule.priority);
    }

    return {
      totalRules: allRules.length,
      rulesByStage,
      rulesByCapability,
      rulesByPlatform,
      highestPriority: allRules.length > 0 ? highestPriority : 0,
      lowestPriority: allRules.length > 0 ? lowestPriority : 0,
      averagePriority: allRules.length > 0 ? totalPriority / allRules.length : 0,
    };
  }

  /**
   * Clears all registered rules
   */
  clear(): void {
    this.rules.clear();
    this.rulesByStage.clear();
    this.rulesByCapability.clear();
    this.rulesByPlatform.clear();

    // Reinitialize stage maps
    Object.values(ValidationStage).forEach(stage => {
      this.rulesByStage.set(stage, []);
    });
  }

  /**
   * Validates a rule before registration
   *
   * @param rule - The rule to validate
   * @throws Error if rule is invalid
   */
  private validateRule(rule: ValidationRule): void {
    if (!rule.id || typeof rule.id !== 'string') {
      throw new Error('Validation rule must have a non-empty string ID');
    }

    if (!rule.name || typeof rule.name !== 'string') {
      throw new Error('Validation rule must have a non-empty string name');
    }

    if (!Object.values(ValidationStage).includes(rule.stage)) {
      throw new Error(`Invalid validation stage: ${rule.stage}`);
    }

    if (typeof rule.priority !== 'number' || rule.priority < 0) {
      throw new Error('Validation rule priority must be a non-negative number');
    }

    if (!Array.isArray(rule.applicableCapabilities)) {
      throw new Error('Validation rule applicableCapabilities must be an array');
    }

    if (!Array.isArray(rule.applicablePlatforms)) {
      throw new Error('Validation rule applicablePlatforms must be an array');
    }

    if (typeof rule.validate !== 'function') {
      throw new Error('Validation rule must have a validate function');
    }

    if (typeof rule.isApplicable !== 'function') {
      throw new Error('Validation rule must have an isApplicable function');
    }
  }
}
