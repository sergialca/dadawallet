import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Design, DesignType } from '@/constants/design';
import { useLoginWithEmail } from '@privy-io/expo';

type EmailAuthMode = 'login' | 'signup';

type EmailAuthFormProps = {
  mode: EmailAuthMode;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSentPassword, setHasSentPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
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
    <View style={styles.form}>
      <View style={styles.field}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onBlur={() => setFocusedField(null)}
          onChangeText={onEmailChange}
          onFocus={() => setFocusedField('email')}
          placeholder="Email"
          placeholderTextColor={Design.colors.outline}
          style={[
            styles.input,
            focusedField === 'email' && styles.inputFocused,
          ]}
          textContentType="emailAddress"
          value={email}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSendCode}
        onPress={() => {
          void onSendCode();
        }}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            opacity: !canSendCode ? 0.5 : pressed ? 0.85 : 1,
          },
          pressed && canSendCode ? styles.neonBloom : null,
        ]}
      >
        {isSending ? (
          <ActivityIndicator color={Design.colors.secondary} />
        ) : (
          <ThemedText style={styles.secondaryButtonLabel}>
            {hasSentPassword ? 'Resend password' : 'Send password'}
          </ThemedText>
        )}
      </Pressable>

      <View style={styles.field}>
        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="one-time-code"
          autoCorrect={false}
          editable={hasSentPassword}
          keyboardType="number-pad"
          onBlur={() => setFocusedField(null)}
          onChangeText={setPassword}
          onFocus={() => setFocusedField('password')}
          placeholder="Password"
          placeholderTextColor={Design.colors.outline}
          style={[
            styles.input,
            !hasSentPassword && styles.inputDisabled,
            focusedField === 'password' && styles.inputFocused,
          ]}
          textContentType="oneTimeCode"
          value={password}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!canSubmit}
        onPress={() => {
          void onSubmit();
        }}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            opacity: !canSubmit ? 0.5 : 1,
          },
          pressed && canSubmit ? styles.neonBloom : null,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color={Design.colors.onPrimary} />
        ) : (
          <ThemedText style={styles.primaryButtonLabel}>
            {mode === 'login' ? 'Log in' : 'Sign up'}
          </ThemedText>
        )}
      </Pressable>

      {errorMessage ? (
        <ThemedText style={styles.error}>{errorMessage}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    alignSelf: 'stretch',
    gap: Design.space.md,
  },
  field: {
    gap: Design.space.sm,
  },
  label: {
    ...DesignType.labelCaps,
    color: Design.colors.onSurfaceVariant,
  },
  input: {
    ...DesignType.bodyMd,
    backgroundColor: Design.colors.surfaceContainerLowest,
    borderBottomColor: Design.colors.outlineVariant,
    borderBottomWidth: 2,
    borderRadius: Design.radius.default,
    color: Design.colors.onSurface,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm + Design.space.unit,
  },
  inputFocused: {
    borderBottomColor: Design.colors.primaryContainer,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: Design.colors.secondary,
    borderRadius: Design.radius.default,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm,
  },
  secondaryButtonLabel: {
    ...DesignType.bodyMd,
    color: Design.colors.secondary,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Design.colors.primaryContainer,
    borderRadius: Design.radius.default,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Design.space.md,
    paddingVertical: Design.space.sm,
  },
  primaryButtonLabel: {
    ...DesignType.bodyMd,
    color: Design.colors.onPrimary,
    fontWeight: '600',
  },
  neonBloom: Platform.select({
    web: {
      boxShadow: `0 0 8px ${Design.colors.primaryContainer}73`,
    },
    default: {
      shadowColor: Design.colors.primaryContainer,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 8,
    },
  }),
  error: {
    ...DesignType.dataSm,
    color: Design.colors.error,
    textAlign: 'center',
  },
});
