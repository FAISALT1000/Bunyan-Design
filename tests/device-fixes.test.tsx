/**
 * Regression tests for the device bugs reported by StreamSpy (0.0.3).
 */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Keyboard, StyleSheet, TextInput as NativeTextInput } from '../src/design-system/components/RNTheme/native';
import {
  Badge,
  BottomSheet,
  Chip,
  Icon,
  InputField,
  OTPInput,
  ThemeProvider,
  ToastProvider,
  createThemes,
  dimTheme,
  getContrastRatio,
  isDarkMode,
  lightTheme,
  palette,
  sepiaTheme,
  themes,
  useTheme,
  useToast,
  type IconName,
  type OTPInputHandle,
  type ThemeContextValue,
  type ThemeMode,
  type ToastContextValue,
} from '../src';
import { renderWithTheme } from './test-utils';

const flat = (element: { props: { style?: unknown } }) =>
  StyleSheet.flatten(element.props.style as never) as Record<string, any>;

const withInsets = (
  ui: React.ReactElement,
  insets = { top: 47, right: 0, bottom: 34, left: 0 },
  providerProps: Record<string, unknown> = {},
) => render(
  <SafeAreaProvider initialMetrics={{ insets, frame: { x: 0, y: 0, width: 390, height: 844 } }}>
    <ThemeProvider {...providerProps}>{ui}</ThemeProvider>
  </SafeAreaProvider>,
);

const field = lightTheme.components.inputField;

describe('1. InputField floated label alignment', () => {
  const renderField = (props: Partial<React.ComponentProps<typeof InputField>> = {}, direction: 'ltr' | 'rtl' = 'ltr') =>
    renderWithTheme(
      <InputField testID="email" label="Email" value="a@b.co" onChangeText={jest.fn()} {...props as object} />,
      { direction, locale: direction === 'rtl' ? 'ar' : 'en' },
    );

  it('scales from the start edge in LTR so the label lines up with the value', () => {
    renderField();
    const label = flat(screen.getByTestId('email-label', { includeHiddenElements: true }));
    expect(label.transformOrigin).toBe('left top');
    expect(label.start).toBe(field.contentPaddingHorizontal);
    expect(label.end).toBe(field.contentPaddingHorizontal);
  });

  it('scales from the right edge in RTL', () => {
    renderField({}, 'rtl');
    expect(flat(screen.getByTestId('email-label', { includeHiddenElements: true })).transformOrigin).toBe('right top');
  });

  it('keeps the leftIcon inset on the side where the text starts', () => {
    const inset = lightTheme.iconSize.md + field.iconGap;
    renderField({ leftIcon: 'search' });
    const ltr = flat(screen.getByTestId('email-label', { includeHiddenElements: true }));
    expect(ltr.start).toBe(field.contentPaddingHorizontal + inset);
    expect(ltr.end).toBe(field.contentPaddingHorizontal);

    // Provider RTL on a natively LTR app: `start` is physically left, so the
    // inset moves to `end` (the right, where Arabic text starts).
    screen.unmount();
    renderField({ leftIcon: 'search' }, 'rtl');
    const rtl = flat(screen.getByTestId('email-label', { includeHiddenElements: true }));
    expect(rtl.start).toBe(field.contentPaddingHorizontal);
    expect(rtl.end).toBe(field.contentPaddingHorizontal + inset);
  });
});

describe('2. InputField resting label is vertically centred', () => {
  const translateY = (style: Record<string, any>) =>
    (style.transform as Array<Record<string, number>>).find(item => 'translateY' in item)!.translateY;

  it('centres the empty label on the content row (icons share the same line)', () => {
    renderWithTheme(<InputField testID="search" label="Search" value="" onChangeText={jest.fn()} leftIcon="search" />);
    const lineHeight = lightTheme.typography.lineHeight.md;
    act(() => {
      fireEvent(screen.getByTestId('search-surface-content'), 'layout', {
        nativeEvent: { layout: { x: 0, y: 24, width: 300, height: 48 } },
      });
    });
    const label = flat(screen.getByTestId('search-label', { includeHiddenElements: true }));
    const labelCenter = label.top + translateY(label) + lineHeight / 2;
    expect(labelCenter).toBe(24 + 48 / 2);
  });

  it('defaults to the token estimate before layout', () => {
    renderWithTheme(<InputField testID="pw" type="password" label="Password" value="" onChangeText={jest.fn()} />);
    const label = flat(screen.getByTestId('pw-label', { includeHiddenElements: true }));
    const center = label.top + translateY(label) + lightTheme.typography.lineHeight.md / 2;
    expect(center).toBe(field.contentPaddingTop + lightTheme.componentHeight.md / 2);
  });
});

describe('3. Chip centres its label', () => {
  it('centres content on both axes', () => {
    renderWithTheme(<Chip label="عربي" onPress={jest.fn()} />);
    const chip = flat(screen.getByRole('button', { name: 'عربي' }));
    expect(chip.justifyContent).toBe('center');
    expect(chip.alignItems).toBe('center');
  });
});

describe('4. Badge follows the parent alignment', () => {
  it('defaults to alignSelf auto without growing', () => {
    renderWithTheme(<Badge testID="admin" label="Admin" />);
    const badge = flat(screen.getByTestId('admin'));
    expect(badge.alignSelf).toBe('auto');
    expect(badge.flexGrow).toBe(0);
    expect(badge.flexShrink).toBe(0);
  });

  it('accepts an explicit alignSelf', () => {
    renderWithTheme(<Badge testID="admin" label="Admin" alignSelf="flex-start" />);
    expect(flat(screen.getByTestId('admin')).alignSelf).toBe('flex-start');
  });
});

describe('5. OTPInput', () => {
  const proto = (NativeTextInput as unknown as { prototype: Record<string, jest.Mock> }).prototype;

  beforeEach(() => {
    proto.focus!.mockClear();
    proto.blur!.mockClear();
    proto.isFocused!.mockReset();
  });

  it('lays slots out left-to-right in Arabic', () => {
    renderWithTheme(<OTPInput value="12" onChange={jest.fn()} length={6} />, { direction: 'rtl', locale: 'ar' });
    const row = screen.getByRole('button', { name: /Verification code/ });
    expect(flat(row).direction).toBe('ltr');
  });

  it('fills every slot from a pasted code, ignoring separators', () => {
    const onChange = jest.fn();
    renderWithTheme(<OTPInput value="" onChange={onChange} length={6} />);
    fireEvent.changeText(screen.getByLabelText('Verification code input'), 'Code: 123-456');
    expect(onChange).toHaveBeenCalledWith('123456');
  });

  it('lays the input over the slots so long-press can paste', () => {
    renderWithTheme(<OTPInput value="" onChange={jest.fn()} />);
    const input = flat(screen.getByLabelText('Verification code input'));
    expect(input.position).toBe('absolute');
    expect(input.top).toBe(0);
    expect(input.opacity).not.toBe(0);
    expect(screen.getByLabelText('Verification code input').props.maxLength).toBeUndefined();
  });

  it('exposes focus / blur / clear through a ref', () => {
    const onChange = jest.fn();
    const ref = React.createRef<OTPInputHandle>();
    renderWithTheme(<OTPInput ref={ref} value="12" onChange={onChange} />);
    act(() => ref.current?.focus());
    expect(proto.focus).toHaveBeenCalledTimes(1);
    act(() => ref.current?.blur());
    expect(proto.blur).toHaveBeenCalledTimes(1);
    act(() => ref.current?.clear());
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('re-opens the keyboard when RN already thinks the input is focused', () => {
    jest.useFakeTimers();
    const visible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
    proto.isFocused!.mockReturnValue(true);
    renderWithTheme(<OTPInput value="" onChange={jest.fn()} />);
    fireEvent.press(screen.getByRole('button', { name: /Verification code/ }));
    expect(proto.blur).toHaveBeenCalledTimes(1);
    act(() => jest.runAllTimers());
    expect(proto.focus).toHaveBeenCalledTimes(1);
    visible.mockRestore();
    jest.useRealTimers();
  });

  it('defers autoFocus inside a BottomSheet until the sheet has shown', async () => {
    renderWithTheme(
      <BottomSheet testID="sheet" visible onClose={jest.fn()} title="Verify">
        <OTPInput value="" onChange={jest.fn()} autoFocus />
      </BottomSheet>,
    );
    expect(proto.focus).not.toHaveBeenCalled();
    const modal = screen.UNSAFE_root.findAll(node => typeof node.props.onShow === 'function')[0]!;
    act(() => modal.props.onShow());
    await waitFor(() => expect(proto.focus).toHaveBeenCalledTimes(1));
  });
});

describe('6. BottomSheet safe area and keyboard', () => {
  it('adds the bottom inset to the sheet padding and avoids the keyboard', () => {
    withInsets(<BottomSheet testID="sheet" visible onClose={jest.fn()} title="Preview"><Chip label="x" /></BottomSheet>);
    expect(flat(screen.getByTestId('sheet')).paddingBottom).toBe(lightTheme.spacing.xxl + 34);
    expect(screen.getByTestId('sheet-keyboard-avoider')).toBeTruthy();
    expect(screen.UNSAFE_root.findAll(node => node.props.behavior === 'padding').length).toBeGreaterThan(0);
    const modal = screen.UNSAFE_root.findAll(node => node.props.navigationBarTranslucent === true);
    expect(modal.length).toBeGreaterThan(0);
  });
});

describe('7. Toast placement', () => {
  const show = (props: Partial<React.ComponentProps<typeof ToastProvider>>) => {
    let api: ToastContextValue | undefined;
    function Capture() {
      api = useToast();
      return null;
    }
    withInsets(<ToastProvider testID="toasts" {...props}><Capture /></ToastProvider>, { top: 47, right: 0, bottom: 20, left: 0 });
    act(() => {
      api?.showToast({ message: 'Saved', duration: 0 });
    });
    return flat(screen.getByTestId('toasts'));
  };

  it('clears the safe area and the tab bar', () => {
    const region = show({ bottomOffset: 56 });
    expect(region.bottom).toBe(20 + lightTheme.spacing.xxl + 56);
  });

  it('can stack from the top', () => {
    const region = show({ placement: 'top' });
    expect(region.top).toBe(47 + lightTheme.spacing.xxl);
    expect(region.bottom).toBeUndefined();
  });

  it('moves above the keyboard', () => {
    const listeners: Record<string, (event: unknown) => void> = {};
    const spy = jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, callback: (event: unknown) => void) => {
      listeners[event] = callback;
      return { remove: jest.fn() };
    }) as never);
    show({ bottomOffset: 56 });
    act(() => {
      Object.entries(listeners).find(([name]) => name.endsWith('Show'))![1]({ endCoordinates: { height: 300 } });
    });
    expect(flat(screen.getByTestId('toasts')).bottom).toBe(300 + lightTheme.spacing.lg);
    spy.mockRestore();
  });
});

describe('8. Dim and sepia themes, palette', () => {
  const modes: ThemeMode[] = ['light', 'dark', 'black', 'dim', 'sepia'];

  it.each(['dim', 'sepia'] as const)('registers the %s theme and createThemes builds it', mode => {
    expect(themes[mode].mode).toBe(mode);
    expect(createThemes({ shared: { spacing: { md: 14 } } })[mode].spacing.md).toBe(14);
  });

  it.each(modes)('%s meets WCAG AA for text and primary buttons', mode => {
    const { color } = themes[mode];
    const pairs: Array<[string, string]> = [
      [color.text.primary, color.background.primary],
      [color.text.secondary, color.background.primary],
      [color.text.primary, color.surface.primary],
      [color.text.secondary, color.surface.primary],
      [color.text.link, color.background.primary],
      [color.primary.contrast, color.primary.default],
      [color.error.text, color.surface.primary],
    ];
    pairs.forEach(([foreground, background]) => {
      expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('marks dim as dark and sepia as light, also on the context', () => {
    expect(isDarkMode('dim')).toBe(true);
    expect(isDarkMode('sepia')).toBe(false);
    expect(dimTheme.color.background.primary).toBe(palette.gray[800]);
    expect(sepiaTheme.color.background.primary).toBe(palette.sepia[50]);
    const seen: Partial<Record<ThemeMode, boolean>> = {};
    function Probe() {
      const context: ThemeContextValue = useTheme();
      seen[context.mode] = context.isDark;
      return null;
    }
    modes.forEach(mode => {
      renderWithTheme(<Probe />, { initialPreference: mode });
      screen.unmount();
    });
    expect(seen).toEqual({ light: false, dark: true, black: true, dim: true, sepia: false });
  });

  it('exports full 50–900 accent scales', () => {
    const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    (['teal', 'amber', 'green', 'purple', 'rose', 'sepia'] as const).forEach(name => {
      expect(Object.keys(palette[name])).toEqual(steps);
    });
  });
});

describe('9. Settings and navigation icons', () => {
  it.each(['monitor', 'sun', 'moon', 'contrast', 'bell', 'globe', 'layers', 'grid'] as IconName[])('renders %s', name => {
    renderWithTheme(<Icon name={name} testID={`icon-${name}`} />);
    expect(screen.getByTestId(`icon-${name}`)).toBeTruthy();
  });
});
