import * as fs from 'fs';

export function readLines(filePath: string): string[] {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf-8');
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

export function readJsonFile<T>(filePath: string, fallback: T): T {
    try {
        if (!fs.existsSync(filePath)) return fallback;

        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function writeJsonFile(filePath: string, data: unknown): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readJsonAfterFirstBrace<T>(filePath: string, fallback: T): T {
    try {
        if (!fs.existsSync(filePath)) return fallback;

        const raw = fs.readFileSync(filePath, 'utf-8');
        const firstBrace = raw.indexOf('{');
        const json = firstBrace !== -1 ? raw.slice(firstBrace) : raw;

        return JSON.parse(json.trim()) as T;
    } catch {
        return fallback;
    }
}
