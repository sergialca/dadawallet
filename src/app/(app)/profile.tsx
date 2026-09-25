import * as Clipboard from 'expo-clipboard';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTabBar } from '@/components/app-tab-bar';
import { CopyIcon, HexLogo } from '@/components/dashboard-icons';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { MaxContentWidth } from '@/constants/theme';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';
import { usePrivy, type User } from '@privy-io/expo';

export function getLinkedEmail(user: User | null) {
  const emailAccount = user?.linked_accounts.find((account) => account.type === 'email');
  return emailAccount && emailAccount.type === 'email' ? emailAccount.address : null;
}

export default function ProfileScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = usePrivy();
  const { address, error, isLoading } = useSolanaWallet();
  const email = getLinkedEmail(user);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.header}>
            <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <ThemedText style={styles.backChevron}>‹</ThemedText>
            </Pressable>
            <View style={styles.brand}>
              <HexLogo />
              <View>
                <ThemedText style={styles.networkLabel}>Account</ThemedText>
                <ThemedText style={styles.headline}>Profile</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.accent} />
            <View style={styles.cardBody}>
              <ThemedText style={styles.fieldLabel}>Email</ThemedText>
              <ThemedText style={email ? styles.email : styles.muted}>{email ?? 'No email linked'}</ThemedText>

              <ThemedText style={styles.fieldLabel}>Wallet address</ThemedText>
              {isLoading ? (
                <ThemedText style={styles.muted}>Preparing wallet…</ThemedText>
              ) : error ? (
                <ThemedText style={styles.error}>{error.message}</ThemedText>
              ) : address ? (
                <Pressable
                  accessibilityHint="Copies the full wallet address"
                  accessibilityLabel={`Wallet address ${address}`}
                  accessibilityRole="button"
                  onPress={() => {
                    void Clipboard.setStringAsync(address);
                  }}
                  style={({ pressed }) => [styles.addressRow, pressed && styles.pressed]}
                >
                  <ThemedText selectable style={styles.address}>
                    {address}
                  </ThemedText>
                  <CopyIcon />
                </Pressable>
              ) : (
                <ThemedText style={styles.muted}>No wallet yet</ThemedText>
              )}

              <Pressable
                accessibilityLabel="Log out"
                accessibilityRole="button"
                onPress={() => {
                  void logout();
                }}
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
              >
                <ThemedText style={styles.logoutLabel}>Log out</ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View style={styles.debug}>
          <ThemedText style={styles.debugText}>Screen: src/app/(app)/profile.tsx</ThemedText>
          <ThemedText style={styles.debugText}>Route: {pathname}</ThemedText>
        </View>

        <AppTabBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Design.colors.background,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: Design.space.md,
    paddingHorizontal: Design.space.container,
    paddingTop: Design.space.sm,
    paddingBottom: Design.space.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.full,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backChevron: {
    color: Design.colors.onSurface,
    fontSize: 28,
    lineHeight: 32,
    marginTop: -2,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
    minWidth: 0,
  },
  networkLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  headline: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurface,
  },
  card: {
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    backgroundColor: Design.colors.secondary,
    width: 2,
  },
  cardBody: {
    flex: 1,
    gap: Design.space.sm,
    padding: Design.space.md,
  },
  fieldLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  addressRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  address: {
    ...DesignType.dataLg,
    color: Design.colors.onSurface,
    flex: 1,
  },
  email: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurface,
  },
  muted: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurfaceVariant,
  },
  error: {
    ...DesignType.dataSm,
    color: Design.colors.error,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: Design.colors.primaryContainer,
    borderRadius: Design.radius.default,
    marginTop: Design.space.sm,
    paddingVertical: 12,
  },
  logoutLabel: {
    ...DesignType.bodyMd,
    color: Design.colors.onPrimary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  debug: {
    paddingHorizontal: Design.space.container,
    paddingVertical: Design.space.sm,
  },
  debugText: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
  },
});
