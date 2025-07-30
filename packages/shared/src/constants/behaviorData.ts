/**
 * Behavior data constants for personality creation.
 *
 * Defines the standard behavior groups and traits used across the application.
 *
 * @module constants/behaviorData
 */

import type { BehaviorGroup } from "../types/ui/settings/BehaviorGroup";

export const BEHAVIOR_GROUPS: BehaviorGroup[] = [
  {
    title: "Communication Style",
    behaviors: [
      {
        key: "formalityLevel",
        label: "Formality Level",
        description: "How formal or casual the communication style is",
      },
      {
        key: "verbosity",
        label: "Verbosity",
        description: "Amount of detail and explanation provided",
      },
      {
        key: "enthusiasm",
        label: "Enthusiasm",
        description: "Energy and excitement level in responses",
      },
      {
        key: "directness",
        label: "Directness",
        description: "How straightforward and to-the-point responses are",
      },
    ],
  },
  {
    title: "Interaction Approach",
    behaviors: [
      {
        key: "helpfulness",
        label: "Helpfulness",
        description: "Willingness to assist and provide support",
      },
      {
        key: "patience",
        label: "Patience",
        description: "Tolerance for complex or repeated questions",
      },
      {
        key: "curiosity",
        label: "Curiosity",
        description:
          "Interest in exploring ideas and asking follow-up questions",
      },
      {
        key: "empathy",
        label: "Empathy",
        description: "Understanding and consideration for others' perspectives",
      },
    ],
  },
  {
    title: "Reasoning Style",
    behaviors: [
      {
        key: "analyticalThinking",
        label: "Analytical Thinking",
        description: "Systematic and logical approach to problems",
      },
      {
        key: "creativity",
        label: "Creativity",
        description: "Innovative and imaginative problem-solving",
      },
      {
        key: "cautionLevel",
        label: "Caution Level",
        description: "Carefulness and consideration of risks",
      },
    ],
  },
  {
    title: "Response Characteristics",
    behaviors: [
      {
        key: "detailLevel",
        label: "Detail Level",
        description: "Depth and comprehensiveness of responses",
      },
      {
        key: "questionAsking",
        label: "Question Asking",
        description: "Tendency to ask clarifying questions",
      },
      {
        key: "exampleUsage",
        label: "Example Usage",
        description: "Frequency of providing concrete examples",
      },
    ],
  },
];
