import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestDataService } from '../../core/services/quest-data.service';
import { ProgressService } from '../../core/services/progress.service';
import { Category } from '../../core/models/category.model';
import { QuestProgress, ProgressStats } from '../../core/models/progress.model';
import { ProgressBarComponent } from '../../ui/progress-bar/progress-bar.component';
import { CategoryCardComponent } from '../../ui/category-card/category-card.component';
import { cloudUpload, download, trash } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ProgressBarComponent, CategoryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {
  categories$!: Observable<Category[]>;
  progress$!: Observable<QuestProgress>;
  globalStats$!: Observable<ProgressStats>;
  categoryStats$!: Observable<Map<number, ProgressStats>>;

  constructor(
    private questDataService: QuestDataService,
    private progressService: ProgressService,
    private alertController: AlertController
  ) {
    addIcons({ download, cloudUpload, trash });
  }

  ngOnInit(): void {
    this.categories$ = this.questDataService.loadQuestData();
    this.progress$ = this.progressService.progress$;

    this.globalStats$ = this.categories$.pipe(
      map(categories => this.progressService.getGlobalProgress(categories))
    );

    this.categoryStats$ = combineLatest([this.categories$, this.progress$]).pipe(
      map(([categories]) => {
        const statsMap = new Map<number, ProgressStats>();
        categories.forEach(category => {
          statsMap.set(category.numero, this.progressService.getCategoryProgress(category));
        });
        return statsMap;
      })
    );
  }

  getCategoryStats(categoryNumero: number, statsMap: Map<number, ProgressStats>): ProgressStats {
    return statsMap.get(categoryNumero) || { completedPoints: 0, totalPoints: 0, percentage: 0 };
  }

  exportProgress(): void {
    this.progressService.exportProgress();
  }

  async importProgress(): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.progressService.importProgress(file);
      }
    };
    input.click();
  }

  async resetProgress(): Promise<void> {
    const alert1 = await this.alertController.create({
      header: 'Réinitialiser la progression',
      message: 'Êtes-vous sûr de vouloir réinitialiser toute votre progression ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Continuer',
          handler: async () => {
            const alert2 = await this.alertController.create({
              header: 'Confirmation finale',
              message: 'Cette action supprimera TOUTES vos données de progression. Continuer ?',
              buttons: [
                {
                  text: 'Annuler',
                  role: 'cancel'
                },
                {
                  text: 'Supprimer',
                  role: 'destructive',
                  handler: () => {
                    this.progressService.resetProgress();
                  }
                }
              ]
            });
            await alert2.present();
          }
        }
      ]
    });
    await alert1.present();
  }
}
