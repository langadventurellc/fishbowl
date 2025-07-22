/**
 * Test data builders and mock data for BDD tests
 * This module provides structured test data following BDD principles
 */

export interface TestUser {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: boolean;
}

export interface TestConversation {
  id: string;
  title: string;
  participants: TestAgent[];
  messages: TestMessage[];
}

export interface TestAgent {
  id: string;
  name: string;
  model: string;
  personality: string;
  role: string;
}

export interface TestMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: "user" | "agent" | "system";
}

export interface AppConfig {
  window: WindowConfig;
  features: FeatureFlags;
  api: ApiConfig;
}

export interface WindowConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  resizable: boolean;
}

export interface FeatureFlags {
  multipleAgents: boolean;
  voiceInput: boolean;
  fileUpload: boolean;
  apiKeyManagement: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

/**
 * Test Data Builders
 */
export class TestDataBuilder {
  /**
   * Create a test user with default or custom properties
   */
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const defaultUser: TestUser = {
      id: "test-user-001",
      name: "Test User",
      email: "test@example.com",
      preferences: {
        theme: "light",
        language: "en",
        notifications: true,
      },
    };

    return { ...defaultUser, ...overrides };
  }

  /**
   * Create a test agent with default or custom properties
   */
  static createAgent(overrides: Partial<TestAgent> = {}): TestAgent {
    const defaultAgent: TestAgent = {
      id: "test-agent-001",
      name: "Assistant",
      model: "gpt-4",
      personality: "helpful and friendly",
      role: "general assistant",
    };

    return { ...defaultAgent, ...overrides };
  }

  /**
   * Create a test conversation with default or custom properties
   */
  static createConversation(
    overrides: Partial<TestConversation> = {},
  ): TestConversation {
    const defaultConversation: TestConversation = {
      id: "test-conversation-001",
      title: "Test Conversation",
      participants: [this.createAgent()],
      messages: [
        this.createMessage({
          content: "Hello, how can I help you today?",
          sender: "test-agent-001",
          type: "agent",
        }),
      ],
    };

    return { ...defaultConversation, ...overrides };
  }

  /**
   * Create a test message with default or custom properties
   */
  static createMessage(overrides: Partial<TestMessage> = {}): TestMessage {
    const defaultMessage: TestMessage = {
      id: `test-message-${Date.now()}`,
      content: "Test message content",
      sender: "test-user-001",
      timestamp: new Date(),
      type: "user",
    };

    return { ...defaultMessage, ...overrides };
  }

  /**
   * Create application configuration for testing
   */
  static createAppConfig(overrides: Partial<AppConfig> = {}): AppConfig {
    const defaultConfig: AppConfig = {
      window: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        resizable: true,
      },
      features: {
        multipleAgents: true,
        voiceInput: false,
        fileUpload: true,
        apiKeyManagement: true,
      },
      api: {
        baseUrl: "http://localhost:3000/api",
        timeout: 30000,
        retries: 3,
      },
    };

    return { ...defaultConfig, ...overrides };
  }

  /**
   * Create multiple test agents for testing multi-agent conversations
   */
  static createMultipleAgents(count: number = 3): TestAgent[] {
    const agentTemplates = [
      {
        name: "Creative Assistant",
        personality: "creative and imaginative",
        role: "creative writer",
      },
      {
        name: "Technical Expert",
        personality: "analytical and precise",
        role: "technical consultant",
      },
      {
        name: "Research Assistant",
        personality: "curious and thorough",
        role: "researcher",
      },
    ];

    return Array.from({ length: count }, (_, index) => {
      const template = agentTemplates[index % agentTemplates.length];
      return this.createAgent({
        id: `test-agent-${String(index + 1).padStart(3, "0")}`,
        ...template,
      });
    });
  }

  /**
   * Create a conversation with multiple participants
   */
  static createMultiAgentConversation(): TestConversation {
    const agents = this.createMultipleAgents(3);
    const messages: TestMessage[] = [
      this.createMessage({
        content: "I need help brainstorming ideas for a new product.",
        sender: "test-user-001",
        type: "user",
      }),
      this.createMessage({
        content:
          "I can help with creative concepts and storytelling approaches.",
        sender: agents[0].id,
        type: "agent",
      }),
      this.createMessage({
        content:
          "I can provide technical feasibility analysis and implementation details.",
        sender: agents[1].id,
        type: "agent",
      }),
      this.createMessage({
        content: "I can research market trends and competitive analysis.",
        sender: agents[2].id,
        type: "agent",
      }),
    ];

    return this.createConversation({
      title: "Multi-Agent Product Brainstorm",
      participants: agents,
      messages,
    });
  }
}

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

/**
 * Utility functions for test data manipulation
 */
export const TestUtils = {
  /**
   * Generate a random string for testing
   */
  randomString(length: number = 10): string {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
  },

  /**
   * Generate a random email for testing
   */
  randomEmail(): string {
    return `test${this.randomString(5)}@example.com`;
  },

  /**
   * Create a timestamp for testing
   */
  createTimestamp(daysAgo: number = 0): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  },

  /**
   * Wait for a specified amount of time (for testing timing scenarios)
   */
  async wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },

  /**
   * Create a mock API response
   */
  createApiResponse<T>(
    data: T,
    status: number = 200,
  ): {
    status: number;
    data: T;
    timestamp: Date;
  } {
    return {
      status,
      data,
      timestamp: new Date(),
    };
  },
};
