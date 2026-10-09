import { useCallback, useState } from 'react';

export interface DisclosureControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (isOpen: boolean) => void;
}

export function useDisclosure(initialOpen = false): DisclosureControls {
  const [isOpen, setOpen] = useState(initialOpen);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen(current => !current), []);

  return { isOpen, open, close, toggle, setOpen };
}
