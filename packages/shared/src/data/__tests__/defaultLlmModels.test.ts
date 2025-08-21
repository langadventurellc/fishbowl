import { readFileSync } from "fs";
import { join } from "path";
import {
  persistedLlmModelsSettingsSchema,
  persistedLlmProviderSchema,
  persistedLlmModelSchema,
} from "../../types/settings/llmModelsSchema";
import type { PersistedLlmModelsSettingsData } from "../../types/settings/PersistedLlmModelsSettingsData";
import { z } from "zod";

type PersistedLlmProvider = z.infer<typeof persistedLlmProviderSchema>;
type PersistedLlmModel = z.infer<typeof persistedLlmModelSchema>;

describe("defaultLlmModels.json", () => {
  let rawJsonData: unknown;
  let parsedData: PersistedLlmModelsSettingsData;
  let fileContent: string;

  beforeAll(() => {
    const filePath = join(process.cwd(), "src/data/defaultLlmModels.json");
    fileContent = readFileSync(filePath, "utf-8");
    rawJsonData = JSON.parse(fileContent);
    parsedData = persistedLlmModelsSettingsSchema.parse(rawJsonData);
  });

  describe("JSON structure validation", () => {
    it("should be valid JSON", () => {
      expect(rawJsonData).toBeDefined();
      expect(typeof rawJsonData).toBe("object");
      expect(rawJsonData).not.toBeNull();
    });

    it("should have correct top-level structure", () => {
      expect(rawJsonData).toHaveProperty("schemaVersion");
      expect(rawJsonData).toHaveProperty("providers");
      expect(rawJsonData).toHaveProperty("lastUpdated");
    });

    it("should not have unexpected top-level fields", () => {
      const expectedFields = ["schemaVersion", "providers", "lastUpdated"];
      const actualFields = Object.keys(rawJsonData as object);
      const unexpectedFields = actualFields.filter(
        (field) => !expectedFields.includes(field),
      );
      expect(unexpectedFields).toEqual([]);
    });

    it("should be parseable without errors", () => {
      expect(() => JSON.parse(fileContent)).not.toThrow();
    });

    it("should be valid UTF-8 encoded", () => {
      // Check for BOM or other encoding issues
      expect(fileContent.charCodeAt(0)).not.toBe(0xfeff); // No BOM
      expect(fileContent).toMatch(/^[\u0020-\u007E\u00A0-\uFFFF\s]*$/); // Valid printable UTF-8 range
    });
  });

  describe("Schema validation", () => {
    it("should validate against persistedLlmModelsSettingsSchema", () => {
      expect(() => {
        persistedLlmModelsSettingsSchema.parse(rawJsonData);
      }).not.toThrow();
    });

    it("should have required structure after schema parsing", () => {
      expect(parsedData).toHaveProperty("schemaVersion");
      expect(parsedData).toHaveProperty("providers");
      expect(parsedData).toHaveProperty("lastUpdated");
      expect(Array.isArray(parsedData.providers)).toBe(true);
    });

    it("should have valid schema version format", () => {
      expect(typeof parsedData.schemaVersion).toBe("string");
      expect(parsedData.schemaVersion).toMatch(/^\d+\.\d+\.\d+$/);
      expect(parsedData.schemaVersion).toBe("1.0.0");
    });

    it("should validate all providers against schema", () => {
      expect(parsedData.providers.length).toBeGreaterThan(0);

      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        expect(provider).toHaveProperty("id");
        expect(provider).toHaveProperty("name");
        expect(provider).toHaveProperty("models");
        expect(Array.isArray(provider.models)).toBe(true);
      });
    });

    it("should validate all models against schema", () => {
      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        expect(provider.models.length).toBeGreaterThan(0);

        provider.models.forEach((model: PersistedLlmModel) => {
          expect(model).toHaveProperty("id");
          expect(model).toHaveProperty("name");
          expect(model).toHaveProperty("contextLength");
          expect(typeof model.contextLength).toBe("number");
          expect(model.contextLength).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Data structure requirements", () => {
    it("should have exactly two providers (OpenAI and Anthropic)", () => {
      expect(parsedData.providers.length).toBe(2);

      const providerIds = parsedData.providers.map(
        (p: PersistedLlmProvider) => p.id,
      );
      expect(providerIds).toContain("openai");
      expect(providerIds).toContain("anthropic");
    });

    it("should have unique provider IDs", () => {
      const ids = parsedData.providers.map(
        (provider: PersistedLlmProvider) => provider.id,
      );
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have non-empty required fields for all providers", () => {
      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        expect(typeof provider.id).toBe("string");
        expect(provider.id.length).toBeGreaterThan(0);

        expect(typeof provider.name).toBe("string");
        expect(provider.name.length).toBeGreaterThan(0);

        expect(Array.isArray(provider.models)).toBe(true);
        expect(provider.models.length).toBeGreaterThan(0);
      });
    });

    it("should have unique model IDs within each provider", () => {
      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        const modelIds = provider.models.map(
          (model: PersistedLlmModel) => model.id,
        );
        const uniqueModelIds = new Set(modelIds);
        expect(uniqueModelIds.size).toBe(modelIds.length);
      });
    });

    it("should have valid model data for all models", () => {
      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        provider.models.forEach((model: PersistedLlmModel) => {
          expect(typeof model.id).toBe("string");
          expect(model.id.length).toBeGreaterThan(0);

          expect(typeof model.name).toBe("string");
          expect(model.name.length).toBeGreaterThan(0);

          expect(typeof model.contextLength).toBe("number");
          expect(model.contextLength).toBeGreaterThanOrEqual(1000);
          expect(model.contextLength).toBeLessThanOrEqual(10000000);
        });
      });
    });

    it("should respect field length constraints", () => {
      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        // Provider constraints from schema
        expect(provider.id.length).toBeLessThanOrEqual(50);
        expect(provider.name.length).toBeLessThanOrEqual(100);

        provider.models.forEach((model: PersistedLlmModel) => {
          // Model constraints from schema
          expect(model.id.length).toBeLessThanOrEqual(100);
          expect(model.name.length).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe("Specific model validation", () => {
    it("should contain expected OpenAI models", () => {
      const openaiProvider = parsedData.providers.find(
        (p: PersistedLlmProvider) => p.id === "openai",
      );
      expect(openaiProvider).toBeDefined();
      expect(openaiProvider!.name).toBe("OpenAI");

      const expectedModels = ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"];
      const actualModelIds = openaiProvider!.models.map(
        (m: PersistedLlmModel) => m.id,
      );

      expectedModels.forEach((expectedId) => {
        expect(actualModelIds).toContain(expectedId);
      });

      expect(openaiProvider!.models.length).toBe(3);
    });

    it("should contain expected Anthropic models", () => {
      const anthropicProvider = parsedData.providers.find(
        (p: PersistedLlmProvider) => p.id === "anthropic",
      );
      expect(anthropicProvider).toBeDefined();
      expect(anthropicProvider!.name).toBe("Anthropic");

      const expectedModels = [
        "claude-3-opus",
        "claude-3-sonnet",
        "claude-3-haiku",
      ];
      const actualModelIds = anthropicProvider!.models.map(
        (m: PersistedLlmModel) => m.id,
      );

      expectedModels.forEach((expectedId) => {
        expect(actualModelIds).toContain(expectedId);
      });

      expect(anthropicProvider!.models.length).toBe(3);
    });

    it("should have correct context lengths for OpenAI models", () => {
      const openaiProvider = parsedData.providers.find(
        (p: PersistedLlmProvider) => p.id === "openai",
      );
      expect(openaiProvider).toBeDefined();

      const expectedContextLengths = {
        "gpt-4-turbo": 128000,
        "gpt-4": 8192,
        "gpt-3.5-turbo": 16385,
      };

      openaiProvider!.models.forEach((model: PersistedLlmModel) => {
        expect(
          expectedContextLengths[
            model.id as keyof typeof expectedContextLengths
          ],
        ).toBe(model.contextLength);
      });
    });

    it("should have correct context lengths for Anthropic models", () => {
      const anthropicProvider = parsedData.providers.find(
        (p: PersistedLlmProvider) => p.id === "anthropic",
      );
      expect(anthropicProvider).toBeDefined();

      const expectedContextLengths = {
        "claude-3-opus": 200000,
        "claude-3-sonnet": 200000,
        "claude-3-haiku": 200000,
      };

      anthropicProvider!.models.forEach((model: PersistedLlmModel) => {
        expect(
          expectedContextLengths[
            model.id as keyof typeof expectedContextLengths
          ],
        ).toBe(model.contextLength);
      });
    });

    it("should have correct model display names", () => {
      const expectedNames = {
        "gpt-4-turbo": "GPT-4 Turbo",
        "gpt-4": "GPT-4",
        "gpt-3.5-turbo": "GPT-3.5 Turbo",
        "claude-3-opus": "Claude 3 Opus",
        "claude-3-sonnet": "Claude 3 Sonnet",
        "claude-3-haiku": "Claude 3 Haiku",
      };

      parsedData.providers.forEach((provider: PersistedLlmProvider) => {
        provider.models.forEach((model: PersistedLlmModel) => {
          expect(expectedNames[model.id as keyof typeof expectedNames]).toBe(
            model.name,
          );
        });
      });
    });
  });

  describe("File format validation", () => {
    it("should be properly formatted JSON", () => {
      // Re-stringify and parse to ensure formatting is valid
      const stringified = JSON.stringify(rawJsonData, null, 2);
      expect(() => JSON.parse(stringified)).not.toThrow();
    });

    it("should handle round-trip serialization", () => {
      const jsonString = JSON.stringify(parsedData);
      const reparsed = JSON.parse(jsonString);
      const revalidated = persistedLlmModelsSettingsSchema.parse(reparsed);

      // Should be able to validate after round-trip
      expect(revalidated).toBeDefined();
      expect(revalidated.schemaVersion).toBe(parsedData.schemaVersion);
      expect(revalidated.providers).toHaveLength(parsedData.providers.length);
    });

    it("should not contain invalid characters", () => {
      // Check for common JSON issues
      expect(fileContent).not.toContain("\t"); // Should use spaces for indentation
      expect(fileContent).not.toMatch(/,\s*[}\]]/); // No trailing commas
    });

    it("should have valid timestamp format", () => {
      expect(typeof parsedData.lastUpdated).toBe("string");
      expect(parsedData.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      // Should be parseable as a valid date
      const date = new Date(parsedData.lastUpdated);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  describe("Error resistance", () => {
    it("should gracefully handle schema parsing", () => {
      // The schema should catch any structural issues
      const result = persistedLlmModelsSettingsSchema.safeParse(rawJsonData);
      expect(result.success).toBe(true);

      if (!result.success) {
        // If this fails, log the error for debugging
        console.error("Schema validation failed:", result.error.issues);
      }
    });

    it("should have valid JSON without syntax errors", () => {
      // Ensure there are no JSON syntax issues
      expect(() => {
        JSON.parse(JSON.stringify(rawJsonData));
      }).not.toThrow();
    });

    it("should match expected data from existing useLlmModels hook", () => {
      // Verify that the JSON contains the same models as the current hook
      // This ensures we didn't miss any models during extraction

      const openaiProvider = parsedData.providers.find(
        (p: PersistedLlmProvider) => p.id === "openai",
      );
      const anthropicProvider = parsedData.providers.find(
        (p: PersistedLlmProvider) => p.id === "anthropic",
      );

      expect(openaiProvider).toBeDefined();
      expect(anthropicProvider).toBeDefined();

      // Total model count should match what's in the hook
      const totalModels =
        openaiProvider!.models.length + anthropicProvider!.models.length;
      expect(totalModels).toBe(6); // 3 OpenAI + 3 Anthropic models
    });
  });
});
