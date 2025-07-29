/**
 * BehaviorTrait interface for personality behavior configuration.
 *
 * Defines the structure for individual behavior traits used in personality creation.
 *
 * @module types/settings/BehaviorTrait
 */

export interface BehaviorTrait {
  /** Unique identifier for the behavior trait */
  key: string;
  /** Display label for the behavior trait */
  label: string;
  /** Descriptive text explaining what the behavior trait controls */
  description: string;
}
