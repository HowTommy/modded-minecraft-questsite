import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Quest } from '../models/quest.model';
import { Category } from '../models/category.model';
import { parseCSV } from '../utils/csv-parser.util';
import { calculateQuestPoints, calculateCategoryTotal } from '../utils/points-calculator.util';

@Injectable({ providedIn: 'root' })
export class QuestDataService {
  constructor(private http: HttpClient) {}

  loadQuestData(): Observable<Category[]> {
    return this.http
      .get('/assets/data/french.csv', { responseType: 'text' })
      .pipe(map((csvText) => this.parseQuestData(csvText)));
  }

  private parseQuestData(csvText: string): Category[] {
    const rows = parseCSV(csvText);
    const categoryMap = new Map<number, Category>();

    rows.forEach((row) => {
      const categoryNumero = parseInt(row['numero catégorie'], 10);
      const questNumero = parseInt(row['numero quête'], 10);
      const difficulty = parseInt(row['difficulté (1 à 5)'], 10);

      // Create quest
      const quest: Quest = {
        numero: questNumero,
        label: row['Label'] || '',
        description: row['Conseils / description détaillée'] || '',
        difficulty: difficulty,
        points: calculateQuestPoints(difficulty),
        categoryNumero: categoryNumero,
        parallelWithPrevious: row['quête faisable en même temps que la précédente (donc afficher côte à côte)'] === 'oui'
      };

      // Get or create category
      if (!categoryMap.has(categoryNumero)) {
        categoryMap.set(categoryNumero, {
          numero: categoryNumero,
          name: row['categorie'] || '',
          parallelWithPrevious: row['catégorie faisable en même temps que la précédente (donc afficher côte à côte)'] === 'oui',
          quests: [],
          totalPoints: 0
        });
      }

      const category = categoryMap.get(categoryNumero)!;
      category.quests.push(quest);
    });

    // Calculate total points for each category
    const categories = Array.from(categoryMap.values());
    categories.forEach(category => {
      category.totalPoints = calculateCategoryTotal(category.quests);
    });

    // Sort categories by numero
    return categories.sort((a, b) => a.numero - b.numero);
  }
}