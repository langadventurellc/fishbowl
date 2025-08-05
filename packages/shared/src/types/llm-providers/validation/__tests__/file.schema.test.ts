import {
  LlmProvidersFileSchema,
  LLM_PROVIDERS_SCHEMA_VERSION,
} from "../file.schema";
import { validateProvidersFile } from "../validateProvidersFile";
import { createEmptyProvidersFile } from "../createEmptyProvidersFile";
import { isValidProvidersFile } from "../isValidProvidersFile";

describe("LlmProvidersFileSchema", () => {
  describe("valid files", () => {
    it("should accept minimal valid file", () => {
      const validFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProvidersFileSchema.parse(validFile);
      expect(result).toEqual(validFile);
    });

    it("should accept file with metadata", () => {
      const fileWithMetadata = {
        version: "1.0.0",
        providers: [
          {
            id: "anthropic",
            name: "Anthropic",
            models: { "claude-3": "Claude 3" },
            configuration: {
              fields: [
                {
                  id: "apiKey",
                  type: "secure-text",
                  label: "API Key",
                  required: true,
                },
              ],
            },
          },
        ],
        metadata: {
          lastUpdated: new Date().toISOString(),
          description: "Production LLM provider configuration",
        },
      };

      const result = LlmProvidersFileSchema.parse(fileWithMetadata);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.description).toBe(
        "Production LLM provider configuration",
      );
    });

    it("should accept file with multiple providers", () => {
      const multiProviderFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
          {
            id: "anthropic",
            name: "Anthropic",
            models: { "claude-3": "Claude 3" },
            configuration: { fields: [] },
          },
          {
            id: "ollama",
            name: "Ollama",
            models: { llama2: "Llama 2" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProvidersFileSchema.parse(multiProviderFile);
      expect(result.providers).toHaveLength(3);
    });

    it("should accept file with optional metadata fields", () => {
      const fileWithOptionalMetadata = {
        version: "1.0.0",
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
        metadata: {
          lastUpdated: "2024-01-01T00:00:00.000Z",
        },
      };

      const result = LlmProvidersFileSchema.parse(fileWithOptionalMetadata);
      expect(result.metadata?.lastUpdated).toBe("2024-01-01T00:00:00.000Z");
      expect(result.metadata?.description).toBeUndefined();
    });
  });

  describe("version validation", () => {
    it("should accept valid semantic versions", () => {
      const versions = ["1.0.0", "2.1.3", "10.20.30", "0.0.1"];

      versions.forEach((version) => {
        const file = {
          version,
          providers: [
            {
              id: "test",
              name: "Test",
              models: { model: "Model" },
              configuration: { fields: [] },
            },
          ],
        };

        expect(() => LlmProvidersFileSchema.parse(file)).not.toThrow();
      });
    });

    it("should reject invalid version formats", () => {
      const invalidVersions = [
        "1.0",
        "1",
        "1.0.0.0",
        "v1.0.0",
        "1.0.0-alpha",
        "",
      ];

      invalidVersions.forEach((version) => {
        const file = {
          version,
          providers: [
            {
              id: "test",
              name: "Test",
              models: { model: "Model" },
              configuration: { fields: [] },
            },
          ],
        };

        const result = LlmProvidersFileSchema.safeParse(file);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(
            result.error.issues.some((issue) => issue.path.includes("version")),
          ).toBe(true);
        }
      });
    });

    it("should reject non-string version", () => {
      const file = {
        version: 1.0,
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProvidersFileSchema.safeParse(file);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "Version must be a string",
        );
      }
    });
  });

  describe("provider array validation", () => {
    it("should reject empty providers array", () => {
      const emptyProvidersFile = {
        version: "1.0.0",
        providers: [],
      };

      const result = LlmProvidersFileSchema.safeParse(emptyProvidersFile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "At least one provider must be defined",
        );
      }
    });

    it("should reject duplicate provider IDs", () => {
      const duplicateIdFile = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: { fields: [] },
          },
          {
            id: "openai", // Duplicate ID
            name: "OpenAI Copy",
            models: { "gpt-3.5": "GPT-3.5" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProvidersFileSchema.safeParse(duplicateIdFile);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain(
          "Provider IDs must be unique within the file",
        );
      }
    });

    it("should allow providers with same field IDs across different providers", () => {
      const file = {
        version: "1.0.0",
        providers: [
          {
            id: "openai",
            name: "OpenAI",
            models: { "gpt-4": "GPT-4" },
            configuration: {
              fields: [
                {
                  id: "apiKey",
                  type: "secure-text",
                  label: "API Key",
                  required: true,
                },
              ],
            },
          },
          {
            id: "anthropic",
            name: "Anthropic",
            models: { "claude-3": "Claude 3" },
            configuration: {
              fields: [
                {
                  id: "apiKey",
                  type: "secure-text",
                  label: "API Key",
                  required: true,
                }, // Same field ID is OK
              ],
            },
          },
        ],
      };

      expect(() => LlmProvidersFileSchema.parse(file)).not.toThrow();
    });

    it("should reject non-array providers field", () => {
      const file = {
        version: "1.0.0",
        providers: "not-array",
      };

      const result = LlmProvidersFileSchema.safeParse(file);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("expected array");
      }
    });
  });

  describe("metadata validation", () => {
    it("should reject invalid lastUpdated format", () => {
      const file = {
        version: "1.0.0",
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
        metadata: {
          lastUpdated: "invalid-date",
        },
      };

      const result = LlmProvidersFileSchema.safeParse(file);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("valid ISO datetime");
      }
    });

    it("should accept valid ISO datetime", () => {
      const validDate = new Date().toISOString();
      const file = {
        version: "1.0.0",
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
        metadata: {
          lastUpdated: validDate,
          description: "Test file",
        },
      };

      const result = LlmProvidersFileSchema.parse(file);
      expect(result.metadata?.lastUpdated).toBe(validDate);
      expect(result.metadata?.description).toBe("Test file");
    });

    it("should accept file without metadata", () => {
      const file = {
        version: "1.0.0",
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProvidersFileSchema.parse(file);
      expect(result.metadata).toBeUndefined();
    });
  });

  describe("forward compatibility", () => {
    it("should allow unknown fields via passthrough", () => {
      const fileWithExtra = {
        version: "1.0.0",
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
        futureFeature: "some value",
        experimentalFlag: true,
        nestedFuture: {
          setting: "value",
        },
      };

      const result = LlmProvidersFileSchema.parse(fileWithExtra);
      expect(result).toHaveProperty("futureFeature", "some value");
      expect(result).toHaveProperty("experimentalFlag", true);
      expect(result).toHaveProperty("nestedFuture", { setting: "value" });
    });
  });

  describe("required field validation", () => {
    it("should reject missing version", () => {
      const file = {
        providers: [
          {
            id: "test",
            name: "Test",
            models: { model: "Model" },
            configuration: { fields: [] },
          },
        ],
      };

      const result = LlmProvidersFileSchema.safeParse(file);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("version")),
        ).toBe(true);
      }
    });

    it("should reject missing providers", () => {
      const file = {
        version: "1.0.0",
      };

      const result = LlmProvidersFileSchema.safeParse(file);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) => issue.path.includes("providers")),
        ).toBe(true);
      }
    });
  });
});

describe("validateProvidersFile", () => {
  it("should return success for valid data", () => {
    const validFile = {
      version: "1.0.0",
      providers: [
        {
          id: "test",
          name: "Test",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
      ],
    };

    const result = validateProvidersFile(validFile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.providers).toHaveLength(1);
    }
  });

  it("should return detailed errors for invalid data", () => {
    const result = validateProvidersFile({ invalid: "data" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
      expect(result.error.format()).toBeDefined();
    }
  });

  it("should handle null input", () => {
    const result = validateProvidersFile(null);
    expect(result.success).toBe(false);
  });

  it("should handle undefined input", () => {
    const result = validateProvidersFile(undefined);
    expect(result.success).toBe(false);
  });

  it("should handle empty object", () => {
    const result = validateProvidersFile({});
    expect(result.success).toBe(false);
  });
});

describe("createEmptyProvidersFile", () => {
  it("should create file with current version and empty providers", () => {
    const emptyFile = createEmptyProvidersFile();
    expect(emptyFile.version).toBe(LLM_PROVIDERS_SCHEMA_VERSION);
    expect(emptyFile.providers).toEqual([]);
    expect(emptyFile.providers).toHaveLength(0);
  });

  it("should create valid structure that passes validation", () => {
    const emptyFile = createEmptyProvidersFile();

    // Add a provider to make it valid (empty providers array is invalid)
    const validFile = {
      ...emptyFile,
      providers: [
        {
          id: "test",
          name: "Test",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
      ],
    };

    const result = LlmProvidersFileSchema.safeParse(validFile);
    expect(result.success).toBe(true);
  });
});

describe("isValidProvidersFile", () => {
  it("should return true for valid files", () => {
    const validFile = {
      version: "1.0.0",
      providers: [
        {
          id: "test",
          name: "Test",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
      ],
    };

    expect(isValidProvidersFile(validFile)).toBe(true);
  });

  it("should return false for invalid files", () => {
    expect(isValidProvidersFile(null)).toBe(false);
    expect(isValidProvidersFile({})).toBe(false);
    expect(isValidProvidersFile({ version: "1.0.0", providers: [] })).toBe(
      false,
    );
    expect(isValidProvidersFile("not an object")).toBe(false);
    expect(isValidProvidersFile(undefined)).toBe(false);
  });

  it("should return false for files with invalid version", () => {
    const invalidFile = {
      version: "invalid",
      providers: [
        {
          id: "test",
          name: "Test",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
      ],
    };

    expect(isValidProvidersFile(invalidFile)).toBe(false);
  });

  it("should return false for files with duplicate provider IDs", () => {
    const duplicateFile = {
      version: "1.0.0",
      providers: [
        {
          id: "same-id",
          name: "Test 1",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
        {
          id: "same-id",
          name: "Test 2",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
      ],
    };

    expect(isValidProvidersFile(duplicateFile)).toBe(false);
  });
});

describe("performance", () => {
  it("should validate large files efficiently", () => {
    const largeFile = {
      version: "1.0.0",
      providers: Array.from({ length: 20 }, (_, i) => ({
        id: `provider-${i}`,
        name: `Provider ${i}`,
        models: Object.fromEntries(
          Array.from({ length: 5 }, (_, j) => [`model-${j}`, `Model ${j}`]),
        ),
        configuration: {
          fields: Array.from({ length: 10 }, (_, j) => ({
            id: `field-${j}`,
            type:
              j % 3 === 0 ? "secure-text" : j % 3 === 1 ? "text" : "checkbox",
            label: `Field ${j}`,
            required: j % 2 === 0,
          })),
        },
      })),
      metadata: {
        lastUpdated: new Date().toISOString(),
        description: "Large test file",
      },
    };

    const startTime = Date.now();
    const result = LlmProvidersFileSchema.parse(largeFile);
    const endTime = Date.now();

    expect(result.providers).toHaveLength(20);
    expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
  });

  it("should handle large number of duplicate IDs efficiently", () => {
    const duplicateFile = {
      version: "1.0.0",
      providers: Array.from({ length: 100 }, () => ({
        id: "duplicate-id", // All have same ID
        name: "Test",
        models: { model: "Model" },
        configuration: { fields: [] },
      })),
    };

    const startTime = Date.now();
    const result = LlmProvidersFileSchema.safeParse(duplicateFile);
    const endTime = Date.now();

    expect(result.success).toBe(false);
    expect(endTime - startTime).toBeLessThan(100); // Should fail fast within 100ms
  });
});

describe("error handling", () => {
  it("should provide clear error messages for common issues", () => {
    const testCases = [
      {
        data: { version: "", providers: [] },
        expectedPath: "version",
        expectedMessage: "semantic versioning",
      },
      {
        data: { version: "1.0.0", providers: "not-array" },
        expectedPath: "providers",
        expectedMessage: "expected array",
      },
      {
        data: { version: "1.0.0", providers: [] },
        expectedPath: "providers",
        expectedMessage: "At least one provider must be defined",
      },
    ];

    testCases.forEach(({ data, expectedPath, expectedMessage }) => {
      const result = LlmProvidersFileSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const hasExpectedError = result.error.issues.some(
          (issue) =>
            issue.path.includes(expectedPath) &&
            issue.message.includes(expectedMessage),
        );
        expect(hasExpectedError).toBe(true);
      }
    });
  });

  it("should provide detailed path information for nested errors", () => {
    const fileWithNestedError = {
      version: "1.0.0",
      providers: [
        {
          id: "", // Invalid empty ID
          name: "Test",
          models: { model: "Model" },
          configuration: { fields: [] },
        },
      ],
    };

    const result = LlmProvidersFileSchema.safeParse(fileWithNestedError);
    expect(result.success).toBe(false);
    if (!result.success) {
      const idError = result.error.issues.find((issue) =>
        issue.path.includes("id"),
      );
      expect(idError).toBeDefined();
      expect(idError?.path).toEqual(["providers", 0, "id"]);
    }
  });
});
