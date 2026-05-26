import { Wallet } from 'ethers';
import { shuffleArray } from '../utils/random';

export interface WalletConfig {
    pk: string;
    proxyStr?: string;
    nextPk: string;
}

export function normalizePrivateKey(privateKey: string): string {
    return privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
}

export function buildWalletConfigs(privateKeys: string[], proxies: string[]): WalletConfig[] {
    const walletConfigs = privateKeys.map((pk, index) => ({
        pk: normalizePrivateKey(pk),
        proxyStr: proxies[index] || proxies[index % proxies.length],
        nextPk: normalizePrivateKey(privateKeys[(index + 1) % privateKeys.length])
    }));

    const firstTwo = walletConfigs.slice(0, 2);
    let theRest = walletConfigs.slice(2);

    console.log(`Keeping first ${firstTwo.length} wallets in order, shuffling the remaining ${theRest.length}...`);
    theRest = shuffleArray(theRest);

    return [...firstTwo, ...theRest];
}

export function getAddress(privateKey: string): string {
    return new Wallet(normalizePrivateKey(privateKey)).address;
}
