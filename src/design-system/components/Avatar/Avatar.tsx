import React, { memo, useState } from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';
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
  name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toLocaleUpperCase()).join('');

export const Avatar = memo(function Avatar({
  source,
  name,
  size = 'medium',
  accessibilityLabel,
}: AvatarProps) {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const dimension = {
    small: theme.componentHeight.xs,
    medium: theme.componentHeight.sm,
    large: theme.componentHeight.lg,
    xlarge: theme.componentHeight.xl,
  }[size];
  const content = source && !failed ? (
    <Image source={source} onError={() => setFailed(true)} style={{ width: dimension, height: dimension }} />
  ) : name ? (
    <Text
      value={initialsFor(name)}
      variant={size === 'small' ? 'caption' : 'labelMedium'}
      weight="semibold"
      tone="info"
    />
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
