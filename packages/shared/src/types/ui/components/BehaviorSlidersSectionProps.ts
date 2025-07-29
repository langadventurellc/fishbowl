/**
 * BehaviorSlidersSection component props interface.
 *
 * Defines the properties for the BehaviorSlidersSection component which provides
 * collapsible behavior trait sliders for personality creation.
 *
 * @module types/ui/components/BehaviorSlidersSectionProps
 */

export interface BehaviorSlidersSectionProps {
  /** Current values for behavior traits (behavior key -> value) */
  values: Record<string, number>;
  /** Callback when a behavior value changes */
  onChange: (behavior: string, value: number) => void;
  /** Whether the sliders are disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}
