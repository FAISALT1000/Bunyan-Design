import React, { memo } from 'react';
import {
  Modal as NativeModal,
  type ModalProps as NativeModalProps,
} from 'react-native';

export interface BaseModalProps extends Omit<
  NativeModalProps,
  'children' | 'onRequestClose'
> {
  children: React.ReactNode;
  onRequestClose?: (() => void) | undefined;
}

export const BaseModal = memo(function BaseModal({
  children,
  onRequestClose,
  ...props
}: BaseModalProps) {
  return (
    <NativeModal onRequestClose={onRequestClose} {...props}>
      {children}
    </NativeModal>
  );
});
