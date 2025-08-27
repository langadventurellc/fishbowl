import { AgentSettingsViewModel } from "../../settings/AgentSettingsViewModel";
import { ConversationAgentViewModel } from "../ConversationAgentViewModel";

describe("ConversationAgentViewModel", () => {
  describe("interface structure", () => {
    it("should correctly type all required properties", () => {
      const mockAgent: AgentSettingsViewModel = {
        id: "agent-123",
        name: "Test Agent",
        role: "Assistant",
        personality: "Helpful assistant",
        model: "gpt-4",
        systemPrompt: "You are a helpful assistant",
        createdAt: "2025-01-15T10:30:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 0,
      };

      expect(typeof viewModel.id).toBe("string");
      expect(typeof viewModel.conversationId).toBe("string");
      expect(typeof viewModel.agentId).toBe("string");
      expect(typeof viewModel.agent).toBe("object");
      expect(typeof viewModel.addedAt).toBe("string");
      expect(typeof viewModel.isActive).toBe("boolean");
      expect(typeof viewModel.displayOrder).toBe("number");
    });

    it("should enforce string types for ID fields", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "ca-uuid-456",
        conversationId: "conv-uuid-789",
        agentId: "agent-uuid-123",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 1,
      };

      expect(viewModel.id).toBe("ca-uuid-456");
      expect(viewModel.conversationId).toBe("conv-uuid-789");
      expect(viewModel.agentId).toBe("agent-uuid-123");
    });

    it("should enforce boolean type for isActive", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const activeViewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 0,
      };

      const inactiveViewModel: ConversationAgentViewModel = {
        id: "ca-457",
        conversationId: "conv-789",
        agentId: "agent-124",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: false,
        displayOrder: 1,
      };

      expect(activeViewModel.isActive).toBe(true);
      expect(inactiveViewModel.isActive).toBe(false);
    });

    it("should enforce number type for displayOrder", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 42,
      };

      expect(typeof viewModel.displayOrder).toBe("number");
      expect(viewModel.displayOrder).toBe(42);
    });

    it("should enforce ISO 8601 string format for addedAt timestamp", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 0,
      };

      expect(typeof viewModel.addedAt).toBe("string");
      expect(viewModel.addedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("AgentSettingsViewModel integration", () => {
    it("should correctly integrate with AgentSettingsViewModel type", () => {
      const agentSettings: AgentSettingsViewModel = {
        id: "agent-123",
        name: "Code Assistant",
        role: "Developer Helper",
        personality: "Analytical and helpful",
        model: "gpt-4",
        systemPrompt: "Help with coding tasks",
        createdAt: "2025-01-10T08:00:00.000Z",
        updatedAt: "2025-01-15T10:30:00.000Z",
      };

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: agentSettings,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 0,
      };

      expect(viewModel.agent).toBe(agentSettings);
      expect(viewModel.agent.id).toBe("agent-123");
      expect(viewModel.agent.name).toBe("Code Assistant");
      expect(viewModel.agentId).toBe(agentSettings.id);
    });

    it("should maintain agent data integrity", () => {
      const agentData: AgentSettingsViewModel = {
        id: "agent-456",
        name: "Research Assistant",
        role: "Researcher",
        personality: "Research-focused",
        model: "gpt-3.5-turbo",
        systemPrompt: "Focus on research tasks",
      };

      const viewModel: ConversationAgentViewModel = {
        id: "ca-789",
        conversationId: "conv-123",
        agentId: agentData.id,
        agent: agentData,
        addedAt: "2025-01-15T14:20:00.000Z",
        isActive: true,
        displayOrder: 2,
      };

      // Agent ID should match the populated agent's ID
      expect(viewModel.agentId).toBe(viewModel.agent.id);
      expect(viewModel.agent.name).toBe("Research Assistant");
      expect(viewModel.agent.role).toBe("Researcher");
    });
  });

  describe("type imports and exports", () => {
    it("should import AgentSettingsViewModel type correctly", () => {
      const agentSettings = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: agentSettings,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 0,
      };

      expect(viewModel.agent).toBe(agentSettings);
    });

    it("should export ConversationAgentViewModel type correctly", () => {
      const viewModel = {} as ConversationAgentViewModel;

      expect(viewModel).toBeDefined();
      // TypeScript compilation will catch if the import/export is broken
    });
  });

  describe("property validation", () => {
    it("should validate all properties are present", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789",
        agentId: "agent-123",
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z",
        isActive: true,
        displayOrder: 0,
      };

      // All required properties should be defined
      expect(viewModel.id).toBeDefined();
      expect(viewModel.conversationId).toBeDefined();
      expect(viewModel.agentId).toBeDefined();
      expect(viewModel.agent).toBeDefined();
      expect(viewModel.addedAt).toBeDefined();
      expect(viewModel.isActive).toBeDefined();
      expect(viewModel.displayOrder).toBeDefined();
    });

    it("should handle edge case values correctly", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "",
        conversationId: "",
        agentId: "",
        agent: mockAgent,
        addedAt: "",
        isActive: false,
        displayOrder: -1,
      };

      expect(typeof viewModel.id).toBe("string");
      expect(typeof viewModel.conversationId).toBe("string");
      expect(typeof viewModel.agentId).toBe("string");
      expect(typeof viewModel.addedAt).toBe("string");
      expect(typeof viewModel.isActive).toBe("boolean");
      expect(typeof viewModel.displayOrder).toBe("number");
    });
  });

  describe("UI consistency", () => {
    it("should use camelCase properties for UI consistency", () => {
      const mockAgent = {} as AgentSettingsViewModel;

      const viewModel: ConversationAgentViewModel = {
        id: "ca-456",
        conversationId: "conv-789", // camelCase, not conversation_id
        agentId: "agent-123", // camelCase, not agent_id
        agent: mockAgent,
        addedAt: "2025-01-15T10:30:00.000Z", // camelCase, not added_at
        isActive: true, // camelCase, not is_active
        displayOrder: 0, // camelCase, not display_order
      };

      // Verify property names exist (this catches naming convention issues at compile time)
      expect("conversationId" in viewModel).toBe(true);
      expect("agentId" in viewModel).toBe(true);
      expect("addedAt" in viewModel).toBe(true);
      expect("isActive" in viewModel).toBe(true);
      expect("displayOrder" in viewModel).toBe(true);
    });
  });
});
