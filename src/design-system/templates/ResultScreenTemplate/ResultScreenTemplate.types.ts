import type { ResultDetail, ResultStatus, ScreenState, TemplateAction } from '../types';

export interface ResultScreenTemplateProps {
  status: ResultStatus;
  title: string;
  description?: string;
  referenceNumber?: string;
  dateTime?: string;
  details?: readonly ResultDetail[];
  primaryAction?: TemplateAction;
  secondaryAction?: TemplateAction;
  shareAction?: TemplateAction;
  downloadAction?: TemplateAction;
  state?: ScreenState;
  onBack?: () => void;
  testID?: string;
}
