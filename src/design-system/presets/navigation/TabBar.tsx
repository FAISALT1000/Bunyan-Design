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
  /** `'default'`: full-width bar with a top border. `'floating'`: rounded bar above the safe area. */
  variant?: 'default' | 'floating';
  /** Hide labels and show icons only. Default true (labels shown). */
  showLabels?: boolean;
  /** Pad for the home indicator / navigation bar. Default true. */
  safeArea?: boolean;
  testID?: string;
}

/** The tab bar's own height without the safe area, for toasts / FAB offsets. */
export const TAB_BAR_HEIGHT = 56;

const badgeView = (badge: TabBarBadge | undefined) => {
  if (badge === undefined || badge === 0 || badge === '') return null;
  if (typeof badge === 'number') return <CountBadge count={badge} />;
  if (typeof badge === 'string') return <CountBadge dot />;
  return <CountBadge {...(badge.count !== undefined ? { count: badge.count } : {})} {...(badge.dot ? { dot: true } : {})} {...(badge.tone ? { tone: badge.tone } : {})} />;
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
  showLabels = true,
  safeArea = true,
  testID,
}: TabBarProps) {
  const { theme, direction } = useTheme();
  const insets = useSafeArea();
  const t = useText();
  const visible = items.filter(Boolean) as TabBarItem[];
  const floating = variant === 'floating';
  const bottom = safeArea ? insets.bottom : 0;

  return (
    <View
      accessibilityRole="tablist"
      {...(testID ? { testID } : {})}
      style={floating
        ? { paddingHorizontal: theme.spacing.lg, paddingBottom: Math.max(bottom, theme.spacing.md) }
        : {
            paddingBottom: bottom,
            backgroundColor: theme.color.surface.elevated,
            borderTopWidth: theme.borderWidth.thin,
            borderTopColor: theme.color.border.secondary,
          }}
    >
      <View
        style={[
          logicalRow(direction),
          { minHeight: TAB_BAR_HEIGHT, alignItems: 'stretch' },
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
          const color = selected ? theme.color.primary.default : theme.color.text.tertiary;
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
              baseStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.xs, gap: 2 }}
              pressedStyle={{ opacity: theme.opacity.pressed }}
            >
              <Box>
                <Icon name={selected && item.activeIcon ? item.activeIcon : item.icon} size="md" color={color} />
                {item.badge !== undefined ? (
                  <View style={{ position: 'absolute', top: -4, ...(direction === 'rtl' ? { left: -8 } : { right: -8 }) }}>
                    {badgeView(item.badge)}
                  </View>
                ) : null}
              </Box>
              {showLabels && label ? (
                <Text value={label} variant="micro" weight={selected ? 'semibold' : 'medium'} internalColor={color} numberOfLines={1} />
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
