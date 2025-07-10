export const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
};
