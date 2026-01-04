import { Quest } from './quest.model';

export interface Category {
  numero: number;
  name: string;
  parallelWithPrevious: boolean;
  quests: Quest[];
  totalPoints: number;
}