import { fetchDailyTasks, DailyTask } from '../api/overlayerClient';
import { FILES } from '../config/paths';
import { loadTaskCache, getPreviousDayTasks, updateTaskCache } from './taskCache';
import { errorMessage } from '../utils/sanitize';

export async function loadDailyTasks(proxyUrl?: string): Promise<DailyTask[]> {
    const token = process.env.GLOBAL_AUTH_TOKEN || '';
    const address = process.env.GLOBAL_AUTH_ADDRESS || '';
    const todayStr = new Date().toISOString().split('T')[0];

    if (hasRealGlobalAuth(token, address)) {
        console.log('\nFetching tasks from API globally using master auth token...');
        try {
            const fetchedTasks = await fetchDailyTasks(address, token, proxyUrl);
            console.log(`✅ Loaded ${fetchedTasks.length} tasks from API.`);
            if (fetchedTasks.length > 0) {
                updateTaskCache(FILES.taskList, fetchedTasks);
                return fetchedTasks;
            }
        } catch (e: any) {
            console.log(`❌ API failed, using fallback... (${errorMessage(e)})`);
        }
    } else {
        console.log('\n⚠️ GLOBAL_AUTH_TOKEN or GLOBAL_AUTH_ADDRESS is missing in .env. Falling back to local task list cache.');
    }

    const fallbackTasks = loadFallbackTasks(todayStr);
    return fallbackTasks;
}

function loadFallbackTasks(todayStr: string): DailyTask[] {
    const parsed = loadTaskCache(FILES.taskList);
    const allFallbackTasks = parsed.tasks || [];

    const todayFallbackTasks = allFallbackTasks.filter(task => task.startDate === todayStr);
    if (todayFallbackTasks.length > 0) {
        console.log(`✅ Loaded ${todayFallbackTasks.length} tasks from fallback task-list.txt for today (${todayStr}).`);
        return todayFallbackTasks;
    }

    const scaledTasks = getPreviousDayTasks(allFallbackTasks, todayStr);
    if (scaledTasks.length > 0) {
        console.log(`⚠️ Scaling previous day's tasks by 1.5x (Loaded ${scaledTasks.length} tasks).`);
        return scaledTasks;
    }

    console.log('❌ No fallback tasks found at all in task-list.txt.');
    return [];
}

function hasRealGlobalAuth(token: string, address: string): boolean {
    if (!token || !address) return false;
    if (token.startsWith('your_')) return false;
    if (address.toLowerCase().includes('your_')) return false;
    return true;
}
