import React, { memo, useEffect, useState } from 'react';
import { Image, View, type ImageSourcePropType } from '../RNTheme';
import { useTheme } from '../../hooks';
import { Icon } from '../Icon';
import { Text } from '../Text';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  accessibilityLabel?: string;
}

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    // Array.from keeps surrogate pairs (emoji, some scripts) intact.
    .map(part => Array.from(part)[0]?.toLocaleUpperCase() ?? '')
    .join('');

export const Avatar = memo(function Avatar({
  source,
  name,
  size = 'medium',
  accessibilityLabel,
}: AvatarProps) {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  // A new source deserves a new attempt; previously one failure was sticky forever.
  useEffect(() => setFailed(false), [source]);
  const dimension = {
    small: theme.componentHeight.xs,
    medium: theme.componentHeight.sm,
    large: theme.componentHeight.lg,
    xlarge: theme.componentHeight.xl,
  }[size];
  const content = source && !failed ? (
    <Image source={source} onError={() => setFailed(true)} style={{ width: dimension, height: dimension }} />
  ) : name?.trim() ? (
    <Text variant={size === 'small' ? 'caption' : 'label'} weight="semibold" tone="link">{initialsFor(name)}</Text>
  ) : (
    <Icon name="user" size={size === 'small' ? 'sm' : size === 'xlarge' ? 'xl' : 'md'} tone="secondary" />
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? name ?? 'User avatar'}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.color.primary.subtle,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {content}
    </View>
  );
});
