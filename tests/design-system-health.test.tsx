import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import {
  Accordion,
  Button,
  IconButton,
  Modal,
  Tabs,
  Text,
} from '../src';
import { renderWithTheme } from './test-utils';

describe('design-system interaction health', () => {
  it('enforces a two-dimensional minimum touch target for icon actions', () => {
    renderWithTheme(
      <IconButton
        icon="search"
        size="small"
        accessibilityLabel="Search"
        testID="search-action"
      />,
    );

    expect(screen.getByTestId('search-action')).toHaveStyle({
      minWidth: 44,
      minHeight: 44,
    });
  });

  it('announces a loading button once through its parent action', () => {
    renderWithTheme(<Button title="Continue" loading />);

    const button = screen.getByRole('button', {
      name: 'Continue, Loading',
    });
    expect(button.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true, disabled: true }),
    );
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('exposes accordion expanded state and content relationships', () => {
    renderWithTheme(
      <Accordion title="Account details">
        <Text value="Account number 1234" />
      </Accordion>,
    );

    const trigger = screen.getByRole('button', { name: 'Account details' });
    expect(trigger.props.accessibilityState.expanded).toBe(false);
    fireEvent.press(trigger);
    expect(trigger.props.accessibilityState.expanded).toBe(true);
    expect(screen.getByText('Account number 1234')).toBeTruthy();
  });

  it('keeps tab state typed, labelled, and disabled interactions inert', () => {
    const onValueChange = jest.fn();
    renderWithTheme(
      <Tabs
        accessibilityLabel="Account sections"
        value="overview"
        onValueChange={onValueChange}
        items={[
          { value: 'overview', label: 'Overview', badge: '12' },
          { value: 'activity', label: 'Activity', disabled: true },
        ]}
      />,
      { locale: 'ar-SA' },
    );

    const selected = screen.getByRole('tab', { name: 'Overview, 12' });
    const disabled = screen.getByRole('tab', { name: 'Activity' });
    expect(selected.props.accessibilityState.selected).toBe(true);
    expect(disabled.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(disabled);
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.press(selected);
    expect(onValueChange).toHaveBeenCalledWith('overview');
  });

  it('supports localized modal close labels', () => {
    const onClose = jest.fn();
    renderWithTheme(
      <Modal
        visible
        title="تأكيد التحويل"
        closeAccessibilityLabel="إغلاق النافذة"
        onClose={onClose}
      >
        <Text value="راجع التفاصيل" />
      </Modal>,
      { locale: 'ar-SA' },
    );

    fireEvent.press(screen.getByRole('button', { name: 'إغلاق النافذة' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
