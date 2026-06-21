import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from '../../components/Text';
import { renderWithTheme } from '../../../../tests/test-utils';
import { StepperFlowTemplate } from './StepperFlowTemplate';

describe('StepperFlowTemplate', () => {
  it('renders active step and forwards navigation', () => {
    const next = jest.fn();
    renderWithTheme(
      <StepperFlowTemplate
        currentStep={0}
        steps={[
          { id: 'one', title: 'Identity', content: <Text>Identity content</Text> },
          { id: 'two', title: 'Review', content: <Text>Review content</Text> },
        ]}
        onNext={next}
      />,
    );
    expect(screen.getByText('Identity content')).toBeTruthy();
    expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(1);
    fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(next).toHaveBeenCalledTimes(1);
  });
});
