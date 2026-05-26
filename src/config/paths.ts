import * as path from 'path';

export const ROOT_DIR = path.resolve(__dirname, '../..');

export const FILES = {
    privateKeys: path.join(ROOT_DIR, 'pv.txt'),
    proxies: path.join(ROOT_DIR, 'proxy.txt'),
    taskList: path.join(ROOT_DIR, 'task-list.txt'),
    progress: path.join(ROOT_DIR, 'progress.json')
};
