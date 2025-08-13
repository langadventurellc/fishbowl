import { randomUUID } from "crypto";
import type { MockRoleData } from "./MockRoleData";

export const createMockWriterRole = (): MockRoleData => {
  const roleId = randomUUID().slice(0, 8);

  return {
    name: `Test Creative Writer ${roleId}`,
    description: `A creative writing test role for content creation testing - ${roleId}`,
    systemPrompt: `You are a test creative writer (ID: ${roleId}). Generate test content, help with narrative testing scenarios, and create sample text for automated tests. Focus on varied content generation.`,
  };
};
