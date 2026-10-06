import type { ScreenState, StepConfiguration, TemplateAction } from '../types';

export interface StepperFlowTemplateProps {
  title?: string;
  steps: readonly StepConfiguration[];
  currentStep: number;
  onNext: () => void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  onStepPress?: (index: number, step: StepConfiguration) => void;
  canContinue?: boolean;
  loading?: boolean;
  state?: ScreenState;
  continueLabel?: string;
  previousLabel?: string;
  saveAndExitLabel?: string;
  nextAction?: Partial<TemplateAction>;
  testID?: string;
}
