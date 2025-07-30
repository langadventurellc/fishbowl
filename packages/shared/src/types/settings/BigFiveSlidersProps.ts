/**
 * Props interface for BigFiveSliders component
 *
 * @module types/settings/BigFiveSlidersProps
 */

import type { BigFiveTraitsViewModel } from "./BigFiveTraits";

export interface BigFiveSlidersProps {
  values: BigFiveTraitsViewModel;
  onChange: (trait: keyof BigFiveTraitsViewModel, value: number) => void;
  disabled?: boolean;
  className?: string;
}
