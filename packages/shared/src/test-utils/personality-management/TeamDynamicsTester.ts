import { TeamCompatibilityResult } from "src/test-utils/personality-management/TeamCompatibilityResult";
import type { PersonalityConfiguration } from "src/types/personality";

/**
 * Helper class for testing team personality dynamics
 */

export class TeamDynamicsTester {
  /**
   * Analyze team compatibility and dynamics
   */
  static analyzeTeamCompatibility(
    teamMembers: PersonalityConfiguration[],
  ): TeamCompatibilityResult {
    const pairwiseCompatibilities =
      this.calculatePairwiseCompatibilities(teamMembers);
    const teamDynamics = this.calculateTeamDynamics(teamMembers);
    const overallCompatibility = this.calculateOverallCompatibility(
      pairwiseCompatibilities,
    );
    const recommendations = this.generateTeamRecommendations(
      teamMembers,
      teamDynamics,
    );

    return {
      overallCompatibility,
      pairwiseCompatibilities,
      teamDynamics,
      recommendations,
    };
  }

  /**
   * Calculate compatibility between all pairs of team members
   */
  private static calculatePairwiseCompatibilities(
    teamMembers: PersonalityConfiguration[],
  ) {
    const compatibilities = [];

    for (let i = 0; i < teamMembers.length; i++) {
      for (let j = i + 1; j < teamMembers.length; j++) {
        const member1 = teamMembers[i];
        const member2 = teamMembers[j];
        if (!member1 || !member2) continue;

        const compatibility = this.calculatePairCompatibility(member1, member2);
        compatibilities.push({
          member1Index: i,
          member2Index: j,
          compatibility: compatibility.score,
          strengths: compatibility.strengths,
          challenges: compatibility.challenges,
        });
      }
    }

    return compatibilities;
  }

  /**
   * Calculate compatibility between two personality profiles
   */
  private static calculatePairCompatibility(
    p1: PersonalityConfiguration,
    p2: PersonalityConfiguration,
  ) {
    const traitDifferences = {
      openness: Math.abs(p1.openness - p2.openness),
      conscientiousness: Math.abs(p1.conscientiousness - p2.conscientiousness),
      extraversion: Math.abs(p1.extraversion - p2.extraversion),
      agreeableness: Math.abs(p1.agreeableness - p2.agreeableness),
      neuroticism: Math.abs(p1.neuroticism - p2.neuroticism),
    };

    // Calculate compatibility score (lower differences = higher compatibility)
    const averageDifference =
      Object.values(traitDifferences).reduce((a, b) => a + b, 0) / 5;
    const compatibilityScore = Math.max(0, 100 - averageDifference);

    const strengths = [];
    const challenges = [];

    // Identify strengths and challenges
    if (traitDifferences.agreeableness < 20)
      strengths.push("Similar cooperation levels");
    if (traitDifferences.neuroticism < 15)
      strengths.push("Compatible stress responses");
    if (traitDifferences.openness > 30)
      strengths.push("Complementary creativity levels");

    if (traitDifferences.agreeableness > 40)
      challenges.push("Different cooperation styles");
    if (traitDifferences.neuroticism > 30)
      challenges.push("Mismatched stress tolerance");

    return {
      score: compatibilityScore,
      strengths,
      challenges,
    };
  }

  /**
   * Calculate team-level dynamics
   */
  private static calculateTeamDynamics(
    teamMembers: PersonalityConfiguration[],
  ) {
    const traits = teamMembers.map((member) => ({
      openness: member.openness,
      conscientiousness: member.conscientiousness,
      extraversion: member.extraversion,
      agreeableness: member.agreeableness,
      neuroticism: member.neuroticism,
    }));

    const diversityIndex = this.calculateDiversityIndex(traits);
    const collaborationPotential = this.calculateCollaborationPotential(traits);
    const conflictRisk = this.calculateConflictRisk(traits);
    const innovationPotential = this.calculateInnovationPotential(traits);
    const productivityPotential = this.calculateProductivityPotential(traits);

    return {
      diversityIndex,
      collaborationPotential,
      conflictRisk,
      innovationPotential,
      productivityPotential,
    };
  }

  /**
   * Calculate trait diversity within team
   */
  private static calculateDiversityIndex(
    traits: Array<{
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    }>,
  ): number {
    const traitNames = [
      "openness",
      "conscientiousness",
      "extraversion",
      "agreeableness",
      "neuroticism",
    ] as const;
    let totalVariance = 0;

    for (const traitName of traitNames) {
      const values = traits.map((t) => t[traitName]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        values.length;
      totalVariance += variance;
    }

    const averageVariance = totalVariance / traitNames.length;
    return Math.min(100, averageVariance); // Higher variance = higher diversity
  }

  /**
   * Calculate team collaboration potential
   */
  private static calculateCollaborationPotential(
    traits: Array<{
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    }>,
  ): number {
    const avgAgreeableness =
      traits.reduce((sum, t) => sum + t.agreeableness, 0) / traits.length;
    const avgExtraversion =
      traits.reduce((sum, t) => sum + t.extraversion, 0) / traits.length;
    const avgNeuroticism =
      traits.reduce((sum, t) => sum + t.neuroticism, 0) / traits.length;

    // Higher agreeableness and extraversion, lower neuroticism = better collaboration
    return (avgAgreeableness + avgExtraversion + (100 - avgNeuroticism)) / 3;
  }

  /**
   * Calculate conflict risk for team
   */
  private static calculateConflictRisk(
    traits: Array<{
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    }>,
  ): number {
    const avgAgreeableness =
      traits.reduce((sum, t) => sum + t.agreeableness, 0) / traits.length;
    const avgNeuroticism =
      traits.reduce((sum, t) => sum + t.neuroticism, 0) / traits.length;
    const lowAgreeablenessCount = traits.filter(
      (t) => t.agreeableness < 40,
    ).length;

    let risk = avgNeuroticism; // Base risk from team stress level
    risk += 100 - avgAgreeableness; // Higher risk with lower agreeableness
    risk += lowAgreeablenessCount * 10; // Additional risk for each low-agreeableness member

    return Math.min(100, risk);
  }

  /**
   * Calculate innovation potential for team
   */
  private static calculateInnovationPotential(
    traits: Array<{
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    }>,
  ): number {
    const avgOpenness =
      traits.reduce((sum, t) => sum + t.openness, 0) / traits.length;
    const opennessVariance = this.calculateVariance(
      traits.map((t) => t.openness),
    );

    // High average openness + some diversity in openness = good innovation
    return Math.min(100, avgOpenness + Math.min(20, opennessVariance / 2));
  }

  /**
   * Calculate productivity potential for team
   */
  private static calculateProductivityPotential(
    traits: Array<{
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    }>,
  ): number {
    const avgConscientiousness =
      traits.reduce((sum, t) => sum + t.conscientiousness, 0) / traits.length;
    const avgNeuroticism =
      traits.reduce((sum, t) => sum + t.neuroticism, 0) / traits.length;

    // High conscientiousness, low neuroticism = good productivity
    return (avgConscientiousness + (100 - avgNeuroticism)) / 2;
  }

  /**
   * Calculate variance for array of numbers
   */
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return (
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length
    );
  }

  /**
   * Calculate overall team compatibility
   */
  private static calculateOverallCompatibility(
    pairwiseCompatibilities: Array<{ compatibility: number }>,
  ): number {
    if (pairwiseCompatibilities.length === 0) return 100;
    return (
      pairwiseCompatibilities.reduce(
        (sum, pair) => sum + pair.compatibility,
        0,
      ) / pairwiseCompatibilities.length
    );
  }

  /**
   * Generate recommendations for team improvement
   */
  private static generateTeamRecommendations(
    teamMembers: PersonalityConfiguration[],
    dynamics: TeamCompatibilityResult["teamDynamics"],
  ): string[] {
    const recommendations: string[] = [];

    const avgAgreeableness =
      teamMembers.reduce((sum, m) => sum + m.agreeableness, 0) /
      teamMembers.length;
    const avgNeuroticism =
      teamMembers.reduce((sum, m) => sum + m.neuroticism, 0) /
      teamMembers.length;
    const avgOpenness =
      teamMembers.reduce((sum, m) => sum + m.openness, 0) / teamMembers.length;

    if (avgAgreeableness < 50) {
      recommendations.push(
        "Consider adding team members with higher agreeableness for better cooperation",
      );
    }

    if (avgNeuroticism > 60) {
      recommendations.push(
        "Include emotionally stable members to balance team stress levels",
      );
    }

    if (avgOpenness < 50) {
      recommendations.push(
        "Add creative, open-minded members to enhance innovation potential",
      );
    }

    if (dynamics.diversityIndex < 30) {
      recommendations.push(
        "Increase personality diversity for better team performance",
      );
    }

    return recommendations;
  }
}
