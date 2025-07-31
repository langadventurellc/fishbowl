/**
 * Props interface for BigFiveSliders component
 *
 * @module types/ui/settings/BigFiveSlidersProps
 */

import type { BigFiveTraitsViewModel } from "./BigFiveTraitsViewModel";

export interface BigFiveSlidersProps {
  values: BigFiveTraitsViewModel;
  onChange: (trait: keyof BigFiveTraitsViewModel, value: number) => void;
  disabled?: boolean;
  className?: string;
}
