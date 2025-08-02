# Bitlight Wallet SDK

A JavaScript SDK to interact with the Bitlight Wallet extension. Supports UMD and ESM builds.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Types](#types)
- [License](#license)

## Overview

Bitlight Wallet SDK provides a simple interface for web applications to interact with the Bitlight browser wallet extension. It supports account management, network switching, message signing, and more.

> **Note:** Compatible with Bitlight Wallet version 1.0.2 and above.

## Installation

```bash
npm install bitlight-wallet-sdk
```

## Usage

```ts
const bitlightSDK = new BitlightWalletSDK();

async function connect() {
  if (bitlightSDK.isReady()) {
    const connected = await bitlightSDK.isConnected();
    if (!connected) {
      await bitlightSDK.connect();
    }

    const address = await bitlightSDK.getAddress();
    console.log('Connected address:', address);
  } else {
    console.warn('Bitlight not ready');
  }
}
```

## API Reference

### ✅ Connection

| Method          | Description                                       |
| --------------- | ------------------------------------------------- |
| `connect()`     | Request wallet connection. Returns `{ address }`. |
| `disconnect()`  | Disconnects wallet. Returns `boolean`.            |
| `isConnected()` | Returns `true` if wallet is connected.            |
| `isReady()`     | Returns `true` if wallet has been injected.       |

### 🧾 Wallet Info

| Method          | Description                                               |
| --------------- | --------------------------------------------------------- |
| `getAccounts()` | Returns full account object with `btc_pub` and `rgb_pub`. |
| `getAddress()`  | Returns address object: `{ address }`.                    |
| `getNetwork()`  | Returns current network (e.g., `'bitcoin'`, `'regtest'`). |
| `getVersion()`  | Returns wallet version string.                            |

### 🔁 Network

| Method                                                        | Description                                        |
| ------------------------------------------------------------- | -------------------------------------------------- |
| `switchNetwork(network: 'bitcoin' \| 'testnet' \| 'regtest')` | Switches active network. Returns new network info. |

### ✍️ Signing

| Method                         | Description                 |
| ------------------------------ | --------------------------- |
| `signMessage(message: string)` | Returns `{ pubkey, sign }`. |

## Types

```ts
type NetworkType = 'bitcoin' | 'testnet' | 'regtest';

interface ConnectResult {
  address: string;
}

interface SignResult {
  pubkey: string;
  sign: string;
}

interface BitlightAccount {
  address: string;
  btc_pub: string;
  rgb_pub: string;
}

interface BitlightAddress {
  address: string;
}
```

## License

MIT
