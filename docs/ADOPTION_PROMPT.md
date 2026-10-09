# Prompt: adopt Bunyan presets in an app

Copy everything inside the block below into Claude (or another AI assistant)
working in the app's repository. Replace the `<…>` placeholders first.

````
You are updating this React Native app to use the presets of our design
system, @bunyan/design-system (version <0.1.0 or later>). The package is
already in package.json (<"file:./bunyan-design-system-0.1.0.tgz" or the
registry version>).

## Read first
Read these docs inside node_modules/@bunyan/design-system/docs/ before
changing code: PRESETS.md, ICONS.md, FORMS.md, COMPONENTS.md, AI_PROMPTS.md,
UPGRADING.md and CHANGELOG.md (in the package root). Treat the package's
types (dist/**/*.d.ts) as the source of truth; never guess a prop name.

## Goal
Screens should contain data and logic, not stacks of View / Text /
TouchableOpacity / StyleSheet. Use Bunyan's presets and templates wherever
they fit:
- Rows and cards: OneLineCard, TwoLineCard, ThreeLineCard, SettingsGroup,
  DetailsCard, AmountCard, StatCard, ProfileCard, ActionCard, ProductCard,
  StatusCard.
- Layout: Section, Row, Column, Center, Grid, Spacer, List.
- Results and feedback: StatusScreen, StatusModal, useStatusToast,
  StatusBanner (success / error / pending, animated).
- Dialogs: useConfirm, useActionSheet, usePrompt instead of local modal
  state.
- Loading / empty / error: DataState (works with React Query results).
- Formatting: Money, DateText, PhoneText, MaskedText instead of local
  format helpers.
- Whole screens: ScreenContent (blocks array) for screens that are mostly a
  composition of cards and sections; the existing screen templates
  (BaseScreenTemplate, ListScreenTemplate, ResultScreenTemplate,
  FormScreenTemplate, OTPTemplate, …) and <Form fields> for forms.
- Icons: Bunyan's Icon set (153 icons in categories). Delete local SVG
  icons that have a Bunyan equivalent; register the rest with
  registerIcons() so everything goes through <Icon name>.
Recommend a preset wherever one fits, even if the current code works.

## Rule: wrap Bunyan in the app's own components
Screens must NOT import from '@bunyan/design-system' directly.
1. Create one folder per component under src/components/, e.g.
   src/components/transaction-row/TransactionRow.tsx + index.ts.
2. Prefer domain components that take the app's own data and map it to a
   preset, for example:

   ```tsx
   // src/components/transaction-row/TransactionRow.tsx
   import React from 'react';
   import { Money, TwoLineCard } from '@bunyan/design-system';
   import type { Transaction } from '@/types';

   export interface TransactionRowProps {
     transaction: Transaction;
     onPress?: () => void;
   }

   export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
     return (
       <TwoLineCard
         icon={{ name: transaction.amount < 0 ? 'arrow-up-right' : 'arrow-down-left', tone: transaction.amount < 0 ? 'neutral' : 'success' }}
         title={transaction.title}
         subtitle={{ localeKey: 'transactions.time', params: { time: transaction.time } }}
         value={<Money amount={transaction.amount} currency={transaction.currency} signed colorize variant="bodySmall" />}
         {...(onPress ? { onPress, chevron: true } : {})}
       />
     );
   }
   ```

3. For generic pieces, make a thin wrapper that sets the app's defaults
   (e.g. src/components/settings-group/SettingsGroup.tsx re-exporting
   Bunyan's SettingsGroup with the app's analytics or default footer).
   Keep the Bunyan prop names unless the app already has its own.
4. Hooks (useTheme, useConfirm, useActionSheet, usePrompt, useStatusToast,
   useResponsive…) are re-exported from src/hooks/ (one file per hook or a
   design-system.ts barrel) so screens import them from the app too.
5. Export everything from src/components/index.ts and src/hooks/index.ts.
6. Enforce it with ESLint in the screens folders:

   ```js
   // .eslintrc.js (overrides for src/screens/**, src/features/**/screens/**)
   'no-restricted-imports': ['error', {
     paths: [
       { name: '@bunyan/design-system', message: 'Import from @/components or @/hooks instead.' },
       { name: 'react-native', importNames: ['View', 'Text', 'TouchableOpacity', 'Pressable', 'StyleSheet'],
         message: 'Use the app components (built on Bunyan presets).' },
     ],
   }],
   ```

## Setup to check
- The root renders, inside the theme / localization providers:
  <ToastProvider bottomOffset={TAB_BAR_HEIGHT}><OverlayProvider>…</OverlayProvider></ToastProvider>
  (the generated DesignSystemSetup already has them).
- All user-facing text is translatable: pass { localeKey } or strings from
  the app's i18n.

## How to work
1. First, list every screen and every local component, and for each one
   say which Bunyan preset / template / hook should replace it and which
   wrapper you will create under src/components. Show me this plan and wait
   for my OK.
2. Then migrate in small steps (one feature or a few screens at a time).
   After each step run the typecheck, lint and tests and fix what you broke.
3. Do not change behaviour or copy while migrating; only the building
   blocks change. If a preset cannot express something, keep a local
   component built from Bunyan primitives and tell me which prop is missing
   so it can be added to Bunyan.
4. Check every changed screen in English (LTR) and Arabic (RTL), and in
   light and dark mode.
5. Finish with a summary: wrappers created, screens migrated, local
   components and icons removed, anything you could not migrate (and why),
   and props you would like added to Bunyan.
````
