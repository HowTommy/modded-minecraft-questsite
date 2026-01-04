import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

interface CongratulationPhrase {
  id: number;
  text: string;
}

const STORAGE_KEY = 'congratulations_used_ids';

@Injectable({
  providedIn: 'root'
})
export class CongratulationsService {
  private allPhrases: CongratulationPhrase[] = [];
  private availablePhrases: CongratulationPhrase[] = [];
  private isLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadPhrases();
  }

  private async loadPhrases(): Promise<void> {
    try {
      const csvText = await firstValueFrom(
        this.http.get('/assets/data/congratulations.csv', { responseType: 'text' })
      );

      // Parser le CSV
      const lines = csvText.split('\n').filter(line => line.trim());
      this.allPhrases = lines.map(line => {
        const [idStr, ...textParts] = line.split(',');
        const id = parseInt(idStr, 10);
        // Rejoindre les parties au cas où il y a des virgules dans le texte
        let text = textParts.join(',').trim();
        // Enlever les guillemets si présents
        if (text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1);
        }
        return { id, text };
      });

      // Mélanger l'ordre des phrases de manière aléatoire
      this.shufflePhrases();

      // Charger les IDs déjà utilisés depuis le localStorage
      this.loadUsedPhrases();

      this.isLoaded$.next(true);
    } catch (error) {
      console.error('Error loading congratulations phrases:', error);
    }
  }

  private shufflePhrases(): void {
    // Algorithme de Fisher-Yates pour mélanger le tableau
    const shuffled = [...this.allPhrases];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.allPhrases = shuffled;
  }

  private loadUsedPhrases(): void {
    const usedIdsStr = localStorage.getItem(STORAGE_KEY);
    if (!usedIdsStr) {
      this.availablePhrases = [...this.allPhrases];
      return;
    }

    const usedIds = JSON.parse(usedIdsStr) as number[];
    this.availablePhrases = this.allPhrases.filter(
      phrase => !usedIds.includes(phrase.id)
    );

    // Si toutes les phrases ont été utilisées, réinitialiser
    if (this.availablePhrases.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      this.availablePhrases = [...this.allPhrases];
    }
  }

  getNextPhrase(): string {
    if (this.availablePhrases.length === 0) {
      // Réinitialiser si nécessaire
      localStorage.removeItem(STORAGE_KEY);
      this.availablePhrases = [...this.allPhrases];
    }

    // Prendre la première phrase disponible
    const phrase = this.availablePhrases.shift()!;

    // Sauvegarder l'ID comme utilisé
    const usedIdsStr = localStorage.getItem(STORAGE_KEY);
    const usedIds = usedIdsStr ? JSON.parse(usedIdsStr) : [];
    usedIds.push(phrase.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usedIds));

    return phrase.text;
  }

  waitForLoad(): Observable<boolean> {
    return this.isLoaded$.asObservable();
  }
}