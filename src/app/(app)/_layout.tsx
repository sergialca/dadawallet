import { Redirect, Stack } from 'expo-router';

import { ErrorScreen } from '@/components/ui/error-screen';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { AuthBoundary } from '@privy-io/expo';

export default function AppLayout() {
  return (
    <AuthBoundary
      loading={<FullScreenLoader />}
      error={(error) => <ErrorScreen error={error} />}
      unauthenticated={<Redirect href="/login" />}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AuthBoundary>
  );
}
