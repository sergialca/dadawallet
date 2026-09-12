import { Image } from 'expo-image';
import { usePathname } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTabBar } from '@/components/app-tab-bar';
import { HexLogo } from '@/components/dashboard-icons';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { listedStocks, stockCatalog } from '@/constants/stocks';
import { MaxContentWidth } from '@/constants/theme';
import type { StockAsset } from '@/types/stocks';

function StockRow({ stock }: { stock: StockAsset }) {
  return (
    <View style={styles.stockRow}>
      <View style={styles.logoWrap}>
        <Image
          accessibilityLabel={`${stock.name} logo`}
          contentFit="contain"
          source={{ uri: stock.logoUrl }}
          style={styles.logo}
        />
      </View>
      <View style={styles.stockCopy}>
        <ThemedText style={styles.stockName}>{stock.name}</ThemedText>
        <ThemedText style={styles.stockTicker}>{stock.ticker}</ThemedText>
      </View>
    </View>
  );
}

export default function TradeScreen() {
  const pathname = usePathname();

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
              <ThemedText style={styles.networkLabel}>{stockCatalog.provider}</ThemedText>
              <ThemedText style={styles.headline}>Trade</ThemedText>
            </View>
          </View>

          <View style={styles.stockList}>
            {listedStocks.map((stock) => (
              <StockRow key={stock.id} stock={stock} />
            ))}
          </View>
        </ScrollView>

        <View style={styles.debug}>
          <ThemedText style={styles.debugText}>Screen: src/app/(app)/trade.tsx</ThemedText>
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
  stockList: {
    gap: Design.space.sm,
  },
  stockRow: {
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
  logoWrap: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainerLowest,
    borderRadius: Design.radius.lg,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40,
  },
  logo: {
    height: 28,
    width: 28,
  },
  stockCopy: {
    flex: 1,
  },
  stockName: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurface,
    fontWeight: '600',
  },
  stockTicker: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
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
