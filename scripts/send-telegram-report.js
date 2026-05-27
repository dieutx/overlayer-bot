const fs = require('fs');
const path = require('path');
const { Wallet } = require('ethers');

const rootDir = path.resolve(__dirname, '..');
const logPath = process.argv[2];
const exitCode = Number(process.argv[3] || '0');

function readWalletAddresses() {
    const pvPath = path.join(rootDir, 'pv.txt');
    if (!fs.existsSync(pvPath)) return [];

    return fs.readFileSync(pvPath, 'utf8')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(key => new Wallet(key.startsWith('0x') ? key : `0x${key}`).address);
}

function readProgress() {
    const progressPath = path.join(rootDir, 'progress.json');
    if (!fs.existsSync(progressPath)) return {};

    try {
        return JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    } catch {
        return {};
    }
}

function buildReport() {
    const today = new Date().toISOString().slice(0, 10);
    const wallets = readWalletAddresses();
    const progress = readProgress();
    const logText = logPath && fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
    const logTail = logPath && fs.existsSync(logPath)
        ? logText.split(/\r?\n/).filter(Boolean).slice(-12).join('\n')
        : '';
    const taskSource = logText.includes('Loaded') && logText.includes('tasks from API')
        ? 'API'
        : logText.includes('API failed')
            ? 'Fallback (API failed)'
            : logText.includes('fallback task-list')
                ? 'Fallback task-list'
                : 'Unknown';

    const lines = [
        `Overlayer daily report - ${today}`,
        `Status: ${exitCode === 0 ? 'OK' : `FAILED (${exitCode})`}`,
        `Task source: ${taskSource}`,
        `Wallets: ${wallets.length}`,
        ''
    ];

    for (const address of wallets) {
        const completed = progress[address]?.[today]?.length || 0;
        lines.push(`${address.slice(0, 8)}...${address.slice(-6)}: ${completed}/6 tasks`);
    }

    if (logTail) {
        lines.push('', 'Log tail:', logTail);
    }

    return lines.join('\n').slice(0, 3900);
}

async function sendTelegram(text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId || token.startsWith('your_') || chatId.startsWith('your_')) {
        console.log('Telegram env is missing. Report not sent.');
        return;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true
        })
    });

    if (!res.ok) {
        throw new Error(`Telegram send failed: ${res.status} ${await res.text()}`);
    }
}

sendTelegram(buildReport()).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
