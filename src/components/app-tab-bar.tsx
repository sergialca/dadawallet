import { usePathname, useRouter, type Href } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ActivityIcon,
  BankIcon,
  GridIcon,
  SettingsIcon,
  SwapIcon,
} from '@/components/dashboard-icons';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';

type AppTab = {
  href?: Href;
  icon: (props: { color: string }) => ReactNode;
  key: 'dashboard' | 'portfolio' | 'trade' | 'activity' | 'settings';
  label: string;
  prominent?: boolean;
};

const TABS: AppTab[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: ({ color }) => <GridIcon color={color} />,
  },
  {
    key: 'portfolio',
    label: 'Portfolio',
    icon: ({ color }) => <BankIcon color={color} />,
  },
  {
    key: 'trade',
    label: 'Trade',
    href: '/trade',
    prominent: true,
    icon: ({ color }) => <SwapIcon color={color} />,
  },
  {
    key: 'activity',
    label: 'Activity',
    href: '/activity',
    icon: ({ color }) => <ActivityIcon color={color} />,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: ({ color }) => <SettingsIcon color={color} />,
  },
];

export function AppTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const selected = tab.href
          ? tab.href === '/trade'
            ? pathname.startsWith('/trade')
            : pathname === tab.href
          : false;
        const iconColor = tab.prominent
          ? Design.colors.onPrimary
          : selected
            ? Design.colors.primaryContainer
            : Design.colors.onSurfaceVariant;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            disabled={!tab.href}
            key={tab.key}
            onPress={() => {
              if (tab.href && pathname !== tab.href) {
                router.replace(tab.href);
              }
            }}
            style={tab.prominent ? styles.tabItemActiveWrap : styles.tabItem}
          >
            {tab.prominent ? (
              <View style={styles.tabItemActive}>
                <tab.icon color={iconColor} />
              </View>
            ) : (
              <tab.icon color={iconColor} />
            )}
            <ThemedText style={selected ? styles.tabLabelActive : styles.tabLabel}>{tab.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    alignItems: 'flex-end',
    borderTopColor: Design.colors.outlineVariant,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Design.space.sm,
    paddingTop: Design.space.sm,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingBottom: Design.space.sm,
  },
  tabItemActiveWrap: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    marginTop: -28,
  },
  tabItemActive: {
    alignItems: 'center',
    backgroundColor: Design.colors.primaryContainer,
    borderRadius: Design.radius.xl,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  tabLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  tabLabelActive: {
    ...DesignType.labelCaps,
    color: Design.colors.primaryContainer,
    fontSize: 9,
    letterSpacing: 0.6,
  },
});
