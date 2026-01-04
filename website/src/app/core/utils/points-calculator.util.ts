import { Quest } from '../models/quest.model';
import { QuestProgress, ProgressStats } from '../models/progress.model';

export function calculateQuestPoints(difficulty: number): number {
  return difficulty * 10;
}

export function calculateCategoryTotal(quests: Quest[]): number {
  return quests.reduce((total, quest) => total + quest.points, 0);
}

export function calculateProgressStats(quests: Quest[], progress: QuestProgress): ProgressStats {
  const totalPoints = calculateCategoryTotal(quests);
  const completedPoints = quests
    .filter(quest => progress[quest.numero] === true)
    .reduce((total, quest) => total + quest.points, 0);

  const percentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

  return {
    completedPoints,
    totalPoints,
    percentage
  };
}