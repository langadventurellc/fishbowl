/**
 * Big Five personality trait values (0-100 range) for UI components
 *
 * @module types/settings/BigFiveTraitsViewModel
 */
export interface BigFiveTraitsViewModel {
  /** Openness to experience (0-100) */
  openness: number;
  /** Conscientiousness (0-100) */
  conscientiousness: number;
  /** Extraversion (0-100) */
  extraversion: number;
  /** Agreeableness (0-100) */
  agreeableness: number;
  /** Neuroticism (0-100) */
  neuroticism: number;
}
