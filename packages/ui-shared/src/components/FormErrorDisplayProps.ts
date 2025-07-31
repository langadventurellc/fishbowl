/**
 * Props for form error display component
 *
 * @module types/ui/components/FormErrorDisplayProps
 */

export interface FormErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
}
