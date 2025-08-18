export interface MockPersonalityData {
  name: string;
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  behaviors: {
    analytical: number;
    empathetic: number;
    decisive: number;
    curious: number;
    patient: number;
    humorous: number;
    formal: number;
    optimistic: number;
    cautious: number;
    creative: number;
    logical: number;
    supportive: number;
    direct: number;
    enthusiastic: number;
  };
  customInstructions: string;
}
