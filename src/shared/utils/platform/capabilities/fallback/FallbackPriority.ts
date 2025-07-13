/**
 * Priority levels for fallback strategy execution.
 * Higher numbers indicate higher priority (executed first).
 */

export enum FallbackPriority {
  LOWEST = 1,
  LOW = 25,
  MEDIUM = 50,
  MEDIUM_HIGH = 60,
  HIGH = 70,
  VERY_HIGH = 75,
  HIGHEST = 100,
}
