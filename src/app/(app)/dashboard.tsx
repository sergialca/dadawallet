import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTabBar } from '@/components/app-tab-bar';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  SolAssetIcon,
  HexLogo,
  MsftAssetIcon,
  PortfolioSparkline,
  UsdcAssetIcon,
  UserIcon,
} from '@/components/dashboard-icons';
import { SolanaWalletAddress } from '@/components/solana-wallet-address';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { SolanaNetworkLabel } from '@/constants/tokens';
import { MaxContentWidth } from '@/constants/theme';
import { useWalletBalances, type WalletAsset } from '@/hooks/use-wallet-balances';

type WatchlistRow = {
  amount: string;
  id: string;
  name: string;
  sentiment?: 'bearish';
  symbol: string;
  value: string;
};

const WATCHLIST: WatchlistRow[] = [
  {
    id: 'msft',
    name: 'Microsoft',
    symbol: 'MSFT',
    amount: '1,000,000',
    value: '-$2.45 (-5%)',
    sentiment: 'bearish',
  },
];

function AssetIcon({ icon }: { icon: WalletAsset['icon'] }) {
  if (icon === 'sol') {
    return <SolAssetIcon />;
  }
  return <UsdcAssetIcon />;
}

export default function DashboardScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { assets, error, isLoading, totalUsdLabel } = useWalletBalances();
  const [listTab, setListTab] = useState<'assets' | 'watchlist'>('assets');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.header}>
            <View style={styles.brand}>
              <HexLogo />
              <View>
                <ThemedText style={styles.networkLabel}>{SolanaNetworkLabel}</ThemedText>
                <ThemedText style={styles.headline}>Dashboard</ThemedText>
              </View>
            </View>
            <View style={styles.headerActions}>
              <SolanaWalletAddress />
              <Pressable
                accessibilityLabel="Profile"
                accessibilityRole="button"
                onPress={() => {
                  router.push('/profile');
                }}
                style={styles.profileButton}
              >
                <UserIcon />
              </Pressable>
            </View>
          </View>

          <View style={styles.portfolioCard}>
            <View style={styles.portfolioHeader}>
              <ThemedText style={styles.portfolioLabel}>Total portfolio value</ThemedText>
              {error ? (
                <ThemedText style={styles.balanceError}>Balance unavailable</ThemedText>
              ) : null}
            </View>
            <ThemedText style={styles.portfolioValue}>
              {isLoading ? '…' : totalUsdLabel}
            </ThemedText>
            <View style={styles.sparkline}>
              <PortfolioSparkline />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <ArrowDownIcon />
              </View>
              <ThemedText style={styles.actionLabel}>Receive</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <ArrowUpIcon />
              </View>
              <ThemedText style={styles.actionLabel}>Send</ThemedText>
            </Pressable>
          </View>

          <View style={styles.listTabs}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: listTab === 'assets' }}
              onPress={() => setListTab('assets')}
            >
              <ThemedText style={[styles.listTab, listTab === 'assets' && styles.listTabActive]}>
                Assets
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: listTab === 'watchlist' }}
              onPress={() => setListTab('watchlist')}
            >
              <ThemedText style={[styles.listTab, listTab === 'watchlist' && styles.listTabActive]}>
                Watchlist
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.assetList}>
            {listTab === 'assets' && isLoading ? (
              <View style={styles.assetRow}>
                <ActivityIndicator color={Design.colors.primaryContainer} />
                <ThemedText style={styles.assetSymbol}>Loading wallet balances…</ThemedText>
              </View>
            ) : null}

            {listTab === 'assets' && !isLoading && error ? (
              <View style={styles.assetRow}>
                <ThemedText style={styles.balanceError}>{error.message}</ThemedText>
              </View>
            ) : null}

            {listTab === 'assets' && !isLoading && !error
              ? assets.map((asset) => (
                  <View key={asset.id} style={styles.assetRow}>
                    <AssetIcon icon={asset.icon} />
                    <View style={styles.assetCopy}>
                      <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
                      <ThemedText style={styles.assetSymbol}>{asset.symbol}</ThemedText>
                    </View>
                    <View style={styles.assetValues}>
                      <ThemedText style={styles.assetAmount}>{asset.amountLabel}</ThemedText>
                      <ThemedText style={styles.assetValue}>{asset.usdLabel}</ThemedText>
                    </View>
                  </View>
                ))
              : null}

            {listTab === 'watchlist'
              ? WATCHLIST.map((asset) => (
                  <View key={asset.id} style={styles.assetRow}>
                    <MsftAssetIcon />
                    <View style={styles.assetCopy}>
                      <ThemedText style={styles.assetName}>{asset.name}</ThemedText>
                      <ThemedText style={styles.assetSymbol}>{asset.symbol}</ThemedText>
                    </View>
                    <View style={styles.assetValues}>
                      <ThemedText style={styles.assetAmount}>{asset.amount}</ThemedText>
                      <ThemedText
                        style={[
                          styles.assetValue,
                          asset.sentiment === 'bearish' && styles.assetValueBearish,
                        ]}
                      >
                        {asset.value}
                      </ThemedText>
                    </View>
                  </View>
                ))
              : null}
          </View>
        </ScrollView>

        <View style={styles.debug}>
          <ThemedText style={styles.debugText}>Screen: src/app/(app)/dashboard.tsx</ThemedText>
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
    justifyContent: 'space-between',
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: Design.colors.primaryContainer,
    borderRadius: Design.radius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  portfolioCard: {
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: Design.space.md,
    paddingTop: Design.space.md,
  },
  portfolioHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portfolioLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  balanceError: {
    ...DesignType.dataSm,
    color: Design.colors.error,
    flex: 1,
  },
  portfolioValue: {
    ...DesignType.displayLg,
    color: Design.colors.primary,
    marginTop: Design.space.sm,
  },
  sparkline: {
    marginHorizontal: -Design.space.md,
    marginTop: Design.space.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Design.space.md,
  },
  actionCard: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    gap: Design.space.sm,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.md,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainerHigh,
    borderRadius: Design.radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  actionLabel: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurface,
    fontWeight: '600',
  },
  listTabs: {
    flexDirection: 'row',
    gap: Design.space.container,
    paddingTop: Design.space.sm,
  },
  listTab: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  listTabActive: {
    color: Design.colors.onSurface,
  },
  assetList: {
    gap: Design.space.sm,
  },
  assetRow: {
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
  assetCopy: {
    flex: 1,
  },
  assetName: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurface,
    fontWeight: '600',
  },
  assetSymbol: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetAmount: {
    ...DesignType.dataLg,
    color: Design.colors.onSurface,
  },
  assetValue: {
    ...DesignType.dataSm,
    color: Design.colors.secondary,
  },
  assetValueBearish: {
    color: Design.colors.error,
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
