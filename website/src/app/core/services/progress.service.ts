import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuestProgress, ProgressStats } from '../models/progress.model';
import { Category } from '../models/category.model';
import { Quest } from '../models/quest.model';
import { calculateProgressStats } from '../utils/points-calculator.util';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly STORAGE_KEY = 'minecraft-quest-progress';
  private progressSubject = new BehaviorSubject<QuestProgress>({});
  public progress$: Observable<QuestProgress> = this.progressSubject.asObservable();

  constructor() {
    const initialProgress = this.loadFromStorage();
    this.progressSubject.next(initialProgress);
  }

  private loadFromStorage(): QuestProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveToStorage(progress: QuestProgress): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  toggleQuest(questNumero: number): void {
    const current = this.progressSubject.value;
    const updated = {
      ...current,
      [questNumero]: !current[questNumero]
    };
    this.progressSubject.next(updated);
    this.saveToStorage(updated);
  }

  getCategoryProgress(category: Category): ProgressStats {
    const progress = this.progressSubject.value;
    return calculateProgressStats(category.quests, progress);
  }

  getGlobalProgress(categories: Category[]): ProgressStats {
    const progress = this.progressSubject.value;
    const allQuests = categories.reduce((acc: Quest[], cat: Category) => [...acc, ...cat.quests], []);
    return calculateProgressStats(allQuests, progress);
  }

  exportProgress(): void {
    const progress = this.progressSubject.value;
    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `minecraft-progress-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importProgress(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const progress = JSON.parse(content) as QuestProgress;
        this.progressSubject.next(progress);
        this.saveToStorage(progress);
      } catch (error) {
        console.error('Failed to import progress:', error);
      }
    };
    reader.readAsText(file);
  }

  resetProgress(): void {
    this.progressSubject.next({});
    this.saveToStorage({});
  }
}