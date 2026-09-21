import { render, screen, userEvent } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';

import TradeScreen from '@/app/(app)/trade';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('TradeScreen', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/trade');
    mockUseRouter.mockReturnValue(router as unknown as ReturnType<typeof useRouter>);
  });

  test('lists stocks alphabetically by company name', async () => {
    await render(<TradeScreen />);

    expect(screen.getByText('Alphabet Inc.')).toBeOnTheScreen();
    expect(screen.getByText('Apple Inc.')).toBeOnTheScreen();
    expect(screen.getByText('Aurora Innovation, Inc.')).toBeOnTheScreen();
    expect(screen.getByText('AUR')).toBeOnTheScreen();
    expect(screen.getAllByText('A').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('M').length).toBeGreaterThanOrEqual(1);
  });

  test('filters the list with All, Stocks, and Pre-IPO chips', async () => {
    const user = userEvent.setup();
    await render(<TradeScreen />);

    await user.press(screen.getByText('Stocks'));
    expect(screen.getByText('Apple Inc.')).toBeOnTheScreen();
    expect(screen.queryByText('Kalshi')).toBeNull();

    await user.press(screen.getByText('Pre-IPO'));
    expect(screen.getByText('Kalshi')).toBeOnTheScreen();
    expect(screen.queryByText('Apple Inc.')).toBeNull();

    await user.press(screen.getByText('All'));
    expect(screen.getByText('Apple Inc.')).toBeOnTheScreen();
    expect(screen.getByText('Aurora Innovation, Inc.')).toBeOnTheScreen();
  });

  test('filters the list from the search field', async () => {
    const user = userEvent.setup();
    await render(<TradeScreen />);

    await user.type(screen.getByLabelText('Search stocks'), 'nvda');

    expect(screen.getByText('NVIDIA Corporation')).toBeOnTheScreen();
    expect(screen.queryByText('Apple Inc.')).toBeNull();
  });
});
