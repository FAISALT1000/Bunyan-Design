import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { renderWithTheme } from '../../../../tests/test-utils';
import { Line } from './Line';

describe('Line', () => {
  it.each([
    ['1', ['Primary']],
    ['2', ['Primary', 'Secondary']],
    ['3', ['Primary', 'Secondary', 'Tertiary']],
  ] as const)('renders the selected %s-line text count', (type, visible) => {
    renderWithTheme(
      <Line
        type={type}
        leftText={{
          text1: 'Primary',
          text2: 'Secondary',
          text3: 'Tertiary',
        }}
      />,
    );

    visible.forEach(value => expect(screen.getByText(value)).toBeTruthy());
    if (type === '1') {
      expect(screen.queryByText('Secondary')).toBeNull();
      expect(screen.queryByText('Tertiary')).toBeNull();
    }
    if (type === '2') expect(screen.queryByText('Tertiary')).toBeNull();
  });

  it('infers the line type from the supplied groups', () => {
    renderWithTheme(
      <Line
        leftText={{ text1: 'One', text2: 'Two', text3: 'Three' }}
        rightText={{ text1: 'Value' }}
      />,
    );
    expect(screen.getByText('Three')).toBeTruthy();
  });

  it('renders icons, buttons, and custom content', () => {
    renderWithTheme(
      <Line
        leftIcon={{ name: 'settings', accessibilityLabel: 'Settings icon' }}
        rightIcon={{ name: 'chevron-end', accessibilityLabel: 'Open icon' }}
        leftButton={{ title: 'Cancel', onPress: jest.fn() }}
        rightButton={{ title: 'Activate', onPress: jest.fn() }}
        leftContent={<Avatar name="Faisal" />}
        rightContent={<Badge label="Verified" tone="success" />}
      />,
    );

    expect(screen.getByLabelText('Settings icon')).toBeTruthy();
    expect(screen.getByLabelText('Open icon')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Activate' })).toBeTruthy();
    expect(screen.getByText('F')).toBeTruthy();
    expect(screen.getByText('Verified')).toBeTruthy();
  });

  it('calls the row action but isolates nested button actions', () => {
    const rowPress = jest.fn();
    const buttonPress = jest.fn();
    renderWithTheme(
      <Line
        leftText={{ text1: 'Beneficiary' }}
        rightButton={{
          title: 'Activate',
          onPress: buttonPress,
          testID: 'activate-button',
        }}
        onPress={rowPress}
      />,
    );

    fireEvent.press(screen.getByTestId('activate-button'));
    expect(buttonPress).toHaveBeenCalledTimes(1);
    expect(rowPress).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'Beneficiary' }));
    expect(rowPress).toHaveBeenCalledTimes(1);
  });

  it('supports disabled, loading, and divider states', () => {
    const onPress = jest.fn();
    const view = renderWithTheme(
      <Line
        testID="state-line"
        leftText={{ text1: 'Disabled line' }}
        onPress={onPress}
        disabled
        showDivider
      />,
    );
    const row = screen.getByRole('button', { name: 'Disabled line' });
    expect(row.props.accessibilityState.disabled).toBe(true);
    fireEvent.press(row);
    expect(onPress).not.toHaveBeenCalled();

    view.unmount();
    renderWithTheme(
      <Line
        testID="state-line"
        leftText={{ text1: 'Loading line' }}
        loading
        showDivider
      />,
    );
    expect(
      screen.getAllByRole('progressbar', { name: 'Loading content' }).length,
    ).toBeGreaterThan(0);
  });

  it('renders a divider with the requested inset', () => {
    renderWithTheme(
      <Line
        leftText={{ text1: 'Reference' }}
        showDivider
        dividerInset="content"
      />,
    );
    expect(screen.getByText('Reference')).toBeTruthy();
  });

  it('uses RTL logical layout and scalable text', () => {
    renderWithTheme(
      <Line
        testID="rtl-line"
        leftText={{
          text1: {
            value: 'حساب التوفير',
            numberOfLines: 2,
          },
        }}
        rightText={{ text1: '٢٥٬٠٠٠ ر.س' }}
      />,
      { locale: 'ar-SA' },
    );

    expect(screen.getByTestId('rtl-line-content')).toHaveStyle({
      flexDirection: 'row-reverse',
    });
    const title = screen.getByText('حساب التوفير');
    expect(title.props.allowFontScaling).toBe(true);
    expect(title.props.numberOfLines).toBe(2);
    expect(title).toHaveStyle({ writingDirection: 'rtl' });
  });

  it('builds a useful default accessibility label', () => {
    renderWithTheme(
      <Line
        leftText={{ text1: 'Savings account', text2: 'Main account' }}
        rightText={{ text1: '25,000 SAR' }}
        onPress={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Savings account, Main account, 25,000 SAR',
      }),
    ).toBeTruthy();
  });
});
