import { z } from "zod";
import {
  persistedLlmModelSchema,
  persistedLlmProviderSchema,
  persistedLlmModelsSettingsSchema,
  LLM_MODELS_SCHEMA_VERSION,
  CURRENT_LLM_MODELS_SCHEMA_VERSION,
} from "../llmModelsSchema";

describe("persistedLlmModelSchema", () => {
  describe("valid data validation", () => {
    it("should accept complete valid model object", () => {
      const validModel = {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        contextLength: 128000,
      };

      const result = persistedLlmModelSchema.parse(validModel);
      expect(result).toEqual(validModel);
    });

    it("should accept model with minimum values", () => {
      const minModel = {
        id: "m",
        name: "M",
        contextLength: 1000,
      };

      const result = persistedLlmModelSchema.parse(minModel);
      expect(result).toEqual(minModel);
    });

    it("should accept model with maximum values", () => {
      const maxModel = {
        id: "a".repeat(100),
        name: "A".repeat(100),
        contextLength: 10000000,
      };

      const result = persistedLlmModelSchema.parse(maxModel);
      expect(result).toEqual(maxModel);
    });

    it("should accept model with Unicode characters", () => {
      const unicodeModel = {
        id: "claude-3-opus-français",
        name: "Claude 3 Opus (Français) 🇫🇷",
        contextLength: 200000,
      };

      const result = persistedLlmModelSchema.parse(unicodeModel);
      expect(result.name).toBe("Claude 3 Opus (Français) 🇫🇷");
    });

    it("should accept model with complex naming", () => {
      const complexModel = {
        id: "gpt-4-turbo-2024-04-09",
        name: "GPT-4 Turbo (April 9, 2024)",
        contextLength: 128000,
      };

      const result = persistedLlmModelSchema.parse(complexModel);
      expect(result).toEqual(complexModel);
    });
  });

  describe("field validation", () => {
    describe("id field", () => {
      it("should reject empty id", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "",
            name: "Test Model",
            contextLength: 8000,
          });
        }).toThrow("Model ID cannot be empty");
      });

      it("should reject id exceeding 100 characters", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "a".repeat(101),
            name: "Test Model",
            contextLength: 8000,
          });
        }).toThrow("Model ID cannot exceed 100 characters");
      });

      it("should reject non-string id", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: 123,
            name: "Test Model",
            contextLength: 8000,
          });
        }).toThrow("Model ID must be a string");
      });

      it("should reject null id", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: null,
            name: "Test Model",
            contextLength: 8000,
          });
        }).toThrow("Model ID must be a string");
      });

      it("should reject undefined id", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            name: "Test Model",
            contextLength: 8000,
          });
        }).toThrow("Model ID must be a string");
      });
    });

    describe("name field", () => {
      it("should reject empty name", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "",
            contextLength: 8000,
          });
        }).toThrow("Model name is required");
      });

      it("should reject name exceeding 100 characters", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "A".repeat(101),
            contextLength: 8000,
          });
        }).toThrow("Model name cannot exceed 100 characters");
      });

      it("should reject non-string name", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: 123,
            contextLength: 8000,
          });
        }).toThrow("Model name must be a string");
      });

      it("should reject null name", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: null,
            contextLength: 8000,
          });
        }).toThrow("Model name must be a string");
      });

      it("should reject undefined name", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            contextLength: 8000,
          });
        }).toThrow("Model name must be a string");
      });
    });

    describe("contextLength field", () => {
      it("should reject context length below 1000", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "Test Model",
            contextLength: 999,
          });
        }).toThrow("Context length must be at least 1,000 tokens");
      });

      it("should reject context length above 10,000,000", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "Test Model",
            contextLength: 10000001,
          });
        }).toThrow("Context length cannot exceed 10,000,000 tokens");
      });

      it("should reject non-integer context length", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "Test Model",
            contextLength: 8000.5,
          });
        }).toThrow("Context length must be an integer");
      });

      it("should reject non-numeric context length", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "Test Model",
            contextLength: "8000",
          });
        }).toThrow("Context length must be a number");
      });

      it("should reject null context length", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "Test Model",
            contextLength: null,
          });
        }).toThrow("Context length must be a number");
      });

      it("should reject undefined context length", () => {
        expect(() => {
          persistedLlmModelSchema.parse({
            id: "test-model",
            name: "Test Model",
          });
        }).toThrow("Context length must be a number");
      });
    });
  });

  describe("passthrough functionality", () => {
    it("should allow unknown fields for schema evolution", () => {
      const modelWithExtraFields = {
        id: "test-model",
        name: "Test Model",
        contextLength: 8000,
        extraField: "should be preserved",
        futureFeature: true,
      };

      const result = persistedLlmModelSchema.parse(modelWithExtraFields);
      expect(result.extraField).toBe("should be preserved");
      expect(result.futureFeature).toBe(true);
    });
  });
});

describe("persistedLlmProviderSchema", () => {
  describe("valid data validation", () => {
    it("should accept complete valid provider object", () => {
      const validProvider = {
        id: "openai",
        name: "OpenAI",
        models: [
          {
            id: "gpt-4-turbo",
            name: "GPT-4 Turbo",
            contextLength: 128000,
          },
          {
            id: "gpt-4",
            name: "GPT-4",
            contextLength: 8000,
          },
        ],
      };

      const result = persistedLlmProviderSchema.parse(validProvider);
      expect(result).toEqual(validProvider);
    });

    it("should accept provider with single model", () => {
      const singleModelProvider = {
        id: "anthropic",
        name: "Anthropic",
        models: [
          {
            id: "claude-3-opus",
            name: "Claude 3 Opus",
            contextLength: 200000,
          },
        ],
      };

      const result = persistedLlmProviderSchema.parse(singleModelProvider);
      expect(result.models).toHaveLength(1);
    });

    it("should accept provider with maximum models", () => {
      const manyModels = Array.from({ length: 50 }, (_, i) => ({
        id: `model-${i + 1}`,
        name: `Model ${i + 1}`,
        contextLength: 8000,
      }));

      const providerWithManyModels = {
        id: "provider",
        name: "Provider",
        models: manyModels,
      };

      const result = persistedLlmProviderSchema.parse(providerWithManyModels);
      expect(result.models).toHaveLength(50);
    });

    it("should accept provider with Unicode characters", () => {
      const unicodeProvider = {
        id: "mistral-ai",
        name: "Mistral AI 🇫🇷",
        models: [
          {
            id: "mistral-large",
            name: "Mistral Large",
            contextLength: 32000,
          },
        ],
      };

      const result = persistedLlmProviderSchema.parse(unicodeProvider);
      expect(result.name).toBe("Mistral AI 🇫🇷");
    });
  });

  describe("field validation", () => {
    const validModel = {
      id: "test-model",
      name: "Test Model",
      contextLength: 8000,
    };

    describe("id field", () => {
      it("should reject empty id", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "",
            name: "Test Provider",
            models: [validModel],
          });
        }).toThrow("Provider ID cannot be empty");
      });

      it("should reject id exceeding 50 characters", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "a".repeat(51),
            name: "Test Provider",
            models: [validModel],
          });
        }).toThrow("Provider ID cannot exceed 50 characters");
      });

      it("should reject non-string id", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: 123,
            name: "Test Provider",
            models: [validModel],
          });
        }).toThrow("Provider ID must be a string");
      });
    });

    describe("name field", () => {
      it("should reject empty name", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: "",
            models: [validModel],
          });
        }).toThrow("Provider name is required");
      });

      it("should reject name exceeding 100 characters", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: "A".repeat(101),
            models: [validModel],
          });
        }).toThrow("Provider name cannot exceed 100 characters");
      });

      it("should reject non-string name", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: 123,
            models: [validModel],
          });
        }).toThrow("Provider name must be a string");
      });
    });

    describe("models field", () => {
      it("should reject empty models array", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: "Test Provider",
            models: [],
          });
        }).toThrow("Provider must have at least one model");
      });

      it("should reject too many models", () => {
        const tooManyModels = Array.from({ length: 51 }, (_, i) => ({
          id: `model-${i}`,
          name: `Model ${i}`,
          contextLength: 8000,
        }));

        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: "Test Provider",
            models: tooManyModels,
          });
        }).toThrow("Provider cannot have more than 50 models");
      });

      it("should reject non-array models", () => {
        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: "Test Provider",
            models: "not-an-array",
          });
        }).toThrow("Models must be an array of model objects");
      });

      it("should validate each model in array", () => {
        const modelsWithInvalid = [
          validModel,
          {
            id: "",
            name: "Invalid Model",
            contextLength: 8000,
          },
        ];

        expect(() => {
          persistedLlmProviderSchema.parse({
            id: "test-provider",
            name: "Test Provider",
            models: modelsWithInvalid,
          });
        }).toThrow("Model ID cannot be empty");
      });
    });
  });
});

describe("persistedLlmModelsSettingsSchema", () => {
  describe("valid data validation", () => {
    it("should accept complete valid settings object", () => {
      const validSettings = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4-turbo",
                name: "GPT-4 Turbo",
                contextLength: 128000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedLlmModelsSettingsSchema.parse(validSettings);
      expect(result).toEqual(validSettings);
    });

    it("should apply defaults when fields are missing", () => {
      const minimalSettings = {
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
      };

      const result = persistedLlmModelsSettingsSchema.parse(minimalSettings);
      expect(result.schemaVersion).toBe(CURRENT_LLM_MODELS_SCHEMA_VERSION);
      expect(result.lastUpdated).toBeDefined();
      expect(result.lastUpdated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should accept settings with multiple providers", () => {
      const multiProviderSettings = {
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
          {
            id: "anthropic",
            name: "Anthropic",
            models: [
              {
                id: "claude-3-opus",
                name: "Claude 3 Opus",
                contextLength: 200000,
              },
            ],
          },
        ],
      };

      const result = persistedLlmModelsSettingsSchema.parse(
        multiProviderSettings,
      );
      expect(result.providers).toHaveLength(2);
    });

    it("should accept settings with maximum providers", () => {
      const maxProviders = Array.from({ length: 20 }, (_, i) => ({
        id: `provider-${i + 1}`,
        name: `Provider ${i + 1}`,
        models: [
          {
            id: "model-1",
            name: "Model 1",
            contextLength: 8000,
          },
        ],
      }));

      const settingsWithMaxProviders = {
        providers: maxProviders,
      };

      const result = persistedLlmModelsSettingsSchema.parse(
        settingsWithMaxProviders,
      );
      expect(result.providers).toHaveLength(20);
    });
  });

  describe("schema version validation", () => {
    it("should default to current version", () => {
      const result = persistedLlmModelsSettingsSchema.parse({
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
      });
      expect(result.schemaVersion).toBe(LLM_MODELS_SCHEMA_VERSION);
    });

    it("should accept custom version strings", () => {
      const result = persistedLlmModelsSettingsSchema.parse({
        schemaVersion: "2.0.0-beta",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
      });
      expect(result.schemaVersion).toBe("2.0.0-beta");
    });

    it("should reject empty version strings", () => {
      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          schemaVersion: "",
          providers: [
            {
              id: "openai",
              name: "OpenAI",
              models: [
                {
                  id: "gpt-4",
                  name: "GPT-4",
                  contextLength: 8000,
                },
              ],
            },
          ],
        });
      }).toThrow("Schema version cannot be empty");
    });

    it("should reject non-string version", () => {
      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          schemaVersion: 1.0,
          providers: [
            {
              id: "openai",
              name: "OpenAI",
              models: [
                {
                  id: "gpt-4",
                  name: "GPT-4",
                  contextLength: 8000,
                },
              ],
            },
          ],
        });
      }).toThrow("Schema version must be a string");
    });
  });

  describe("providers array validation", () => {
    it("should reject settings with empty providers array", () => {
      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          providers: [],
        });
      }).toThrow("Configuration must have at least one provider");
    });

    it("should reject settings with too many providers", () => {
      const tooManyProviders = Array.from({ length: 21 }, (_, i) => ({
        id: `provider-${i}`,
        name: `Provider ${i}`,
        models: [
          {
            id: "model-1",
            name: "Model 1",
            contextLength: 8000,
          },
        ],
      }));

      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          providers: tooManyProviders,
        });
      }).toThrow("Configuration cannot have more than 20 providers");
    });

    it("should reject non-array providers field", () => {
      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          providers: "not-an-array",
        });
      }).toThrow("Providers must be an array of provider objects");
    });

    it("should validate each provider in array", () => {
      const providersWithInvalid = [
        {
          id: "openai",
          name: "OpenAI",
          models: [
            {
              id: "gpt-4",
              name: "GPT-4",
              contextLength: 8000,
            },
          ],
        },
        {
          id: "",
          name: "Invalid Provider",
          models: [
            {
              id: "model-1",
              name: "Model 1",
              contextLength: 8000,
            },
          ],
        },
      ];

      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          providers: providersWithInvalid,
        });
      }).toThrow("Provider ID cannot be empty");
    });
  });

  describe("timestamp validation", () => {
    it("should generate automatic timestamp", () => {
      const before = new Date().toISOString();
      const result = persistedLlmModelsSettingsSchema.parse({
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
      });
      const after = new Date().toISOString();

      expect(new Date(result.lastUpdated).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime(),
      );
      expect(new Date(result.lastUpdated).getTime()).toBeLessThanOrEqual(
        new Date(after).getTime(),
      );
    });

    it("should accept custom valid timestamps", () => {
      const customTimestamp = "2025-01-15T10:30:00.000Z";
      const result = persistedLlmModelsSettingsSchema.parse({
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: customTimestamp,
      });
      expect(result.lastUpdated).toBe(customTimestamp);
    });

    it("should reject invalid timestamp formats", () => {
      expect(() => {
        persistedLlmModelsSettingsSchema.parse({
          providers: [
            {
              id: "openai",
              name: "OpenAI",
              models: [
                {
                  id: "gpt-4",
                  name: "GPT-4",
                  contextLength: 8000,
                },
              ],
            },
          ],
          lastUpdated: "not-a-date",
        });
      }).toThrow("Last updated must be a valid ISO datetime");
    });
  });

  describe("future compatibility", () => {
    it("should preserve unknown fields", () => {
      const settingsWithFutureFields = {
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
        experimental: { feature: true },
        version2Fields: ["field1", "field2"],
      };

      const result = persistedLlmModelsSettingsSchema.parse(
        settingsWithFutureFields,
      );
      expect(result.experimental).toEqual({ feature: true });
      expect(result.version2Fields).toEqual(["field1", "field2"]);
    });

    it("should handle JSON serialization round-trip", () => {
      const original = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4-turbo",
                name: "GPT-4 Turbo",
                contextLength: 128000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
        customField: "preserved",
      };

      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);
      const result = persistedLlmModelsSettingsSchema.parse(parsed);

      expect(result).toEqual(original);
    });
  });

  describe("type inference", () => {
    it("should properly infer TypeScript types", () => {
      type InferredType = z.infer<typeof persistedLlmModelsSettingsSchema>;

      const testFile: InferredType = {
        schemaVersion: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
        lastUpdated: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedLlmModelsSettingsSchema.parse(testFile);
      expect(result).toEqual(testFile);
    });
  });

  describe("schema version constants", () => {
    it("should export correct version constants", () => {
      expect(LLM_MODELS_SCHEMA_VERSION).toBe("1.0.0");
      expect(CURRENT_LLM_MODELS_SCHEMA_VERSION).toBe(LLM_MODELS_SCHEMA_VERSION);
    });

    it("should use current version as default", () => {
      const result = persistedLlmModelsSettingsSchema.parse({
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: [
              {
                id: "gpt-4",
                name: "GPT-4",
                contextLength: 8000,
              },
            ],
          },
        ],
      });
      expect(result.schemaVersion).toBe(CURRENT_LLM_MODELS_SCHEMA_VERSION);
    });
  });
});
