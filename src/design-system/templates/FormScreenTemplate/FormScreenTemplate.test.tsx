import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { InputField } from '../../components/InputField';
import { renderWithTheme } from '../../../../tests/test-utils';
import { FormScreenTemplate } from './FormScreenTemplate';

describe('FormScreenTemplate', () => {
  it('renders form sections and submits', () => {
    const submit = jest.fn();
    renderWithTheme(
      <FormScreenTemplate
        title="Profile"
        sections={[{
          id: 'profile',
          title: 'Details',
          content: (
            <InputField
              label="Name"
              value=""
              onChangeText={() => undefined}
            />
          ),
        }]}
        submitLabel="Save"
        onSubmit={submit}
      />,
    );
    expect(screen.getByText('Details')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('announces validation errors', () => {
    renderWithTheme(
      <FormScreenTemplate
        title="Profile"
        sections={[]}
        validationSummary={[{ id: 'name', message: 'Name is required' }]}
        submitLabel="Save"
        onSubmit={jest.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
