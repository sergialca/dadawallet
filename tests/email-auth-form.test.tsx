import { useLoginWithEmail } from '@privy-io/expo';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { EmailAuthForm } from '@/components/email-auth-form';

const WRONG_PASSWORD = '123456';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@privy-io/expo', () => ({
  useLoginWithEmail: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseLoginWithEmail = useLoginWithEmail as jest.MockedFunction<typeof useLoginWithEmail>;

describe('EmailAuthForm login', () => {
  const router = {
    replace: jest.fn(),
  };
  const loginWithCode = jest.fn();
  const sendCode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue(router as unknown as ReturnType<typeof useRouter>);

    loginWithCode.mockImplementation(async ({ code }: { code: string }) => {
      if (code === WRONG_PASSWORD) {
        throw new Error('Invalid credentials');
      }
    });

    mockUseLoginWithEmail.mockReturnValue({
      sendCode,
      loginWithCode,
      state: { status: 'initial' },
    } as ReturnType<typeof useLoginWithEmail>);
  });

  test('does not log in with the wrong predefined password 123456', async () => {
    sendCode.mockResolvedValue({ success: true });

    await render(<EmailAuthForm mode="login" />);

    await fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@example.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Send password' }));
    await fireEvent.changeText(screen.getByPlaceholderText('Password'), WRONG_PASSWORD);
    await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeOnTheScreen();
    });

    expect(loginWithCode).toHaveBeenCalledWith({
      email: 'user@example.com',
      code: WRONG_PASSWORD,
      disableSignup: true,
    });
    expect(router.replace).not.toHaveBeenCalledWith('/dashboard');
  });
});
