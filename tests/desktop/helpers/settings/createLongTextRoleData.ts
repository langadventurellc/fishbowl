import type { MockRoleData } from "./MockRoleData";

export const createLongTextRoleData = (): MockRoleData => {
  const longName = "A".repeat(100);
  const longDescription = "B".repeat(500);
  const longSystemPrompt = "C".repeat(5000);

  return {
    name: longName,
    description: longDescription,
    systemPrompt: longSystemPrompt,
  };
};
