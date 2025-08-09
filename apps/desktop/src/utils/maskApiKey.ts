/**
 * Masks an API key by showing only the first 3 and last 3 characters
 * @param apiKey - The API key to mask
 * @returns The masked API key in format "abc...xyz"
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 6) {
    return "•".repeat(8); // Return 8 dots for short or empty keys
  }

  const first3 = apiKey.slice(0, 3);
  const last3 = apiKey.slice(-3);
  return `${first3}...${last3}`;
};

/**
 * Checks if a value is a masked API key
 * @param value - The value to check
 * @returns True if the value appears to be a masked API key
 */
export const isMaskedApiKey = (value: string): boolean => {
  // Check for the pattern "abc...xyz" (3 chars + ... + 3 chars)
  const maskedPattern = /^.{3}\.{3}.{3}$/;
  const dotPattern = /^•+$/; // All dots pattern for short keys
  return maskedPattern.test(value) || dotPattern.test(value);
};
