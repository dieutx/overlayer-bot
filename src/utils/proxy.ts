export function formatProxyString(proxyStr: string): string {
    const uri = proxyStr.trim();
    if (uri.startsWith('http')) return uri;

    const parts = uri.split(':');
    if (parts.length === 4) return `http://${parts[2]}:${parts[3]}@${parts[0]}:${parts[1]}`;

    return `http://${uri}`;
}
