import * as Device from 'expo-device';
import { usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HintRow } from '@/components/hint-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePrivy } from '@privy-io/expo';

function getDevMenuHint() {
  if (Platform.OS === 'web') {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === 'android' ? 'cmd+m (or ctrl+m)' : 'cmd+d';
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function DashboardScreen() {
  const pathname = usePathname();
  const theme = useTheme();
  const { logout } = usePrivy();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText type="small">Screen: src/app/(app)/dashboard.tsx</ThemedText>
        <ThemedText type="small">Route: {pathname}</ThemedText>

        <ThemedText type="code" style={styles.code}>
          get started
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.stepContainer}>
          <HintRow
            title="Try editing"
            hint={<ThemedText type="code">src/app/(app)/dashboard.tsx</ThemedText>}
          />
          <HintRow title="Dev tools" hint={getDevMenuHint()} />
          <HintRow
            title="Fresh start"
            hint={<ThemedText type="code">npm run reset-project</ThemedText>}
          />
        </ThemedView>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void logout();
          }}
          style={({ pressed }) => [
            styles.logout,
            { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <ThemedText type="smallBold">Log out</ThemedText>
        </Pressable>

        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  logout: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});
