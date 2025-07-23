declare global {
  interface Window {
    bitlight?: any;
  }
}
type NetworkType = 'bitcoin' | 'testnet' | 'regtest';

interface SendBitcoinOptions {
  feeRate?: number;
}

interface BitlightAccount {
  address: string;
  btcAddress: string;
  rgbAddress: string;
}

interface WalletEventMap {
  accountsChanged: (accounts: BitlightAccount[]) => void;
  networkChanged: (network: string) => void;
}

class BitlightWalletSDK {
  private wallet: any;
  private eventListeners: Partial<{ [K in keyof WalletEventMap]: WalletEventMap[K][] }> = {};

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

  on<K extends keyof WalletEventMap>(event: K, handler: WalletEventMap[K]) {
    this.eventListeners[event] = this.eventListeners[event] || [];
    this.eventListeners[event]!.push(handler);

    if (this.wallet?.on) {
      this.wallet.on(event, handler);
    }
  }

  async connect(): Promise<boolean> {
    this.ensureWallet();
    return await this.wallet.connect();
  }


  isConnected(): boolean {
    return !!this.wallet && typeof this.wallet.getAccounts === 'function';
  }

  async disconnect(): Promise<boolean> {
    this.ensureWallet();
    return await this.wallet.disconnect();
  }

  async getAccounts(): Promise<BitlightAccount[]> {
    this.ensureWallet();
    return await this.wallet.getAccounts();
  }

  async getAddress(): Promise<string> {
    this.ensureWallet();
    return await this.wallet.getAddress();
  }

  async getNetwork(): Promise<string> {
    this.ensureWallet();
    return await this.wallet.getNetwork();
  }

  async getBalance(): Promise<any> {
    this.ensureWallet();
    return await this.wallet.getBalance();
  }

  async switchNetwork(network: NetworkType): Promise<any> {
    this.ensureWallet();
    return await this.wallet.switchNetwork(network);
  }

  async signMessage(message: string): Promise<any> {
    this.ensureWallet();
    return await this.wallet.signMessage(message);
  }

  async sendBitcoin(toAddress: string, satoshis: number, options?: SendBitcoinOptions): Promise<any> {
    this.ensureWallet();
    return await this.wallet.sendBitcoin(toAddress, satoshis, options || {});
  }

  async getPublicKey(): Promise<string> {
    this.ensureWallet();
    if (typeof this.wallet.getPublicKey === 'function') {
      return await this.wallet.getPublicKey();
    }
    throw new Error('getPublicKey() is not supported by current Bitlight version.');
  }

  async getVersion(): Promise<string> {
    this.ensureWallet();
    return await this.wallet.getVersion();
  }

  private ensureWallet() {
    if (!this.wallet) {
      throw new Error('Bitlight wallet is not connected or not injected.');
    }
  }
}

export default BitlightWalletSDK;
