import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '../../base/Box';
import { BasePressable } from '../../base/Pressable';
import { Image, ScrollView, TextInput, View } from '../../components/RNTheme';
import { Animated, FlatList, type ImageSourcePropType } from '../../components/RNTheme/native';
import { useAccessibility, useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { useStrings } from '../../i18n/strings';
import { formatFileSize } from '../../utilities/numbers';
import { logicalRow, logicalTextAlign, needsMirroring } from '../../utilities/styles';
import { Avatar } from '../../components/Avatar';
import { EmptyState, type EmptyStateProps } from '../../components/EmptyState';
import { Icon, type IconName } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { Spinner } from '../../components/Spinner';
import { Text } from '../../components/Text';
import { TimelineEvent } from '../display/Display';

export type ChatSide = 'outgoing' | 'incoming';
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
/** Where a bubble sits in a run of messages from the same sender (shapes the corners). */
export type ChatBubblePosition = 'single' | 'first' | 'middle' | 'last';

export interface ChatAttachmentPreview {
  name: string;
  uri?: string;
  /** MIME type; `image/*` with a `uri` shows a thumbnail. */
  type?: string | null;
  size?: number | null;
  onPress?: () => void;
}

export interface ChatAuthor {
  name?: string;
  image?: ImageSourcePropType;
}

const STATUS_ICON: Record<ChatMessageStatus, IconName> = {
  sending: 'clock',
  sent: 'check',
  delivered: 'check-double',
  read: 'check-double',
  failed: 'alert-circle',
};

const useTimeText = () => {
  const { locale } = useTheme();
  return (time: string | Date | number | undefined) => {
    if (time === undefined) return undefined;
    if (typeof time === 'string') return time;
    try {
      return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(time));
    } catch {
      return undefined;
    }
  };
};

// ---------------------------------------------------------------- ChatBubble

export interface ChatBubbleProps {
  side: ChatSide;
  text?: string;
  /** Extra content inside the bubble (cards, links…). */
  children?: React.ReactNode;
  /** Sender shown above incoming bubbles (group chats, support agents). */
  author?: ChatAuthor;
  /** Show the sender name on incoming bubbles. Default: when `author.name` is set and position is first/single. */
  showAuthorName?: boolean;
  /** Avatar beside incoming bubbles. Default false. */
  showAvatar?: boolean;
  time?: string | Date | number;
  status?: ChatMessageStatus;
  /** Shown under failed outgoing messages. */
  onRetry?: () => void;
  attachments?: readonly ChatAttachmentPreview[];
  position?: ChatBubblePosition;
  onPress?: () => void;
  /** Long press (copy, reply, delete menu). */
  onLongPress?: () => void;
  /** Text can be selected. Default true (ignored with `onLongPress`). */
  selectable?: boolean;
  testID?: string;
}

/**
 * A chat message bubble: outgoing at the end edge in the brand colour,
 * incoming at the start edge. Time, delivery status, attachments, failed
 * state with retry, and grouped corners for runs of messages.
 */
export const ChatBubble = memo(function ChatBubble({
  side,
  text,
  children,
  author,
  showAuthorName,
  showAvatar = false,
  time,
  status,
  onRetry,
  attachments,
  position = 'single',
  onPress,
  onLongPress,
  selectable = true,
  testID,
}: ChatBubbleProps) {
  const { theme, direction } = useTheme();
  const strings = useStrings();
  const timeText = useTimeText()(time);
  const outgoing = side === 'outgoing';
  const foreground = outgoing ? theme.color.primary.contrast : theme.color.text.primary;
  const metaColor = outgoing ? theme.color.primary.contrast : theme.color.text.tertiary;
  const big = theme.radius.xl;
  const small = theme.radius.sm;
  // Logical corners; swap when the provider direction differs from the native one.
  const [S, E] = needsMirroring(direction) ? (['End', 'Start'] as const) : (['Start', 'End'] as const);
  const joinsAbove = position === 'middle' || position === 'last';
  const radii = outgoing
    ? {
        [`borderTop${S}Radius`]: big,
        [`borderBottom${S}Radius`]: big,
        [`borderTop${E}Radius`]: joinsAbove ? small : big,
        [`borderBottom${E}Radius`]: small,
      }
    : {
        [`borderTop${E}Radius`]: big,
        [`borderBottom${E}Radius`]: big,
        [`borderTop${S}Radius`]: joinsAbove ? small : big,
        [`borderBottom${S}Radius`]: small,
      };
  const nameVisible = !outgoing && Boolean(author?.name) && (showAuthorName ?? (position === 'single' || position === 'first'));
  const avatarSlot = !outgoing && showAvatar;
  const avatarVisible = avatarSlot && (position === 'single' || position === 'last');
  const statusLabel = status ? strings(status === 'failed' ? 'notSent' : status) : undefined;
  const a11yLabel = [nameVisible || (!outgoing && author?.name) ? author?.name : strings('you'), text, timeText, outgoing ? statusLabel : undefined]
    .filter(Boolean)
    .join(', ');

  const bubble = (
    <View
      style={[
        {
          maxWidth: '100%',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          backgroundColor: outgoing ? theme.color.primary.default : theme.color.surface.primary,
          ...(outgoing ? {} : { borderWidth: theme.borderWidth.thin, borderColor: theme.color.border.secondary }),
          gap: theme.spacing.xxs,
          opacity: status === 'sending' ? 0.8 : 1,
        },
        radii,
      ]}
    >
      {nameVisible ? <Text value={author?.name ?? ''} variant="caption" weight="semibold" tone="info" /> : null}
      {attachments?.map((attachment, index) => <AttachmentPreview key={`${attachment.name}-${index}`} attachment={attachment} outgoing={outgoing} />)}
      {text ? (
        <Text
          value={text}
          internalColor={foreground}
          selectable={selectable && !onLongPress}
          internalStyle={{ textAlign: logicalTextAlign(direction, 'start') }}
        />
      ) : null}
      {children}
      {timeText || (outgoing && status) ? (
        <View style={[logicalRow(direction), { alignSelf: 'flex-end', alignItems: 'center', gap: theme.spacing.xxs }]}>
          {timeText ? <Text value={timeText} variant="micro" internalColor={metaColor} internalStyle={{ opacity: 0.8 }} /> : null}
          {outgoing && status && status !== 'failed' ? (
            <Icon
              name={STATUS_ICON[status]}
              size={12}
              color={status === 'read' ? theme.color.information.subtle : metaColor}
              {...(statusLabel ? { accessibilityLabel: statusLabel } : {})}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <View
      {...(testID ? { testID } : {})}
      style={[
        logicalRow(direction),
        {
          justifyContent: outgoing ? 'flex-end' : 'flex-start',
          alignItems: 'flex-end',
          gap: theme.spacing.xs,
          marginTop: joinsAbove ? 2 : theme.spacing.sm,
        },
      ]}
    >
      {avatarSlot ? (
        <Box width={28}>
          {avatarVisible ? <Avatar size="small" {...(author?.name ? { name: author.name } : {})} {...(author?.image ? { source: author.image } : {})} /> : null}
        </Box>
      ) : null}
      <View style={{ maxWidth: '80%', alignItems: outgoing ? 'flex-end' : 'flex-start', gap: theme.spacing.xxs }}>
        {onPress || onLongPress ? (
          <BasePressable
            accessibilityRole={onPress ? 'button' : 'text'}
            accessibilityLabel={a11yLabel}
            {...(onPress ? { onPress } : {})}
            {...(onLongPress ? { onLongPress } : {})}
            minTouchTarget={false}
            pressedStyle={{ opacity: theme.opacity.pressed }}
          >
            {bubble}
          </BasePressable>
        ) : (
          <View accessible accessibilityLabel={a11yLabel}>{bubble}</View>
        )}
        {outgoing && status === 'failed' ? (
          <BasePressable
            accessibilityRole="button"
            accessibilityLabel={strings('notSent')}
            {...(onRetry ? { onPress: onRetry } : {})}
            disabled={!onRetry}
            minTouchTarget={false}
            baseStyle={[logicalRow(direction), { alignItems: 'center', gap: theme.spacing.xxs }]}
          >
            <Icon name="alert-circle" size="xs" tone="error" />
            <Text value={strings('notSent')} variant="caption" tone="error" />
          </BasePressable>
        ) : null}
      </View>
    </View>
  );
});

function AttachmentPreview({ attachment, outgoing }: { attachment: ChatAttachmentPreview; outgoing: boolean }) {
  const { theme, direction } = useTheme();
  const isImage = Boolean(attachment.uri && attachment.type?.startsWith('image/'));
  const color = outgoing ? theme.color.primary.contrast : theme.color.text.primary;
  const content = isImage ? (
    <Image
      source={{ uri: attachment.uri }}
      accessibilityLabel={attachment.name}
      style={{ width: 200, height: 150, borderRadius: theme.radius.md, backgroundColor: theme.color.overlay.subtle }}
      resizeMode="cover"
    />
  ) : (
    <View
      style={[logicalRow(direction), {
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        backgroundColor: outgoing ? 'rgba(255,255,255,0.15)' : theme.color.surface.primary,
      }]}
    >
      <Icon name={attachment.type === 'application/pdf' ? 'file-pdf' : 'file'} size="md" color={color} />
      <View style={{ flexShrink: 1 }}>
        <Text value={attachment.name} variant="bodySmall" weight="medium" internalColor={color} numberOfLines={1} />
        {attachment.size ? <Text value={formatFileSize(attachment.size)} variant="micro" internalColor={color} internalStyle={{ opacity: 0.8, writingDirection: 'ltr', textAlign: logicalTextAlign(direction, 'start') }} /> : null}
      </View>
    </View>
  );
  if (!attachment.onPress) return content;
  return (
    <BasePressable accessibilityRole="button" accessibilityLabel={attachment.name} onPress={attachment.onPress} minTouchTarget={false}>
      {content}
    </BasePressable>
  );
}

// ---------------------------------------------------------------- ChatDayDivider

export interface ChatDayDividerProps {
  /** A date ("Today", "Yesterday" or the formatted date) or your own text. */
  date: Date | number | TextValue;
  testID?: string;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const useDayLabel = () => {
  const { locale } = useTheme();
  const strings = useStrings();
  return (value: Date | number) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(date, today)) return strings('today');
    if (sameDay(date, yesterday)) return strings('yesterday');
    const options: Intl.DateTimeFormatOptions = date.getFullYear() === today.getFullYear()
      ? { weekday: 'long', day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat(locale, options).format(date);
  };
};

/** Date separator between days of a conversation. */
export const ChatDayDivider = memo(function ChatDayDivider({ date, testID }: ChatDayDividerProps) {
  const { theme } = useTheme();
  const t = useText();
  const dayLabel = useDayLabel();
  const label = date instanceof Date || typeof date === 'number' ? dayLabel(date) : t(date) ?? '';
  return (
    <Box alignItems="center" paddingVertical="sm" {...(testID ? { testID } : {})}>
      <View
        accessibilityRole="header"
        style={{
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xxs,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.color.surface.primary,
          borderWidth: theme.borderWidth.thin,
          borderColor: theme.color.border.secondary,
        }}
      >
        <Text value={label} variant="caption" weight="medium" tone="secondary" />
      </View>
    </Box>
  );
});

// ---------------------------------------------------------------- TypingIndicator

export interface TypingIndicatorProps {
  /** Who is typing ("Sara is typing"). */
  name?: string;
  testID?: string;
}

/** Three animated dots in an incoming bubble. Static when Reduce Motion is on. */
export const TypingIndicator = memo(function TypingIndicator({ name, testID }: TypingIndicatorProps) {
  const { theme, direction } = useTheme();
  const strings = useStrings();
  const { reduceMotionEnabled } = useAccessibility();
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    if (reduceMotionEnabled) return undefined;
    const animation = Animated.loop(
      Animated.stagger(
        160,
        dots.map(dot => Animated.sequence([
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [dots, reduceMotionEnabled]);
  const label = name ? strings('typingName', { name }) : strings('typing');
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      {...(testID ? { testID } : {})}
      style={[logicalRow(direction), { marginTop: theme.spacing.sm }]}
    >
      <View
        style={[logicalRow(direction), {
          gap: 4,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.color.surface.primary,
          borderWidth: theme.borderWidth.thin,
          borderColor: theme.color.border.secondary,
        }]}
      >
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.color.text.tertiary, opacity: reduceMotionEnabled ? 0.6 : dot }}
          />
        ))}
      </View>
    </View>
  );
});

// ---------------------------------------------------------------- ChatComposer

export interface ChatComposerAttachment {
  key: string;
  name: string;
  onRemove?: () => void;
}

export interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  /** Called with the trimmed text. Clear `value` yourself after sending. */
  onSend: (text: string) => void;
  /** Shows an attach button. */
  onAttach?: () => void;
  /** Files waiting to be sent, shown as removable chips above the input. */
  attachments?: readonly ChatComposerAttachment[];
  placeholder?: string;
  disabled?: boolean;
  /** Disables the send button and shows a spinner in it. */
  sending?: boolean;
  maxLength?: number;
  /** Lines before the input scrolls. Default 5. */
  maxLines?: number;
  /** Extra button before the input (e.g. emoji). */
  leading?: React.ReactNode;
  /** Replaces nothing; shown before the send button (e.g. microphone). */
  trailing?: React.ReactNode;
  autoFocus?: boolean;
  /** Pad for the home indicator when the composer sits at the screen bottom. */
  bottomInset?: number;
  testID?: string;
}

/** Message input with attach and send buttons; grows up to `maxLines`. */
export const ChatComposer = memo(function ChatComposer({
  value,
  onChangeText,
  onSend,
  onAttach,
  attachments,
  placeholder,
  disabled = false,
  sending = false,
  maxLength,
  maxLines = 5,
  leading,
  trailing,
  autoFocus = false,
  bottomInset = 0,
  testID,
}: ChatComposerProps) {
  const { theme, direction } = useTheme();
  const strings = useStrings();
  const lineHeight = theme.typography.lineHeight.md;
  const canSend = !disabled && !sending && (value.trim().length > 0 || Boolean(attachments?.length));
  const send = () => {
    if (canSend) onSend(value.trim());
  };
  return (
    <View
      {...(testID ? { testID } : {})}
      style={{
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm + bottomInset,
        gap: theme.spacing.sm,
        backgroundColor: theme.color.surface.elevated,
        borderTopWidth: theme.borderWidth.thin,
        borderTopColor: theme.color.border.secondary,
      }}
    >
      {attachments?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[logicalRow(direction), { gap: theme.spacing.xs }]}>
          {attachments.map(attachment => (
            <View
              key={attachment.key}
              style={[logicalRow(direction), {
                alignItems: 'center',
                gap: theme.spacing.xxs,
                paddingStart: theme.spacing.sm,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.color.surface.secondary,
                maxWidth: 220,
              }]}
            >
              <Icon name="attachment" size="xs" tone="secondary" />
              <Text value={attachment.name} variant="caption" numberOfLines={1} internalStyle={{ flexShrink: 1 }} />
              {attachment.onRemove ? (
                <IconButton icon="close" size={28} variant="ghost" tone="secondary" accessibilityLabel={strings('removeFile', { name: attachment.name })} onPress={attachment.onRemove} />
              ) : <Box width={theme.spacing.sm} />}
            </View>
          ))}
        </ScrollView>
      ) : null}
      <View style={[logicalRow(direction), { alignItems: 'flex-end', gap: theme.spacing.xs }]}>
        {onAttach ? (
          <IconButton icon="attachment" variant="ghost" tone="secondary" disabled={disabled} accessibilityLabel={strings('attach')} onPress={onAttach} />
        ) : null}
        {leading}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? strings('messagePlaceholder')}
          placeholderTextColor={theme.color.text.tertiary}
          multiline
          editable={!disabled}
          autoFocus={autoFocus}
          accessibilityLabel={placeholder ?? strings('messagePlaceholder')}
          {...(maxLength ? { maxLength } : {})}
          style={{
            flex: 1,
            minHeight: theme.componentHeight.md,
            maxHeight: lineHeight * maxLines + theme.spacing.sm * 2,
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.color.surface.secondary,
            color: theme.color.text.primary,
            fontSize: theme.typography.fontSize.md,
            lineHeight,
            textAlign: logicalTextAlign(direction, 'start'),
            writingDirection: direction,
            textAlignVertical: 'center',
          }}
        />
        {trailing}
        {sending ? (
          <Box width={theme.componentHeight.md} height={theme.componentHeight.md} alignItems="center" justifyContent="center">
            <Spinner label={strings('sending')} />
          </Box>
        ) : (
          <IconButton icon="send" variant="tonal" disabled={!canSend} accessibilityLabel={strings('send')} onPress={send} />
        )}
      </View>
    </View>
  );
});

// ---------------------------------------------------------------- ChatThread

export interface ChatMessage {
  id: string;
  side: ChatSide;
  createdAt: Date | string | number;
  text?: string;
  status?: ChatMessageStatus;
  author?: ChatAuthor;
  attachments?: readonly ChatAttachmentPreview[];
  /** A centred system line ("Ticket reopened") instead of a bubble. */
  system?: boolean;
}

type ThreadRow<M> =
  | { kind: 'message'; key: string; message: M; position: ChatBubblePosition }
  | { kind: 'day'; key: string; date: Date };

export interface ChatThreadProps<M extends ChatMessage> {
  /** Oldest first. */
  messages: readonly M[];
  /** Custom bubble; default renders `ChatBubble`. */
  renderMessage?: (message: M, info: { position: ChatBubblePosition }) => React.ReactElement | null;
  onRetry?: (message: M) => void;
  onLongPress?: (message: M) => void;
  /** Loads older messages when scrolled to the top. */
  onLoadOlder?: () => unknown;
  hasOlder?: boolean;
  loadingOlder?: boolean;
  /** Typing indicator at the bottom (`true` or a name). */
  typing?: boolean | string;
  /** Avatars beside incoming messages (group / support chats). */
  showAvatars?: boolean;
  /** Messages from the same sender closer than this join into one group. Default 5. */
  groupWithinMinutes?: number;
  empty?: EmptyStateProps;
  listProps?: Record<string, unknown>;
  testID?: string;
}

const toDate = (value: Date | string | number) => (value instanceof Date ? value : new Date(value));

/** Builds rows newest-first (for an inverted list) with day dividers and bubble positions. */
export function buildChatRows<M extends ChatMessage>(messages: readonly M[], groupWithinMinutes = 5): ThreadRow<M>[] {
  const joins = (a: M | undefined, b: M | undefined) => {
    if (!a || !b || a.system || b.system || a.side !== b.side) return false;
    if ((a.author?.name ?? '') !== (b.author?.name ?? '')) return false;
    const da = toDate(a.createdAt);
    const db = toDate(b.createdAt);
    return sameDay(da, db) && Math.abs(db.getTime() - da.getTime()) <= groupWithinMinutes * 60_000;
  };
  const rows: ThreadRow<M>[] = [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index] as M;
    const previous = messages[index - 1];
    const next = messages[index + 1];
    const withPrevious = joins(previous, message);
    const withNext = joins(message, next);
    const position: ChatBubblePosition = withPrevious && withNext ? 'middle' : withPrevious ? 'last' : withNext ? 'first' : 'single';
    rows.push({ kind: 'message', key: message.id, message, position });
    const date = toDate(message.createdAt);
    if (!previous || !sameDay(toDate(previous.createdAt), date)) {
      rows.push({ kind: 'day', key: `day-${date.toDateString()}`, date });
    }
  }
  return rows;
}

/**
 * A conversation: inverted list (newest at the bottom), day dividers,
 * grouped bubbles, typing indicator and "load older" on scroll to the top.
 * Put a `ChatComposer` under it.
 */
export function ChatThread<M extends ChatMessage>({
  messages,
  renderMessage,
  onRetry,
  onLongPress,
  onLoadOlder,
  hasOlder = false,
  loadingOlder = false,
  typing,
  showAvatars = false,
  groupWithinMinutes = 5,
  empty,
  listProps,
  testID,
}: ChatThreadProps<M>) {
  const { theme } = useTheme();
  const strings = useStrings();
  const rows = useMemo(() => buildChatRows(messages, groupWithinMinutes), [groupWithinMinutes, messages]);
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    if (!loadingOlder) setRequested(false);
  }, [loadingOlder]);

  if (messages.length === 0 && empty && !typing) {
    return <Box flex={1} justifyContent="center" padding="lg" {...(testID ? { testID } : {})}><EmptyState {...empty} /></Box>;
  }

  const renderRow = ({ item }: { item: ThreadRow<M> }) => {
    if (item.kind === 'day') return <ChatDayDivider date={item.date} />;
    const { message, position } = item;
    if (renderMessage) return renderMessage(message, { position });
    if (message.system) return <TimelineEvent text={message.text ?? ''} />;
    return (
      <ChatBubble
        side={message.side}
        position={position}
        time={toDate(message.createdAt)}
        showAvatar={showAvatars}
        {...(message.text ? { text: message.text } : {})}
        {...(message.status ? { status: message.status } : {})}
        {...(message.author ? { author: message.author } : {})}
        {...(message.attachments ? { attachments: message.attachments } : {})}
        {...(onRetry ? { onRetry: () => onRetry(message) } : {})}
        {...(onLongPress ? { onLongPress: () => onLongPress(message) } : {})}
      />
    );
  };

  return (
    <FlatList<ThreadRow<M>>
      {...listProps}
      inverted
      data={rows}
      keyExtractor={row => row.key}
      renderItem={renderRow}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (hasOlder && !loadingOlder && !requested && onLoadOlder) {
          setRequested(true);
          void onLoadOlder();
        }
      }}
      // Inverted: the header renders at the bottom, the footer at the top.
      ListHeaderComponent={typing ? <TypingIndicator {...(typeof typing === 'string' ? { name: typing } : {})} /> : null}
      ListFooterComponent={loadingOlder ? (
        <Box paddingVertical="md" alignItems="center"><Spinner label={strings('loadOlder')} /></Box>
      ) : null}
      {...(testID ? { testID } : {})}
    />
  );
}
