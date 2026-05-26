import 'dotenv/config';
import { Wallet } from 'ethers';
import { getPoints, requestOgMint, submitGdprConsent } from './api/overlayerClient';
import { getWorkingRpc } from './config/rpcs';
import { FILES } from './config/paths';
import { runWalletTasks } from './runner/runWalletTasks';
import { readLines } from './storage/fileStore';
import { ProgressStore } from './storage/progressStore';
import { loadDailyTasks } from './tasks/taskService';
import { randomSleep } from './utils/random';
import { formatProxyString } from './utils/proxy';
import { buildWalletConfigs, getAddress } from './wallets/walletConfig';

async function setupWalletProfile(address: string, privateKey: string, proxyUrl?: string): Promise<void> {
    try {
        await submitGdprConsent(address, proxyUrl);
        const expiresAt = Math.floor(Date.now() / 1000) + 300;
        const message = `Request Overlayer OG mint\n${address.toLowerCase()}\n${expiresAt}`;
        const signature = await new Wallet(privateKey).signMessage(message);
        await requestOgMint(address, signature, message, proxyUrl);
    } catch (e: any) {
        console.log(`[${address}] OG Mint / GDPR setup error: ${e.message}`);
    }
}

async function main(): Promise<void> {
    console.log('🚀 Starting Ultimate Overlayer Sybil-Proof Bot...');

    const privateKeys = readLines(FILES.privateKeys);
    const proxies = readLines(FILES.proxies);

    if (privateKeys.length === 0) {
        console.error('❌ No private keys found in pv.txt! Exiting.');
        process.exit(1);
    }

    console.log(`Loaded ${privateKeys.length} wallets and ${proxies.length} proxies.`);

    const walletConfigs = buildWalletConfigs(privateKeys, proxies);
    const workingRpc = await getWorkingRpc();
    const globalProxy = walletConfigs[0]?.proxyStr ? formatProxyString(walletConfigs[0].proxyStr) : undefined;
    const tasks = await loadDailyTasks(globalProxy);
    const todayStr = new Date().toISOString().split('T')[0];
    const progressStore = new ProgressStore(FILES.progress);

    for (let i = 0; i < walletConfigs.length; i++) {
        const { pk, proxyStr, nextPk } = walletConfigs[i];
        const currentAddr = getAddress(pk);
        const nextWalletAddr = getAddress(nextPk);
        const completedTaskIds = progressStore.getCompletedTaskIds(currentAddr, todayStr);

        if (completedTaskIds.length >= tasks.length && tasks.length > 0) {
            console.log(`\n⏭️  [${currentAddr}] All ${tasks.length} tasks completed today (${todayStr}). Skipping!`);
            continue;
        }

        const formattedProxy = proxyStr ? formatProxyString(proxyStr) : undefined;
        await setupWalletProfile(currentAddr, pk, formattedProxy);

        await runWalletTasks(
            pk,
            proxyStr,
            workingRpc,
            nextWalletAddr,
            tasks,
            completedTaskIds,
            proxies,
            (taskId: string) => progressStore.markCompleted(currentAddr, todayStr, taskId)
        );

        try {
            const points = await getPoints(currentAddr, formattedProxy);
            console.log(`[${currentAddr}] Total Points: ${points}`);
        } catch {
            // Points are informational only.
        }

        if (i < walletConfigs.length - 1) {
            const sleepMs = Math.floor(Math.random() * 15000) + 10000;
            console.log(`Sleeping for ${sleepMs / 1000}s before next wallet...`);
            await randomSleep(sleepMs, sleepMs);
        }
    }

    console.log('\n🎉 All wallets processed for today. You can close the bot.');
}

main().catch(console.error);
