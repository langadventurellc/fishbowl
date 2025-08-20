import type { PersonalityBehaviors } from "./PersonalityBehaviors";

/**
 * Core agent configuration interface.
 * Represents an AI agent with personality, role, and configuration settings.
 */
export interface Agent {
  id: string;
  name: string;
  description?: string;
  role?: string;
  personality?: string;
  model?: string;
  systemPrompt?: string;
  personalityBehaviors?: PersonalityBehaviors;
  createdAt?: string;
  updatedAt?: string;
}
