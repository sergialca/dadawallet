import { Link, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HexLogo } from '@/components/dashboard-icons';
import { EmailAuthForm } from '@/components/email-auth-form';
import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { MaxContentWidth } from '@/constants/theme';
import { usePrivy } from '@privy-io/expo';

export default function LoginScreen() {
  const { user } = usePrivy();

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.brand}>
          <HexLogo />
          <View>
            <ThemedText style={styles.accessLabel}>Access</ThemedText>
            <ThemedText style={styles.headline}>Log in</ThemedText>
          </View>
        </View>

        <View style={styles.panel}>
          <EmailAuthForm mode="login" />
        </View>

        <ThemedText style={styles.footer}>
          Need an account?{' '}
          <Link href="/signup">
            <ThemedText style={styles.footerLink}>Sign up</ThemedText>
          </Link>
        </ThemedText>
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
    gap: Design.space.md,
    justifyContent: 'center',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Design.space.container,
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Design.space.sm,
  },
  accessLabel: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  headline: {
    ...DesignType.headlineMd,
    color: Design.colors.onSurface,
  },
  panel: {
    backgroundColor: Design.colors.surfaceContainer,
    borderColor: Design.colors.outlineVariant,
    borderRadius: Design.radius.lg,
    borderWidth: 1,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.md,
  },
  footer: {
    ...DesignType.bodyMd,
    color: Design.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footerLink: {
    ...DesignType.bodyMd,
    color: Design.colors.secondary,
    fontWeight: '600',
  },
});
