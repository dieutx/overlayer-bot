import { Wallet } from 'ethers';
import { getPoints, requestOgMint, submitGdprConsent } from './api/overlayerClient';
import { getWorkingRpc } from './config/rpcs';
import { FILES } from './config/paths';
import { runWalletTasks } from './runner/runWalletTasks';
import { loadGlobalProxy, loadPrivateKeys, loadProxies, loadWalletConcurrency } from './config/secrets';
import { ProgressStore } from './storage/progressStore';
import { loadDailyTasks } from './tasks/taskService';
import { randomSleep } from './utils/random';
import { formatProxyString } from './utils/proxy';
import { buildWalletConfigs, getAddress } from './wallets/walletConfig';
import { errorMessage } from './utils/sanitize';

async function setupWalletProfile(address: string, privateKey: string, proxyUrl?: string): Promise<void> {
    try {
        await submitGdprConsent(address, proxyUrl);
        const expiresAt = Math.floor(Date.now() / 1000) + 300;
        const message = `Request Overlayer OG mint\n${address.toLowerCase()}\n${expiresAt}`;
        const signature = await new Wallet(privateKey).signMessage(message);
        await requestOgMint(address, signature, message, proxyUrl);
    } catch (e: any) {
        console.log(`[${address}] OG Mint / GDPR setup error: ${errorMessage(e)}`);
    }
}

async function main(): Promise<void> {
    console.log('🚀 Starting Ultimate Overlayer Sybil-Proof Bot...');

    const privateKeys = loadPrivateKeys();
    const proxies = loadProxies();
    const configuredGlobalProxy = loadGlobalProxy();
    const walletConcurrency = loadWalletConcurrency();

    if (privateKeys.length === 0) {
        console.error('❌ No private keys found in PRIVATE_KEYS or pv.txt! Exiting.');
        process.exit(1);
    }

    console.log(`Loaded ${privateKeys.length} wallets and ${proxies.filter(Boolean).length} proxies.`);
    console.log(`Wallet concurrency: ${walletConcurrency}`);

    const walletConfigs = buildWalletConfigs(privateKeys, proxies);
    const workingRpc = await getWorkingRpc();
    const globalProxySource = configuredGlobalProxy || walletConfigs[0]?.proxyStr;
    const globalProxy = globalProxySource ? formatProxyString(globalProxySource) : undefined;
    const tasks = await loadDailyTasks(globalProxy);
    const todayStr = new Date().toISOString().split('T')[0];
    const progressStore = new ProgressStore(FILES.progress);

    await runWithConcurrency(walletConfigs, walletConcurrency, async (walletConfig, index) => {
        await processWallet({
            walletConfig,
            index,
            totalWallets: walletConfigs.length,
            workingRpc,
            tasks,
            proxies,
            todayStr,
            progressStore,
            sequential: walletConcurrency === 1
        });
    });

    console.log('\n🎉 All wallets processed for today. You can close the bot.');
}

type WalletConfig = ReturnType<typeof buildWalletConfigs>[number];

interface ProcessWalletParams {
    walletConfig: WalletConfig;
    index: number;
    totalWallets: number;
    workingRpc: string;
    tasks: Awaited<ReturnType<typeof loadDailyTasks>>;
    proxies: string[];
    todayStr: string;
    progressStore: ProgressStore;
    sequential: boolean;
}

async function processWallet(params: ProcessWalletParams): Promise<void> {
    const { walletConfig, index, totalWallets, workingRpc, tasks, proxies, todayStr, progressStore, sequential } = params;
    const { pk, proxyStr, nextPk } = walletConfig;
    const currentAddr = getAddress(pk);
    const nextWalletAddr = getAddress(nextPk);
    const completedTaskIds = progressStore.getCompletedTaskIds(currentAddr, todayStr);

    if (completedTaskIds.length >= tasks.length && tasks.length > 0) {
        console.log(`\n⏭️  [${currentAddr}] All ${tasks.length} tasks completed today (${todayStr}). Skipping!`);
        return;
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
        proxyStr ? [proxyStr] : [],
        (taskId: string) => progressStore.markCompleted(currentAddr, todayStr, taskId)
    );

    try {
        const points = await getPoints(currentAddr, formattedProxy);
        console.log(`[${currentAddr}] Total Points: ${points}`);
    } catch {
        // Points are informational only.
    }

    if (sequential && index < totalWallets - 1) {
        const sleepMs = Math.floor(Math.random() * 15000) + 10000;
        console.log(`Sleeping for ${sleepMs / 1000}s before next wallet...`);
        await randomSleep(sleepMs, sleepMs);
    }
}

async function runWithConcurrency<T>(
    items: T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<void>
): Promise<void> {
    let nextIndex = 0;
    const workerCount = Math.min(concurrency, items.length);

    await Promise.all(Array.from({ length: workerCount }, async () => {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex++;
            await worker(items[currentIndex], currentIndex);
        }
    }));
}

main().catch(console.error);
