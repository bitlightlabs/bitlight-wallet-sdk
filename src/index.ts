import validate from 'bitcoin-address-validation';

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

export interface PayjoinBuyPost {
  assets_name: string;
  ticker: string;
  precision: number;
  contract_id: string;
  receive_rgb_amount: string;
  sell_btc_address: string;
  sell_amount_sat: string;
  utxo: string;
  state?: string;
}

export interface PayjoinBuyResult {
  invoice: string;
  psbt: string;
  txid: string;
  error?: string;
  state?: string;
}

export interface PayjoinPost {
  invoice: string;
  sell_amount_sat: string;
  psbt: string;
  payment_id?: string;
  state?: string;
}

export interface PayjoinSignResult {
  psbt: string;
  txid: string;
  error?: string;
  state?: string;
}
export interface PayjoinBuyConfirmResult {
  psbt: string;
  error?: string;
  state?: string;
}

export interface PayjoinSellResult {
  psbt: string;
  payment_id: string;
  error?: string;
  state?: string;
}

export interface PayjoinSellConfirmResult {
  paid: boolean;
  txid: string;
  error?: string;
  state?: string;
}

export interface PublicIssuePost {
  ticker: string;
  name: string;
  supply: number;
  precision: number;
  seal: string;
}

export interface GetContractBalanceResult {
  confirmed: string;
  unconfirmed: string;
}

export interface PublicIssueResult {
  id: string;
}

export interface SendBitcoinPost {
  toAddress: string;
  satoshis: number;
}

export interface SendBitcoinResult {
  txid: string;
}

export interface SendRGBPost {
  invoice: string;
}

export interface SendRGBResult {
  payment_id: string;
  txid: string;
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
  getRgbUtxos: () => Promise<any[]>;
  payjoinBuy: (post: PayjoinBuyPost) => Promise<PayjoinBuyResult>;
  payjoinBuySign: (post: PayjoinPost) => Promise<PayjoinBuyConfirmResult>;
  payjoinSell: (post: PayjoinPost) => Promise<PayjoinSellResult>;
  payjoinSellSign: (post: PayjoinPost) => Promise<PayjoinSellConfirmResult>;
  getContractBalance: (contract_id: string) => Promise<GetContractBalanceResult>;
  publicIssue: (post: PublicIssuePost) => Promise<PublicIssueResult>;
  sendBitcoin: (post: SendBitcoinPost) => Promise<SendBitcoinResult>;
  sendRGB: (post: SendRGBPost) => Promise<SendRGBResult>;
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

  async getContractUtxo(contractId: string): Promise<string> {
    await this.waitForWalletReady();
    const utxoData: any = await this.wallet!.getRgbUtxos();
    const utxos = utxoData.utxos || [];
    for (let i = 0; i < utxos.length; i++) {
      const tokens = utxos[i].tokenList || [];
      for (let j = 0; j < tokens.length; j++) {
        if (tokens[j].address === contractId) {
          return utxos[i].outpoint;
        }
      }
    }
    const defaultUtxo =
      utxoData.available && utxoData.available.length > 0
        ? utxoData.available[0]?.outpoint
        : null;
    return defaultUtxo;
  }

  async payjoinBuy(post: PayjoinBuyPost): Promise<PayjoinBuyResult> {
    await this.waitForWalletReady();
    const result = await this.wallet!.payjoinBuy(post);
    return result;
  }

  async payjoinBuyConfirm(post: PayjoinPost): Promise<PayjoinBuyConfirmResult> {
    await this.waitForWalletReady();
    const result = await this.wallet!.payjoinBuySign(post);
    return result;
  }

  async payjoinSell(post: PayjoinPost): Promise<PayjoinSellResult> {
    await this.waitForWalletReady();
    const result = await this.wallet!.payjoinSell(post);
    return result;
  }

  async payjoinSellConfirm(post: PayjoinPost): Promise<PayjoinSellConfirmResult> {
    await this.waitForWalletReady();
    const result = await this.wallet!.payjoinSellSign(post);
    return result;
  }

  async getContractBalance(contract_id: string): Promise<GetContractBalanceResult> {
    await this.waitForWalletReady();
    return await this.wallet!.getContractBalance(contract_id);

  }

  async publicIssue(post: PublicIssuePost): Promise<PublicIssueResult> {
    await this.waitForWalletReady();
    const { ticker, name, supply, precision, seal } = post;
    return await this.wallet!.publicIssue({
      ticker,
      name,
      supply,
      precision,
      seal,
    });
  }

  async sendBitcoin(post: SendBitcoinPost): Promise<SendBitcoinResult> {
    const { toAddress, satoshis } = post;
    if (!this.isBitcoinAddress(toAddress)) {
      throw new Error('Invalid Bitcoin address format.');
    }
    if (satoshis <= 1000) {
      throw new Error('Satoshis must be greater than 1000.');
    }
    await this.waitForWalletReady();
    return await this.wallet!.sendBitcoin(post);
  }

  async sendRGB(post: SendRGBPost): Promise<SendRGBResult> {
    const { invoice } = post;
    if (!this.isRGBInvoice(invoice)) {
      throw new Error('Invalid RGB invoice format.');
    }
    await this.waitForWalletReady();
    return await this.wallet!.sendRGB(post);
  }


  isBitcoinAddress(address: string): boolean {
    console.log('address', address);
    return validate(address);
  }
  isRGBInvoice(invoice: string): boolean {
    return /contract:[\s\S]*/.test(invoice);
  }

}

export default BitlightWalletSDK;
