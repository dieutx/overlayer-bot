import { FILES } from './paths';
import { readLines, readMappedLines } from '../storage/fileStore';

function parseListEnv(value?: string): string[] {
    if (!value) return [];

    return value
        .split(/\r?\n|,/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

function parseMappedEnv(value?: string): string[] {
    if (!value) return [];

    return value
        .split(/\r?\n|,/)
        .map(line => line.trim());
}

export function loadPrivateKeys(): string[] {
    const envKeys = parseListEnv(process.env.PRIVATE_KEYS);
    if (envKeys.length > 0) return envKeys;

    return readLines(FILES.privateKeys);
}

export function loadProxies(): string[] {
    const envProxies = parseMappedEnv(process.env.PROXIES);
    if (envProxies.length > 0) return envProxies;

    const mappedProxies = readMappedLines(FILES.proxies);
    if (mappedProxies.length > 0) return mappedProxies;

    return readMappedLines(FILES.legacyProxies);
}

export function loadWalletConcurrency(): number {
    const raw = process.env.WALLET_CONCURRENCY || '1';
    const parsed = Number.parseInt(raw, 10);

    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return parsed;
}
