import { Link, Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmailAuthForm } from '@/components/email-auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { usePrivy } from '@privy-io/expo';

export default function LoginScreen() {
  const { user } = usePrivy();

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="title">Log in</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Enter your email, then the one-time password Privy sends you.
        </ThemedText>

        <EmailAuthForm mode="login" />

        <ThemedText type="small">
          Need an account?{' '}
          <Link href="/signup">
            <ThemedText type="linkPrimary">Sign up</ThemedText>
          </Link>
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    width: '100%',
  },
});
