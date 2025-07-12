import { z } from 'zod';

/**
 * Zod schema for theme values
 */
export const ThemeSchema = z.enum(['light', 'dark', 'system']);
