import React, { memo } from 'react';
import { Box } from '../../base/Box';
import { BasePressable } from '../../base/Pressable';
import { View } from '../../components/RNTheme';
import { useSafeArea, useTheme } from '../../hooks';
import { useText, type TextValue } from '../../i18n';
import { logicalRow } from '../../utilities/styles';
import { CountBadge } from '../../components/CountBadge';
import { Icon, type IconName } from '../../components/Icon';
import { Text } from '../../components/Text';
import { tabBarBaseTokens } from '../../tokens';

export type TabBarBadge = number | string | { count?: number; dot?: boolean; tone?: 'primary' | 'error' | 'neutral' };

export interface TabBarItem {
  key: string;
  icon: IconName;
  /** Icon of the selected tab (e.g. a filled variant). */
  activeIcon?: IconName;
  label?: TextValue;
  /** Translation key (Bunyan prop naming); `label` is the fallback. */
  labelLocalize?: string;
  badge?: TabBarBadge;
  accessibilityLabel?: string;
  testID?: string;
}

export interface TabBarProps {
  items: readonly (TabBarItem | false | null | undefined)[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Long press on a tab (e.g. account switcher). */
  onLongPress?: (key: string) => void;
  /** `minimal`: X-inspired monochrome icons; `floating`: rounded surface; `default`: platform styling. */
  variant?: 'default' | 'floating' | 'minimal';
  /** Hide labels and show icons only. Defaults to false for minimal; true otherwise. */
  showLabels?: boolean;
  /** Pad for the home indicator / navigation bar. Default true. */
  safeArea?: boolean;
  testID?: string;
}

/** Shared/iOS baseline without safe area. For platform offsets use platformTokens.components.tabBar.minimumHeight. */
export const TAB_BAR_HEIGHT = 56;

const badgeView = (badge: TabBarBadge | undefined, tone: 'primary' | 'error' = 'error') => {
  if (badge === undefined || badge === 0 || badge === '') return null;
  if (typeof badge === 'number') return <CountBadge count={badge} tone={tone} />;
  if (typeof badge === 'string') return <CountBadge dot tone={tone} />;
  return <CountBadge tone={badge.tone ?? tone} {...(badge.count !== undefined ? { count: badge.count } : {})} {...(badge.dot ? { dot: true } : {})} />;
};

/**
 * Bottom tab bar with icons, labels and count badges. Use it on its own or as
 * React Navigation's `tabBar` with `tabBarPropsFromNavigation`.
 *
 * ```tsx
 * <Tab.Navigator tabBar={props => <TabBar {...tabBarPropsFromNavigation(props, {
 *   Home: { icon: 'home' }, Inbox: { icon: 'inbox', badge: unread }, Settings: { icon: 'settings' },
 * })} />}>
 * ```
 */
export const TabBar = memo(function TabBar({
  items,
  activeKey,
  onChange,
  onLongPress,
  variant = 'default',
  showLabels,
  safeArea = true,
  testID,
}: TabBarProps) {
  const { theme, direction, platformTokens } = useTheme();
  const tokens = platformTokens.components.tabBar;
  const insets = useSafeArea();
  const t = useText();
  const visible = items.filter(Boolean) as TabBarItem[];
  const floating = variant === 'floating';
  const minimal = variant === 'minimal';
  const labelsVisible = showLabels ?? !minimal;
  const activeIndicator = !minimal && tokens.activeIndicator;
  const surface = minimal ? theme.color.background.primary : theme.color.surface.elevated;
  const bottom = safeArea ? insets.bottom : 0;

  return (
    <View
      accessibilityRole="tablist"
      {...(testID ? { testID } : {})}
      style={floating
        ? { paddingHorizontal: theme.spacing.lg, paddingBottom: Math.max(bottom, theme.spacing.md) }
        : {
            paddingBottom: bottom,
            backgroundColor: surface,
            borderTopWidth: theme.borderWidth.thin,
            borderTopColor: theme.color.border.secondary,
          }}
    >
      <View
        style={[
          logicalRow(direction),
          { minHeight: minimal ? tabBarBaseTokens.minimal.minHeight : tokens.minimumHeight, alignItems: 'stretch' },
          floating ? {
            borderRadius: theme.radius.xl,
            backgroundColor: theme.color.surface.elevated,
            ...theme.shadow.lg,
          } : null,
        ]}
      >
        {visible.map(item => {
          const selected = item.key === activeKey;
          const label = t(item.labelLocalize ? { localeKey: item.labelLocalize, fallback: t(item.label) ?? item.key } : item.label);
          const color = selected ? minimal ? theme.color.text.primary : theme.color.text.link : theme.color.text.secondary;
          const iconColor = selected && activeIndicator
            ? theme.color.primary.onSubtle ?? theme.color.text.primary
            : color;
          const badgeLabel = typeof item.badge === 'number' && item.badge > 0
            ? String(item.badge)
            : typeof item.badge === 'object' && item.badge.count ? String(item.badge.count) : undefined;
          return (
            <BasePressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={[item.accessibilityLabel ?? label ?? item.key, badgeLabel].filter(Boolean).join(', ')}
              onPress={() => onChange(item.key)}
              {...(onLongPress ? { onLongPress: () => onLongPress(item.key) } : {})}
              {...(item.testID ? { testID: item.testID } : {})}
              baseStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xs, borderWidth: platformTokens.interaction.focusRingWidth, borderColor: theme.color.overlay.transparent, gap: 2 }}
              pressedStyle={{ opacity: theme.opacity.pressed }}
              focusedStyle={{ borderColor: theme.color.border.focus, borderWidth: platformTokens.interaction.focusRingWidth }}
            >
              <Box internalStyle={activeIndicator ? {
                minWidth: 64,
                minHeight: 32,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? theme.color.primary.subtle : theme.color.overlay.transparent,
              } : {}}>
                <Icon name={selected ? item.activeIcon ?? (minimal && item.icon === 'home' ? 'home-filled' : item.icon) : item.icon} size={minimal ? tabBarBaseTokens.minimal.iconSize : tokens.iconSize} color={iconColor} strokeWidth={minimal && selected ? tabBarBaseTokens.minimal.selectedStrokeWidth : theme.borderWidth.medium} />
                {item.badge !== undefined ? (
                  <View style={{ position: 'absolute', top: -4, ...(direction === 'rtl' ? { left: -8 } : { right: -8 }) }}>
                    {badgeView(item.badge, minimal ? 'primary' : 'error')}
                  </View>
                ) : null}
              </Box>
              {labelsVisible && label ? (
                <Text value={label} variant={tokens.labelVariant} weight={selected ? 'semibold' : 'medium'} internalColor={color} align="center" />
              ) : null}
            </BasePressable>
          );
        })}
      </View>
    </View>
  );
});

/** The parts of React Navigation's `BottomTabBarProps` the adapter reads. */
export interface NavigationTabBarPropsLike {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string; tabBarLabel?: unknown; tabBarAccessibilityLabel?: string; tabBarBadge?: unknown } }>;
  navigation: {
    emit: (event: { type: 'tabPress' | 'tabLongPress'; target: string; canPreventDefault?: boolean }) => { defaultPrevented?: boolean } | unknown;
    navigate: (name: string) => void;
  };
}

/**
 * Maps React Navigation's tab bar props to `TabBar` props. `config` gives each
 * route its icon (and optionally label / badge); titles and `tabBarBadge`
 * come from the screen options.
 */
export function tabBarPropsFromNavigation(
  { state, descriptors, navigation }: NavigationTabBarPropsLike,
  config: Record<string, Omit<TabBarItem, 'key'>>,
): Pick<TabBarProps, 'items' | 'activeKey' | 'onChange' | 'onLongPress'> {
  const items = state.routes.map(route => {
    const options = descriptors[route.key]?.options ?? {};
    const own = config[route.name];
    const optionBadge = options.tabBarBadge;
    const badge = own?.badge ?? (typeof optionBadge === 'number' || typeof optionBadge === 'string' ? optionBadge : undefined);
    const label = own?.label ?? (typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name);
    const item: TabBarItem = { icon: 'home', ...own, key: route.key, label };
    if (badge !== undefined) item.badge = badge;
    if (options.tabBarAccessibilityLabel) item.accessibilityLabel = options.tabBarAccessibilityLabel;
    return item;
  });
  const routeOf = (key: string) => state.routes.find(route => route.key === key);
  const active = state.routes[state.index];
  return {
    items,
    activeKey: active ? active.key : '',
    onChange: key => {
      const route = routeOf(key);
      if (!route) return;
      const event = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true }) as { defaultPrevented?: boolean } | undefined;
      if (key !== active?.key && !event?.defaultPrevented) navigation.navigate(route.name);
    },
    onLongPress: key => {
      navigation.emit({ type: 'tabLongPress', target: key });
    },
  };
}
