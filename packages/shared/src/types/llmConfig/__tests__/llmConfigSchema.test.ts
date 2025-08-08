import { z } from "zod";
import { llmConfigInputSchema } from "../llmConfigInputSchema";
import { llmConfigSchema } from "../llmConfigSchema";

describe("llmConfigSchema", () => {
  describe("llmConfigInputSchema validation", () => {
    it("should accept valid input configuration", () => {
      const validInput = {
        customName: "My OpenAI Config",
        provider: "openai",
        apiKey: "sk-test123",
        baseUrl: "https://api.openai.com/v1",
        useAuthHeader: true,
      };
      const result = llmConfigInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it("should accept configuration without optional fields", () => {
      const minimalInput = {
        customName: "Minimal Config",
        provider: "anthropic",
        apiKey: "test-key",
      };
      const result = llmConfigInputSchema.parse(minimalInput);
      expect(result).toEqual({
        customName: "Minimal Config",
        provider: "anthropic",
        apiKey: "test-key",
        useAuthHeader: true,
      });
    });

    it("should allow unknown fields (passthrough)", () => {
      const inputWithExtra = {
        customName: "Test",
        provider: "openai",
        apiKey: "test",
        unknownField: "value",
      };
      const result = llmConfigInputSchema.parse(inputWithExtra);
      expect(result).toEqual({
        customName: "Test",
        provider: "openai",
        apiKey: "test",
        useAuthHeader: true,
        unknownField: "value",
      });
    });

    describe("customName validation", () => {
      it("should reject empty custom name", () => {
        expect(() => {
          llmConfigInputSchema.parse({
            customName: "",
            provider: "openai",
            apiKey: "test",
          });
        }).toThrow("Custom name is required");
      });

      it("should reject custom name exceeding 100 characters", () => {
        const longName = "a".repeat(101);
        expect(() => {
          llmConfigInputSchema.parse({
            customName: longName,
            provider: "openai",
            apiKey: "test",
          });
        }).toThrow("Custom name cannot exceed 100 characters");
      });

      it("should accept custom name at 100 character boundary", () => {
        const boundaryName = "a".repeat(100);
        const result = llmConfigInputSchema.parse({
          customName: boundaryName,
          provider: "openai",
          apiKey: "test",
        });
        expect(result.customName).toBe(boundaryName);
      });

      it("should reject non-string custom name", () => {
        expect(() => {
          llmConfigInputSchema.parse({
            customName: 123,
            provider: "openai",
            apiKey: "test",
          });
        }).toThrow("Custom name must be a string");
      });
    });

    describe("provider validation", () => {
      it("should accept valid providers", () => {
        const validProviders = ["openai", "anthropic"];

        validProviders.forEach((provider) => {
          const result = llmConfigInputSchema.parse({
            customName: "Test",
            provider: provider,
            apiKey: "test",
          });
          expect(result.provider).toBe(provider);
        });
      });

      it("should reject invalid providers", () => {
        const invalidProviders = ["invalid", "azure", "gemini", ""];

        invalidProviders.forEach((provider) => {
          expect(() => {
            llmConfigInputSchema.parse({
              customName: "Test",
              provider: provider,
              apiKey: "test",
            });
          }).toThrow();
        });
      });

      it("should reject non-string provider", () => {
        expect(() => {
          llmConfigInputSchema.parse({
            customName: "Test",
            provider: 123,
            apiKey: "test",
          });
        }).toThrow();
      });
    });

    describe("apiKey validation", () => {
      it("should reject empty API key", () => {
        expect(() => {
          llmConfigInputSchema.parse({
            customName: "Test",
            provider: "openai",
            apiKey: "",
          });
        }).toThrow("API key is required");
      });

      it("should reject API key exceeding 500 characters", () => {
        const longApiKey = "a".repeat(501);
        expect(() => {
          llmConfigInputSchema.parse({
            customName: "Test",
            provider: "openai",
            apiKey: longApiKey,
          });
        }).toThrow("API key cannot exceed 500 characters");
      });

      it("should accept API key at 500 character boundary", () => {
        const boundaryApiKey = "a".repeat(500);
        const result = llmConfigInputSchema.parse({
          customName: "Test",
          provider: "openai",
          apiKey: boundaryApiKey,
        });
        expect(result.apiKey).toBe(boundaryApiKey);
      });

      it("should reject non-string API key", () => {
        expect(() => {
          llmConfigInputSchema.parse({
            customName: "Test",
            provider: "openai",
            apiKey: 123,
          });
        }).toThrow("API key must be a string");
      });
    });

    describe("baseUrl validation", () => {
      it("should accept valid URLs", () => {
        const validUrls = [
          "https://api.openai.com/v1",
          "http://localhost:8080",
          "https://custom.example.com/api",
        ];

        validUrls.forEach((url) => {
          const result = llmConfigInputSchema.parse({
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            baseUrl: url,
          });
          expect(result.baseUrl).toBe(url);
        });
      });

      it("should reject invalid URLs", () => {
        const invalidUrls = [
          "not-a-url",
          "http://",
          "https://",
          "://missing-scheme",
          "",
          "   ",
        ];

        invalidUrls.forEach((url) => {
          expect(() => {
            llmConfigInputSchema.parse({
              customName: "Test",
              provider: "openai",
              apiKey: "test",
              baseUrl: url,
            });
          }).toThrow("Base URL must be a valid URL");
        });
      });

      it("should accept undefined baseUrl", () => {
        const result = llmConfigInputSchema.parse({
          customName: "Test",
          provider: "openai",
          apiKey: "test",
        });
        expect(result.baseUrl).toBeUndefined();
      });

      it("should reject non-string baseUrl", () => {
        expect(() => {
          llmConfigInputSchema.parse({
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            baseUrl: 123,
          });
        }).toThrow("Base URL must be a string");
      });
    });

    describe("useAuthHeader validation", () => {
      it("should accept boolean values", () => {
        const booleanValues = [true, false];

        booleanValues.forEach((value) => {
          const result = llmConfigInputSchema.parse({
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            useAuthHeader: value,
          });
          expect(result.useAuthHeader).toBe(value);
        });
      });

      it("should default to true when omitted", () => {
        const result = llmConfigInputSchema.parse({
          customName: "Test",
          provider: "openai",
          apiKey: "test",
        });
        expect(result.useAuthHeader).toBe(true);
      });

      it("should reject non-boolean values", () => {
        const invalidValues = ["true", "false", 1, 0, "Bearer", null];

        invalidValues.forEach((value) => {
          expect(() => {
            llmConfigInputSchema.parse({
              customName: "Test",
              provider: "openai",
              apiKey: "test",
              useAuthHeader: value,
            });
          }).toThrow("Use auth header must be a boolean");
        });
      });
    });
  });

  describe("llmConfigSchema validation", () => {
    it("should accept valid complete configuration", () => {
      const validConfig = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        customName: "Complete Config",
        provider: "openai",
        apiKey: "sk-test",
        baseUrl: "https://api.openai.com/v1",
        useAuthHeader: true,
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-02T12:00:00.000Z",
      };
      const result = llmConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it("should accept configuration without optional fields", () => {
      const minimalConfig = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        customName: "Minimal Config",
        provider: "anthropic",
        apiKey: "test-key",
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-01T12:00:00.000Z",
      };
      const result = llmConfigSchema.parse(minimalConfig);
      expect(result).toEqual({
        id: "550e8400-e29b-41d4-a716-446655440000",
        customName: "Minimal Config",
        provider: "anthropic",
        apiKey: "test-key",
        useAuthHeader: true,
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-01T12:00:00.000Z",
      });
    });

    describe("id validation", () => {
      it("should accept valid UUIDs", () => {
        const validUuids = [
          "550e8400-e29b-41d4-a716-446655440000",
          "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        ];

        validUuids.forEach((uuid) => {
          const result = llmConfigSchema.parse({
            id: uuid,
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            createdAt: "2024-01-01T12:00:00.000Z",
            updatedAt: "2024-01-01T12:00:00.000Z",
          });
          expect(result.id).toBe(uuid);
        });
      });

      it("should reject invalid UUIDs", () => {
        const invalidUuids = [
          "not-a-uuid",
          "550e8400-e29b-41d4-a716-44665544000", // Too short
          "550e8400-e29b-41d4-a716-4466554400000", // Too long
          "550e8400-e29b-41d4-a716-446655440000x", // Invalid character
        ];

        invalidUuids.forEach((uuid) => {
          expect(() => {
            llmConfigSchema.parse({
              id: uuid,
              customName: "Test",
              provider: "openai",
              apiKey: "test",
              createdAt: "2024-01-01T12:00:00.000Z",
              updatedAt: "2024-01-01T12:00:00.000Z",
            });
          }).toThrow("ID must be a valid UUID");
        });
      });

      it("should reject non-string id", () => {
        expect(() => {
          llmConfigSchema.parse({
            id: 123,
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            createdAt: "2024-01-01T12:00:00.000Z",
            updatedAt: "2024-01-01T12:00:00.000Z",
          });
        }).toThrow("ID must be a string");
      });
    });

    describe("createdAt validation", () => {
      it("should accept valid ISO datetime strings", () => {
        const validDates = [
          "2024-01-01T12:00:00.000Z",
          "2023-12-25T23:59:59.999Z",
          "2024-06-15T08:30:45.123Z",
        ];

        validDates.forEach((date) => {
          const result = llmConfigSchema.parse({
            id: "550e8400-e29b-41d4-a716-446655440000",
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            createdAt: date,
            updatedAt: "2024-01-01T12:00:00.000Z",
          });
          expect(result.createdAt).toBe(date);
        });
      });

      it("should reject invalid datetime strings", () => {
        const invalidDates = [
          "not-a-date",
          "2024-01-01",
          "2024/01/01 12:00:00",
          "2024-13-01T12:00:00.000Z", // Invalid month
          "2024-01-32T12:00:00.000Z", // Invalid day
        ];

        invalidDates.forEach((date) => {
          expect(() => {
            llmConfigSchema.parse({
              id: "550e8400-e29b-41d4-a716-446655440000",
              customName: "Test",
              provider: "openai",
              apiKey: "test",
              createdAt: date,
              updatedAt: "2024-01-01T12:00:00.000Z",
            });
          }).toThrow("Created date must be a valid ISO datetime");
        });
      });

      it("should reject non-string createdAt", () => {
        expect(() => {
          llmConfigSchema.parse({
            id: "550e8400-e29b-41d4-a716-446655440000",
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            createdAt: 1234567890,
            updatedAt: "2024-01-01T12:00:00.000Z",
          });
        }).toThrow("Created date must be a string");
      });
    });

    describe("updatedAt validation", () => {
      it("should accept valid ISO datetime strings", () => {
        const validDates = [
          "2024-01-01T12:00:00.000Z",
          "2023-12-25T23:59:59.999Z",
          "2024-06-15T08:30:45.123Z",
        ];

        validDates.forEach((date) => {
          const result = llmConfigSchema.parse({
            id: "550e8400-e29b-41d4-a716-446655440000",
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            createdAt: "2024-01-01T12:00:00.000Z",
            updatedAt: date,
          });
          expect(result.updatedAt).toBe(date);
        });
      });

      it("should reject invalid datetime strings", () => {
        const invalidDates = [
          "not-a-date",
          "2024-01-01",
          "2024/01/01 12:00:00",
          "2024-13-01T12:00:00.000Z", // Invalid month
          "2024-01-32T12:00:00.000Z", // Invalid day
        ];

        invalidDates.forEach((date) => {
          expect(() => {
            llmConfigSchema.parse({
              id: "550e8400-e29b-41d4-a716-446655440000",
              customName: "Test",
              provider: "openai",
              apiKey: "test",
              createdAt: "2024-01-01T12:00:00.000Z",
              updatedAt: date,
            });
          }).toThrow("Updated date must be a valid ISO datetime");
        });
      });

      it("should reject non-string updatedAt", () => {
        expect(() => {
          llmConfigSchema.parse({
            id: "550e8400-e29b-41d4-a716-446655440000",
            customName: "Test",
            provider: "openai",
            apiKey: "test",
            createdAt: "2024-01-01T12:00:00.000Z",
            updatedAt: 1234567890,
          });
        }).toThrow("Updated date must be a string");
      });
    });
  });

  describe("type inference", () => {
    it("should correctly infer types from schemas", () => {
      // This test ensures TypeScript compilation succeeds with inferred types
      type InputType = z.infer<typeof llmConfigInputSchema>;
      type ConfigType = z.infer<typeof llmConfigSchema>;

      // Type assertions to ensure structure matches expected interfaces
      const inputTest: InputType = {
        customName: "test",
        provider: "openai",
        apiKey: "test",
        useAuthHeader: true,
      };

      const configTest: ConfigType = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        customName: "test",
        provider: "openai",
        apiKey: "test",
        useAuthHeader: true,
        createdAt: "2024-01-01T12:00:00.000Z",
        updatedAt: "2024-01-01T12:00:00.000Z",
      };

      // Verify the types work correctly
      expect(inputTest.customName).toBe("test");
      expect(configTest.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });
});
