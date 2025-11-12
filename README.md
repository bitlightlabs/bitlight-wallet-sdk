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

> **Note:** Compatible with Bitlight Wallet version 1.2.3 and above.

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

| Method                           | Description                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `getAccounts()`                  | Returns full account object with `btc_pub` and `rgb_pub`.                                   |
| `getAddress()`                   | Returns address object: `{ address }`.                                                      |
| `getNetwork()`                   | Returns current network (e.g., `'bitcoin'`, `'regtest'`).                                   |
| `getVersion()`                   | Returns wallet version string.                                                              |
| `getContractUtxo(contractId)`    | Returns the UTXO for a given RGB contract.                                                  |
| `getContractBalance(contractId)` | Returns the confirmed and unconfirmed balance for a given RGB contract.                     |
| `publicIssue(post)`              | Issues a new RGB asset. `post` is a PublicIssuePost object. Returns PublicIssueResult.      |
| `sendBitcoin(post)`              | Send BTC to a given address. `post` is a SendBitcoinPost object. Returns SendBitcoinResult. |

### 🔁 Network

| Method                                                        | Description                                        |
| ------------------------------------------------------------- | -------------------------------------------------- |
| `switchNetwork(network: 'bitcoin' \| 'testnet' \| 'regtest')` | Switches active network. Returns new network info. |

### ✍️ Signing

| Method                         | Description                 |
| ------------------------------ | --------------------------- |
| `signMessage(message: string)` | Returns `{ pubkey, sign }`. |

### 💸 Payjoin

| Method                     | Description                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `payjoinBuy(post)`         | Initiates a payjoin buy. `post` is a PayjoinBuyPost object. Returns PayjoinBuyResult.      |
| `payjoinBuyConfirm(post)`  | Confirms a payjoin buy. `post` is a PayjoinPost object. Returns PayjoinBuyConfirmResult.   |
| `payjoinSell(post)`        | Initiates a payjoin sell. `post` is a PayjoinPost object. Returns PayjoinSellResult.       |
| `payjoinSellConfirm(post)` | Confirms a payjoin sell. `post` is a PayjoinPost object. Returns PayjoinSellConfirmResult. |

### 🪙 Bitcoin Transfer

| Method              | Description                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `sendBitcoin(post)` | Send BTC to a given address. `post` is a SendBitcoinPost object. Returns SendBitcoinResult. |

## Types

```ts
// Supported network types
type NetworkType = 'bitcoin' | 'testnet' | 'regtest';

// Result of connect()
interface ConnectResult {
  address: string; // Connected wallet address
}

// Result of signMessage()
interface SignResult {
  pubkey: string; // Public key used for signing
  sign: string; // Signature
}

// Account information
interface BitlightAccount {
  address: string; // Main address
  btc_pub: string; // Bitcoin public key
  rgb_pub: string; // RGB public key
}

// Address information
interface BitlightAddress {
  address: string; // Main address
}

interface PayjoinBuyPost {
  assets_name: string; // Name of the RGB asset
  ticker: string; // Asset ticker symbol
  precision: number; // Number of decimals (e.g. 8 for Bitcoin-like assets)
  contract_id: string; // RGB contract ID
  receive_rgb_amount: string; // Amount of RGB asset to receive (as string for compatibility)
  sell_btc_address: string; // Seller's BTC address
  sell_amount_sat: string; // Amount of BTC to sell, in satoshis
  utxo: string; // UTXO to use for the transaction
  state?: string; // Optional state field
}

// Result of payjoinBuy()
interface PayjoinBuyResult {
  invoice: string; // Lightning invoice
  psbt: string; // Partially signed Bitcoin transaction
  txid: string; // Transaction ID
  error?: string; // Error message if any
  state?: string; // Optional state
}

// Parameters for payjoinBuyConfirm, payjoinSell, payjoinSellConfirm
interface PayjoinPost {
  invoice: string; // Lightning invoice
  sell_amount_sat: string; // Amount of BTC to sell, in satoshis
  psbt: string; // Partially signed Bitcoin transaction
  payment_id?: string; // Optional payment ID
  state?: string; // Optional state
}

// Result of payjoinSellSign
interface PayjoinSignResult {
  psbt: string; // Partially signed Bitcoin transaction
  txid: string; // Transaction ID
  error?: string; // Error message if any
  state?: string; // Optional state
}

// Result of payjoinBuyConfirm
interface PayjoinBuyConfirmResult {
  psbt: string; // Partially signed Bitcoin transaction
  error?: string; // Error message if any
  state?: string; // Optional state
}

// Result of payjoinSell
interface PayjoinSellResult {
  psbt: string; // Partially signed Bitcoin transaction
  payment_id: string; // Payment ID
  error?: string; // Error message if any
  state?: string; // Optional state
}

// Result of payjoinSellConfirm
interface PayjoinSellConfirmResult {
  paid: boolean; // Whether payment was successful
  txid: string; // Transaction ID
  error?: string; // Error message if any
  state?: string; // Optional state
}

// Parameters for publicIssue
interface PublicIssuePost {
  ticker: string; // Asset ticker symbol
  name: string; // Asset name
  supply: number; // Total supply
  precision: number; // Number of decimals, must be an integer between 1 and 18
  /**
   * seal: The txid of the transaction sending fee (e.g. 30000 sats) to fee_payee address
   * on testnet. Example fee_payee: "tb1pn0s2pajhsw38fnpgcj79w3kr3c0r89y3xyekjt8qaudje70g4shs8keguu"
   */
  seal: string;
}

// Result of getContractBalance
interface GetContractBalanceResult {
  confirmed: string; // Confirmed balance
  unconfirmed: string; // Unconfirmed balance
}

// Result of publicIssue
interface PublicIssueResult {
  id: string; // Issued contract ID
}

// Send Bitcoin
interface SendBitcoinPost {
  toAddress: string; // Recipient BTC address
  satoshis: number; // Amount in satoshis
}

interface SendBitcoinResult {
  txid: string; // Transaction ID
}

// BitlightInjected interface (window.bitlight)
interface BitlightInjected {
  connect: () => Promise<ConnectResult>;
  disconnect: () => Promise<boolean>;
  getAccounts: () => Promise<BitlightAccount>;
  getAddress: () => Promise<BitlightAddress>;
  getNetwork: () => Promise<{ network: NetworkType }>;
  switchNetwork: (network: NetworkType) => Promise<{ network: NetworkType }>;
  signMessage: (message: string) => Promise<SignResult>;
  getVersion: () => Promise<{ version: string }>;
  getRgbUtxos: () => Promise<any[]>;
  payjoinBuy: (post: PayjoinBuyPost) => Promise<PayjoinBuyResult>;
  payjoinBuySign: (post: PayjoinPost) => Promise<PayjoinBuyConfirmResult>;
  payjoinSell: (post: PayjoinPost) => Promise<PayjoinSellResult>;
  payjoinSellSign: (post: PayjoinPost) => Promise<PayjoinSellConfirmResult>;
  getContractBalance: (
    contract_id: string
  ) => Promise<GetContractBalanceResult>;
  publicIssue: (post: PublicIssuePost) => Promise<PublicIssueResult>;
  sendBitcoin: (post: SendBitcoinPost) => Promise<SendBitcoinResult>;
}
```

## License

MIT
