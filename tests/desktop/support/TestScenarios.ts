import { TestDataBuilder } from "support/TestDataBuilder";

/**
 * Common test scenarios and data sets
 */

export const TestScenarios = {
  /**
   * Valid user inputs for form testing
   */
  validInputs: {
    userNames: ["John Doe", "Jane Smith", "Test User"],
    emails: ["john@example.com", "jane@example.com", "test@example.com"],
    apiKeys: ["sk-test123456789", "key-abcdef123456", "token-xyz789"],
    conversationTitles: [
      "New Conversation",
      "Project Discussion",
      "Daily Standup",
    ],
  },

  /**
   * Invalid user inputs for validation testing
   */
  invalidInputs: {
    emails: ["invalid-email", "@example.com", "test@", ""],
    apiKeys: ["", "short", "123", "invalid-key-format"],
    longText: "A".repeat(1000), // Very long text for testing limits
    specialCharacters: "!@#$%^&*()[]{}|\\:\";'<>?,./`~",
  },

  /**
   * Error conditions for testing error handling
   */
  errorConditions: {
    networkErrors: ["timeout", "connection_refused", "dns_error"],
    apiErrors: [400, 401, 403, 404, 429, 500, 502, 503],
    validationErrors: [
      "required_field",
      "invalid_format",
      "too_long",
      "too_short",
    ],
  },

  /**
   * Performance testing data
   */
  performance: {
    largeConversation: TestDataBuilder.createConversation({
      messages: Array.from({ length: 100 }, (_, i) =>
        TestDataBuilder.createMessage({
          content: `Message ${i + 1}: This is a test message for performance testing.`,
        }),
      ),
    }),
    multipleAgents: TestDataBuilder.createMultipleAgents(10),
  },
};
