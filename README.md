# dadawallet

dadawallet is a Solana mobile wallet. Sign in with email, and the app creates a wallet for you. From there you can see what you hold, send and receive funds, and trade tokenized stocks. You can also mark stocks as favorites so they are easy to find later.

Those stocks come from two providers:

- [Ondo Global Markets](https://ondo.finance) offers tokenized versions of listed stocks, such as Apple or NVIDIA. You buy and sell them with USDC on Solana.
- Tessera offers pre-IPO tokens, such as OpenAI and Kalshi. These give economic exposure to a company before it is public. They are not company shares, and they are not Ondo stocks.

You can also review incoming and outgoing transfers, and copy the wallet address or log out from the profile screen.

## Stack


| Layer       | Choice                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| App runtime | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) / React Native 0.86 / React 19                        |
| Navigation  | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routes in `src/app`)                   |
| Auth + keys | [Privy](https://docs.privy.io/basics/react-native/installation) embedded Solana wallets (`@privy-io/expo`)   |
| Chain I/O   | Solana JSON-RPC (`getBalance`, SPL token accounts) plus Privy `signAndSendTransaction`                       |
| Transfers   | Solana `getSignaturesForAddress` / `getTransaction`                                                          |
| Listed stocks | [Ondo Global Markets](https://ondo.finance) HTTP API on Solana (`solana-900`)                              |
| Pre-IPO stocks | Tessera tokenized pre-IPO exposure                                                                        |
| Favorites   | [Supabase](https://supabase.com) (`@supabase/supabase-js`), table `favorite_stocks`                         |
| UI          | React Native, the local design tokens in `src/constants/design.ts`                                           |
| Tests       | Jest + Testing Library (`pnpm test`)                                                                         |


Privy, passkeys, and secure storage need a **native development build**. Expo Go is not enough.

## Local setup



### Prerequisites

- **Node.js 22.13+** (required by Expo SDK 57)
- **[pnpm](https://pnpm.io/installation)** (this repo uses `pnpm-lock.yaml`)
- A [Privy](https://dashboard.privy.io) app with a **React Native app client**
- Optional: `EXPO_PUBLIC_SOLANA_RPC_URL` for a custom Solana node
- Optional: an [Ondo](https://ondo.finance) API key for live stock quotes
- Optional: a [Supabase](https://supabase.com) project for saved favorites (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`). Favorites stay off when these are missing.
- **iOS:** Xcode and a Simulator (or device)
- **Android:** Android Studio, SDK, and an emulator (or device)



### One-shot setup

From the repo root:

```bash
pnpm setup
```

That script:

1. Checks the Node.js version
2. Copies `.env.example` → `.env` if you do not already have `.env`
3. Runs `pnpm install`

Then edit `.env`:

```bash
EXPO_PUBLIC_PRIVY_APP_ID=
EXPO_PUBLIC_PRIVY_CLIENT_ID=
EXPO_PUBLIC_SOLANA_RPC_URL=
EXPO_PUBLIC_ONDO_API_KEY=
```

`EXPO_PUBLIC_PRIVY_*` are required or the app shows a missing-env screen. Favorites also read `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` when you add them to `.env`. Restart Metro after any `.env` change (`EXPO_PUBLIC_*` is inlined at bundle time).

### Run the app

```bash
# iOS simulator / device (builds a native dev client)
pnpm ios

# Android emulator / device
pnpm android

# Metro only (after a native client already exists)
pnpm start
```

`pnpm web` starts the web bundler, but Privy’s React Native SDK does not support web.

### Other scripts


| Script         | What it does                                       |
| -------------- | -------------------------------------------------- |
| `pnpm setup`   | Node check, `.env` bootstrap, install dependencies |
| `pnpm start`   | Start the Expo dev server                          |
| `pnpm ios`     | Compile and launch the iOS development build       |
| `pnpm android` | Compile and launch the Android development build   |
| `pnpm test`    | Run Jest once                                      |
| `pnpm lint`    | Run Expo lint                                      |




## Project layout

```
src/app/            Screens (Expo Router)
src/components/     Shared UI
src/hooks/          Wallet, balances, quotes, activity, favorites
src/lib/            Solana RPC, transfers, Supabase client, formatting
src/constants/      Tokens, Ondo, Tessera catalog, design system
db/db_scripts/      Supabase SQL for favorite stocks
```

Authenticated routes sit under `src/app/(app)/` and are wrapped in Privy’s `AuthBoundary`. Favorite rows are stored per Solana wallet address and ticker.