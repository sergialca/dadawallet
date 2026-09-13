import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrivyProvider } from '@privy-io/expo';
import { sepolia } from 'viem/chains';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const privyAppId = process.env.EXPO_PUBLIC_PRIVY_APP_ID;
const privyClientId = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID;

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!privyAppId || !privyClientId) {
    return (
      <ThemedView style={styles.root}>
        <SafeAreaView style={styles.root} edges={['top']}>
          <ThemedView style={styles.centered}>
            <ThemedText type="title">Missing Privy env</ThemedText>
            <ThemedText type="small">Set EXPO_PUBLIC_PRIVY_APP_ID and EXPO_PUBLIC_PRIVY_CLIENT_ID, then restart Expo.</ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      supportedChains={[sepolia]}
      config={{
        embedded: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <ThemedView style={styles.root}>
        <SafeAreaView style={styles.root} edges={['top']}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </ThemedView>
    </PrivyProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
