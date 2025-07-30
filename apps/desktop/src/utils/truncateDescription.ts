/**
 * Truncates description text at word boundaries for clean display
 *
 * @param description - The full description text
 * @param maxLength - Maximum character length (default: 100)
 * @returns Truncated description with ellipsis if needed
 */
export function truncateDescription(
  description: string,
  maxLength = 100,
): string {
  if (description.length <= maxLength) {
    return description;
  }

  // Find a good break point near the threshold (prefer word boundaries)
  const truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const breakPoint =
    lastSpaceIndex > maxLength * 0.8 ? lastSpaceIndex : maxLength;

  return description.substring(0, breakPoint).trim() + "...";
}
