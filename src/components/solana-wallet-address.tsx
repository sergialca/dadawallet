import * as Clipboard from 'expo-clipboard';
import { Pressable, StyleSheet } from 'react-native';

import { CopyIcon } from '@/components/dashboard-icons';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { useSolanaWallet } from '@/hooks/use-solana-wallet';

export function truncateSolanaAddress(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-2)}`;
}

export function SolanaWalletAddress() {
  const { address, error, isLoading } = useSolanaWallet();

  if (isLoading) {
    return (
      <ThemedText type="small" style={styles.muted}>
        Preparing wallet…
      </ThemedText>
    );
  }

  if (error) {
    return (
      <ThemedText type="small" style={styles.error}>
        {error.message}
      </ThemedText>
    );
  }

  if (!address) {
    return null;
  }

  const truncated = truncateSolanaAddress(address);

  return (
    <Pressable
      accessibilityHint="Copies the full wallet address"
      accessibilityLabel={`Wallet address ${address}`}
      accessibilityRole="button"
      onPress={() => {
        void Clipboard.setStringAsync(address);
      }}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
    >
      <CopyIcon />
      <ThemedText style={styles.address}>{truncated}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainerLow,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Design.space.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  address: {
    ...DesignType.dataSm,
    color: Design.colors.onSurface,
  },
  muted: {
    color: Design.colors.onSurfaceVariant,
  },
  error: {
    color: Design.colors.error,
    maxWidth: 140,
  },
});
