# Overlayer Daily Tasks Automation Bot

> [!IMPORTANT]
> **Educational & Research Purpose Only**: This repository is created strictly for **educational, academic, and research purposes**. It is designed as a proof-of-concept to study Web3 automated interactions, programmatic transaction flows, and decentralized network behaviors on the Sepolia testnet. It is not intended for commercial use or any activity that violates third-party terms of service. The authors are not responsible for any misuse, account bans, or restrictions. Use of this codebase is entirely at your own risk.

A production-grade, Sybil-proof automation bot for the **Overlayer** protocol on the Ethereum Sepolia testnet. It automates daily active tasks—including Mint, Stake, Send, Receive, and Bridge—for multiple wallets with built-in proxy rotation, random delays, crash-resilient progression, and burner-routing for the Receive task.

## Key Features

- **Daily Auto-Task Syncing**: Automatically fetches daily tasks directly from the Overlayer API. If the API is unreachable, it rolls back to a local cache and scales the tasks by 1.5x (to ensure you don't miss out on rewards).
- **Burner-Routed Receive Task**: Routes C+ and T+ Receive tasks through dynamically generated burner wallets. This avoids self-transfers (which aren't indexed for points) and gets you full points without linking any of your main wallets together (fully Sybil-safe).
- **Anti-Sybil Protections**:
  - Keeps the first two wallets in order (usually master/primary wallets) and shuffles all remaining wallets to randomize processing patterns.
  - Introduces random delay windows (jitter) between actions and wallets.
  - Sends outgoing C+/T+ tokens to random burn addresses to break transfer graphs.
- **Crash Resilience**: Saves task completion state in real-time to `progress.json`. If a node or proxy connection fails, the bot skips already-completed tasks on restart.
- **Automatic Proxy Rotation**: Automatically rotates proxies from `proxy.txt` when network/timeout issues are encountered.
- **Dummy Transaction Filler**: Ensures you hit daily transaction target tasks using dummy mints, incorporating a `+2` safeguard threshold to guarantee targets are comfortably met.
- **Auto OG NFT Mint & GDPR Setup**: Auto-agrees to GDPR terms and signs messages to request Overlayer OG NFT mints for every wallet.

---

## Folder Structure

```
.
├── src/
│   ├── api/            # Overlayer REST API client
│   ├── blockchain/     # Contract addresses and ABIs
│   ├── config/         # Runtime paths and RPC selection
│   ├── runner/         # Per-wallet task execution pipeline
│   ├── storage/        # File and progress persistence
│   ├── tasks/          # Task fetching, fallback, and cache handling
│   ├── utils/          # Randomization, proxy, and user-agent helpers
│   ├── wallets/        # Wallet config and address helpers
│   └── index.ts        # Main coordinator and entrypoint
├── pv.txt              # Private keys config (one per line, gitignored)
├── proxy.txt           # Proxy config (one per line, gitignored)
├── progress.json       # Real-time task progress cache (gitignored)
└── task-list.txt       # Daily task fallback database
```

---

## Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (version 20 or higher) installed.

### 2. Install Dependencies
Clone the repository, enter the directory, and install required libraries:
```bash
npm install
```

### 3. Configuration files
Create the configuration files in the root folder:

- **`pv.txt`**: Add your private keys (hexadecimal format, one per line).
  ```
  0xabc123...
  0xdef456...
  ```
- **`proxy.txt`**: Add HTTP/S proxies (one per line). Supported format is `ip:port:user:pass` or `ip:port`.
  ```
  127.0.0.1:8080:user:password
  ```

*Note: Both files are already added to `.gitignore` to prevent uploading your keys and proxies to public repositories.*

---

## Running the Bot

Run the coordinator script:
```bash
npm start
```

The script will:
1. Load your wallets and proxies.
2. Select a working Sepolia RPC endpoint.
3. Fetch or scale daily tasks.
4. Process each wallet sequentially, executing tasks randomly, rotating proxies on failure, and immediately logging progress to `progress.json`.

To compile TypeScript without running the bot:
```bash
npm run typecheck
```
---

## Support & Tips

If this bot has helped you automate tasks or scale your research, feel free to support further development!

<a href="https://nowpayments.io/donation?api_key=c0df45b8-76ae-42f2-b09e-861973bd4794" target="_blank" rel="noreferrer noopener">
    <img src="https://nowpayments.io/images/embeds/donation-button-black.svg" alt="Crypto donation button by NOWPayments">
</a>

Direct Link: [Donate via NOWPayments](https://nowpayments.io/donation/ravi)

*(Note: GitHub sanitizes raw iframe widgets for security reasons, so please use the button or direct link above)*

---

## Safety & Security Disclaimer

- **Never share your `pv.txt` or `proxy.txt`** files. They contain sensitive credentials and must be protected.
- Keep `.gitignore` updated to block raw private keys and proxies from git commits.
- This codebase is meant for testnet/development automation and local simulation purposes.

---

## Educational License & Terms of Use

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
