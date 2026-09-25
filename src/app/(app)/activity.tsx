import { usePathname } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTabBar } from '@/components/app-tab-bar';
import { HexLogo } from '@/components/dashboard-icons';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { MaxContentWidth } from '@/constants/theme';
import { useWalletActivity } from '@/hooks/use-wallet-activity';
import { SolanaNetworkLabel } from '@/constants/tokens';
import type { WalletTransfer } from '@/lib/solana-transfers';

function TransferField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <ThemedText selectable style={styles.fieldValueMono}>
        {value}
      </ThemedText>
    </View>
  );
}

function truncateAddress(value: string) {
  if (value.length < 12) {
    return value;
  }

  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function TransferCard({ transfer }: { transfer: WalletTransfer }) {
  return (
    <View style={styles.transferCard}>
      <View style={styles.transferAccent} />
      <View style={styles.transferBody}>
        <View style={styles.transferHeader}>
          <ThemedText style={styles.asset}>{transfer.asset}</ThemedText>
          <ThemedText style={styles.value}>{transfer.value}</ThemedText>
        </View>
        <TransferField label="From" value={truncateAddress(transfer.from)} />
        <TransferField label="To" value={truncateAddress(transfer.to)} />
        <TransferField label="Hash" value={truncateAddress(transfer.hash)} />
      </View>
    </View>
  );
}

export default function ActivityScreen() {
  const pathname = usePathname();
  const { error, isLoading, transfers } = useWalletActivity();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.header}>
            <HexLogo />
            <View>
              <ThemedText style={styles.networkLabel}>{SolanaNetworkLabel}</ThemedText>
              <ThemedText style={styles.headline}>Activity</ThemedText>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.statusRow}>
              <ActivityIndicator color={Design.colors.primaryContainer} />
              <ThemedText style={styles.statusCopy}>Loading wallet activity…</ThemedText>
            </View>
          ) : null}

          {!isLoading && error ? (
            <View style={styles.statusRow}>
              <ThemedText style={styles.errorCopy}>{error.message}</ThemedText>
            </View>
          ) : null}

          {!isLoading && !error && transfers.length === 0 ? (
            <View style={styles.statusRow}>
              <ThemedText style={styles.statusCopy}>No transactions yet.</ThemedText>
            </View>
          ) : null}

          {!isLoading && !error
            ? transfers.map((transfer) => <TransferCard key={transfer.id} transfer={transfer} />)
            : null}
        </ScrollView>

        <View style={styles.debug}>
          <ThemedText style={styles.debugText}>Screen: src/app/(app)/activity.tsx</ThemedText>
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
    paddingBottom: Design.space.md,
    paddingHorizontal: Design.space.container,
    paddingTop: Design.space.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  networkLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  headline: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurface,
  },
  statusRow: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Design.space.md,
    paddingHorizontal: Design.space.md,
    paddingVertical: 12,
  },
  statusCopy: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
    flex: 1,
  },
  errorCopy: {
    ...DesignType.dataSm,
    color: Design.colors.error,
    flex: 1,
  },
  transferCard: {
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  transferAccent: {
    backgroundColor: Design.colors.secondaryContainer,
    width: 2,
  },
  transferBody: {
    flex: 1,
    gap: Design.space.sm,
    paddingHorizontal: Design.space.md,
    paddingVertical: 12,
  },
  transferHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  asset: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurface,
    fontWeight: '600',
  },
  value: {
    ...DesignType.dataLg,
    color: Design.colors.primary,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  fieldValueMono: {
    ...DesignType.dataSm,
    color: Design.colors.onSurface,
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
