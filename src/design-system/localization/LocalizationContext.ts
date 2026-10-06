import { createContext } from 'react';
import type {
  LocalizationContextValue,
  SupportedLocale,
} from './localization.types';

export const LocalizationContext = createContext<
  LocalizationContextValue<SupportedLocale> | undefined
>(undefined);
