/**
 * @fileoverview Warning interface for trait interactions
 */

/**
 * Warning about trait interactions
 */
export interface TraitInteractionWarning {
  type:
    | "statistical_improbability"
    | "psychological_inconsistency"
    | "cultural_sensitivity"
    | "developmental_mismatch";
  severity: "low" | "medium" | "high";
  message: string;
  affectedTraits: string[];
  suggestedAction: string;
  researchBasis?: string;
}
