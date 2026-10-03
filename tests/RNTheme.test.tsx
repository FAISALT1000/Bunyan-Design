import fs from 'fs';
import path from 'path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
  Pressable as NativePressable,
  View as NativeView,
} from '../src/design-system/components/RNTheme/native';
import { RNTheme, createThemedComponent, darkTheme, lightTheme, mergeThemedStyles } from '../src';
import { renderWithTheme } from './test-utils';

const SRC_ROOT = path.resolve(__dirname, '../src');
const BOUNDARY = path.join(SRC_ROOT, 'design-system/components/RNTheme/native.ts');

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

describe('RNTheme boundary', () => {
  it('is the only module that imports react-native directly', () => {
    const offenders = sourceFiles(SRC_ROOT)
      .filter(file => file !== BOUNDARY)
      .filter(file => /from\s+['"]react-native['"]|require\(\s*['"]react-native['"]\s*\)/.test(fs.readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});

describe('createThemedComponent', () => {
  it('applies theme base style beneath caller style and forwards refs', () => {
    const Surface = createThemedComponent(NativeView, {
      displayName: 'Surface',
      baseStyle: ({ theme }) => ({ backgroundColor: theme.color.surface.primary, padding: 1 }),
    });
    const ref = React.createRef<React.ComponentRef<typeof NativeView>>();
    renderWithTheme(<Surface ref={ref} testID="surface" style={{ padding: 4 }} />, { initialPreference: 'dark' });

    expect(screen.getByTestId('surface')).toHaveStyle({
      backgroundColor: darkTheme.color.surface.primary,
      padding: 4,
    });
    expect(ref.current).toBeTruthy();
    expect(Surface.displayName).toBe('Surface');
  });

  it('resolves themeStyle and keeps Pressable state styles working', () => {
    const ThemedPressable = createThemedComponent(NativePressable, { displayName: 'ThemedPressable' });
    const onPress = jest.fn();
    renderWithTheme(
      <ThemedPressable
        testID="press"
        onPress={onPress}
        themeStyle={({ theme }) => ({ borderColor: theme.color.border.focus })}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      />,
    );
    const node = screen.getByTestId('press');
    expect(node).toHaveStyle({ borderColor: lightTheme.color.border.focus, opacity: 1 });
    fireEvent.press(node);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps theme defaults when a prop is explicitly undefined', () => {
    renderWithTheme(<RNTheme.TextInput testID="input" placeholderTextColor={undefined} />);
    expect(screen.getByTestId('input').props.placeholderTextColor).toBe(lightTheme.color.text.tertiary);
  });

  it('works without a ThemeProvider (falls back to the light theme)', () => {
    render(<RNTheme.RNText testID="text">Hi</RNTheme.RNText>);
    expect(screen.getByTestId('text')).toHaveStyle({ color: lightTheme.color.text.primary });
  });

  it('merges static and resolver style layers', () => {
    expect(mergeThemedStyles(undefined, null)).toBeUndefined();
    expect(mergeThemedStyles({ a: 1 })).toEqual({ a: 1 });
    const merged = mergeThemedStyles({ a: 1 }, (state: { pressed: boolean }) => ({ b: state.pressed })) as (s: unknown) => unknown;
    expect(merged({ pressed: true })).toEqual([{ a: 1 }, { b: true }]);
  });
});
