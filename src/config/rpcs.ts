import { FetchRequest, JsonRpcProvider } from 'ethers';

const DEFAULT_PUBLIC_RPCS = [
    'https://rpc.ankr.com/eth_sepolia',
    'https://sepolia.rpc.sentio.xyz',
    'https://rpc.sepolia.ethpandaops.io',
    'https://ethereum-sepolia-public.nodies.app',
    'https://eth-sepolia.api.onfinality.io/public',
    'https://sepolia.drpc.org',
    'https://1rpc.io/sepolia'
];

export const RPCS = [
    ...(process.env.RPC ? [process.env.RPC] : []),
    ...DEFAULT_PUBLIC_RPCS
];

export async function getWorkingRpc(rpcs = RPCS): Promise<string> {
    console.log('Testing RPCs for a working connection...');

    for (const rpc of rpcs) {
        let provider: JsonRpcProvider | undefined;
        try {
            const fetchReq = new FetchRequest(rpc);
            fetchReq.timeout = 10000;
            provider = new JsonRpcProvider(fetchReq, undefined, { staticNetwork: true });
            const block = await provider.getBlockNumber();
            console.log(`[RPC OK] ${rpc} (Block: ${block})`);
            return rpc;
        } catch {
            console.log(`[RPC Failed] ${rpc}`);
        } finally {
            provider?.destroy();
        }
    }

    throw new Error('No working RPC found!');
}
