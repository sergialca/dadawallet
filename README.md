# dadawallet

dadawallet is a mobile app for holding and trading onchain assets from a single embedded wallet. Sign in with email, get an Ethereum wallet created for you, then:

- See Sepolia ETH and USDC balances on the dashboard
- Browse and trade tokenized stocks through [Ondo Global Markets](https://ondo.finance)
- Review incoming and outgoing transfers on the activity screen
- Open profile to copy the wallet address or log out

The wallet lives on **Ethereum Sepolia** for balances and activity. Stock quotes and settlement target **Ethereum mainnet** USDC via Ondo’s API.

## Stack

| Layer | Choice |
| --- | --- |
| App runtime | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) / React Native 0.86 / React 19 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routes in `src/app`) |
| Auth + keys | [Privy](https://docs.privy.io/basics/react-native/installation) embedded Ethereum wallets (`@privy-io/expo`) |
| Chain I/O | [viem](https://viem.sh/) for RPC, ERC-20 reads, and send flows |
| Transfers | Alchemy `alchemy_getAssetTransfers` on Sepolia |
| Equities | Ondo Global Markets HTTP API + onchain mint/redeem |
| UI | React Native, the local design tokens in `src/constants/design.ts` |
| Tests | Jest + Testing Library (`pnpm test`) |

Privy, passkeys, and secure storage need a **native development build**. Expo Go is not enough.

## Local setup

### Prerequisites

- **Node.js 22.13+** (required by Expo SDK 57)
- **[pnpm](https://pnpm.io/installation)** (this repo uses `pnpm-lock.yaml`)
- A [Privy](https://dashboard.privy.io) app with a **React Native app client**
  - Allowed identifier: `com.dadawallet.app`
  - Allowed URL scheme: `dadawallet`
- An [Alchemy](https://www.alchemy.com/) API key with **Sepolia** enabled (activity screen)
- Optional: an [Ondo](https://ondo.finance) API key for live stock quotes
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
EXPO_PUBLIC_ALCHEMY_API_KEY=
EXPO_PUBLIC_ONDO_API_KEY=
```

`EXPO_PUBLIC_PRIVY_*` are required or the app shows a missing-env screen. Restart Metro after any `.env` change (`EXPO_PUBLIC_*` is inlined at bundle time).

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

| Script | What it does |
| --- | --- |
| `pnpm setup` | Node check, `.env` bootstrap, install dependencies |
| `pnpm start` | Start the Expo dev server |
| `pnpm ios` | Compile and launch the iOS development build |
| `pnpm android` | Compile and launch the Android development build |
| `pnpm test` | Run Jest once |
| `pnpm lint` | Run Expo lint |

## Project layout

```
src/app/            Screens (Expo Router)
src/components/     Shared UI
src/hooks/          Wallet, balances, quotes, activity
src/lib/            Alchemy transfers and formatting
src/constants/      Tokens, Ondo, design system
```

Authenticated routes sit under `src/app/(app)/` and are wrapped in Privy’s `AuthBoundary`.
