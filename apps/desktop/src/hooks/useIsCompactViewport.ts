import { useEffect, useState } from "react";

/**
 * Hook to detect compact viewport size for responsive UI
 * Uses 640px breakpoint to match Tailwind's 'sm' breakpoint
 *
 * In desktop apps, this helps adapt UI for narrow window sizes
 * rather than detecting mobile devices.
 *
 * @returns boolean indicating if current viewport is compact (<640px)
 */
export function useIsCompactViewport(): boolean {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const checkIsCompact = () => {
      setIsCompact(window.innerWidth < 640);
    };

    // Check initial viewport size
    checkIsCompact();

    // Add resize listener
    window.addEventListener("resize", checkIsCompact);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsCompact);
  }, []);

  return isCompact;
}
