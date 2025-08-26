import * as conversationAgentsExports from "../index";

describe("conversationAgents repository exports", () => {
  it("should export ConversationAgentsRepository", () => {
    expect(
      conversationAgentsExports.ConversationAgentsRepository,
    ).toBeDefined();
    expect(typeof conversationAgentsExports.ConversationAgentsRepository).toBe(
      "function",
    );
  });

  it("should have correct number of exports", () => {
    const exportKeys = Object.keys(conversationAgentsExports);
    expect(exportKeys).toHaveLength(1);
    expect(exportKeys).toContain("ConversationAgentsRepository");
  });
});
