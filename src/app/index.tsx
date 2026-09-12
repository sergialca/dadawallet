import { Redirect, usePathname } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePrivy } from '@privy-io/expo';

export default function IndexScreen() {
  const { isReady, error, user } = usePrivy();
  const pathname = usePathname();

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Privy failed to start</ThemedText>
        <ThemedText type="small">Screen: src/app/index.tsx</ThemedText>
        <ThemedText type="small">Route: {pathname || '/'}</ThemedText>
        <ThemedText type="small" style={styles.error}>
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isReady) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Waiting for Privy</ThemedText>
        <ThemedText type="small">Screen: src/app/index.tsx</ThemedText>
        <ThemedText type="small">Route: {pathname || '/'}</ThemedText>
      </ThemedView>
    );
  }

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
});
