import type { AgentFormData } from "@fishbowl-ai/ui-shared";
import { createMockAgentData } from "../settings/createMockAgentData";
import type { ConversationAgentConfig } from "./setupMultipleConversationsWithAgents";

/**
 * Predefined test data for common conversation agent testing scenarios
 * These constants provide standardized test cases for different testing needs.
 */
export const CONVERSATION_AGENT_TEST_SCENARIOS = {
  // Single agent in single conversation - simplest test case
  singleAgentSingleConversation: [
    {
      conversationTitle: "Simple Test Conversation",
      agentNames: ["Test Analyst Agent"],
    },
  ] as ConversationAgentConfig[],

  // Multiple agents in multiple conversations - complex relationships
  multipleAgentsMultipleConversations: [
    {
      conversationTitle: "Development Planning",
      agentNames: ["Technical Architect", "Product Manager"],
    },
    {
      conversationTitle: "Code Review Session",
      agentNames: ["Senior Developer", "QA Engineer"],
    },
    {
      conversationTitle: "Research Discussion",
      agentNames: ["Data Analyst", "Research Specialist"],
    },
  ] as ConversationAgentConfig[],

  // Agent reused across conversations - tests agent sharing
  agentReusedAcrossConversations: [
    {
      conversationTitle: "Project Alpha Planning",
      agentNames: ["Lead Developer", "UI Designer"],
    },
    {
      conversationTitle: "Project Beta Planning",
      agentNames: ["Lead Developer", "Backend Specialist"], // Lead Developer appears in both
    },
    {
      conversationTitle: "Cross-Project Review",
      agentNames: ["Lead Developer", "Technical Writer"], // Lead Developer appears in all three
    },
  ] as ConversationAgentConfig[],

  // Single conversation with many agents - tests UI limits
  singleConversationManyAgents: [
    {
      conversationTitle: "Team Brainstorm Session",
      agentNames: [
        "Project Manager",
        "Lead Developer",
        "UI Designer",
        "UX Researcher",
        "QA Engineer",
        "DevOps Engineer",
        "Product Owner",
        "Technical Writer",
      ],
    },
  ] as ConversationAgentConfig[],

  // Empty conversations - tests edge cases
  emptyConversations: [
    {
      conversationTitle: "Empty Conversation 1",
      agentNames: [],
    },
    {
      conversationTitle: "Empty Conversation 2",
      agentNames: [],
    },
  ] as ConversationAgentConfig[],
};

/**
 * Agent type configurations for creating different types of test agents
 */
export const AGENT_TYPE_CONFIGS = {
  analyst: {
    role: "business-analyst",
    personality: "analytical-thinker",
    systemPrompt:
      "You are a business analyst focused on data-driven insights and strategic recommendations. Analyze problems systematically and provide actionable solutions.",
  },
  technical: {
    role: "software-engineer",
    personality: "problem-solver",
    systemPrompt:
      "You are a senior software engineer with expertise in system design and best practices. Focus on technical accuracy, scalability, and maintainability.",
  },
  writer: {
    role: "content-creator",
    personality: "creative-collaborator",
    systemPrompt:
      "You are a technical writer specializing in clear communication and documentation. Transform complex concepts into accessible content.",
  },
  designer: {
    role: "ui-designer",
    personality: "creative-thinker",
    systemPrompt:
      "You are a UI/UX designer focused on user experience and visual design. Consider usability, accessibility, and aesthetic principles.",
  },
  manager: {
    role: "project-manager",
    personality: "collaborative-leader",
    systemPrompt:
      "You are an experienced project manager skilled in coordinating teams and delivering results. Focus on planning, communication, and risk management.",
  },
};

/**
 * Factory for creating test agent configurations based on type
 * Provides consistent agent data with role-appropriate defaults
 */
export const createConversationAgentTestConfig = (
  type: keyof typeof AGENT_TYPE_CONFIGS,
  nameOverride?: string,
): AgentFormData => {
  const config = AGENT_TYPE_CONFIGS[type];
  const baseAgent = createMockAgentData({
    name:
      nameOverride ||
      `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
    role: config.role,
    personality: config.personality,
    systemPrompt: config.systemPrompt,
  });

  return baseAgent;
};

/**
 * Standard agent names used across test scenarios
 * Provides consistency when referencing agents in different tests
 */
export const STANDARD_AGENT_NAMES = {
  // Technical roles
  LEAD_DEVELOPER: "Lead Developer",
  SENIOR_DEVELOPER: "Senior Developer",
  BACKEND_SPECIALIST: "Backend Specialist",
  FRONTEND_DEVELOPER: "Frontend Developer",
  DEVOPS_ENGINEER: "DevOps Engineer",

  // Design roles
  UI_DESIGNER: "UI Designer",
  UX_RESEARCHER: "UX Researcher",

  // Management roles
  PROJECT_MANAGER: "Project Manager",
  PRODUCT_MANAGER: "Product Manager",
  PRODUCT_OWNER: "Product Owner",

  // Analysis roles
  DATA_ANALYST: "Data Analyst",
  BUSINESS_ANALYST: "Business Analyst",
  RESEARCH_SPECIALIST: "Research Specialist",

  // Quality roles
  QA_ENGINEER: "QA Engineer",
  TEST_ANALYST: "Test Analyst",

  // Communication roles
  TECHNICAL_WRITER: "Technical Writer",
  CONTENT_CREATOR: "Content Creator",

  // Architecture roles
  TECHNICAL_ARCHITECT: "Technical Architect",
  SOLUTION_ARCHITECT: "Solution Architect",
} as const;

/**
 * Common test conversation titles for consistent naming
 */
export const STANDARD_CONVERSATION_TITLES = {
  PLANNING: "Planning Session",
  REVIEW: "Code Review Session",
  BRAINSTORM: "Brainstorm Session",
  STANDUP: "Daily Standup",
  RETROSPECTIVE: "Sprint Retrospective",
  ARCHITECTURE: "Architecture Discussion",
  RESEARCH: "Research Session",
  DESIGN_REVIEW: "Design Review",
  TESTING: "Testing Strategy",
  DEPLOYMENT: "Deployment Planning",
} as const;
