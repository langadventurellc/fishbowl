/**
 * SavedPersonalitiesTab component displays saved personalities with edit/clone actions.
 *
 * Features:
 * - Grid layout of personality cards
 * - Big Five trait preview in compact format
 * - Edit and Clone buttons with accessibility
 * - Empty state for no saved personalities
 * - Responsive design across screen sizes
 *
 * @module components/settings/SavedPersonalitiesTab
 */

import type {
  Personality,
  SavedPersonalitiesTabProps,
} from "@fishbowl-ai/ui-shared";
import { User } from "lucide-react";
import React from "react";
import { PersonalityCard } from "./PersonalityCard";

export const SavedPersonalitiesTab: React.FC<SavedPersonalitiesTabProps> = ({
  onEdit,
  onClone,
}) => {
  // Mock data for UI evaluation - will be replaced with actual store data
  const personalities: Personality[] = [
    {
      id: "analytical-researcher",
      name: "Analytical Researcher",
      bigFive: {
        openness: 85,
        conscientiousness: 90,
        extraversion: 35,
        agreeableness: 70,
        neuroticism: 25,
      },
      behaviors: {
        creativity: 80,
        skepticism: 85,
        formality: 75,
        enthusiasm: 40,
        verbosity: 60,
        empathy: 65,
        assertiveness: 55,
        patience: 80,
        curiosity: 95,
        humor: 30,
        optimism: 60,
        detailOrientation: 95,
        adaptability: 50,
        riskTaking: 25,
      },
      customInstructions:
        "Focus on data-driven analysis and thorough research. Ask probing questions and verify claims with evidence.",
    },
    {
      id: "creative-brainstormer",
      name: "Creative Brainstormer",
      bigFive: {
        openness: 95,
        conscientiousness: 45,
        extraversion: 80,
        agreeableness: 85,
        neuroticism: 40,
      },
      behaviors: {
        creativity: 95,
        skepticism: 30,
        formality: 25,
        enthusiasm: 90,
        verbosity: 75,
        empathy: 80,
        assertiveness: 70,
        patience: 50,
        curiosity: 85,
        humor: 85,
        optimism: 90,
        detailOrientation: 35,
        adaptability: 85,
        riskTaking: 80,
      },
      customInstructions:
        "Generate wild ideas and think outside the box. Encourage experimentation and celebrate unconventional approaches.",
    },
    {
      id: "diplomatic-mediator",
      name: "Diplomatic Mediator",
      bigFive: {
        openness: 70,
        conscientiousness: 80,
        extraversion: 65,
        agreeableness: 95,
        neuroticism: 20,
      },
      behaviors: {
        creativity: 60,
        skepticism: 45,
        formality: 70,
        enthusiasm: 65,
        verbosity: 70,
        empathy: 95,
        assertiveness: 45,
        patience: 90,
        curiosity: 75,
        humor: 60,
        optimism: 80,
        detailOrientation: 75,
        adaptability: 85,
        riskTaking: 40,
      },
      customInstructions:
        "Seek common ground and help resolve conflicts. Focus on understanding all perspectives before suggesting solutions.",
    },
    {
      id: "pragmatic-executor",
      name: "Pragmatic Executor",
      bigFive: {
        openness: 55,
        conscientiousness: 95,
        extraversion: 60,
        agreeableness: 65,
        neuroticism: 30,
      },
      behaviors: {
        creativity: 45,
        skepticism: 70,
        formality: 80,
        enthusiasm: 55,
        verbosity: 50,
        empathy: 60,
        assertiveness: 75,
        patience: 60,
        curiosity: 65,
        humor: 40,
        optimism: 70,
        detailOrientation: 90,
        adaptability: 60,
        riskTaking: 35,
      },
      customInstructions:
        "Focus on practical solutions and actionable steps. Prioritize efficiency and clear implementation plans.",
    },
    {
      id: "enthusiastic-mentor",
      name: "Enthusiastic Mentor",
      bigFive: {
        openness: 80,
        conscientiousness: 75,
        extraversion: 90,
        agreeableness: 90,
        neuroticism: 25,
      },
      behaviors: {
        creativity: 70,
        skepticism: 35,
        formality: 40,
        enthusiasm: 95,
        verbosity: 80,
        empathy: 90,
        assertiveness: 60,
        patience: 85,
        curiosity: 80,
        humor: 75,
        optimism: 95,
        detailOrientation: 65,
        adaptability: 80,
        riskTaking: 60,
      },
      customInstructions:
        "Encourage learning and growth. Provide positive reinforcement and break down complex topics into digestible pieces.",
    },
  ];
  const isLoading = false; // Will be connected to actual loading state

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 space-y-3 animate-pulse"
          >
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="flex justify-end gap-2 mt-4">
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (personalities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No personalities saved</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          Create your first personality to customize how agents behave and
          respond in conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {personalities.map((personality) => (
          <PersonalityCard
            key={personality.id}
            personality={personality}
            onEdit={onEdit}
            onClone={onClone}
          />
        ))}
      </div>
    </div>
  );
};
