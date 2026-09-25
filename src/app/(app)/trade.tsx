import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
  type SectionList as SectionListType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppTabBar } from '@/components/app-tab-bar';
import { HexLogo } from '@/components/dashboard-icons';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { listedStocks, stockCatalog } from '@/constants/stocks';
import { MaxContentWidth } from '@/constants/theme';
import { useFavoriteTickers } from '@/hooks/use-favorite-stock';
import {
  ALPHABET,
  filterStocks,
  filterStocksByKind,
  filterStocksByTickers,
  groupStocksByNameLetter,
  type StockListFilter,
} from '@/lib/stock-list';
import type { StockAsset } from '@/types/stocks';

const LIST_FILTERS: { id: StockListFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'stock', label: 'Stocks' },
  { id: 'pre-IPO stock', label: 'Pre-IPO' },
];

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle
        cx="7"
        cy="7"
        r="4.5"
        fill="none"
        stroke={Design.colors.outline}
        strokeWidth="1.4"
      />
      <Path
        d="M10.5 10.5 14 14"
        fill="none"
        stroke={Design.colors.outline}
        strokeWidth="1.4"
      />
    </Svg>
  );
}

function StockRow({ stock }: { stock: StockAsset }) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        router.push(`/trade/${stock.id}`);
      }}
      style={styles.stockRow}
    >
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
    </Pressable>
  );
}

export default function TradeScreen() {
  const pathname = usePathname();
  const listRef = useRef<SectionListType<StockAsset>>(null);
  const [query, setQuery] = useState('');
  const [listFilter, setListFilter] = useState<StockListFilter>('all');
  const { error: favoritesError, tickers: favoriteTickers } = useFavoriteTickers();

  const sections = useMemo(() => {
    const visible =
      listFilter === 'favorites'
        ? filterStocksByTickers(listedStocks, favoriteTickers)
        : filterStocksByKind(listedStocks, listFilter);
    return groupStocksByNameLetter(filterStocks(visible, query));
  }, [favoriteTickers, listFilter, query]);
  const populatedLetters = useMemo(
    () => new Set(sections.map((section) => section.title)),
    [sections]
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.header}>
          <HexLogo />
          <View>
            <ThemedText style={styles.networkLabel}>{stockCatalog.provider}</ThemedText>
            <ThemedText style={styles.headline}>Trade</ThemedText>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon />
          <TextInput
            accessibilityLabel="Search stocks"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Search asset, ticker (e.g., AAPL, NVDA)"
            placeholderTextColor={Design.colors.outline}
            style={styles.searchInput}
            value={query}
          />
        </View>

        <View style={styles.filterRow}>
          {LIST_FILTERS.map((filter) => {
            const selected = listFilter === filter.id;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={filter.id}
                onPress={() => {
                  setListFilter(filter.id);
                }}
                style={[styles.filterChip, selected && styles.filterChipSelected]}
              >
                {selected ? <View style={styles.filterDot} /> : null}
                <ThemedText style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                  {filter.label}
                </ThemedText>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityLabel="Favorites"
            accessibilityRole="button"
            accessibilityState={{ selected: listFilter === 'favorites' }}
            onPress={() => {
              setListFilter('favorites');
            }}
            style={[styles.filterChip, listFilter === 'favorites' && styles.filterChipSelected]}
          >
            <ThemedText style={[styles.starFilter, listFilter === 'favorites' && styles.filterLabelSelected]}>
              {listFilter === 'favorites' ? '★' : '☆'}
            </ThemedText>
          </Pressable>
        </View>
        {listFilter === 'favorites' && favoritesError ? (
          <ThemedText style={styles.favoritesError}>{favoritesError}</ThemedText>
        ) : null}

        <View style={styles.listWrap}>
          <SectionList
            ref={listRef}
            contentContainerStyle={styles.listContent}
            keyExtractor={(stock) => stock.id}
            ListEmptyComponent={
              <ThemedText style={styles.emptyText}>No matching stocks</ThemedText>
            }
            renderItem={({ item }) => <StockRow stock={item} />}
            renderSectionHeader={({ section }) => (
              <ThemedText style={styles.sectionHeader}>{section.title}</ThemedText>
            )}
            sections={sections}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
            style={styles.list}
          />

          <View pointerEvents="box-none" style={styles.letterRail}>
            {ALPHABET.map((letter) => {
              const enabled = populatedLetters.has(letter);
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !enabled }}
                  disabled={!enabled}
                  key={letter}
                  onPress={() => {
                    const sectionIndex = sections.findIndex((section) => section.title === letter);
                    if (sectionIndex < 0) {
                      return;
                    }
                    listRef.current?.scrollToLocation({
                      animated: true,
                      itemIndex: 0,
                      sectionIndex,
                      viewPosition: 0,
                    });
                  }}
                >
                  <ThemedText style={[styles.railLetter, enabled && styles.railLetterActive]}>
                    {letter}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
    paddingHorizontal: Design.space.container,
    paddingTop: Design.space.sm,
  },
  networkLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  headline: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurface,
  },
  searchWrap: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainerLow,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Design.space.sm,
    marginHorizontal: Design.space.container,
    marginTop: Design.space.md,
    paddingHorizontal: Design.space.md,
    paddingVertical: 10,
  },
  searchInput: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurface,
    flex: 1,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Design.space.sm,
    marginHorizontal: Design.space.container,
    marginTop: Design.space.md,
  },
  filterChip: {
    alignItems: 'center',
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipSelected: {
    backgroundColor: Design.colors.primaryContainer,
    borderColor: Design.colors.primaryContainer,
  },
  filterDot: {
    backgroundColor: Design.colors.onPrimary,
    borderRadius: Design.radius.full,
    height: 6,
    width: 6,
  },
  filterLabel: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  filterLabelSelected: {
    color: Design.colors.onPrimary,
  },
  starFilter: {
    color: Design.colors.success,
    fontSize: 16,
    lineHeight: 20,
  },
  favoritesError: {
    ...DesignType.dataSm,
    color: Design.colors.error,
    marginHorizontal: Design.space.container,
    marginTop: Design.space.sm,
  },
  listWrap: {
    flex: 1,
    marginTop: Design.space.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Design.space.sm,
    paddingBottom: Design.space.md,
    paddingLeft: Design.space.container,
    paddingRight: 36,
  },
  sectionHeader: {
    ...DesignType.bodyMd,
    backgroundColor: Design.colors.background,
    color: Design.colors.primaryContainer,
    fontWeight: '600',
    paddingVertical: 4,
  },
  stockRow: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.xl,
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
  emptyText: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurfaceVariant,
    paddingTop: Design.space.md,
  },
  letterRail: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 0,
    width: 16,
  },
  railLetter: {
    color: Design.colors.outlineVariant,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    textAlign: 'center',
  },
  railLetterActive: {
    color: Design.colors.primaryContainer,
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
