# Localization

Bunyan owns the localization engine and React integration. Each consuming
application owns its translation JSON, selected locale, persistence, and
application-wide RTL lifecycle.

`i18n-js` is a direct dependency because Bunyan executes it internally.
Applications do not need to create or share a global `I18n` instance.

## Project configuration

```tsx
import englishTranslations from './localization/en.json';
import arabicTranslations from './localization/ar.json';
import {
  DesignSystemLocalizationProvider,
  ThemeProvider,
} from '@bunyan/design-system';

const translations = {
  en: englishTranslations,
  ar: arabicTranslations,
};

export function App() {
  const locale = useSelectedLocaleFromApplicationState();

  return (
    <DesignSystemLocalizationProvider
      locale={locale}
      fallbackLocale="en"
      translations={translations}
    >
      <ThemeProvider locale={locale}>
        <Application />
      </ThemeProvider>
    </DesignSystemLocalizationProvider>
  );
}
```

The composed provider keeps theme direction and localization aligned:

```tsx
<DesignSystemProvider
  localization={{
    locale,
    fallbackLocale: 'en',
    translations,
  }}
  theme={{ initialPreference: 'system' }}
>
  <Application />
</DesignSystemProvider>
```

Locale persistence belongs in the consuming application. Redux, MMKV, native
settings, or another store can supply the controlled `locale` prop.

## Localized components

```tsx
<Text value="Static text" />

<Text
  localize="accounts.availableBalance"
  value="Available balance"
/>

<Text
  localize="welcome.message"
  value="Welcome"
  translationOptions={{ name: 'Faisal' }}
/>

<Button
  title="Confirm"
  titleLocalize="common.confirm"
/>

<Input
  label="Account number"
  labelLocalize="account.number"
  placeholder="Enter account number"
  placeholderLocalize="account.numberPlaceholder"
/>

<Badge
  label="Pending"
  labelLocalize="status.pending"
/>

<Line
  leftText={{
    text1: {
      value: 'Available balance',
      localize: 'accounts.availableBalance',
    },
  }}
/>
```

`value` is the visible fallback. Missing behavior defaults to `value`, then the
key when no fallback is supplied. Providers may select `key`, `empty`, or
`throw`. Missing callbacks are deduplicated by locale and key.

`useLocalization` exposes `locale`, `isRTL`, `translate`, `exists`,
`setLocale`, and the stable manager. It throws when used outside the provider.
Static `<Text value="..." />` remains usable without localization setup.

## Typed application keys

Translation keys remain strings in the shared package because applications own
their schemas. An application can narrow them:

```tsx
type AppTranslationKey =
  | 'common.confirm'
  | 'accounts.availableBalance';

type AppTextProps = Omit<TextProps, 'localize'> & {
  localize?: AppTranslationKey;
};

export function AppText(props: AppTextProps) {
  return <Text {...props} />;
}
```

## Translation validation

```bash
node ./node_modules/@bunyan/design-system/scripts/validate-translations.mjs \
  ./src/localization/en.json \
  ./src/localization/ar.json
```

The validator reports missing keys, invalid values, empty strings, and
incompatible locale structures. The reusable `validateTranslationResources`
utility provides the same checks in application tooling or tests.

The design system does not call `I18nManager.forceRTL`, reload the application,
or persist locale state.
