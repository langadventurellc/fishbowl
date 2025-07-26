/**
 * @fileoverview Result interface for trait interaction validation
 */

import type { TraitInteractionWarning } from "./trait-interaction-warning";
import type { TraitInteractionError } from "./trait-interaction-error";

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
