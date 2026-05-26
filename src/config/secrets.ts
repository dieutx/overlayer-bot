import { FILES } from './paths';
import { readLines } from '../storage/fileStore';

function parseMultilineEnv(value?: string): string[] {
    if (!value) return [];

    return value
        .split(/\r?\n|,/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

export function loadPrivateKeys(): string[] {
    const envKeys = parseMultilineEnv(process.env.PRIVATE_KEYS);
    if (envKeys.length > 0) return envKeys;

    return readLines(FILES.privateKeys);
}

export function loadProxies(): string[] {
    const envProxies = parseMultilineEnv(process.env.PROXIES);
    if (envProxies.length > 0) return envProxies;

    return readLines(FILES.proxies);
}
