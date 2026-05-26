export function randomSleep(minMs: number, maxMs: number): Promise<void> {
    const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomJitterAmount(baseAmount: number, maxVariancePercent: number): string {
    const variance = baseAmount * (maxVariancePercent / 100);
    const jitter = Math.random() * variance;
    return (baseAmount + jitter).toFixed(3);
}

export function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
