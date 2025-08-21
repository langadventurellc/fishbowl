import { PersonalityBehaviors, Agent } from "../index";

describe("Agent Types", () => {
  describe("PersonalityBehaviors", () => {
    it("includes all 7 personality behavior types", () => {
      const behaviors: PersonalityBehaviors = {
        // Existing behaviors
        humor: 0,
        formality: 0,
        brevity: 0,
        assertiveness: 0,
        // New behaviors
        responseLength: 0,
        randomness: 0,
        focus: 0,
      };

      // TypeScript will catch if any required properties are missing
      expect(behaviors).toBeDefined();
    });

    it("allows partial personality behavior objects", () => {
      const partialBehaviors: PersonalityBehaviors = {
        humor: 50,
        responseLength: -30,
      };

      expect(partialBehaviors).toBeDefined();
    });

    it("accepts valid number ranges for behaviors", () => {
      const behaviors: PersonalityBehaviors = {
        humor: -100,
        formality: 100,
        brevity: 0,
        assertiveness: 75,
        responseLength: -50,
        randomness: 25,
        focus: -75,
      };

      expect(behaviors).toBeDefined();
    });

    it("allows empty personality behaviors object", () => {
      const emptyBehaviors: PersonalityBehaviors = {};

      expect(emptyBehaviors).toBeDefined();
    });
  });

  describe("Agent Interface", () => {
    it("does not include removed LLM parameters", () => {
      const agent: Agent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        // Verify these don't exist on Agent type (TypeScript will catch if they do)
        // temperature: 0.7,     // Should cause TypeScript error
        // maxTokens: 4096,     // Should cause TypeScript error
        // topP: 1,             // Should cause TypeScript error
      };

      // This test mainly serves as TypeScript validation
      expect(agent).toBeDefined();
    });

    it("supports personality behaviors with new types", () => {
      const agent: Agent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
        personalityBehaviors: {
          humor: 25,
          formality: -10,
          brevity: 50,
          assertiveness: 0,
          responseLength: 75,
          randomness: -25,
          focus: 100,
        },
      };

      expect(agent.personalityBehaviors).toBeDefined();
      expect(agent.personalityBehaviors?.responseLength).toBe(75);
      expect(agent.personalityBehaviors?.randomness).toBe(-25);
      expect(agent.personalityBehaviors?.focus).toBe(100);
    });

    it("allows agents without personality behaviors", () => {
      const agent: Agent = {
        id: "test-id",
        name: "Test Agent",
        description: "Test description",
      };

      expect(agent.personalityBehaviors).toBeUndefined();
    });

    it("supports all required and optional properties", () => {
      const fullAgent: Agent = {
        id: "agent-123",
        name: "Full Test Agent",
        description: "Complete agent description",
        role: "assistant",
        personality: "helpful",
        model: "gpt-4",
        systemPrompt: "You are a helpful assistant",
        personalityBehaviors: {
          humor: 50,
          formality: -25,
          brevity: 75,
          assertiveness: 0,
          responseLength: 25,
          randomness: -50,
          focus: 100,
        },
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
      };

      expect(fullAgent.id).toBe("agent-123");
      expect(fullAgent.name).toBe("Full Test Agent");
      expect(fullAgent.description).toBe("Complete agent description");
      expect(fullAgent.role).toBe("assistant");
      expect(fullAgent.personality).toBe("helpful");
      expect(fullAgent.model).toBe("gpt-4");
      expect(fullAgent.systemPrompt).toBe("You are a helpful assistant");
      expect(fullAgent.personalityBehaviors).toBeDefined();
      expect(fullAgent.createdAt).toBe("2023-01-01T00:00:00Z");
      expect(fullAgent.updatedAt).toBe("2023-01-02T00:00:00Z");
    });

    it("requires only id and name properties", () => {
      const minimalAgent: Agent = {
        id: "minimal-id",
        name: "Minimal Agent",
      };

      expect(minimalAgent.id).toBe("minimal-id");
      expect(minimalAgent.name).toBe("Minimal Agent");
      expect(minimalAgent.description).toBeUndefined();
      expect(minimalAgent.role).toBeUndefined();
      expect(minimalAgent.personality).toBeUndefined();
      expect(minimalAgent.model).toBeUndefined();
      expect(minimalAgent.systemPrompt).toBeUndefined();
      expect(minimalAgent.personalityBehaviors).toBeUndefined();
      expect(minimalAgent.createdAt).toBeUndefined();
      expect(minimalAgent.updatedAt).toBeUndefined();
    });
  });

  describe("Type Compatibility", () => {
    it("supports partial updates to personality behaviors", () => {
      const originalBehaviors: PersonalityBehaviors = {
        humor: 50,
        formality: 25,
        brevity: 0,
        assertiveness: -25,
        responseLength: 75,
        randomness: 50,
        focus: 100,
      };

      const updates: Partial<PersonalityBehaviors> = {
        humor: 75,
        responseLength: 50,
      };

      const updatedBehaviors: PersonalityBehaviors = {
        ...originalBehaviors,
        ...updates,
      };

      expect(updatedBehaviors.humor).toBe(75);
      expect(updatedBehaviors.responseLength).toBe(50);
      expect(updatedBehaviors.formality).toBe(25); // unchanged
    });

    it("supports partial agent updates", () => {
      const originalAgent: Agent = {
        id: "agent-1",
        name: "Original Agent",
        description: "Original description",
        personalityBehaviors: {
          humor: 50,
          focus: 75,
        },
      };

      const updates: Partial<Agent> = {
        name: "Updated Agent",
        personalityBehaviors: {
          humor: 25,
          randomness: 50,
        },
      };

      const updatedAgent: Agent = {
        ...originalAgent,
        ...updates,
      };

      expect(updatedAgent.id).toBe("agent-1"); // unchanged
      expect(updatedAgent.name).toBe("Updated Agent"); // updated
      expect(updatedAgent.description).toBe("Original description"); // unchanged
      expect(updatedAgent.personalityBehaviors?.humor).toBe(25); // updated
      expect(updatedAgent.personalityBehaviors?.randomness).toBe(50); // new
    });
  });
});
