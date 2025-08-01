declare global {
  interface Window {
    bitlight?: BitlightInjected;
  }
}

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

interface BitlightInjected {
  connect: () => Promise<ConnectResult>;
  disconnect: () => Promise<boolean>;
  getAccounts: () => Promise<BitlightAccount>;
  getAddress: () => Promise<BitlightAddress>;
  getNetwork: () => Promise<{ network: NetworkType }>;
  switchNetwork: (network: NetworkType) => Promise<{ network: NetworkType }>;
  signMessage: (message: string) => Promise<SignResult>;
  getVersion: () => Promise<{ version: string }>;
}

class BitlightWalletSDK {
  private wallet?: BitlightInjected;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('Bitlight SDK must be run in a browser environment.');
    }

    if (!window.bitlight) {
      console.warn('[Bitlight SDK] bitlight wallet not yet injected. Waiting...');
      const check = setInterval(() => {
        if (window.bitlight) {
          this.wallet = window.bitlight;
          clearInterval(check);
        }
      }, 100);
    } else {
      this.wallet = window.bitlight;
    }
  }

  isReady(): boolean {
    return !!this.wallet;
  }

  async connect(): Promise<ConnectResult> {
    this.ensureWallet();
    return await this.wallet!.connect();
  }

  async disconnect(): Promise<boolean> {
    this.ensureWallet();
    return await this.wallet!.disconnect();
  }

  async getAccounts(): Promise<BitlightAccount> {
    this.ensureWallet();
    return await this.wallet!.getAccounts();
  }

  async getAddress(): Promise<BitlightAddress> {
    this.ensureWallet();
    return await this.wallet!.getAddress();
  }

  async getNetwork(): Promise<NetworkType> {
    this.ensureWallet();
    const result = await this.wallet!.getNetwork();
    return result.network;
  }

  async switchNetwork(network: NetworkType): Promise<NetworkType> {
    this.ensureWallet();
    const result = await this.wallet!.switchNetwork(network);
    return result.network;
  }

  async signMessage(message: string): Promise<SignResult> {
    this.ensureWallet();
    return await this.wallet!.signMessage(message);
  }

  async getVersion(): Promise<string> {
    this.ensureWallet();
    const result = await this.wallet!.getVersion();
    return result.version;
  }

  isConnected(): boolean {
    return !!this.wallet && typeof this.wallet.getAddress === 'function';
  }

  private ensureWallet() {
    if (!this.wallet) {
      throw new Error('Bitlight wallet is not connected or not injected.');
    }
  }
}

export default BitlightWalletSDK;
