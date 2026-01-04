export type QuestProgress = Record<number, boolean>;

export interface ProgressStats {
  completedPoints: number;
  totalPoints: number;
  percentage: number;
}