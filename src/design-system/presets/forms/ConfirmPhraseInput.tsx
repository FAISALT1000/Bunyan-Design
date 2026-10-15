import React, { memo } from 'react';
import { useStrings } from '../../i18n/strings';
import { useText, type TextValue } from '../../i18n';
import { InputField } from '../../components/InputField';

export const phraseMatches = (value: string, phrase: string, caseSensitive = true) =>
  caseSensitive ? value.trim() === phrase : value.trim().toLocaleLowerCase() === phrase.toLocaleLowerCase();

export interface ConfirmPhraseInputProps {
  /** The phrase to type, e.g. `'DELETE'`. */
  phrase: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Called when the match state changes (enable the danger button with it). */
  onMatchChange?: (matched: boolean) => void;
  /** Default true. */
  caseSensitive?: boolean;
  /** Default: "Type DELETE to confirm" (translated). */
  label?: TextValue;
  helperText?: TextValue;
  testID?: string;
}

/**
 * "Type DELETE to confirm" field for irreversible actions (delete account,
 * kill all sessions). Pair it with a danger button enabled by `onMatchChange`
 * or `phraseMatches()`.
 */
export const ConfirmPhraseInput = memo(function ConfirmPhraseInput({
  phrase,
  value,
  onChangeText,
  onMatchChange,
  caseSensitive = true,
  label,
  helperText,
  testID,
}: ConfirmPhraseInputProps) {
  const strings = useStrings();
  const t = useText();
  const helper = t(helperText);
  return (
    <InputField
      type="text"
      label={t(label) ?? strings('typeToConfirm', { phrase })}
      value={value}
      onChangeText={next => {
        const before = phraseMatches(value, phrase, caseSensitive);
        const after = phraseMatches(next, phrase, caseSensitive);
        onChangeText(next);
        if (before !== after) onMatchChange?.(after);
      }}
      autoCapitalize={caseSensitive && phrase === phrase.toUpperCase() ? 'characters' : 'none'}
      autoCorrect={false}
      autoComplete="off"
      {...(helper ? { helperText: helper } : {})}
      {...(testID ? { testID } : {})}
    />
  );
});
