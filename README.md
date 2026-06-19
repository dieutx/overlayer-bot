# Overlayer Sepolia Task Bot

TypeScript bot for running Overlayer daily on-chain tasks on Ethereum Sepolia across multiple wallets.

The project is designed for server runs: it loads wallets from local secrets, fetches the latest Overlayer daily tasks when API auth is configured, executes the required Sepolia actions, records local progress, and rotates proxies when network failures happen.

## Features

- Multi-wallet task execution with configurable concurrency.
- Daily task loading from the Overlayer API with a local cache fallback.
- Supported task actions: mint, stake, send, receive, bridge, and extra transaction top-ups.
- Sepolia RPC fallback selection.
- Optional wallet-to-proxy mapping and proxy rotation after network errors.
- Local progress tracking to avoid repeating completed tasks in the same day.
- dotenvx support for encrypted local environment files.

## Project Layout

```text
src/
  api/          Overlayer API client
  blockchain/   Contract addresses and ABIs
  config/       Paths, RPCs, and secret loading
  runner/       Per-wallet task execution
  storage/      JSON and line-based local file storage
  tasks/        Daily task cache handling
  utils/        Proxy formatting, randomization, sanitization
tests/          Unit tests for deterministic planning logic
```

## Install

```bash
npm install
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Fill `.env` with your own values. Do not commit `.env`, `.env.keys`, wallet keys, proxies, progress files, logs, or generated task caches.

```env
GLOBAL_AUTH_TOKEN=
GLOBAL_AUTH_ADDRESS=
GLOBAL_PROXY=
RPC=
PRIVATE_KEYS=
PROXIES=
WALLET_CONCURRENCY=1
DUMMY_TX_TOPUP_ONLY=0
```

`PRIVATE_KEYS` and `PROXIES` accept comma-separated values or newline-separated values. Proxy entries may use host/port credentials or a full proxy URL. Use placeholders in docs and commit history only; keep real proxy hosts and credentials in local files.

If you prefer local files instead of env variables:

- `pv.txt` contains one private key per line.
- `prx.txt` contains one proxy entry per wallet line. Blank lines are allowed when a wallet should run without a proxy.
- `proxy.txt` is still supported as a legacy fallback, but `prx.txt` is preferred.

## Task Loading

The bot first tries to fetch daily tasks from the Overlayer API when both values are configured:

```env
GLOBAL_AUTH_TOKEN=
GLOBAL_AUTH_ADDRESS=
```

`GLOBAL_PROXY` is optional and is used only for the daily task API request. If it is empty, the bot falls back to the first wallet proxy; if that is also empty, the API request uses the local network.

When API loading fails or auth is not configured, the bot reads `task-list.txt` as a local cache. That file is intentionally ignored by Git because it is runtime data.

## Run

```bash
npm start
```

Run without dotenvx:

```bash
npm run start:plain
```

Process multiple wallets at the same time:

```bash
WALLET_CONCURRENCY=2 npm start
```

Run only extra dummy transaction top-ups for wallets that already completed their daily tasks:

```bash
DUMMY_TX_TOPUP_ONLY=1 npm start
```

## Secret Handling

Recommended dotenvx workflow:

```bash
npm run secrets:encrypt
npm run secrets:decrypt
```

Keep `.env.keys` only on the machine that runs the bot. Do not push it to GitHub.

The repository ignores these local runtime files:

- `.env`
- `.env.*` except `.env.example`
- `.env.keys`
- `pv.txt`
- `prx.txt`
- `proxy.txt`
- `progress.json`
- `task-list.txt`
- `logs/`
- `dist/`
- `node_modules/`
- dated local run/retry scripts under `scripts/`
- runtime snapshots matching `*.backup-*` or `*.bak-*`

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Public Repository Checklist

Before making a fork public, scan both the working tree and Git history for private keys, auth tokens, proxy hosts, proxy credentials, wallet progress, logs, and backup files. If any real secret ever reached Git history, rotate that secret before publishing.
