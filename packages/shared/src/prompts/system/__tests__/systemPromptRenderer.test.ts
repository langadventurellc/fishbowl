import { renderSystemPrompt } from "../systemPromptRenderer";
import type { SystemPromptRenderData } from "../systemPromptTypes";
import type { BehaviorRenderData } from "../BehaviorRenderData";

describe("renderSystemPrompt", () => {
  const basicTemplate = `{{agentSystemPrompt}}

Core Role
You are a {{roleName}}: {{roleDescription}}
{{roleSystemPrompt}}

Personality Profile: {{personalityName}}

{{personalityCustomInstructions}}

{{behaviors}}

{{participants}}`;

  const createBasicData = (): SystemPromptRenderData => ({
    agentSystemPrompt: "You are an AI assistant",
    agentName: "Test Agent",
    roleName: "Assistant",
    roleDescription: "A helpful AI assistant",
    roleSystemPrompt: "Help users with their questions",
    personalityName: "Friendly",
    personalityCustomInstructions: "Be helpful and courteous",
    behaviors: {
      personalityBehaviors: {
        humor: 60,
        formality: 40,
      },
      agentOverrides: {},
    },
    participants: "",
  });

  describe("token replacement", () => {
    test("replaces all placeholders with provided values", () => {
      const data = createBasicData();
      const result = renderSystemPrompt(basicTemplate, data);

      expect(result).toContain("You are an AI assistant");
      expect(result).toContain("You are a Assistant: A helpful AI assistant");
      expect(result).toContain("Help users with their questions");
      expect(result).toContain("Personality Profile: Friendly");
      expect(result).toContain("Be helpful and courteous");
      expect(result).not.toContain("{{");
      expect(result).not.toContain("}}");
    });

    test("handles missing agentSystemPrompt gracefully", () => {
      const data = createBasicData();
      data.agentSystemPrompt = undefined;

      const result = renderSystemPrompt(basicTemplate, data);

      expect(result).not.toContain("{{agentSystemPrompt}}");
      expect(result).not.toContain("undefined");
    });

    test("escapes special regex characters in tokens", () => {
      const template = "{{agentName}} says: Hello (world)! {{roleName}}";
      const data = createBasicData();
      data.agentName = "Agent [1]";
      data.roleName = "Role (2)";

      const result = renderSystemPrompt(template, data);

      expect(result).toBe("Agent [1] says: Hello (world)! Role (2)");
    });
  });

  describe("behavior rendering", () => {
    test("renders behaviors alphabetically", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          zeta: 80,
          alpha: 20,
          beta: 60,
        },
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("- alpha: 20\n- beta: 60\n- zeta: 80");
    });

    test("renders behavior overrides correctly", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          humor: 40,
          formality: 60,
        },
        agentOverrides: {
          humor: 80,
        },
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("- formality: 60\n- humor: 40 (override: 80)");
    });

    test("handles agent overrides without base values", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          humor: 40,
        },
        agentOverrides: {
          formality: 80,
        },
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("- formality: 80\n- humor: 40");
    });

    test("returns empty string for no behaviors", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {},
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("");
    });

    test("handles undefined agentOverrides", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          humor: 60,
          formality: 40,
        },
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("- formality: 40\n- humor: 60");
    });
  });

  describe("whitespace cleanup", () => {
    test("removes excessive whitespace", () => {
      const template = "Line 1\n\n\n\nLine 2\n\n\n\nLine 3";
      const data = createBasicData();

      const result = renderSystemPrompt(template, data);

      expect(result).toBe("Line 1\n\nLine 2\n\nLine 3");
    });

    test("trims leading and trailing whitespace", () => {
      const template = "  \n\n  Content  \n\n  ";
      const data = createBasicData();

      const result = renderSystemPrompt(template, data);

      expect(result).toBe("Content");
    });
  });

  describe("stability and determinism", () => {
    test("produces stable output for same inputs", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          gamma: 60,
          alpha: 20,
          beta: 80,
        },
        agentOverrides: {
          alpha: 40,
        },
      };

      const result1 = renderSystemPrompt(basicTemplate, data);
      const result2 = renderSystemPrompt(basicTemplate, data);

      expect(result1).toBe(result2);
    });

    test("behavior order is always alphabetical", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          z: 20,
          a: 40,
          m: 60,
          b: 80,
        },
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("- a: 40\n- b: 80\n- m: 60\n- z: 20");
    });
  });

  describe("edge cases", () => {
    test("handles empty template", () => {
      const data = createBasicData();

      const result = renderSystemPrompt("", data);

      expect(result).toBe("");
    });

    test("handles template with no tokens", () => {
      const template = "This is a static template with no placeholders";
      const data = createBasicData();

      const result = renderSystemPrompt(template, data);

      expect(result).toBe(template);
    });

    test("handles multiple instances of same token", () => {
      const template = "{{agentName}} and {{agentName}} are the same";
      const data = createBasicData();

      const result = renderSystemPrompt(template, data);

      expect(result).toBe("Test Agent and Test Agent are the same");
    });

    test("handles zero and 100 behavior values", () => {
      const data = createBasicData();
      data.behaviors = {
        personalityBehaviors: {
          minimum: 0,
          maximum: 100,
        },
      };

      const result = renderSystemPrompt("{{behaviors}}", data);

      expect(result).toBe("- maximum: 100\n- minimum: 0");
    });
  });

  describe("real-world integration", () => {
    test("works with actual template structure", () => {
      const realTemplate = `{{agentSystemPrompt}}

{{personalityName}}

Core Role
You are a {{roleName}}: {{roleDescription}}
{{roleSystemPrompt}}

Personality Profile: {{personalityName}}

Core Behavioral Framework
{{personalityCustomInstructions}}

{{behaviors}}

Interaction Guidelines
Integrate all the above traits naturally in your responses.`;

      const data: SystemPromptRenderData = {
        agentSystemPrompt:
          "You are Claude, an AI assistant created by Anthropic.",
        agentName: "Claude",
        roleName: "Research Assistant",
        roleDescription: "An AI that helps with research tasks",
        roleSystemPrompt:
          "Focus on providing accurate, well-sourced information.",
        personalityName: "Analytical Researcher",
        personalityCustomInstructions:
          "Be thorough and methodical in research.",
        behaviors: {
          personalityBehaviors: {
            analytical: 80,
            curiosity: 100,
            formality: 60,
          },
          agentOverrides: {
            formality: 40,
          },
        },
        participants: "",
      };

      const result = renderSystemPrompt(realTemplate, data);

      expect(result).toContain(
        "You are Claude, an AI assistant created by Anthropic.",
      );
      expect(result).toContain(
        "You are a Research Assistant: An AI that helps with research tasks",
      );
      expect(result).toContain(
        "Focus on providing accurate, well-sourced information.",
      );
      expect(result).toContain("Analytical Researcher");
      expect(result).toContain("Be thorough and methodical in research.");
      expect(result).toContain("- analytical: 80");
      expect(result).toContain("- curiosity: 100");
      expect(result).toContain("- formality: 60 (override: 40)");
      expect(result).toContain("Integrate all the above traits naturally");
      expect(result).not.toContain("{{");
      expect(result).not.toContain("}}");
    });
  });

  describe("participants token", () => {
    test("replaces participants token with provided content", () => {
      const template = "Agent info\n\n{{participants}}";
      const data = createBasicData();
      data.participants =
        "You are in a conversation with multiple participants:\n- Alice: researcher\n- Bob: analyst";

      const result = renderSystemPrompt(template, data);

      expect(result).toContain(
        "You are in a conversation with multiple participants:",
      );
      expect(result).toContain("- Alice: researcher");
      expect(result).toContain("- Bob: analyst");
      expect(result).not.toContain("{{participants}}");
    });

    test("replaces empty participants token", () => {
      const template = "Agent info\n\n{{participants}}\n\nEnd";
      const data = createBasicData();
      data.participants = "";

      const result = renderSystemPrompt(template, data);

      expect(result).not.toContain("{{participants}}");
      expect(result).toContain("Agent info");
      expect(result).toContain("End");
      // Should not have extra blank lines where participants was empty
      expect(result).not.toMatch(/\n\s*\n\s*\n\s*End/);
    });

    test("handles participants token in complex template", () => {
      const complexTemplate = `{{agentSystemPrompt}}

Core Role: {{roleName}}
{{roleSystemPrompt}}

{{participants}}

Additional instructions here.`;

      const data = createBasicData();
      data.participants = "Multi-agent conversation context here.";

      const result = renderSystemPrompt(complexTemplate, data);

      expect(result).toContain("Multi-agent conversation context here.");
      expect(result).toContain("You are an AI assistant");
      expect(result).toContain("Core Role: Assistant");
      expect(result).toContain("Additional instructions here.");
      expect(result).not.toContain("{{");
    });

    test("handles multiple participants tokens in template", () => {
      const template = "Start {{participants}} Middle {{participants}} End";
      const data = createBasicData();
      data.participants = "PARTICIPANT_INFO";

      const result = renderSystemPrompt(template, data);

      expect(result).toBe("Start PARTICIPANT_INFO Middle PARTICIPANT_INFO End");
      expect(result).not.toContain("{{participants}}");
    });
  });
});
