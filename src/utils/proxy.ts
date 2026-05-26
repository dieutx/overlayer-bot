export function formatProxyString(proxyStr: string): string {
    const uri = proxyStr.trim();
    if (uri.startsWith('http')) return uri;

    const parts = uri.split(':');
    if (parts.length === 4) return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;

    return `http://${uri}`;
}

export function maskProxyString(proxyStr?: string): string {
    if (!proxyStr) return 'NONE';

    try {
        const formatted = formatProxyString(proxyStr);
        const url = new URL(formatted);
        const auth = url.username ? '***:***@' : '';
        return `${url.protocol}//${auth}${url.hostname}:${url.port}`;
    } catch {
        const parts = proxyStr.trim().split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}${parts.length > 2 ? ':***' : ''}`;
        return '***';
    }
}
