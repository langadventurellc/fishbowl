import { TraitInteractionError } from "./TraitInteractionError";
import { TraitInteractionWarning } from "./TraitInteractionWarning";

/**
 * Result from trait interaction validation
 */

export interface TraitInteractionValidationResult {
  isValid: boolean;
  validationScore: number;
  warnings: TraitInteractionWarning[];
  errors: TraitInteractionError[];
  psychologicalCoherenceScore: number;
  statisticalProbability: number;
  recommendations: string[];
}
