import { DailyTask } from '../api/overlayerClient';
import { readJsonAfterFirstBrace, writeJsonFile } from '../storage/fileStore';
import { errorMessage } from '../utils/sanitize';

interface TaskCache {
    success: boolean;
    tasks: DailyTask[];
    timestamp?: string;
}

export function loadTaskCache(filePath: string): TaskCache {
    const cache = readJsonAfterFirstBrace<Partial<TaskCache>>(filePath, { success: true, tasks: [] });

    return {
        success: cache.success ?? true,
        tasks: cache.tasks ?? [],
        timestamp: cache.timestamp
    };
}

export function updateTaskCache(filePath: string, fetchedTasks: DailyTask[]): void {
    try {
        const currentList = loadTaskCache(filePath);

        for (const task of fetchedTasks) {
            const idx = currentList.tasks.findIndex(existing => existing.id === task.id);
            if (idx !== -1) {
                currentList.tasks[idx] = task;
            } else {
                currentList.tasks.push(task);
            }
        }

        currentList.timestamp = new Date().toISOString();
        writeJsonFile(filePath, currentList);
        console.log(`Updated task-list.txt with ${fetchedTasks.length} tasks.`);
    } catch (e: any) {
        console.log(`Could not auto-update task-list.txt: ${errorMessage(e)}`);
    }
}

export function getPreviousDayTasks(allTasks: DailyTask[], todayStr: string): DailyTask[] {
    const tasksNotToday = allTasks.filter(task => task.startDate && task.startDate !== todayStr);
    if (tasksNotToday.length === 0) return [];

    const dates = Array.from(new Set(tasksNotToday.map(task => task.startDate))).sort().reverse();
    const mostRecentDate = dates[0];
    console.log(`No tasks found for today (${todayStr}). Found previous day tasks from ${mostRecentDate}.`);

    const prevTasks = allTasks.filter(task => task.startDate === mostRecentDate);

    return prevTasks.map(task => {
        let newId = task.id;
        if (task.id.endsWith(mostRecentDate)) {
            newId = task.id.replace(mostRecentDate, todayStr);
        } else {
            newId = `${task.id}_${todayStr}`;
        }

        return {
            ...task,
            id: newId,
            startDate: todayStr,
            amount: Math.ceil((task.amount || 0) * 1.5),
            points: Math.ceil((task.points || 0) * 1.5)
        };
    });
}
