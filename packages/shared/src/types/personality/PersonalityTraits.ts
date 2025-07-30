/**
 * Base personality traits interface with Big Five model and behavioral traits
 */
export interface PersonalityTraits {
  // Big Five Personality Factors
  openness: number; // 0-100: Openness to Experience
  conscientiousness: number; // 0-100: Conscientiousness
  extraversion: number; // 0-100: Extraversion
  agreeableness: number; // 0-100: Agreeableness
  neuroticism: number; // 0-100: Neuroticism

  // 14 Behavioral Traits
  formality?: number; // 0-100: Level of formality in communication
  humor?: number; // 0-100: Use of humor and playfulness
  assertiveness?: number; // 0-100: Assertiveness in interactions
  empathy?: number; // 0-100: Empathy and emotional sensitivity
  storytelling?: number; // 0-100: Narrative and storytelling tendency
  brevity?: number; // 0-100: Preference for concise communication
  imagination?: number; // 0-100: Creative and imaginative thinking
  playfulness?: number; // 0-100: Playful and spontaneous behavior
  dramaticism?: number; // 0-100: Dramatic expression and flair
  analyticalDepth?: number; // 0-100: Depth of analytical thinking
  contrarianism?: number; // 0-100: Tendency to challenge conventional views
  encouragement?: number; // 0-100: Supportive and encouraging behavior
  curiosity?: number; // 0-100: Intellectual curiosity and questioning
  patience?: number; // 0-100: Patience and tolerance in interactions
}
