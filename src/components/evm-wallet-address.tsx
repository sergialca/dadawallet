import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useEvmWallet } from '@/hooks/use-evm-wallet';

export function EvmWalletAddress() {
  const { address, error, isLoading } = useEvmWallet();

  if (isLoading) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        Preparing EVM wallet…
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

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">EVM wallet · Sepolia</ThemedText>
      <ThemedText selectable type="code">
        {address}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: Spacing.four,
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
});
