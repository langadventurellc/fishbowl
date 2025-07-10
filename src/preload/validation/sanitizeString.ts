/**
 * Sanitize string input to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/<\/?(?:script|iframe|object|embed|meta|link|style)[^>]*>/gi, '') // Remove opening/closing tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]*/gi, '')
    .trim();
};
