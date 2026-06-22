import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../Button';
import { Line } from '../Line';
import { Text } from '../Text';
import { renderWithTheme } from '../../../../tests/test-utils';
import { Card, type CardVariant } from './index';

const variants: readonly CardVariant[] = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'elevated',
  'ghost',
  'success',
  'warning',
  'error',
];

describe('Card', () => {
  it.each(variants)('renders the %s variant', variant => {
    renderWithTheme(
      <Card
        testID={`card-${variant}`}
        variant={variant}
        title={`${variant} card`}
      />,
    );
    expect(screen.getByTestId(`card-${variant}`)).toBeTruthy();
    expect(screen.getByText(`${variant} card`)).toBeTruthy();
  });

  it('renders explicit metadata and complex child content', () => {
    renderWithTheme(
      <Card
        title="Savings account"
        subtitle="Main account"
        description="View your balance and activity"
        showDivider
      >
        <Line
          leftText={{ text1: 'Available balance' }}
          rightText={{ text1: '15,000 SAR' }}
        />
      </Card>,
    );

    expect(screen.getByText('Savings account')).toBeTruthy();
    expect(screen.getByText('Main account')).toBeTruthy();
    expect(screen.getByText('View your balance and activity')).toBeTruthy();
    expect(screen.getByText('15,000 SAR')).toBeTruthy();
  });

  it('supports pressable, disabled, selected, and loading states', () => {
    const onPress = jest.fn();
    const selectedView = renderWithTheme(
      <Card
        testID="interactive-card"
        title="Credit cards"
        onPress={onPress}
        selected
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Credit cards' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('interactive-card').props.accessibilityState.selected).toBe(true);

    selectedView.unmount();
    const disabledView = renderWithTheme(
      <Card
        title="Disabled card"
        onPress={onPress}
        disabled
      />,
    );
    const disabledCard = screen.getByRole('button', { name: 'Disabled card' });
    fireEvent.press(disabledCard);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(disabledCard.props.accessibilityState.disabled).toBe(true);

    disabledView.unmount();
    renderWithTheme(<Card title="Loading card" loading />);
    expect(screen.getByRole('progressbar', { name: 'Loading card' })).toBeTruthy();
  });

  it('isolates internal button presses from the card action', () => {
    const cardPress = jest.fn();
    const buttonPress = jest.fn();
    renderWithTheme(
      <Card title="Account" onPress={cardPress}>
        <Button title="Manage" testID="manage-button" onPress={buttonPress} />
      </Card>,
    );

    fireEvent.press(screen.getByTestId('manage-button'));
    expect(buttonPress).toHaveBeenCalledTimes(1);
    expect(cardPress).not.toHaveBeenCalled();
  });

  it('supports Arabic RTL content and accessibility hints', () => {
    renderWithTheme(
      <Card
        title="حساب التوفير"
        description="الحساب الرئيسي"
        onPress={jest.fn()}
        accessibilityHint="يفتح تفاصيل الحساب"
      >
        <Text value="الرصيد المتاح" />
      </Card>,
      { locale: 'ar-SA' },
    );

    const card = screen.getByRole('button', {
      name: 'حساب التوفير, الحساب الرئيسي',
    });
    expect(card.props.accessibilityHint).toBe('يفتح تفاصيل الحساب');
    expect(screen.getByText('حساب التوفير')).toHaveStyle({
      writingDirection: 'rtl',
    });
  });
});
