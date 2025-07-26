/**
 * Team compatibility analysis result
 */

export interface TeamCompatibilityResult {
  overallCompatibility: number;
  pairwiseCompatibilities: Array<{
    member1Index: number;
    member2Index: number;
    compatibility: number;
    strengths: string[];
    challenges: string[];
  }>;
  teamDynamics: {
    diversityIndex: number;
    collaborationPotential: number;
    conflictRisk: number;
    innovationPotential: number;
    productivityPotential: number;
  };
  recommendations: string[];
}
