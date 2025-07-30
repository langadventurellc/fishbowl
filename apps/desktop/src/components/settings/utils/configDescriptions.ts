export const getTemperatureDescription = (temperature: number): string => {
  if (temperature < 0.3) return "Very focused and deterministic responses";
  if (temperature < 0.7) return "Balanced creativity and consistency";
  if (temperature < 1.2) return "Creative and varied responses";
  if (temperature < 1.7) return "Highly creative responses";
  return "Maximum creativity and unpredictability";
};

export const getTopPDescription = (topP: number): string => {
  if (topP < 0.3) return "Very focused token selection";
  if (topP < 0.7) return "Balanced token diversity";
  if (topP < 0.9) return "High token diversity";
  return "Maximum token variety";
};

export const getMaxTokensDescription = (maxTokens: number): string => {
  const words = Math.round(maxTokens * 0.75);
  if (maxTokens < 500) return `Short responses (~${words} words)`;
  if (maxTokens < 1500) return `Medium responses (~${words} words)`;
  if (maxTokens < 3000) return `Long responses (~${words} words)`;
  return `Very long responses (~${words} words)`;
};
