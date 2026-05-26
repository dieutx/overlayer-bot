import { FetchRequest, JsonRpcProvider } from 'ethers';

export const RPCS = [
    process.env.RPC || 'https://eth-sepolia.g.alchemy.com/v2/s7fdCDCUVr0QNlQf6cSC94ogwjXw0g29',
    'https://api.web3auth.io/infura-service/v1/0xaa36a7/BBxWMjyduQj8NuN7Fu1luxCY-YCQl-CSRf9R5LtrjFKWbyGstCpjSDhyR3jD_4T2RKP-liJCyCG2GCrCdZSor_4',
    'https://rpc.ankr.com/eth_sepolia',
    'https://sepolia.rpc.sentio.xyz',
    'https://rpc.sepolia.ethpandaops.io',
    'https://ethereum-sepolia-public.nodies.app',
    'https://eth-sepolia.api.onfinality.io/public',
    'https://sepolia.drpc.org',
    'https://1rpc.io/sepolia'
];

export async function getWorkingRpc(rpcs = RPCS): Promise<string> {
    console.log('Testing RPCs for a working connection...');

    for (const rpc of rpcs) {
        try {
            const fetchReq = new FetchRequest(rpc);
            fetchReq.timeout = 10000;
            const provider = new JsonRpcProvider(fetchReq, undefined, { staticNetwork: true });
            const block = await provider.getBlockNumber();
            console.log(`[RPC OK] ${rpc} (Block: ${block})`);
            return rpc;
        } catch {
            console.log(`[RPC Failed] ${rpc}`);
        }
    }

    throw new Error('No working RPC found!');
}
