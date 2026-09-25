-- 1. Create the favorite_stocks table
CREATE TABLE public.favorite_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Solana public key (Base58 address, 32-44 characters)
    wallet_address VARCHAR(44) NOT NULL CHECK (char_length(wallet_address) BETWEEN 32 AND 44),
    
    -- Stock/token ticker (e.g., 'CELH', 'AAPL', 'NVDA')
    ticker VARCHAR(12) NOT NULL,
    
    -- Optional: display order/index if user reorders their watchlist
    sort_order INT DEFAULT 0,
    
    -- Creation timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Ensure a wallet cannot add the same ticker more than once
    CONSTRAINT uq_wallet_ticker UNIQUE (wallet_address, ticker)
);

-- 2. Performance indexes
-- Fast lookup when loading all favorites for a specific wallet
CREATE INDEX idx_favorites_wallet ON public.favorite_stocks(wallet_address);
-- Fast count or lookup when querying popular tickers across all users
CREATE INDEX idx_favorites_ticker ON public.favorite_stocks(ticker);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.favorite_stocks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone to read favorites by wallet address (public watchlists or read from client)
CREATE POLICY "Allow public read by wallet address"
ON public.favorite_stocks
FOR SELECT
USING (true);

-- The Expo client writes with the anon key. There is no Supabase Auth session.
CREATE POLICY "Insert favorite for a wallet"
ON public.favorite_stocks
FOR INSERT
WITH CHECK (
  char_length(wallet_address) BETWEEN 32 AND 44
  AND char_length(ticker) BETWEEN 1 AND 12
);

CREATE POLICY "Delete favorite for a wallet"
ON public.favorite_stocks
FOR DELETE
USING (true);

-- 5. Table privileges
-- RLS policies are not enough. New Supabase projects do not grant public tables to anon.
GRANT SELECT, INSERT, DELETE ON TABLE public.favorite_stocks TO anon, authenticated;