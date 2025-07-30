export interface ConfigurationSliderProps {
  label: string;
  value: number;
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  description: string;
  tooltip: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}
