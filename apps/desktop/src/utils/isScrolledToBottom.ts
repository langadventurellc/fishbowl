/**
 * Determines if an HTML element is scrolled to bottom using scroll math
 *
 * @param element - The HTML element to check scroll position for
 * @param threshold - Distance in pixels from bottom to still consider "scrolled to bottom" (default: 100)
 * @returns true if element is scrolled to within threshold pixels of the bottom
 */
export function isScrolledToBottom(
  element: HTMLElement,
  threshold: number = 100,
): boolean {
  const { scrollHeight, scrollTop, clientHeight } = element;

  // Calculate remaining scroll distance to bottom
  const remainingScroll = scrollHeight - scrollTop - clientHeight;

  // Consider "scrolled to bottom" if within threshold
  return remainingScroll <= threshold;
}
