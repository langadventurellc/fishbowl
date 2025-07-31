/**
 * @fileoverview String Sanitization Utility
 *
 * Provides string sanitization for XSS prevention and whitespace normalization.
 * Used by validation schemas to clean user input before storage.
 */

/**
 * Input sanitization transform for string fields
 *
 * Provides basic XSS prevention and whitespace normalization:
 * - Trims leading/trailing whitespace
 * - Removes HTML-like angle brackets to prevent basic XSS attacks
 * - Normalizes multiple consecutive whitespace characters to single spaces
 *
 * @param str - Input string to sanitize
 * @returns Sanitized string safe for storage and display
 *
 * @example
 * ```typescript
 * sanitizeString("  Hello<script>alert('xss')</script>World  ")
 * // Returns: "Helloscriptalert('xss')/scriptWorld"
 *
 * sanitizeString("Multiple   spaces   here")
 * // Returns: "Multiple spaces here"
 * ```
 */
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, "") // Basic XSS prevention - remove HTML tags
    .replace(/\s+/g, " "); // Normalize multiple whitespace to single space
};
