/**
 * Props interface for BigFiveSliders component
 *
 * @module types/settings/BigFiveSlidersProps
 */

import type { BigFiveTraits } from "./BigFiveTraits";

export interface BigFiveSlidersProps {
  values: BigFiveTraits;
  onChange: (trait: keyof BigFiveTraits, value: number) => void;
  disabled?: boolean;
  className?: string;
}
