import type { ScreenState, FormSection, TemplateAction, ValidationMessage } from '../types';

export interface FormScreenTemplateProps {
  title: string;
  subtitle?: string;
  sections: readonly FormSection[];
  submitLabel: string;
  onSubmit: () => void;
  secondaryAction?: TemplateAction;
  validationSummary?: readonly ValidationMessage[];
  unsavedChanges?: boolean;
  unsavedChangesMessage?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  state?: ScreenState;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  requiredLabel?: string;
  testID?: string;
}
