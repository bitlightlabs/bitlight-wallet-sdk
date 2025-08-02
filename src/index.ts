declare global {
  interface Window {
    bitlight?: BitlightInjected;
  }
}

export type NetworkType = 'bitcoin' | 'testnet' | 'regtest';

export interface ConnectResult {
  address: string;
}

export interface SignResult {
  pubkey: string;
  sign: string;
}

export interface BitlightAccount {
  address: string;
  btc_pub: string;
  rgb_pub: string;
}

export interface BitlightAddress {
  address: string;
}

export interface BitlightInjected {
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
  private injectedCheck?: Promise<void>;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('Bitlight SDK must be run in a browser environment.');
    }

    if (window.bitlight) {
      this.wallet = window.bitlight;
    } else {
      this.injectedCheck = this.waitForInjection();
    }
  }

  private waitForInjection(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(() => {
        if (window.bitlight) {
          this.wallet = window.bitlight;
          clearInterval(interval);
          resolve();
        } else if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(new Error('Bitlight wallet injection timeout.'));
        }
      }, 100);
    });
  }

  private async waitForWalletReady(): Promise<void> {
    if (this.wallet) return;
    if (this.injectedCheck) {
      await this.injectedCheck;
    } else {
      await this.waitForInjection();
    }
    if (!this.wallet) {
      throw new Error('Bitlight wallet not injected.');
    }
  }

  isReady(): boolean {
    return !!this.wallet;
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.getAddress();
      return true;
    } catch {
      return false;
    }
  }

  async connect(): Promise<ConnectResult> {
    await this.waitForWalletReady();
    return await this.wallet!.connect();
  }

  async disconnect(): Promise<boolean> {
    await this.waitForWalletReady();
    return await this.wallet!.disconnect();
  }

  async getAccounts(): Promise<BitlightAccount> {
    await this.waitForWalletReady();
    return await this.wallet!.getAccounts();
  }

  async getAddress(): Promise<BitlightAddress> {
    await this.waitForWalletReady();
    return await this.wallet!.getAddress();
  }

  async getNetwork(): Promise<NetworkType> {
    await this.waitForWalletReady();
    const result = await this.wallet!.getNetwork();
    return result.network;
  }

  async switchNetwork(network: NetworkType): Promise<NetworkType> {
    await this.waitForWalletReady();
    const result = await this.wallet!.switchNetwork(network);
    return result.network;
  }

  async signMessage(message: string): Promise<SignResult> {
    await this.waitForWalletReady();
    return await this.wallet!.signMessage(message);
  }

  async getVersion(): Promise<string> {
    await this.waitForWalletReady();
    const result = await this.wallet!.getVersion();
    return result.version;
  }
}

export default BitlightWalletSDK;
