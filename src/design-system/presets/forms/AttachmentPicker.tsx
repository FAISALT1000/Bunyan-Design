import React, { memo, useState } from 'react';
import { Box } from '../../base/Box';
import { BasePressable } from '../../base/Pressable';
import { Stack } from '../../base/Stack';
import { Image, View } from '../../components/RNTheme';
import { useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import { formatFileSize } from '../../utilities/numbers';
import { logicalRow, logicalTextAlign } from '../../utilities/styles';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { getDefaultFilePicker, type FilePicker, type PickedFile } from '../../components/FileInput';
import { Icon, type IconName } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { ProgressBar } from '../../components/ProgressBar';
import { Text } from '../../components/Text';

export interface Attachment extends PickedFile {
  /** Your id (e.g. after upload). */
  id?: string;
  /** Upload progress 0–1 while `status` is `'uploading'`. */
  progress?: number;
  status?: 'uploading' | 'uploaded' | 'error';
  /** Error text when `status` is `'error'`. Default: "Upload failed". */
  error?: TextValue;
}

/** A place to pick from (camera, photo library, files…). */
export interface AttachmentSource {
  key: string;
  label: TextValue;
  icon: IconName;
  pick: FilePicker;
}

export type AttachmentRejection = { file: PickedFile; reason: 'maxSize' | 'maxFiles' };

export interface AttachmentPickerProps {
  value: readonly Attachment[];
  /** New list after adding or removing. Start uploads from here (set `status` / `progress`). */
  onChange: (files: Attachment[]) => void;
  /** One picker. Default: the one set with `setDefaultFilePicker`. */
  pickFile?: FilePicker;
  /** Several pickers; more than one opens a sheet to choose. */
  sources?: readonly AttachmentSource[];
  multiple?: boolean;
  maxFiles?: number;
  /** Bytes per file. */
  maxSize?: number;
  onReject?: (rejected: AttachmentRejection[]) => void;
  /** Shows a retry button on failed files. */
  onRetry?: (file: Attachment, index: number) => void;
  /** Tap on a file (preview). */
  onPreview?: (file: Attachment, index: number) => void;
  label?: TextValue;
  /** "PDF or JPG, up to 5 MB". */
  hint?: TextValue;
  addLabel?: TextValue;
  errorText?: TextValue;
  disabled?: boolean;
  /** `'list'` rows (default) or `'grid'` thumbnails (photos). */
  layout?: 'list' | 'grid';
  testID?: string;
}

const isImage = (file: PickedFile) => Boolean(file.uri && file.type?.startsWith('image/'));
const iconOf = (file: PickedFile): IconName =>
  isImage(file) ? 'image' : file.type === 'application/pdf' ? 'file-pdf' : 'file';

/**
 * Attachments for support requests, chats and forms: add from one or several
 * sources, size and count limits, image thumbnails, upload progress, failed
 * uploads with retry, remove.
 *
 * ```tsx
 * <AttachmentPicker value={files} onChange={setFiles} maxFiles={5} maxSize={10_000_000}
 *   sources={[
 *     { key: 'camera', label: 'Camera', icon: 'camera', pick: takePhoto },
 *     { key: 'files', label: 'Files', icon: 'folder', pick: pickDocument },
 *   ]} />
 * ```
 */
export const AttachmentPicker = memo(function AttachmentPicker({
  value,
  onChange,
  pickFile,
  sources,
  multiple = true,
  maxFiles = multiple ? Infinity : 1,
  maxSize,
  onReject,
  onRetry,
  onPreview,
  label,
  hint,
  addLabel,
  errorText,
  disabled = false,
  layout = 'list',
  testID,
}: AttachmentPickerProps) {
  const { theme, direction } = useTheme();
  const t = useText();
  const strings = useStrings();
  const [busy, setBusy] = useState(false);
  const [chooser, setChooser] = useState(false);
  const canAdd = !disabled && !busy && value.length < maxFiles;
  const labelText = t(label);
  const hintText = t(hint);
  const error = t(errorText);
  const addText = t(addLabel) ?? strings('addAttachment');

  const run = async (picker: FilePicker | undefined) => {
    setChooser(false);
    if (!picker) {
      console.warn('AttachmentPicker: pass `pickFile` / `sources` or call setDefaultFilePicker() first.');
      return;
    }
    setBusy(true);
    try {
      const result = await picker({ multiple: multiple && maxFiles - value.length > 1 });
      if (!result) return;
      const picked = Array.isArray(result) ? [...result] : [result as PickedFile];
      const rejected: AttachmentRejection[] = [];
      const accepted: Attachment[] = [];
      for (const file of picked) {
        if (maxSize !== undefined && (file.size ?? 0) > maxSize) rejected.push({ file, reason: 'maxSize' });
        else if (value.length + accepted.length >= maxFiles) rejected.push({ file, reason: 'maxFiles' });
        else accepted.push(file);
      }
      if (rejected.length) onReject?.(rejected);
      if (accepted.length) onChange(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
    } finally {
      setBusy(false);
    }
  };

  const add = () => {
    if (sources && sources.length > 1) setChooser(true);
    else void run(sources?.[0]?.pick ?? pickFile ?? getDefaultFilePicker());
  };
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const statusLine = (file: Attachment) => {
    if (file.status === 'error') return { text: t(file.error) ?? strings('uploadFailed'), tone: 'error' as const };
    if (file.status === 'uploading') {
      return { text: `${strings('uploading')}${file.progress !== undefined ? ` ${Math.round(file.progress * 100)}%` : ''}`, tone: 'secondary' as const };
    }
    return file.size ? { text: formatFileSize(file.size), tone: 'tertiary' as const, ltr: true } : undefined;
  };

  const thumbnail = (file: Attachment, size: number) => (
    isImage(file) ? (
      <Image source={{ uri: file.uri }} style={{ width: size, height: size, borderRadius: theme.radius.md, backgroundColor: theme.color.surface.secondary }} />
    ) : (
      <Box
        width={size}
        height={size}
        radius="md"
        alignItems="center"
        justifyContent="center"
        internalStyle={{ backgroundColor: file.status === 'error' ? theme.color.error.subtle : theme.color.primary.subtle }}
      >
        <Icon name={iconOf(file)} size={size * 0.5} color={file.status === 'error' ? theme.color.error.default : theme.color.primary.default} />
      </Box>
    )
  );

  const rows = value.map((file, index) => {
    const line = statusLine(file);
    const body = (
      <View style={[logicalRow(direction), { alignItems: 'center', gap: theme.spacing.md }]}>
        {thumbnail(file, 40)}
        <View style={{ flex: 1, gap: theme.spacing.xxs }}>
          <Text value={file.name} variant="labelMedium" weight="medium" numberOfLines={1} />
          {line ? <Text value={line.text} variant="caption" tone={line.tone} {...('ltr' in line ? { internalStyle: { writingDirection: 'ltr' as const, textAlign: logicalTextAlign(direction, 'start') } } : {})} /> : null}
          {file.status === 'uploading' ? <ProgressBar value={file.progress ?? 0} size="small" showValue={false} /> : null}
        </View>
        {file.status === 'error' && onRetry ? (
          <IconButton icon="refresh" size="small" tone="secondary" accessibilityLabel={strings('retryUpload', { name: file.name })} onPress={() => onRetry(file, index)} />
        ) : null}
        <IconButton icon="close" size="small" tone="secondary" disabled={disabled} accessibilityLabel={strings('removeFile', { name: file.name })} onPress={() => remove(index)} />
      </View>
    );
    const frame = {
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: theme.borderWidth.thin,
      borderColor: file.status === 'error' ? theme.color.border.error : theme.color.border.secondary,
      backgroundColor: theme.color.surface.primary,
    };
    return onPreview ? (
      <BasePressable key={`${file.uri}-${index}`} accessibilityRole="button" accessibilityLabel={file.name} onPress={() => onPreview(file, index)} baseStyle={frame} pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}>
        {body}
      </BasePressable>
    ) : (
      <View key={`${file.uri}-${index}`} style={frame}>{body}</View>
    );
  });

  const tiles = (
    <View style={[logicalRow(direction), { flexWrap: 'wrap', gap: theme.spacing.sm }]}>
      {value.map((file, index) => (
        <View key={`${file.uri}-${index}`} style={{ width: 88, height: 88 }}>
          <BasePressable
            accessibilityRole={onPreview ? 'button' : 'image'}
            accessibilityLabel={[file.name, statusLine(file)?.text].filter(Boolean).join(', ')}
            {...(onPreview ? { onPress: () => onPreview(file, index) } : {})}
            disabled={!onPreview}
            minTouchTarget={false}
          >
            {thumbnail(file, 88)}
          </BasePressable>
          {file.status === 'uploading' || file.status === 'error' ? (
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute', top: 0, start: 0, end: 0, bottom: 0,
                borderRadius: theme.radius.md,
                backgroundColor: theme.color.overlay.scrim,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {file.status === 'error' && onRetry ? (
                <IconButton icon="refresh" size="small" tone="inverse" accessibilityLabel={strings('retryUpload', { name: file.name })} onPress={() => onRetry(file, index)} />
              ) : (
                <Text value={file.status === 'error' ? '!' : `${Math.round((file.progress ?? 0) * 100)}%`} variant="labelSmall" weight="bold" tone="inverse" />
              )}
            </View>
          ) : null}
          <View style={{ position: 'absolute', top: -8, ...(direction === 'rtl' ? { left: -8 } : { right: -8 }) }}>
            <IconButton icon="close" size={28} variant="filled" tone="secondary" disabled={disabled} accessibilityLabel={strings('removeFile', { name: file.name })} onPress={() => remove(index)} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Stack gap="sm" {...(testID ? { testID } : {})}>
      {labelText || maxFiles !== Infinity ? (
        <View style={[logicalRow(direction), { alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }]}>
          {labelText ? <Text value={labelText} variant="labelMedium" weight="medium" /> : <View />}
          {maxFiles !== Infinity ? (
            <Text value={strings('fileCount', { count: value.length, max: maxFiles })} variant="caption" tone="tertiary" />
          ) : null}
        </View>
      ) : null}
      {layout === 'grid' ? tiles : rows}
      {value.length < maxFiles ? (
        <Button
          title={addText}
          variant="outline"
          leftIcon="plus"
          fullWidth
          loading={busy}
          disabled={!canAdd}
          onPress={add}
          {...(hintText ? { accessibilityHint: hintText } : {})}
        />
      ) : null}
      {hintText ? <Text value={hintText} variant="caption" tone="tertiary" /> : null}
      {error ? <Text value={error} variant="caption" tone="error" accessibilityRole="alert" /> : null}
      {sources && sources.length > 1 ? (
        <BottomSheet visible={chooser} onClose={() => setChooser(false)} title={addText}>
          <Stack gap="xs">
            {sources.map(source => (
              <BasePressable
                key={source.key}
                accessibilityRole="button"
                accessibilityLabel={t(source.label) ?? source.key}
                onPress={() => void run(source.pick)}
                baseStyle={[logicalRow(direction), { alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.sm, borderRadius: theme.radius.md }]}
                pressedStyle={{ backgroundColor: theme.color.overlay.subtle }}
              >
                <Icon name={source.icon} size="md" tone="secondary" />
                <Text value={t(source.label) ?? source.key} weight="medium" />
              </BasePressable>
            ))}
          </Stack>
        </BottomSheet>
      ) : null}
    </Stack>
  );
});
