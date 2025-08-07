import {
  LlmConfigValidationService,
  LlmConfigValidationError,
  validateCreateInput,
  validateUpdateInput,
  validateComplete,
  throwIfValidationFailed,
} from "../index";
import type { LlmConfig, LlmConfigInput } from "@fishbowl-ai/shared";
import { ValidationErrorCode } from "@fishbowl-ai/shared";

describe("LlmConfigValidation", () => {
  let validationService: LlmConfigValidationService;

  const createValidInput = (): LlmConfigInput => ({
    customName: "Test OpenAI",
    provider: "openai",
    apiKey: "sk-test1234567890abcdefghijklmnopqrstuvwxyz",
    baseUrl: "https://api.openai.com/v1",
    useAuthHeader: true,
  });

  const createValidConfig = (): LlmConfig => ({
    id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID
    ...createValidInput(),
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  const createAnthropicInput = (): LlmConfigInput => ({
    customName: "Test Anthropic",
    provider: "anthropic",
    apiKey: "sk-ant-test1234567890abcdefghijklmnopqrstuvwxyz123456789",
    baseUrl: "https://api.anthropic.com/v1",
    useAuthHeader: true,
  });

  const createCustomInput = (): LlmConfigInput => ({
    customName: "Test Custom",
    provider: "custom",
    apiKey: "custom-key-123",
    baseUrl: "https://api.custom.com/v1",
    useAuthHeader: true,
  });

  beforeEach(() => {
    validationService = new LlmConfigValidationService();
  });

  describe("validateCreateInput", () => {
    it("should pass validation for valid OpenAI input", async () => {
      const input = createValidInput();
      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.errors).toHaveLength(0);
    });

    it("should pass validation for valid Anthropic input", async () => {
      const input = createAnthropicInput();
      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.errors).toHaveLength(0);
    });

    it("should pass validation for valid custom provider with baseUrl", async () => {
      const input = createCustomInput();
      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail for missing required fields", async () => {
      const input = { customName: "Test" }; // Missing provider, apiKey
      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === "provider")).toBe(true);
      expect(result.errors.some((e) => e.field === "apiKey")).toBe(true);
    });

    it("should fail for invalid API key format", async () => {
      const input = createValidInput();
      input.apiKey = "invalid-key";

      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe(ValidationErrorCode.API_KEY_FORMAT);
      expect(result.errors[0]?.field).toBe("apiKey");
      expect(result.errors[0]?.value).toBe("[REDACTED]"); // API key should be redacted
    });

    it("should fail for duplicate configuration name", async () => {
      const input = createValidInput();
      const existing = [createValidConfig()];

      const result = await validateCreateInput(input, existing);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe(ValidationErrorCode.DUPLICATE_NAME);
      expect(result.errors[0]?.field).toBe("customName");
    });

    it("should fail for custom provider without baseUrl", async () => {
      const input = createCustomInput();
      input.baseUrl = undefined;

      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === ValidationErrorCode.PROVIDER_SPECIFIC,
        ),
      ).toBe(true);
    });

    it("should aggregate multiple validation errors", async () => {
      const input = {
        customName: "Test OpenAI", // This will match the existing config name
        provider: "openai",
        apiKey: "invalid-key", // Invalid format
        baseUrl: "https://api.openai.com/v1",
      };
      const existing = [createValidConfig()]; // Has same customName

      const result = await validateCreateInput(input, existing);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);

      // Should have both API key format error and duplicate name error
      const errorCodes = result.errors.map((e) => e.code);
      expect(errorCodes.includes(ValidationErrorCode.API_KEY_FORMAT)).toBe(
        true,
      );
      expect(errorCodes.includes(ValidationErrorCode.DUPLICATE_NAME)).toBe(
        true,
      );
    });

    it("should fail for invalid provider enum", async () => {
      const input = {
        ...createValidInput(),
        provider: "invalid-provider",
      };

      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "provider")).toBe(true);
    });

    it("should fail for invalid baseUrl format", async () => {
      const input = createValidInput();
      input.baseUrl = "not-a-valid-url";

      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "baseUrl")).toBe(true);
    });

    it("should fail for empty customName", async () => {
      const input = createValidInput();
      input.customName = "";

      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "customName")).toBe(true);
    });

    it("should fail for customName exceeding max length", async () => {
      const input = createValidInput();
      input.customName = "a".repeat(101); // Max is 100 characters

      const result = await validateCreateInput(input, []);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "customName")).toBe(true);
    });
  });

  describe("validateUpdateInput", () => {
    it("should pass validation for partial update", async () => {
      const current = createValidConfig();
      const update = { customName: "Updated Name" };

      const result = await validateUpdateInput(update, current, [current]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        customName: "Updated Name",
        useAuthHeader: true, // Default value applied by schema
      });
    });

    it("should allow keeping same name on update", async () => {
      const current = createValidConfig();
      const update = { customName: current.customName };

      const result = await validateUpdateInput(update, current, [current]);

      expect(result.success).toBe(true);
    });

    it("should pass validation for API key update", async () => {
      const current = createValidConfig();
      const update = {
        apiKey: "sk-newtest1234567890abcdefghijklmnopqrstuvwxyz",
      };

      const result = await validateUpdateInput(update, current, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        apiKey: "sk-newtest1234567890abcdefghijklmnopqrstuvwxyz",
        useAuthHeader: true, // Default value applied by schema
      });
    });

    it("should fail for invalid API key in update", async () => {
      const current = createValidConfig();
      const update = { apiKey: "invalid-key" };

      const result = await validateUpdateInput(update, current, []);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === ValidationErrorCode.API_KEY_FORMAT,
        ),
      ).toBe(true);
    });

    it("should validate merged configuration for provider requirements", async () => {
      const current = createValidConfig();
      current.provider = "custom";
      current.baseUrl = "https://api.custom.com/v1";

      const update = { baseUrl: undefined }; // This would make custom provider invalid

      const result = await validateUpdateInput(update, current, []);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === ValidationErrorCode.PROVIDER_SPECIFIC,
        ),
      ).toBe(true);
    });

    it("should fail for duplicate name in update", async () => {
      const current = createValidConfig();
      const other = {
        ...createValidConfig(),
        id: "550e8400-e29b-41d4-a716-446655440001", // Different valid UUID
        customName: "Other Config",
      };

      const update = { customName: "Other Config" };

      const result = await validateUpdateInput(update, current, [
        current,
        other,
      ]);

      expect(result.success).toBe(false);
      expect(
        result.errors.some(
          (e) => e.code === ValidationErrorCode.DUPLICATE_NAME,
        ),
      ).toBe(true);
    });

    it("should fail for invalid schema in partial update", async () => {
      const current = createValidConfig();
      const update = { provider: "invalid-provider" };

      const result = await validateUpdateInput(update, current, []);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "provider")).toBe(true);
    });
  });

  describe("validateComplete", () => {
    it("should validate complete configuration successfully", () => {
      const config = createValidConfig();

      const result = validateComplete(config);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(config);
    });

    it("should fail for missing system fields", () => {
      const config = createValidInput(); // Missing id, createdAt, updatedAt

      const result = validateComplete(config);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "id")).toBe(true);
      expect(result.errors.some((e) => e.field === "createdAt")).toBe(true);
      expect(result.errors.some((e) => e.field === "updatedAt")).toBe(true);
    });

    it("should fail for invalid UUID format", () => {
      const config = createValidConfig();
      config.id = "invalid-uuid";

      const result = validateComplete(config);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "id")).toBe(true);
    });

    it("should fail for invalid datetime format", () => {
      const config = createValidConfig();
      config.createdAt = "invalid-datetime";

      const result = validateComplete(config);

      expect(result.success).toBe(false);
      expect(result.errors.some((e) => e.field === "createdAt")).toBe(true);
    });
  });

  describe("throwIfValidationFailed", () => {
    it("should return data on successful validation", () => {
      const data = createValidInput();
      const result = { success: true as const, data, errors: [] };

      const output = throwIfValidationFailed(result);

      expect(output).toEqual(data);
    });

    it("should throw LlmConfigValidationError on failure", () => {
      const errors = [
        {
          field: "apiKey",
          code: ValidationErrorCode.API_KEY_FORMAT,
          message: "Invalid API key",
          value: "[REDACTED]",
        },
      ];
      const result = { success: false as const, data: undefined, errors };

      expect(() => throwIfValidationFailed(result)).toThrow(
        LlmConfigValidationError,
      );
    });

    it("should include validation summary in thrown error", () => {
      const errors = [
        {
          field: "apiKey",
          code: ValidationErrorCode.API_KEY_FORMAT,
          message: "Invalid API key",
          value: "[REDACTED]",
        },
      ];
      const result = { success: false as const, data: undefined, errors };

      try {
        throwIfValidationFailed(result);
      } catch (error) {
        expect(error).toBeInstanceOf(LlmConfigValidationError);
        expect(
          (error as LlmConfigValidationError).validationSummary,
        ).toBeTruthy();
        expect((error as LlmConfigValidationError).errors).toEqual(errors);
      }
    });
  });

  describe("LlmConfigValidationService", () => {
    it("should validate for create successfully", async () => {
      const input = createValidInput();

      const result = await validationService.validateForCreate(input, []);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
    });

    it("should validate for update successfully", async () => {
      const current = createValidConfig();
      const update = { customName: "Updated Name" };

      const result = await validationService.validateForUpdate(
        update,
        current,
        [current],
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        customName: "Updated Name",
        useAuthHeader: true, // Default value applied by schema
      });
    });

    it("should validate complete configuration successfully", () => {
      const config = createValidConfig();

      const result = validationService.validateComplete(config);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(config);
    });

    it("should validate and throw for create successfully", async () => {
      const input = createValidInput();

      const result = await validationService.validateAndThrowForCreate(
        input,
        [],
      );

      expect(result).toEqual(input);
    });

    it("should validate and throw for update successfully", async () => {
      const current = createValidConfig();
      const update = { customName: "Updated Name" };

      const result = await validationService.validateAndThrowForUpdate(
        update,
        current,
        [current],
      );

      expect(result).toEqual({
        customName: "Updated Name",
        useAuthHeader: true, // Default value applied by schema
      });
    });

    it("should throw error for invalid create input", async () => {
      const input = { customName: "Test" }; // Missing required fields

      await expect(
        validationService.validateAndThrowForCreate(input, []),
      ).rejects.toThrow(LlmConfigValidationError);
    });

    it("should throw error for invalid update input", async () => {
      const current = createValidConfig();
      const update = { apiKey: "invalid" };

      await expect(
        validationService.validateAndThrowForUpdate(update, current, []),
      ).rejects.toThrow(LlmConfigValidationError);
    });
  });

  describe("LlmConfigValidationError", () => {
    it("should create error with validation summary", () => {
      const errors = [
        {
          field: "apiKey",
          code: ValidationErrorCode.API_KEY_FORMAT,
          message: "Invalid API key format",
          value: "[REDACTED]",
        },
      ];

      const error = new LlmConfigValidationError(
        "Test validation failed",
        errors,
      );

      expect(error.name).toBe("LlmConfigValidationError");
      expect(error.message).toBe("Test validation failed");
      expect(error.errors).toEqual(errors);
      expect(error.validationSummary).toBeTruthy();
    });

    it("should be instance of Error", () => {
      const error = new LlmConfigValidationError("Test", []);

      expect(error).toBeInstanceOf(Error);
    });
  });
});
