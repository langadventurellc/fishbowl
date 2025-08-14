import type { MockRoleData } from "./MockRoleData";

type InvalidField = "name" | "description" | "systemPrompt";

export const createInvalidRoleData = (
  invalidField: InvalidField = "name",
): MockRoleData => {
  const validData: MockRoleData = {
    name: "Valid Test Role",
    description: "Valid test description",
    systemPrompt: "Valid test system prompt",
  };

  switch (invalidField) {
    case "name":
      return { ...validData, name: "" };
    case "description":
      return { ...validData, description: "   " };
    case "systemPrompt":
      return { ...validData, systemPrompt: "" };
    default:
      return { ...validData, name: "" };
  }
};
