import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePrivy } from '@privy-io/expo';
import { PrivyUIError, useLogin } from '@privy-io/expo/ui';

function loginErrorMessage(error: unknown) {
  if (error instanceof PrivyUIError) {
    if (
      error.code === 'login_flow_closed' ||
      error.code === 'ui_flow_closed' ||
      error.code === 'user_already_logged_in'
    ) {
      return null;
    }
    return error.error || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Login failed';
}

export default function LoginScreen() {
  const theme = useTheme();
  const { isReady, user, logout } = usePrivy();
  const { login } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const disableLogin = !isReady || !!user || isLoggingIn;

  async function onContinueWithGoogle() {
    setErrorMessage(null);
    setIsLoggingIn(true);

    try {
      await login({ loginMethods: ['google'] });
    } catch (error) {
      setErrorMessage(loginErrorMessage(error));
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Log in</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Sign in with Google using Privy's login modal
      </ThemedText>

      {user ? (
        <>
          <ThemedText type="small">Signed in as {user.id}</ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void logout();
            }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <ThemedText type="smallBold">Log out</ThemedText>
          </Pressable>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={disableLogin}
          onPress={() => {
            void onContinueWithGoogle();
          }}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.backgroundElement,
              opacity: disableLogin ? 0.5 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemedText type="smallBold">
            {!isReady ? 'Preparing Privy…' : isLoggingIn ? 'Opening login…' : 'Continue with Google'}
          </ThemedText>
        </Pressable>
      )}

      {errorMessage ? (
        <ThemedText type="small" style={styles.error}>
          {errorMessage}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  button: {
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
});
