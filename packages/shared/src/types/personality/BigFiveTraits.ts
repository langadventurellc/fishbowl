/**
 * Big Five personality traits (0-100 integer values)
 */
export interface BigFiveTraits {
  /** Creativity and willingness to explore new ideas (0-100) */
  openness: number;
  /** Attention to detail and methodical approach (0-100) */
  conscientiousness: number;
  /** Verbosity and enthusiasm in responses (0-100) */
  extraversion: number;
  /** Supportiveness versus critical analysis (0-100) */
  agreeableness: number;
  /** Confidence versus cautiousness in responses (0-100) */
  neuroticism: number;
}
