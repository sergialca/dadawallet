import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLoginWithEmail } from '@privy-io/expo';

type EmailAuthMode = 'login' | 'signup';

type EmailAuthFormProps = {
  mode: EmailAuthMode;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSentPassword, setHasSentPassword] = useState(false);
  const { sendCode, loginWithCode, state } = useLoginWithEmail();

  const isSending = state.status === 'sending-code';
  const isSubmitting = state.status === 'submitting-code';
  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const canSendCode = emailValid && !isSending && !isSubmitting;
  const canSubmit =
    hasSentPassword && password.trim().length > 0 && !isSending && !isSubmitting;

  function onEmailChange(value: string) {
    setEmail(value);
    if (hasSentPassword) {
      setHasSentPassword(false);
      setPassword('');
    }
  }

  async function onSendCode() {
    setErrorMessage(null);

    if (!emailValid) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    try {
      const result = await sendCode({ email: trimmedEmail });
      if (!result.success) {
        setErrorMessage('Could not send a one-time password. Try again.');
        return;
      }

      setHasSentPassword(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send a one-time password.');
    }
  }

  async function onSubmit() {
    setErrorMessage(null);

    if (!emailValid) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Enter the one-time password from your email.');
      return;
    }

    try {
      await loginWithCode({
        email: trimmedEmail,
        code: password.trim(),
        disableSignup: mode === 'login',
      });
      router.replace('/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed.');
    }
  }

  return (
    <ThemedView style={styles.form}>
      <ThemedText type="small" themeColor="textSecondary">
        Enter a valid email, then send a one-time password.
      </ThemedText>

      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        onChangeText={onEmailChange}
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        textContentType="emailAddress"
        value={email}
      />

      <Pressable
        accessibilityRole="button"
        disabled={!canSendCode}
        onPress={() => {
          void onSendCode();
        }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.backgroundSelected,
            opacity: !canSendCode ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        {isSending ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <ThemedText type="smallBold">{hasSentPassword ? 'Resend password' : 'Send password'}</ThemedText>
        )}
      </Pressable>

      <TextInput
        autoCapitalize="none"
        autoComplete="one-time-code"
        autoCorrect={false}
        editable={hasSentPassword}
        keyboardType="number-pad"
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            opacity: hasSentPassword ? 1 : 0.5,
          },
        ]}
        textContentType="oneTimeCode"
        value={password}
      />

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => {
          void onSubmit();
        }}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.backgroundElement,
            opacity: !canSubmit ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <ThemedText type="smallBold">{mode === 'login' ? 'Log in' : 'Sign up'}</ThemedText>
        )}
      </Pressable>

      {errorMessage ? (
        <ThemedText type="small" style={styles.error}>
          {errorMessage}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.two,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  button: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
});
