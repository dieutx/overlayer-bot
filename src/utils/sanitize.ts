const PRIVATE_KEY_PATTERN = /\b0x[a-fA-F0-9]{64}\b/g;
const URL_AUTH_PATTERN = /(https?:\/\/)([^/\s:@]+):([^/\s@]+)@/g;

export function sanitizeLogValue(value: unknown): string {
    return String(value ?? '')
        .replace(PRIVATE_KEY_PATTERN, '0x***PRIVATE_KEY***')
        .replace(URL_AUTH_PATTERN, '$1***:***@');
}

export function errorMessage(error: unknown, maxLength?: number): string {
    const raw = error instanceof Error ? error.message : String(error ?? '');
    const sanitized = sanitizeLogValue(raw);
    return maxLength ? sanitized.slice(0, maxLength) : sanitized;
}
