import { useEffect, useState } from "react";

/**
 * Hook to detect mobile device based on viewport width
 * Uses 640px breakpoint to match Tailwind's 'sm' breakpoint
 *
 * @returns boolean indicating if current viewport is mobile (<640px)
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Check initial viewport size
    checkIsMobile();

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}
