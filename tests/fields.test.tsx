import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import {
  ActionText,
  AmountInput,
  BoxGroup,
  CheckboxGroup,
  FileInput,
  Form,
  Heading,
  PhoneInput,
  Slider,
  SwatchGroup,
  formatAmount,
  formatFileSize,
  groupAmountText,
  isValidPhone,
  normalizeDigits,
  parseAmount,
  sanitizeAmountText,
  toE164,
} from '../src';
import { renderWithTheme } from './test-utils';

describe('number utilities', () => {
  it('normalises Arabic-Indic digits and sanitises amounts', () => {
    expect(normalizeDigits('١٢٣٫٤٥')).toBe('123.45');
    expect(sanitizeAmountText('00012,500.759')).toBe('12500.75');
    expect(sanitizeAmountText('.5')).toBe('0.5');
    expect(sanitizeAmountText('12.3.4', { decimals: 3 })).toBe('12.34');
    expect(sanitizeAmountText('99.9', { decimals: 0 })).toBe('99');
    expect(groupAmountText('1234567.5')).toBe('1,234,567.5');
    expect(parseAmount('1,234.50')).toBe(1234.5);
    expect(parseAmount('')).toBeNull();
    expect(formatAmount(1234.5)).toBe('1,234.50');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});

describe('inputs', () => {
  it('AmountInput groups thousands and reports a number', () => {
    const onChangeValue = jest.fn();
    renderWithTheme(<AmountInput accessibilityLabel="Amount" currency="SAR" onChangeValue={onChangeValue} />);
    fireEvent.changeText(screen.getByLabelText('Amount'), '١٢٥٠٠.٥');
    expect(onChangeValue).toHaveBeenLastCalledWith(12500.5);
    expect(screen.getByLabelText('Amount').props.value).toBe('12,500.5');
    expect(screen.getByText('SAR')).toBeTruthy();
  });

  it('PhoneInput strips the leading zero and builds E.164', () => {
    const onChange = jest.fn();
    renderWithTheme(<PhoneInput accessibilityLabel="Mobile" onChange={onChange} showFlag={false} />);
    fireEvent.changeText(screen.getByLabelText('Mobile'), '0512 345 678');
    expect(onChange).toHaveBeenLastCalledWith({ country: 'SA', number: '512345678' });
    expect(toE164({ country: 'SA', number: '512345678' })).toBe('+966512345678');
    expect(isValidPhone({ country: 'SA', number: '512345678' })).toBe(true);
    expect(isValidPhone({ country: 'SA', number: '5123' })).toBe(false);
    expect(screen.getByRole('button', { name: 'Country code' })).toBeTruthy();
  });

  it('FileInput uses the picker, enforces maxSize and removes files', async () => {
    const onChange = jest.fn();
    const onReject = jest.fn();
    const pickFile = jest.fn().mockResolvedValue([
      { uri: 'file://a.pdf', name: 'a.pdf', size: 1000, type: 'application/pdf' },
      { uri: 'file://b.pdf', name: 'b.pdf', size: 9_000_000, type: 'application/pdf' },
    ]);
    const view = renderWithTheme(<FileInput multiple maxSize={5_000_000} pickFile={pickFile} onChange={onChange} onReject={onReject} title="Upload" />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Upload' }));
    });
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.pdf' })]);
    expect(onReject).toHaveBeenCalledWith([{ file: expect.objectContaining({ name: 'b.pdf' }), reason: 'maxSize' }]);
    view.unmount();
    renderWithTheme(<FileInput multiple value={[{ uri: 'file://a.pdf', name: 'a.pdf', size: 1000 }]} pickFile={pickFile} onChange={onChange} />);
    fireEvent.press(screen.getByRole('button', { name: 'Remove a.pdf' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('choice groups', () => {
  it('CheckboxGroup supports select all', () => {
    const onChange = jest.fn();
    renderWithTheme(<CheckboxGroup selectAllLabel="All" value={['a']} onChange={onChange} options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />);
    expect(screen.getByRole('checkbox', { name: 'All' }).props.accessibilityState).toEqual(expect.objectContaining({ checked: 'mixed' }));
    fireEvent.press(screen.getByRole('checkbox', { name: 'All' }));
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
  });

  it('BoxGroup multiple toggles values', () => {
    const onChange = jest.fn();
    renderWithTheme(<BoxGroup multiple value={['x']} onChange={onChange} options={[{ value: 'x', title: 'X', icon: 'user' }, { value: 'y', title: 'Y' }]} />);
    fireEvent.press(screen.getByRole('checkbox', { name: 'Y' }));
    expect(onChange).toHaveBeenLastCalledWith(['x', 'y']);
  });

  it('SwatchGroup selects a colour', () => {
    const onChange = jest.fn();
    renderWithTheme(<SwatchGroup value="#2563EB" onChange={onChange} options={['#2563EB', { color: '#16A34A', label: 'Green' }]} />);
    fireEvent.press(screen.getByRole('radio', { name: 'Green' }));
    expect(onChange).toHaveBeenCalledWith('#16A34A');
  });

  it('Slider responds to accessibility increment / decrement', () => {
    const onChange = jest.fn();
    renderWithTheme(<Slider label="Level" value={3} min={1} max={5} onChange={onChange} />);
    const slider = screen.getByRole('adjustable');
    fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(slider.props.accessibilityValue).toEqual(expect.objectContaining({ min: 1, max: 5 }));
  });

  it('ActionText runs its action', () => {
    const onPress = jest.fn();
    renderWithTheme(<ActionText text="No account?" actionText="Sign up" onPress={onPress} />);
    fireEvent.press(screen.getByRole('link', { name: 'Sign up' }));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('Form with the extended field types', () => {
  it('renders React elements, repeated controls, progress and submits OTP on complete', async () => {
    const onSubmit = jest.fn();
    renderWithTheme(
      <Form
        initialValues={{ beneficiaries: [{ iban: '' }], code: '', name: '' }}
        onSubmit={onSubmit}
        submitButton={false}
        fields={[
          <Heading key="h" level={4}>Transfer</Heading>,
          { type: 'TextInput', name: 'name', label: 'Name' },
          { type: 'Progress', label: 'Completion', value: values => (values.name ? 1 : 0.5) },
          {
            type: 'RepeatedControls',
            name: 'beneficiaries',
            max: 2,
            addText: 'Add beneficiary',
            itemLabel: index => `Beneficiary ${index + 1}`,
            newItem: { iban: '' },
            fields: [{ type: 'Input', name: 'iban', label: 'IBAN' }],
          },
          { type: 'OTP', name: 'code', label: 'Code', length: 4, submitOnComplete: true },
        ]}
      />,
    );
    expect(screen.getByText('Transfer')).toBeTruthy();
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual(expect.objectContaining({ now: 50 }));

    fireEvent.press(screen.getByRole('button', { name: 'Add beneficiary' }));
    expect(await screen.findByText('Beneficiary 2')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add beneficiary' })).toBeNull(); // max reached
    fireEvent.changeText(screen.getAllByLabelText('IBAN')[1]!, 'SA03');
    fireEvent.press(screen.getByRole('button', { name: 'Remove Beneficiary 1' }));
    await waitFor(() => expect(screen.queryByText('Beneficiary 2')).toBeNull());
    expect(screen.getAllByLabelText('IBAN')[0]!.props.value).toBe('SA03');

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('Verification code input'), '1234');
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual(expect.objectContaining({ code: '1234', beneficiaries: [{ iban: 'SA03' }] }));
  });

  it('accepts the alias names TextInput / Picker / Toggle', async () => {
    const onSubmit = jest.fn();
    renderWithTheme(
      <Form
        initialValues={{ name: '', alerts: false }}
        onSubmit={onSubmit}
        fields={[
          { type: 'TextInput', name: 'name', label: 'Name' },
          { type: 'Toggle', name: 'alerts', label: 'Alerts' },
        ]}
      />,
    );
    fireEvent.changeText(screen.getByLabelText('Name'), 'Sara');
    fireEvent(screen.getByRole('switch'), 'valueChange', true);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Submit' }));
    });
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ name: 'Sara', alerts: true });
  });
});
