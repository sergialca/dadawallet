import { Redirect } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { usePrivy } from '@privy-io/expo';

const LOGO = require('@/assets/images/dadawallet_logo.png');
const PULSE_MS = 1400;
const DOT_MS = 420;

function Wordmark() {
  return (
    <ThemedText accessibilityRole="header" style={styles.wordmark}>
      <ThemedText style={styles.wordmarkDada}>DADA</ThemedText>
      <ThemedText style={styles.wordmarkWallet}>WALLET</ThemedText>
    </ThemedText>
  );
}

function LoadingDots() {
  const a = useSharedValue(0.25);
  const b = useSharedValue(0.25);
  const c = useSharedValue(0.25);

  useEffect(() => {
    const pulse = (delay: number) =>
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: DOT_MS, easing: Easing.out(Easing.quad) }),
            withTiming(0.25, { duration: DOT_MS, easing: Easing.in(Easing.quad) }),
            withTiming(0.25, { duration: DOT_MS * 2 }),
          ),
          -1,
          false,
        ),
      );

    a.value = pulse(0);
    b.value = pulse(DOT_MS);
    c.value = pulse(DOT_MS * 2);
  }, [a, b, c]);

  const dotA = useAnimatedStyle(() => ({ opacity: a.value }));
  const dotB = useAnimatedStyle(() => ({ opacity: b.value }));
  const dotC = useAnimatedStyle(() => ({ opacity: c.value }));

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, dotA]} />
      <Animated.View style={[styles.dot, dotB]} />
      <Animated.View style={[styles.dot, dotC]} />
    </View>
  );
}

function BootScreen({ errorMessage }: { errorMessage?: string }) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.25);
  const loadingFade = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.06, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    glow.value = withRepeat(
      withTiming(0.7, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    loadingFade.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [glow, loadingFade, pulse]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: pulse.value * 1.08 }],
  }));
  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadingFade.value,
  }));

  return (
    <View style={styles.screen} accessibilityLabel={errorMessage ? 'Startup error' : 'Loading'}>
      <View style={styles.brand}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Animated.View style={logoStyle}>
            <Image
              accessibilityLabel="DadaWallet logo"
              contentFit="contain"
              source={LOGO}
              style={styles.logo}
            />
          </Animated.View>
        </View>
        <Wordmark />
      </View>

      {errorMessage ? (
        <ThemedText style={styles.error}>{errorMessage}</ThemedText>
      ) : (
        <Animated.View style={[styles.loadingRow, loadingStyle]}>
          <ThemedText style={styles.loadingLabel}>Loading</ThemedText>
          <LoadingDots />
        </Animated.View>
      )}
    </View>
  );
}

export default function IndexScreen() {
  const { isReady, error, user } = usePrivy();

  if (error) {
    return <BootScreen errorMessage={error.message} />;
  }

  if (!isReady) {
    return <BootScreen />;
  }

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: Design.colors.background,
    flex: 1,
    gap: Design.space.container,
    justifyContent: 'center',
    paddingHorizontal: Design.space.container,
  },
  brand: {
    alignItems: 'center',
    gap: Design.space.md,
  },
  logoWrap: {
    alignItems: 'center',
    height: 196,
    justifyContent: 'center',
    width: 196,
  },
  logoGlow: {
    backgroundColor: Design.colors.primaryContainer,
    borderRadius: Design.radius.full,
    height: 160,
    opacity: 0.2,
    position: 'absolute',
    width: 160,
  },
  logo: {
    height: 168,
    width: 168,
  },
  wordmark: {
    fontFamily: Design.fonts.sans,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 32,
  },
  wordmarkDada: {
    color: '#ffffff',
    fontFamily: Design.fonts.sans,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  wordmarkWallet: {
    color: Design.colors.secondaryContainer,
    fontFamily: Design.fonts.sans,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  loadingRow: {
    alignItems: 'center',
    gap: Design.space.sm,
  },
  loadingLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  dots: {
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  dot: {
    backgroundColor: Design.colors.primaryContainer,
    borderRadius: Design.radius.full,
    height: 6,
    width: 6,
  },
  error: {
    ...DesignType.bodyMd,
    color: Design.colors.error,
    textAlign: 'center',
  },
});
