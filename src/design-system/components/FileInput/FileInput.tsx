import React, { memo, useState } from 'react';
import { Pressable, View } from '../RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { formatFileSize } from '../../utilities/numbers';
import { logicalRow, type FeedbackStatus } from '../../utilities/styles';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Spinner } from '../Spinner';
import { Text } from '../Text';

export interface PickedFile {
  uri: string;
  name: string;
  /** Bytes. */
  size?: number | null;
  /** MIME type, e.g. `'application/pdf'`. */
  type?: string | null;
}

/** Opens the platform picker. Return the picked file(s), or `null` when cancelled. */
export type FilePicker = (options: { multiple: boolean }) => Promise<PickedFile | readonly PickedFile[] | null | undefined>;

let defaultPicker: FilePicker | undefined;

/**
 * Sets the picker used when `pickFile` is not passed — call once at app start with
 * `expo-document-picker`, `react-native-document-picker`, an image picker, etc.
 *
 * ```ts
 * setDefaultFilePicker(async ({ multiple }) => {
 *   const result = await DocumentPicker.getDocumentAsync({ multiple });
 *   return result.canceled ? null : result.assets.map(a => ({ uri: a.uri, name: a.name, size: a.size, type: a.mimeType }));
 * });
 * ```
 */
export const setDefaultFilePicker = (picker: FilePicker | undefined) => {
  defaultPicker = picker;
};

export interface FileInputProps {
  value?: readonly PickedFile[] | null;
  onChange?: (files: PickedFile[]) => void;
  pickFile?: FilePicker;
  multiple?: boolean;
  maxFiles?: number;
  /** Maximum size per file in bytes. Larger files are rejected with `onReject`. */
  maxSize?: number;
  /** Called with files that were rejected and why. */
  onReject?: (rejected: { file: PickedFile; reason: 'maxSize' | 'maxFiles' }[]) => void;
  title?: TextValue;
  /** Hint under the title, e.g. "PDF or JPG, up to 5 MB". */
  hint?: TextValue;
  removeLabel?: TextValue;
  disabled?: boolean;
  status?: FeedbackStatus;
  accessibilityLabel?: TextValue;
  testID?: string;
}

/**
 * Upload box + list of picked files. Bunyan does not bundle a native picker:
 * pass `pickFile` (or call `setDefaultFilePicker` once) with the library you use.
 */
export const FileInput = memo(function FileInput({
  value,
  onChange,
  pickFile,
  multiple = false,
  maxFiles = multiple ? Infinity : 1,
  maxSize,
  onReject,
  title = 'Upload file',
  hint,
  removeLabel = 'Remove',
  disabled = false,
  status = 'default',
  accessibilityLabel,
  testID,
}: FileInputProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const [busy, setBusy] = useState(false);
  const files = value ?? [];
  const canAdd = !disabled && !busy && files.length < maxFiles;
  const hintText = t(hint);

  const pick = async () => {
    const picker = pickFile ?? defaultPicker;
    if (!picker) {
      console.warn('FileInput: pass `pickFile` or call setDefaultFilePicker() first.');
      return;
    }
    setBusy(true);
    try {
      const result = await picker({ multiple });
      if (!result) return;
      const picked = Array.isArray(result) ? [...result] : [result as PickedFile];
      const rejected: { file: PickedFile; reason: 'maxSize' | 'maxFiles' }[] = [];
      const accepted: PickedFile[] = [];
      for (const file of picked) {
        if (maxSize !== undefined && (file.size ?? 0) > maxSize) rejected.push({ file, reason: 'maxSize' });
        else if (files.length + accepted.length >= maxFiles) rejected.push({ file, reason: 'maxFiles' });
        else accepted.push(file);
      }
      if (rejected.length) onReject?.(rejected);
      if (accepted.length) onChange?.(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
    } finally {
      setBusy(false);
    }
  };

  const borderColor = status === 'error' ? theme.color.border.error : status === 'success' ? theme.color.border.success : theme.color.border.primary;

  return (
    <View testID={testID} style={{ gap: theme.spacing.sm }}>
      {files.length < maxFiles || files.length === 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(accessibilityLabel) ?? t(title)}
          {...(hintText ? { accessibilityHint: hintText } : {})}
          accessibilityState={{ disabled: !canAdd, busy }}
          disabled={!canAdd}
          onPress={() => void pick()}
          style={({ pressed }) => ({
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingVertical: theme.spacing.xl,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.lg,
            borderWidth: theme.borderWidth.medium,
            borderStyle: 'dashed',
            borderColor,
            backgroundColor: pressed ? theme.color.overlay.subtle : theme.color.surface.secondary,
            opacity: disabled ? theme.opacity.disabled : theme.opacity.opaque,
          })}
        >
          {busy ? <Spinner label="" /> : <Icon name="upload" size="lg" tone="secondary" />}
          <Text weight="semibold" internalColor={theme.color.text.link} align="center" value={t(title) ?? ""} />
          {hintText ? <Text variant="caption" tone="tertiary" align="center" value={hintText} /> : null}
        </Pressable>
      ) : null}
      {files.map((file, index) => (
        <View
          key={`${file.uri}-${index}`}
          style={[
            logicalRow(direction),
            {
              alignItems: 'center',
              gap: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              borderWidth: theme.borderWidth.thin,
              borderColor: theme.color.border.secondary,
              backgroundColor: theme.color.surface.primary,
            },
          ]}
        >
          <Icon name={file.type?.startsWith('image/') ? 'image' : 'file'} size="md" tone="secondary" />
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" weight="medium" numberOfLines={1} value={file.name} />
            {file.size ? <Text variant="caption" tone="tertiary" value={formatFileSize(file.size)} /> : null}
          </View>
          <IconButton
            icon="trash"
            size="small"
            tone="error"
            disabled={disabled}
            accessibilityLabel={`${t(removeLabel)} ${file.name}`}
            onPress={() => onChange?.(files.filter((_, i) => i !== index))}
          />
        </View>
      ))}
    </View>
  );
});
