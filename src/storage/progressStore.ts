import { readJsonFile, writeJsonFile } from './fileStore';

export type Progress = Record<string, Record<string, string[]>>;

export class ProgressStore {
    private progress: Progress;

    constructor(private readonly filePath: string) {
        this.progress = readJsonFile<Progress>(filePath, {});
    }

    getCompletedTaskIds(address: string, date: string): string[] {
        this.ensureDate(address, date);
        return this.progress[address][date];
    }

    markCompleted(address: string, date: string, taskId: string): void {
        this.ensureDate(address, date);
        this.progress[address][date].push(taskId);
        this.progress[address][date] = Array.from(new Set(this.progress[address][date]));
        this.save();
    }

    private ensureDate(address: string, date: string): void {
        if (!this.progress[address]) this.progress[address] = {};
        if (!this.progress[address][date]) this.progress[address][date] = [];
    }

    private save(): void {
        writeJsonFile(this.filePath, this.progress);
    }
}
