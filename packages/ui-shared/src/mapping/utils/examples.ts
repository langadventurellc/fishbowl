/**
 * Practical examples demonstrating the mapping utilities in real-world scenarios.
 * These examples show how to use the utilities for settings mapping, error handling,
 * and utility composition patterns.
 */

import {
  applyDefaults,
  convertTimeUnit,
  normalizeEnum,
  createMappingError,
  wrapMapper,
  validateAndMap,
  mergeDeep,
  pickFields,
  isSuccess,
  isError,
  type TimeUnit,
} from "./index";

// =============================================================================
// Example Types (simulating settings structures)
// =============================================================================

interface GeneralSettingsUI {
  responseDelay: number; // in seconds
  maximumMessages: number;
  maximumWaitTime: number; // in seconds
  defaultMode: "manual" | "auto";
  maximumAgents: number;
  checkForUpdates: boolean;
}

interface GeneralSettingsPersistence {
  responseDelay: number; // in milliseconds
  maximumMessages: number;
  maximumWaitTime: number; // in milliseconds
  defaultMode: "manual" | "auto";
  maximumAgents: number;
  checkForUpdates: boolean;
}

interface AppearanceSettingsUI {
  theme: "light" | "dark" | "system";
  showTimestamps: "always" | "hover" | "never";
  showActivityTime: boolean;
  compactList: boolean;
  fontSize: number;
  messageSpacing: "compact" | "normal" | "relaxed";
}

// =============================================================================
// Helper Functions for Examples
// =============================================================================

function demonstrateCompleteMapping() {
  console.log("1. Complete Settings Mapping Workflow");

  const defaultGeneralSettings: GeneralSettingsUI = {
    responseDelay: 1,
    maximumMessages: 50,
    maximumWaitTime: 30,
    defaultMode: "manual",
    maximumAgents: 5,
    checkForUpdates: true,
  };

  const userInput: Partial<GeneralSettingsUI> = {
    responseDelay: 2,
    defaultMode: "auto",
  };

  const withDefaults = applyDefaults(
    userInput as unknown as Partial<Record<string, unknown>>,
    defaultGeneralSettings as unknown as Record<string, unknown>,
  ) as unknown as GeneralSettingsUI;
  const mappedToPersistence: GeneralSettingsPersistence = {
    responseDelay: convertTimeUnit(withDefaults.responseDelay, "s", "ms"),
    maximumMessages: withDefaults.maximumMessages,
    maximumWaitTime: convertTimeUnit(withDefaults.maximumWaitTime, "s", "ms"),
    defaultMode: normalizeEnum(
      withDefaults.defaultMode,
      ["manual", "auto"] as const,
      "manual",
    ),
    maximumAgents: withDefaults.maximumAgents,
    checkForUpdates: withDefaults.checkForUpdates,
  };

  console.log("   Input:", userInput);
  console.log("   With defaults:", withDefaults);
  console.log("   Mapped to persistence:", mappedToPersistence);

  return mappedToPersistence;
}

function demonstrateErrorHandling() {
  console.log("\n2. Error Handling Workflows");

  const riskyMapper = (input: { value: number }) => {
    if (input.value < 0) {
      throw createMappingError(
        "Value cannot be negative",
        "value",
        input.value,
      );
    }
    return { processedValue: input.value * 2 };
  };

  const safeMapper = wrapMapper(riskyMapper);
  const validResult = safeMapper({ value: 5 });
  const invalidResult = safeMapper({ value: -3 });

  console.log("   Valid result:", validResult);
  console.log("   Invalid result:", invalidResult);

  if (isSuccess(validResult)) {
    console.log("   Success data:", validResult.data);
  }

  if (isError(invalidResult)) {
    console.log("   Error details:", {
      message: invalidResult.error.message,
      field: invalidResult.error.field,
      value: invalidResult.error.value,
    });
  }

  return { validResult, invalidResult };
}

function demonstrateValidation() {
  console.log("\n3. Validation Combined with Mapping");

  const isValidGeneralSettings = (
    input: unknown,
  ): input is GeneralSettingsUI => {
    if (typeof input !== "object" || input === null) return false;
    const obj = input as Record<string, unknown>;
    return (
      typeof obj.responseDelay === "number" &&
      typeof obj.maximumMessages === "number" &&
      typeof obj.defaultMode === "string"
    );
  };

  const uiToPersistenceMapper = (
    ui: GeneralSettingsUI,
  ): GeneralSettingsPersistence => ({
    ...ui,
    responseDelay: convertTimeUnit(ui.responseDelay, "s", "ms"),
    maximumWaitTime: convertTimeUnit(ui.maximumWaitTime, "s", "ms"),
  });

  const validateAndMapSettings = validateAndMap(
    isValidGeneralSettings,
    uiToPersistenceMapper,
  );

  const validData = {
    responseDelay: 2,
    maximumMessages: 100,
    maximumWaitTime: 60,
    defaultMode: "auto",
    maximumAgents: 3,
    checkForUpdates: false,
  };

  const invalidData = { invalidField: "wrong" };
  const validationResult = validateAndMapSettings(validData);
  const invalidValidationResult = validateAndMapSettings(invalidData);

  console.log("   Valid validation result:", validationResult);
  console.log("   Invalid validation result:", invalidValidationResult);

  return { validationResult, invalidValidationResult };
}

function demonstrateComposition() {
  console.log("\n4. Utility Composition for Complex Transformations");

  const rawUserInput: Record<string, unknown> = {
    theme: "dark",
    showTimestamps: "hover",
    fontSize: "14",
    messageSpacing: "unknown-value",
    compactList: 1,
  };

  const defaultAppearanceSettings: AppearanceSettingsUI = {
    theme: "system",
    showTimestamps: "never",
    showActivityTime: true,
    compactList: false,
    fontSize: 12,
    messageSpacing: "normal",
  };

  const transformAppearanceSettings = (
    input: Record<string, unknown>,
  ): AppearanceSettingsUI => {
    const relevantFields = pickFields(input, [
      "theme",
      "showTimestamps",
      "showActivityTime",
      "compactList",
      "fontSize",
      "messageSpacing",
    ]);

    const normalized = {
      theme: normalizeEnum(
        relevantFields.theme,
        ["light", "dark", "system"] as const,
        "system",
      ),
      showTimestamps: normalizeEnum(
        relevantFields.showTimestamps,
        ["always", "hover", "never"] as const,
        "never",
      ),
      showActivityTime:
        typeof relevantFields.showActivityTime === "boolean"
          ? relevantFields.showActivityTime
          : true,
      compactList: Boolean(relevantFields.compactList),
      fontSize:
        typeof relevantFields.fontSize === "string"
          ? parseInt(relevantFields.fontSize, 10) || 12
          : typeof relevantFields.fontSize === "number"
            ? relevantFields.fontSize
            : 12,
      messageSpacing: normalizeEnum(
        relevantFields.messageSpacing,
        ["compact", "normal", "relaxed"] as const,
        "normal",
      ),
    };

    return applyDefaults(
      normalized as unknown as Partial<Record<string, unknown>>,
      defaultAppearanceSettings as unknown as Record<string, unknown>,
    ) as unknown as AppearanceSettingsUI;
  };

  const safeTransform = wrapMapper(transformAppearanceSettings);
  const compositionResult = safeTransform(rawUserInput);

  console.log("   Raw input:", rawUserInput);
  console.log("   Transformed result:", compositionResult);

  return compositionResult;
}

function demonstrateTypeConversion() {
  console.log("\n5. Type-Safe Generic Transformations");

  const createTimeConverter = <T extends Record<string, unknown>>(
    fields: (keyof T)[],
    fromUnit: TimeUnit,
    toUnit: TimeUnit,
  ) => {
    return (input: T): T => {
      const result = { ...input };
      for (const field of fields) {
        if (typeof result[field] === "number") {
          (result as Record<string, unknown>)[field as string] =
            convertTimeUnit(result[field] as number, fromUnit, toUnit);
        }
      }
      return result;
    };
  };

  const uiToPersistenceTimeConverter = createTimeConverter<
    Record<string, unknown>
  >(["responseDelay", "maximumWaitTime"], "s", "ms");

  const uiSettings: GeneralSettingsUI = {
    responseDelay: 2,
    maximumMessages: 50,
    maximumWaitTime: 30,
    defaultMode: "auto",
    maximumAgents: 5,
    checkForUpdates: true,
  };

  const persistenceSettings = uiToPersistenceTimeConverter(
    uiSettings as unknown as Record<string, unknown>,
  ) as unknown as GeneralSettingsUI;
  console.log("   UI settings:", uiSettings);
  console.log("   Persistence settings:", persistenceSettings);

  return persistenceSettings;
}

function demonstrateDeepMerge() {
  console.log("\n6. Deep Merging for Configuration");

  const baseConfig = {
    general: { responseDelay: 1000, maximumMessages: 50 },
    appearance: { theme: "system", fontSize: 12 },
    advanced: { debugLogging: false },
  };

  const userOverrides = {
    general: { responseDelay: 2000 },
    appearance: { theme: "dark" },
  };

  const systemDefaults = {
    general: { maximumWaitTime: 30000 },
    advanced: { experimentalFeatures: false },
  };

  const finalConfig = mergeDeep(baseConfig, systemDefaults, userOverrides);

  console.log("   Final merged config:", finalConfig);
  return finalConfig;
}

/**
 * Comprehensive examples demonstrating all mapping utilities in practical scenarios.
 * This function runs through various real-world use cases showing how to:
 * - Apply defaults and transform values
 * - Handle errors gracefully
 * - Compose utilities for complex operations
 * - Work with type-safe transformations
 */
export function runMappingUtilityExamples() {
  console.log("=== Mapping Utilities Examples ===\n");

  const completeMapping = demonstrateCompleteMapping();
  const errorHandling = demonstrateErrorHandling();
  const validation = demonstrateValidation();
  const composition = demonstrateComposition();
  const typeConversion = demonstrateTypeConversion();
  const deepMerge = demonstrateDeepMerge();

  console.log("\n=== All examples completed successfully! ===");

  return {
    completeMapping,
    errorHandling,
    validation,
    composition,
    typeConversion,
    deepMerge,
  };
}
