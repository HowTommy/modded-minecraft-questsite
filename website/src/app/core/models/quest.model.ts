export interface Quest {
  numero: number;
  label: string;
  description: string;
  difficulty: number;
  points: number;
  categoryNumero: number;
  parallelWithPrevious: boolean;
}