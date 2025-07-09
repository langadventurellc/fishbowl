import { sanitizeString } from './sanitizeString';

/**
 * Validate and sanitize any input value
 */
export const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const sanitizedKey = sanitizeString(key);
      // If sanitized key already exists, append a counter to avoid overwriting
      let finalKey = sanitizedKey;
      let counter = 1;
      while (finalKey in sanitized) {
        finalKey = `${sanitizedKey}_${counter}`;
        counter++;
      }
      sanitized[finalKey] = sanitizeValue(val);
    }
    return sanitized;
  }

  return value;
};
