import { z } from "zod";
import { persistedRoleSchema } from "../rolesSettingsSchema";

describe("persistedRoleSchema", () => {
  describe("valid data validation", () => {
    it("should accept complete valid role object", () => {
      const validRole = {
        id: "role-123",
        name: "Project Manager",
        description: "Manages project timelines and coordination",
        systemPrompt: "You are a project manager focused on timelines...",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedRoleSchema.parse(validRole);
      expect(result).toEqual(validRole);
    });

    it("should accept role with null timestamps", () => {
      const roleWithNullTimestamps = {
        id: "role-456",
        name: "Developer",
        description: "Writes code",
        systemPrompt: "You are a developer",
        createdAt: null,
        updatedAt: null,
      };

      const result = persistedRoleSchema.parse(roleWithNullTimestamps);
      expect(result.createdAt).toBeNull();
      expect(result.updatedAt).toBeNull();
    });

    it("should accept role with missing optional fields", () => {
      const roleWithoutTimestamps = {
        id: "role-789",
        name: "Designer",
        description: "Creates designs",
        systemPrompt: "You are a designer",
      };

      const result = persistedRoleSchema.parse(roleWithoutTimestamps);
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it("should accept role with empty description and systemPrompt", () => {
      const roleWithEmptyFields = {
        id: "role-empty",
        name: "Basic Role",
        description: "",
        systemPrompt: "",
      };

      const result = persistedRoleSchema.parse(roleWithEmptyFields);
      expect(result.description).toBe("");
      expect(result.systemPrompt).toBe("");
    });

    it("should accept role with minimum length name", () => {
      const roleWithMinName = {
        id: "r",
        name: "A",
        description: "Short role",
        systemPrompt: "Brief",
      };

      const result = persistedRoleSchema.parse(roleWithMinName);
      expect(result.name).toBe("A");
    });

    it("should accept role with maximum length fields", () => {
      const roleWithMaxFields = {
        id: "role-max",
        name: "A".repeat(100), // 100 characters
        description: "D".repeat(500), // 500 characters
        systemPrompt: "S".repeat(5000), // 5000 characters
      };

      const result = persistedRoleSchema.parse(roleWithMaxFields);
      expect(result.name).toHaveLength(100);
      expect(result.description).toHaveLength(500);
      expect(result.systemPrompt).toHaveLength(5000);
    });

    it("should accept role with Unicode characters", () => {
      const roleWithUnicode = {
        id: "role-unicode",
        name: "Rôle Spéçiāl 🎯",
        description: "Descripción con acentos y emojis 📝",
        systemPrompt:
          "You are a multilingual assistant: français, español, 中文",
      };

      const result = persistedRoleSchema.parse(roleWithUnicode);
      expect(result.name).toBe("Rôle Spéçiāl 🎯");
      expect(result.description).toBe("Descripción con acentos y emojis 📝");
    });

    it("should accept role with special characters in system prompt", () => {
      const roleWithSpecialChars = {
        id: "role-special",
        name: "Code Assistant",
        description: "Helps with programming",
        systemPrompt:
          "You are a coding assistant. Use ```javascript\ncode blocks\n``` and <xml>tags</xml>",
      };

      const result = persistedRoleSchema.parse(roleWithSpecialChars);
      expect(result.systemPrompt).toContain("```javascript");
      expect(result.systemPrompt).toContain("<xml>tags</xml>");
    });
  });

  describe("field validation", () => {
    describe("id field", () => {
      it("should reject empty id", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "",
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role ID cannot be empty");
      });

      it("should reject non-string id", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: 123,
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role ID must be a string");
      });

      it("should reject null id", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: null,
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role ID must be a string");
      });

      it("should reject undefined id", () => {
        expect(() => {
          persistedRoleSchema.parse({
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role ID must be a string");
      });
    });

    describe("name field", () => {
      it("should reject empty name", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "",
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role name is required");
      });

      it("should reject name exceeding 100 characters", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "A".repeat(101), // 101 characters
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role name cannot exceed 100 characters");
      });

      it("should reject non-string name", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: 123,
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role name must be a string");
      });

      it("should reject null name", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: null,
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role name must be a string");
      });

      it("should reject undefined name", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            description: "Test",
            systemPrompt: "Test",
          });
        }).toThrow("Role name must be a string");
      });
    });

    describe("description field", () => {
      it("should accept empty description", () => {
        const result = persistedRoleSchema.parse({
          id: "test-id",
          name: "Test Role",
          description: "",
          systemPrompt: "Test",
        });
        expect(result.description).toBe("");
      });

      it("should reject description exceeding 500 characters", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "D".repeat(501), // 501 characters
            systemPrompt: "Test",
          });
        }).toThrow("Role description cannot exceed 500 characters");
      });

      it("should reject non-string description", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: 123,
            systemPrompt: "Test",
          });
        }).toThrow("Role description must be a string");
      });

      it("should reject null description", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: null,
            systemPrompt: "Test",
          });
        }).toThrow("Role description must be a string");
      });

      it("should reject undefined description", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            systemPrompt: "Test",
          });
        }).toThrow("Role description must be a string");
      });
    });

    describe("systemPrompt field", () => {
      it("should accept empty systemPrompt", () => {
        const result = persistedRoleSchema.parse({
          id: "test-id",
          name: "Test Role",
          description: "Test",
          systemPrompt: "",
        });
        expect(result.systemPrompt).toBe("");
      });

      it("should reject systemPrompt exceeding 5000 characters", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
            systemPrompt: "S".repeat(5001), // 5001 characters
          });
        }).toThrow("System prompt cannot exceed 5000 characters");
      });

      it("should reject non-string systemPrompt", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
            systemPrompt: 123,
          });
        }).toThrow("System prompt must be a string");
      });

      it("should reject null systemPrompt", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
            systemPrompt: null,
          });
        }).toThrow("System prompt must be a string");
      });

      it("should reject undefined systemPrompt", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
          });
        }).toThrow("System prompt must be a string");
      });
    });

    describe("timestamp fields", () => {
      it("should accept valid ISO datetime for createdAt", () => {
        const result = persistedRoleSchema.parse({
          id: "test-id",
          name: "Test Role",
          description: "Test",
          systemPrompt: "Test",
          createdAt: "2025-01-15T10:30:00.000Z",
        });
        expect(result.createdAt).toBe("2025-01-15T10:30:00.000Z");
      });

      it("should accept valid ISO datetime for updatedAt", () => {
        const result = persistedRoleSchema.parse({
          id: "test-id",
          name: "Test Role",
          description: "Test",
          systemPrompt: "Test",
          updatedAt: "2025-01-15T10:30:00.000Z",
        });
        expect(result.updatedAt).toBe("2025-01-15T10:30:00.000Z");
      });

      it("should reject invalid datetime format for createdAt", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
            createdAt: "2025-01-15 10:30:00",
          });
        }).toThrow("Created timestamp must be a valid ISO datetime");
      });

      it("should reject invalid datetime format for updatedAt", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
            updatedAt: "invalid-date",
          });
        }).toThrow("Updated timestamp must be a valid ISO datetime");
      });

      it("should reject non-string timestamp values", () => {
        expect(() => {
          persistedRoleSchema.parse({
            id: "test-id",
            name: "Test Role",
            description: "Test",
            systemPrompt: "Test",
            createdAt: 1642252200000,
          });
        }).toThrow("Created timestamp must be a string");
      });
    });
  });

  describe("error messages", () => {
    it("should provide clear error message for multiple validation failures", () => {
      expect(() => {
        persistedRoleSchema.parse({
          id: "",
          name: "",
          description: "D".repeat(501),
          systemPrompt: "S".repeat(5001),
          createdAt: "invalid-date",
        });
      }).toThrow(); // Should contain multiple error messages
    });

    it("should reference field names in error messages", () => {
      expect(() => {
        persistedRoleSchema.parse({
          id: "test",
          name: "A".repeat(101),
          description: "test",
          systemPrompt: "test",
        });
      }).toThrow("Role name cannot exceed 100 characters");
    });

    it("should include character limits in error messages", () => {
      expect(() => {
        persistedRoleSchema.parse({
          id: "test",
          name: "test",
          description: "D".repeat(501),
          systemPrompt: "test",
        });
      }).toThrow("Role description cannot exceed 500 characters");

      expect(() => {
        persistedRoleSchema.parse({
          id: "test",
          name: "test",
          description: "test",
          systemPrompt: "S".repeat(5001),
        });
      }).toThrow("System prompt cannot exceed 5000 characters");
    });
  });

  describe("type inference", () => {
    it("should properly infer TypeScript type from schema", () => {
      type InferredType = z.infer<typeof persistedRoleSchema>;

      const testRole: InferredType = {
        id: "test-role",
        name: "Test Role",
        description: "A test role",
        systemPrompt: "You are a test assistant",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const result = persistedRoleSchema.parse(testRole);
      expect(result).toEqual(testRole);
    });

    it("should infer optional timestamp fields correctly", () => {
      type InferredType = z.infer<typeof persistedRoleSchema>;

      const testRoleNoTimestamps: InferredType = {
        id: "test-role",
        name: "Test Role",
        description: "A test role",
        systemPrompt: "You are a test assistant",
      };

      const result = persistedRoleSchema.parse(testRoleNoTimestamps);
      expect(result).toEqual(testRoleNoTimestamps);
    });

    it("should infer nullable timestamp fields correctly", () => {
      type InferredType = z.infer<typeof persistedRoleSchema>;

      const testRoleNullTimestamps: InferredType = {
        id: "test-role",
        name: "Test Role",
        description: "A test role",
        systemPrompt: "You are a test assistant",
        createdAt: null,
        updatedAt: null,
      };

      const result = persistedRoleSchema.parse(testRoleNullTimestamps);
      expect(result).toEqual(testRoleNullTimestamps);
    });
  });

  describe("passthrough functionality", () => {
    it("should allow unknown fields for schema evolution", () => {
      const roleWithExtraFields = {
        id: "test-role",
        name: "Test Role",
        description: "A test role",
        systemPrompt: "You are a test assistant",
        extraField: "should be preserved",
        anotherField: 123,
      };

      const result = persistedRoleSchema.parse(roleWithExtraFields);
      expect(result.extraField).toBe("should be preserved");
      expect(result.anotherField).toBe(123);
    });
  });

  describe("malformed data handling", () => {
    it("should reject null input", () => {
      expect(() => {
        persistedRoleSchema.parse(null);
      }).toThrow("Invalid input: expected object, received null");
    });

    it("should reject array input", () => {
      expect(() => {
        persistedRoleSchema.parse([]);
      }).toThrow();
    });

    it("should reject string input", () => {
      expect(() => {
        persistedRoleSchema.parse("invalid");
      }).toThrow();
    });

    it("should reject number input", () => {
      expect(() => {
        persistedRoleSchema.parse(42);
      }).toThrow();
    });

    it("should reject undefined input", () => {
      expect(() => {
        persistedRoleSchema.parse(undefined);
      }).toThrow("Invalid input: expected object, received undefined");
    });
  });
});
