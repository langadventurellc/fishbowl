import { AppConfig } from "support/AppConfig";
import { TestAgent } from "support/TestAgent";
import { TestConversation } from "support/TestConversation";
import { TestMessage } from "support/TestMessage";
import { TestUser } from "./TestUser";

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
        sender: agents[0]!.id,
        type: "agent",
      }),
      this.createMessage({
        content:
          "I can provide technical feasibility analysis and implementation details.",
        sender: agents[1]!.id,
        type: "agent",
      }),
      this.createMessage({
        content: "I can research market trends and competitive analysis.",
        sender: agents[2]!.id,
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
