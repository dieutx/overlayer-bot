declare const process: { env: Record<string, string | undefined> };

export interface DummyTxPlanInput {
    totalTargetTx: number;
    txCount: number;
    topUpOnly?: boolean;
    rng?: () => number;
}

export function pickExtraDummyTxCount(rng: () => number = Math.random): number {
    const value = Math.min(Math.max(rng(), 0), 0.999999999999);
    return 6 + Math.floor(value * 5);
}

export function calculateDummyTxCount(input: DummyTxPlanInput): number {
    const { totalTargetTx, txCount, topUpOnly = false, rng = Math.random } = input;
    const extra = pickExtraDummyTxCount(rng);

    if (topUpOnly) return extra;
    if (totalTargetTx <= 0) return 0;

    return Math.max(0, totalTargetTx - txCount) + extra;
}

export function isDummyTxTopUpOnlyMode(): boolean {
    return process.env.DUMMY_TX_TOPUP_ONLY === '1';
}
