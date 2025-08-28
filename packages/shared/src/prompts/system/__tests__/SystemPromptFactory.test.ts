import { SystemPromptFactory } from "../SystemPromptFactory";
import type { SystemPromptResolvers } from "../SystemPromptResolvers";
import type { PersistedAgentData } from "../../../types/agents/PersistedAgentData";
import type { PersistedPersonalityData } from "../../../types/settings/PersistedPersonalityData";
import type { PersistedRoleData } from "../../../types/settings/PersistedRoleData";

describe("SystemPromptFactory", () => {
  const mockTemplate = `{{agentSystemPrompt}}

Core Role
You are a {{roleName}}: {{roleDescription}}
{{roleSystemPrompt}}

Personality Profile: {{personalityName}}

{{personalityCustomInstructions}}

{{behaviors}}

Agent: {{agentName}}

{{participants}}`;

  const mockPersonality: PersistedPersonalityData = {
    id: "test-personality",
    name: "Analytical Researcher",
    behaviors: {
      analytical: 80,
      curiosity: 100,
      formality: 60,
    },
    customInstructions: "Be thorough and methodical in research.",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockRole: PersistedRoleData = {
    id: "test-role",
    name: "Research Assistant",
    description: "An AI that helps with research tasks",
    systemPrompt: "Focus on providing accurate, well-sourced information.",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const mockAgent: PersistedAgentData = {
    id: "test-agent",
    name: "Claude",
    model: "claude-3-sonnet",
    llmConfigId: "test-config-id",
    role: "test-role",
    personality: "test-personality",
    systemPrompt: "You are Claude, an AI assistant created by Anthropic.",
    personalityBehaviors: {
      formality: 40, // Override the personality's formality value
    },
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  };

  const createMockResolvers = (): SystemPromptResolvers => ({
    async resolvePersonality(
      personalityId: string,
    ): Promise<PersistedPersonalityData> {
      if (personalityId === "test-personality") {
        return mockPersonality;
      }
      throw new Error(`Personality ${personalityId} not found`);
    },
    async resolveRole(roleId: string): Promise<PersistedRoleData> {
      if (roleId === "test-role") {
        return mockRole;
      }
      throw new Error(`Role ${roleId} not found`);
    },
  });

  describe("constructor", () => {
    test("creates factory with resolvers and template", () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      expect(factory).toBeInstanceOf(SystemPromptFactory);
    });

    test("accepts optional logger", () => {
      const resolvers = createMockResolvers();
      const mockLogger = {
        setLevel: jest.fn(),
        getLevel: jest.fn().mockReturnValue("info"),
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        fatal: jest.fn(),
        child: jest.fn(),
        addTransport: jest.fn(),
        removeTransport: jest.fn(),
        setFormatter: jest.fn(),
      } as const;

      const factory = new SystemPromptFactory(
        resolvers,
        mockTemplate,
        mockLogger,
      );
      expect(factory).toBeInstanceOf(SystemPromptFactory);
    });
  });

  describe("createSystemPrompt", () => {
    test("generates system prompt with all components", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result = await factory.createSystemPrompt(mockAgent);

      expect(result).toContain(
        "You are Claude, an AI assistant created by Anthropic.",
      );
      expect(result).toContain(
        "You are a Research Assistant: An AI that helps with research tasks",
      );
      expect(result).toContain(
        "Focus on providing accurate, well-sourced information.",
      );
      expect(result).toContain("Personality Profile: Analytical Researcher");
      expect(result).toContain("Be thorough and methodical in research.");
      expect(result).toContain("Agent: Claude");
      expect(result).not.toContain("{{");
      expect(result).not.toContain("}}");
    });

    test("includes behaviors with overrides correctly", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result = await factory.createSystemPrompt(mockAgent);

      expect(result).toContain("- analytical: 80");
      expect(result).toContain("- curiosity: 100");
      expect(result).toContain("- formality: 60 (override: 40)");
    });

    test("handles agent without system prompt", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const { systemPrompt, ...agentWithoutSystemPrompt } = mockAgent;

      const result = await factory.createSystemPrompt(agentWithoutSystemPrompt);

      expect(result).toContain("You are a Research Assistant");
      expect(result).toContain("Agent: Claude");
      expect(result).not.toContain("{{");
    });

    test("handles agent without behavior overrides", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const { personalityBehaviors, ...agentWithoutOverrides } = mockAgent;

      const result = await factory.createSystemPrompt(agentWithoutOverrides);

      expect(result).toContain("- analytical: 80");
      expect(result).toContain("- curiosity: 100");
      expect(result).toContain("- formality: 60");
      expect(result).not.toContain("override:");
    });

    test("validates agent has role", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const { role, ...agentWithoutRole } = mockAgent;

      await expect(
        factory.createSystemPrompt(agentWithoutRole as PersistedAgentData),
      ).rejects.toThrow("Agent test-agent missing role");
    });

    test("validates agent has personality", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const { personality, ...agentWithoutPersonality } = mockAgent;

      await expect(
        factory.createSystemPrompt(
          agentWithoutPersonality as PersistedAgentData,
        ),
      ).rejects.toThrow("Agent test-agent missing personality");
    });

    test("propagates resolver errors", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const agentWithBadRole = { ...mockAgent, role: "nonexistent-role" };

      await expect(
        factory.createSystemPrompt(agentWithBadRole),
      ).rejects.toThrow("Role nonexistent-role not found");
    });

    test("produces deterministic output for same inputs", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result1 = await factory.createSystemPrompt(mockAgent);
      const result2 = await factory.createSystemPrompt(mockAgent);

      expect(result1).toBe(result2);
    });

    test("handles personality without custom instructions", async () => {
      const resolvers: SystemPromptResolvers = {
        async resolvePersonality(): Promise<PersistedPersonalityData> {
          return {
            ...mockPersonality,
            customInstructions: "",
          };
        },
        async resolveRole(): Promise<PersistedRoleData> {
          return mockRole;
        },
      };

      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result = await factory.createSystemPrompt(mockAgent);

      expect(result).toContain("Personality Profile: Analytical Researcher");
      expect(result).not.toContain("{{");
      expect(result).not.toContain("undefined");
    });

    test("works without accessing filesystem", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result = await factory.createSystemPrompt(mockAgent);

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toContain("{{");
    });

    test("includes participants when provided", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const participants: PersistedAgentData[] = [
        {
          id: "participant-1",
          name: "Alice",
          model: "claude-3-sonnet",
          llmConfigId: "test-config-id",
          role: "test-role",
          personality: "test-personality",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
        {
          id: "participant-2",
          name: "Bob",
          model: "claude-3-sonnet",
          llmConfigId: "test-config-id",
          role: "test-role",
          personality: "test-personality",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
        },
      ];

      const result = await factory.createSystemPrompt(mockAgent, participants);

      expect(result).toContain(
        "You are in a conversation with multiple participants:",
      );
      expect(result).toContain("- Alice: test-role");
      expect(result).toContain("- Bob: test-role");
      expect(result).toContain(
        "When you see messages prefixed with [ParticipantName]: that indicates who is speaking.",
      );
      expect(result).toContain(
        "Respond naturally as Claude based on your configured personality and role.",
      );
    });

    test("handles empty participants array", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result = await factory.createSystemPrompt(mockAgent, []);

      expect(result).not.toContain(
        "You are in a conversation with multiple participants:",
      );
      expect(result).not.toContain(
        "When you see messages prefixed with [ParticipantName]:",
      );
    });

    test("handles no participants parameter", async () => {
      const resolvers = createMockResolvers();
      const factory = new SystemPromptFactory(resolvers, mockTemplate);

      const result = await factory.createSystemPrompt(mockAgent);

      expect(result).not.toContain(
        "You are in a conversation with multiple participants:",
      );
      expect(result).not.toContain(
        "When you see messages prefixed with [ParticipantName]:",
      );
    });
  });
});
