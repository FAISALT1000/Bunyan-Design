import React, { createContext, memo, useContext, useEffect, useState } from 'react';
import { Modal as NativeModal, type ModalProps as NativeModalProps } from '../../components/RNTheme/native';

export interface BaseModalProps extends Omit<
  NativeModalProps,
  'children' | 'onRequestClose'
> {
  children: React.ReactNode;
  onRequestClose?: (() => void) | undefined;
}

/**
 * `true` once the surrounding modal has finished its show animation (always
 * `true` outside a modal). Inputs use it to defer `autoFocus`: Android does not
 * open the keyboard for an input focused while its modal is still sliding in.
 */
const OverlayShownContext = createContext(true);

export const useOverlayShown = () => useContext(OverlayShownContext);

/** Some platforms never call `onShow`; stop waiting after this many ms. */
const SHOW_FALLBACK_MS = 600;

export const BaseModal = memo(function BaseModal({
  children,
  onRequestClose,
  onShow,
  visible = true,
  ...props
}: BaseModalProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShown(false);
      return undefined;
    }
    const timer = setTimeout(() => setShown(true), SHOW_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <NativeModal
      onRequestClose={onRequestClose}
      visible={visible}
      onShow={event => {
        setShown(true);
        onShow?.(event);
      }}
      {...props}
    >
      <OverlayShownContext.Provider value={shown}>
        {children}
      </OverlayShownContext.Provider>
    </NativeModal>
  );
});
