import { Image } from 'expo-image';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { encodeFunctionData, erc20Abi, parseUnits, zeroAddress } from 'viem';

import { AppTabBar } from '@/components/app-tab-bar';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import {
  GmTokenManagerAddress,
  MinimumOrderUsdc,
  gmTokenManagerAbi,
  type OndoQuoteSide,
} from '@/constants/ondo';
import { getStockById } from '@/constants/stocks';
import { SepoliaUsdcAddress } from '@/constants/tokens';
import { MaxContentWidth } from '@/constants/theme';
import { fetchOndoAttestation, toUint18, useTradeQuote } from '@/hooks/use-trade-quote';
import { useErc20Balance } from '@/hooks/use-erc20-balance';
import { useTokenAllowance } from '@/hooks/use-token-allowance';
import { useUsdcBalance } from '@/hooks/use-usdc-balance';
import { useWalletTransaction } from '@/hooks/use-wallet-transaction';
import { formatAmount, parseAmount } from '@/lib/format-amount';

export default function BuySellScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { stockId } = useLocalSearchParams<{ stockId: string }>();
  const stock = getStockById(stockId ?? '');

  const [side, setSide] = useState<OndoQuoteSide>('buy');
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  const notionalUsdc = parseAmount(amountInput);
  const { balance: usdcBalance, isLoading: usdcLoading, refresh: refreshBalance } = useUsdcBalance();
  const { balance: stockBalance, isLoading: stockLoading, refresh: refreshStockBalance } = useErc20Balance(
    stock?.contractAddress,
    stock?.decimals ?? 18,
  );
  const { allowance, refresh: refreshAllowance } = useTokenAllowance(
    SepoliaUsdcAddress,
    GmTokenManagerAddress,
  );
  const { quote, isLoading: quoteLoading } = useTradeQuote({
    notionalUsdc,
    side,
    symbol: stock?.tokenSymbol ?? '',
    ticker: stock?.ticker ?? '',
  });
  const { sendTransaction } = useWalletTransaction();

  const requiredRaw = useMemo(() => {
    try {
      return parseUnits(notionalUsdc.toFixed(6), 6);
    } catch {
      return 0n;
    }
  }, [notionalUsdc]);

  const needsApproval = side === 'buy' && requiredRaw > 0n && allowance < requiredRaw;
  const belowMinimum = notionalUsdc > 0 && notionalUsdc < MinimumOrderUsdc;
  const exceedsUsdc = side === 'buy' && notionalUsdc > usdcBalance;
  const exceedsStock = side === 'sell' && quote.estimatedShares > stockBalance + 1e-8;
  const exceedsBalance = exceedsUsdc || exceedsStock;
  const canSubmit =
    notionalUsdc >= MinimumOrderUsdc && !exceedsBalance && !isSubmitting && !!stock && (side === 'buy' || stockBalance > 0);

  if (!stock) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ThemedText style={styles.headline}>Stock not found</ThemedText>
          <Pressable onPress={() => router.replace('/trade')} style={styles.backButton}>
            <ThemedText style={styles.meta}>Back to list</ThemedText>
          </Pressable>
          <AppTabBar />
        </SafeAreaView>
      </View>
    );
  }

  const isBuy = side === 'buy';
  const accent = isBuy ? Design.colors.primaryContainer : Design.colors.error;
  const accentOn = isBuy ? Design.colors.onPrimary : Design.colors.onError;
  const displayPrice = quote.quotePrice ?? quote.midPrice;

  async function onApprove() {
    setActionError(null);
    setIsSubmitting(true);
    try {
      await sendTransaction({
        to: SepoliaUsdcAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [GmTokenManagerAddress, requiredRaw],
        }),
      });
      await refreshAllowance();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'USDC approval failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onExecute() {
    if (!stock) {
      return;
    }

    setActionError(null);
    setIsSubmitting(true);
    try {
      const minReceive = parseUnits(Math.max(quote.minShares, 0).toFixed(6), stock.decimals);

      if (process.env.EXPO_PUBLIC_ONDO_API_KEY && stock.contractAddress !== zeroAddress) {
        const attestation = await fetchOndoAttestation({
          notionalValue: notionalUsdc.toString(),
          side,
          symbol: stock.tokenSymbol,
        });
        const quoteTuple = {
          chainId: BigInt(attestation.chainId || 1),
          attestationId: BigInt(attestation.attestationId),
          userId: attestation.userId.startsWith('0x')
            ? (attestation.userId as `0x${string}`)
            : (`0x${attestation.userId}` as `0x${string}`),
          asset: stock.contractAddress,
          price: toUint18(attestation.price),
          quantity: toUint18(attestation.tokenAmount),
          expiration: BigInt(attestation.expiration),
          side: isBuy ? 0 : 1,
          additionalData: (attestation.additionalData.startsWith('0x')
            ? attestation.additionalData
            : `0x${attestation.additionalData}`) as `0x${string}`,
        };

        await sendTransaction({
          chainId: 1,
          to: GmTokenManagerAddress,
          data: encodeFunctionData({
            abi: gmTokenManagerAbi,
            functionName: isBuy ? 'mintWithAttestation' : 'redeemWithAttestation',
            args: isBuy
              ? [quoteTuple, attestation.signature as `0x${string}`, SepoliaUsdcAddress, requiredRaw]
              : [quoteTuple, attestation.signature as `0x${string}`, SepoliaUsdcAddress, minReceive],
          }),
        });
      }

      await refreshBalance();
      await refreshStockBalance();
      await refreshAllowance();
      setCompletedMessage(
        isBuy
          ? `Purchase completed. Estimated ${formatAmount(quote.estimatedShares, 4)} ${stock.tokenSymbol}.`
          : `Sale completed. Estimated ${formatAmount(notionalUsdc, 2)} USDC.`,
      );
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Trade execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconCircle}>
              <ThemedText style={styles.backChevron}>‹</ThemedText>
            </Pressable>
            <View style={styles.titleBlock}>
              <Image contentFit="contain" source={{ uri: stock.logoUrl }} style={styles.headerLogo} />
              <View>
                <ThemedText style={styles.ticker}>{stock.ticker}</ThemedText>
                <ThemedText style={styles.meta}>{stock.name}</ThemedText>
              </View>
            </View>
            <View style={styles.iconCircle}>
              <ThemedText style={styles.star}>★</ThemedText>
            </View>
          </View>

          <View style={styles.priceCard}>
            <ThemedText style={styles.priceLabel}>Current price</ThemedText>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceValue}>
                {quoteLoading && displayPrice == null
                  ? '…'
                  : `$${displayPrice == null ? '—' : formatAmount(displayPrice, 2)}`}
              </ThemedText>
              <ThemedText style={styles.priceUnit}>USDC</ThemedText>
            </View>
          </View>

          <View style={styles.ticket}>
            <View style={styles.sideSwitch}>
              <Pressable
                onPress={() => setSide('buy')}
                style={[styles.sideButton, isBuy && { backgroundColor: Design.colors.primaryContainer }]}
              >
                <ThemedText style={[styles.sideLabel, isBuy && { color: Design.colors.onPrimary }]}>
                  Buy {stock.ticker}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setSide('sell')}
                style={[styles.sideButton, !isBuy && { backgroundColor: Design.colors.error }]}
              >
                <ThemedText style={[styles.sideLabel, !isBuy && { color: Design.colors.onError }]}>
                  Sell {stock.ticker}
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.metaRow}>
              <ThemedText style={styles.meta}>Type: Market Order</ThemedText>
              <ThemedText style={styles.meta}>Slippage: {quote.slippagePercent}%</ThemedText>
            </View>

            <ThemedText style={styles.orderLabel}>Order value</ThemedText>
            <ThemedText style={styles.available}>
              {isBuy
                ? `Available: ${usdcLoading ? '…' : `${formatAmount(usdcBalance, 2)} USDC`}`
                : `Available: ${stockLoading ? '…' : `${formatAmount(stockBalance, 4)} ${stock.tokenSymbol}`}`}
            </ThemedText>

            <View style={styles.amountBox}>
              <ThemedText style={styles.dollar}>$</ThemedText>
              <TextInput
                accessibilityLabel="Order value in USDC"
                keyboardType="decimal-pad"
                onChangeText={setAmountInput}
                placeholder="0"
                placeholderTextColor={Design.colors.outline}
                style={styles.amountInput}
                value={amountInput}
              />
              <ThemedText style={styles.amountUnit}>USDC</ThemedText>
            </View>

            <View style={styles.estimateRow}>
              <ThemedText style={styles.meta}>Estimated shares received</ThemedText>
              <ThemedText style={styles.estimate}>
                {quoteLoading ? '…' : `≈ ${formatAmount(quote.estimatedShares, 4)} ${stock.tokenSymbol}`}
              </ThemedText>
            </View>
            <View style={styles.estimateRow}>
              <ThemedText style={styles.meta}>Estimated fees / spread</ThemedText>
              <ThemedText style={styles.estimate}>{formatAmount(quote.feeUsdc, 4)} USDC</ThemedText>
            </View>
            <View style={styles.estimateRow}>
              <ThemedText style={styles.meta}>Min shares after slippage</ThemedText>
              <ThemedText style={styles.estimate}>
                {formatAmount(quote.minShares, 4)} {stock.tokenSymbol}
              </ThemedText>
            </View>

            {belowMinimum ? (
              <ThemedText style={styles.error}>Minimum order size is {MinimumOrderUsdc} USDC.</ThemedText>
            ) : null}
            {exceedsUsdc ? (
              <ThemedText style={styles.error}>Amount exceeds available USDC.</ThemedText>
            ) : null}
            {side === 'sell' && stockBalance <= 0 ? (
              <ThemedText style={styles.error}>You don’t hold any {stock.tokenSymbol} to sell.</ThemedText>
            ) : null}
            {exceedsStock ? (
              <ThemedText style={styles.error}>Order exceeds your {stock.tokenSymbol} balance.</ThemedText>
            ) : null}
            {actionError ? <ThemedText style={styles.error}>{actionError}</ThemedText> : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => {
                void (needsApproval ? onApprove() : onExecute());
              }}
              style={[styles.confirm, { backgroundColor: accent, opacity: canSubmit ? 1 : 0.5 }]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={accentOn} />
              ) : (
                <ThemedText style={[styles.confirmLabel, { color: accentOn }]}>
                  {needsApproval
                    ? 'Approve USDC'
                    : `Confirm ${isBuy ? 'buy' : 'sell'} ${stock.tokenSymbol}`}
                </ThemedText>
              )}
            </Pressable>

            <ThemedText style={styles.footerMeta}>ETH · Ondo Global Markets · Gas varies</ThemedText>
          </View>
        </ScrollView>

        <View style={styles.debug}>
          <ThemedText style={styles.debugText}>Screen: src/app/(app)/trade/[stockId].tsx</ThemedText>
          <ThemedText style={styles.debugText}>Route: {pathname}</ThemedText>
        </View>
        <AppTabBar />
      </SafeAreaView>

      <Modal animationType="fade" transparent visible={completedMessage != null}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.headline}>Order completed</ThemedText>
            <ThemedText style={styles.meta}>{completedMessage}</ThemedText>
            <Pressable
              onPress={() => {
                setCompletedMessage(null);
                setAmountInput('');
                void refreshBalance();
                void refreshStockBalance();
                void refreshAllowance();
              }}
              style={[styles.confirm, { backgroundColor: Design.colors.primaryContainer }]}
            >
              <ThemedText style={[styles.confirmLabel, { color: Design.colors.onPrimary }]}>Done</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  content: {
    gap: Design.space.md,
    paddingBottom: Design.space.md,
    paddingHorizontal: Design.space.container,
    paddingTop: Design.space.sm,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconCircle: {
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
  star: {
    color: Design.colors.success,
    fontSize: 18,
  },
  titleBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  headerLogo: {
    height: 28,
    width: 28,
  },
  ticker: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurface,
    textAlign: 'center',
  },
  meta: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
  },
  headline: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurface,
  },
  priceCard: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    paddingVertical: Design.space.md,
  },
  priceLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.success,
  },
  priceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  priceValue: {
    ...DesignType.displayLg,
    color: Design.colors.success,
  },
  priceUnit: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  ticket: {
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    gap: Design.space.sm,
    padding: Design.space.md,
  },
  sideSwitch: {
    backgroundColor: Design.colors.surfaceContainerLowest,
    borderRadius: Design.radius.md,
    flexDirection: 'row',
    padding: 4,
  },
  sideButton: {
    alignItems: 'center',
    borderRadius: Design.radius.default,
    flex: 1,
    paddingVertical: 10,
  },
  sideLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
    marginTop: Design.space.sm,
  },
  available: {
    ...DesignType.dataSm,
    color: Design.colors.secondary,
    textAlign: 'right',
  },
  amountBox: {
    alignItems: 'center',
    backgroundColor: Design.colors.surfaceContainerLowest,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm,
  },
  dollar: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurfaceVariant,
  },
  amountInput: {
    ...DesignType.displayLg,
    color: Design.colors.primary,
    flex: 1,
    paddingHorizontal: Design.space.sm,
    paddingVertical: 0,
  },
  amountUnit: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  estimate: {
    ...DesignType.dataSm,
    color: Design.colors.onSurface,
  },
  error: {
    ...DesignType.dataSm,
    color: Design.colors.error,
  },
  confirm: {
    alignItems: 'center',
    borderRadius: Design.radius.md,
    justifyContent: 'center',
    minHeight: 52,
    marginTop: Design.space.sm,
  },
  confirmLabel: {
    ...DesignType.labelCaps,
    letterSpacing: 0.8,
  },
  footerMeta: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  debug: {
    paddingHorizontal: Design.space.container,
    paddingVertical: Design.space.sm,
  },
  debugText: {
    ...DesignType.dataSm,
    color: Design.colors.onSurfaceVariant,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: Design.space.container,
  },
  modalCard: {
    backgroundColor: Design.colors.surfaceContainerHigh,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    gap: Design.space.md,
    padding: Design.space.container,
    width: '100%',
  },
  backButton: {
    padding: Design.space.md,
  },
});
