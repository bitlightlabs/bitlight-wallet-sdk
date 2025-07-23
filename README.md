# Bitlight Wallet SDK

A JavaScript SDK to interact with the Bitlight browser wallet extension. Supports UMD and ESM builds.

## Installation

```bash
npm install bitlight-wallet-sdk
```

## Usage

```ts
import BitlightWalletSDK from 'bitlight-wallet-sdk';

const sdk = new BitlightWalletSDK();

sdk.getAccounts().then((accounts) => {
  console.log(accounts);
});
```

## Supported Methods

- `getAccounts()`
- `getAddress()`
- `getNetwork()`
- `getBalance()`
- `switchNetwork(network)`
- `signMessage(message)`
- `sendBitcoin(toAddress, satoshis, options)`
- `disconnect()`
- `getVersion()`
- `on(event, handler)` for `accountsChanged`, `networkChanged`

## License

MIT
