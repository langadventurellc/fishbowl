/**
 * Announces content to screen readers via live region updates
 * Creates or finds live region elements and updates them with messages
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  // Find or create live region for the specified priority
  let liveRegion = document.getElementById(`aria-live-${priority}`);

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = `aria-live-${priority}`;
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className =
      "sr-only absolute -m-px h-px w-px overflow-hidden border-0 p-0";
    document.body.appendChild(liveRegion);
  }

  // Clear existing content and set new message with slight delay for screen readers
  liveRegion.textContent = "";
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 100);
}
