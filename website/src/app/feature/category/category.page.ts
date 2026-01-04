import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestDataService } from '../../core/services/quest-data.service';
import { ProgressService } from '../../core/services/progress.service';
import { AnimationService } from '../../core/services/animation.service';
import { Category } from '../../core/models/category.model';
import { Quest } from '../../core/models/quest.model';
import { QuestProgress, ProgressStats } from '../../core/models/progress.model';
import { ProgressBarComponent } from '../../ui/progress-bar/progress-bar.component';
import { QuestCardComponent } from '../../ui/quest-card/quest-card.component';
import { ConfettiComponent } from '../../ui/confetti/confetti.component';
import { QuestToastComponent } from '../../ui/quest-toast/quest-toast.component';

interface QuestGroup {
  quests: Quest[];
  isParallel: boolean;
}

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ProgressBarComponent, QuestCardComponent, ConfettiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryPage implements OnInit {
  category$!: Observable<Category | undefined>;
  progress$!: Observable<QuestProgress>;
  categoryStats$!: Observable<ProgressStats | null>;
  questGroups$!: Observable<QuestGroup[]>;
  categoryNumero!: number;
  private activeToasts: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questDataService: QuestDataService,
    private progressService: ProgressService,
    public animationService: AnimationService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.categoryNumero = parseInt(this.route.snapshot.params['numero'], 10);

    this.category$ = this.questDataService.loadQuestData().pipe(
      map(categories => categories.find(c => c.numero === this.categoryNumero))
    );

    this.progress$ = this.progressService.progress$;

    this.categoryStats$ = combineLatest([this.category$, this.progress$]).pipe(
      map(([category]) => {
        if (!category) return null;
        return this.progressService.getCategoryProgress(category);
      })
    );

    this.questGroups$ = this.category$.pipe(
      map(category => {
        if (!category) return [];
        return this.groupQuests(category.quests);
      })
    );
  }

  private groupQuests(quests: Quest[]): QuestGroup[] {
    const groups: QuestGroup[] = [];
    let currentGroup: Quest[] = [];

    quests.forEach((quest, index) => {
      if (index === 0 || !quest.parallelWithPrevious) {
        if (currentGroup.length > 0) {
          groups.push({
            quests: currentGroup,
            isParallel: currentGroup.length > 1
          });
        }
        currentGroup = [quest];
      } else {
        currentGroup.push(quest);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        quests: currentGroup,
        isParallel: currentGroup.length > 1
      });
    }

    return groups;
  }

  isQuestLocked(quest: Quest, category: Category, progress: QuestProgress): boolean {
    const questIndex = category.quests.findIndex(q => q.numero === quest.numero);
    if (questIndex === 0) {
      return false;
    }

    const previousQuest = category.quests[questIndex - 1];

    // Si la quête peut être faite en parallèle
    if (quest.parallelWithPrevious) {
      // Elle est locked si la quête précédente est locked
      return this.isQuestLocked(previousQuest, category, progress);
    }

    // Si la quête n'est pas en parallèle, on doit trouver toutes les quêtes précédentes
    // jusqu'au début du dernier groupe parallèle et vérifier qu'elles sont toutes complétées
    let checkIndex = questIndex - 1;

    // Trouver le début du groupe parallèle précédent
    while (checkIndex > 0 && category.quests[checkIndex].parallelWithPrevious) {
      checkIndex--;
    }

    // Vérifier que toutes les quêtes depuis checkIndex jusqu'à questIndex - 1 sont complétées
    for (let i = checkIndex; i < questIndex; i++) {
      const questToCheck = category.quests[i];

      // Cette quête doit être complétée
      if (!progress[questToCheck.numero]) {
        return true;
      }
    }

    return false;
  }


  isCurrentQuest(quest: Quest, category: Category, progress: QuestProgress): boolean {
    // La quête ne doit pas être complétée ni lockée
    if (progress[quest.numero] || this.isQuestLocked(quest, category, progress)) {
      return false;
    }

    // Trouver la première quête non complétée et non lockée
    let firstAvailableQuest: Quest | null = null;
    for (const q of category.quests) {
      if (!progress[q.numero] && !this.isQuestLocked(q, category, progress)) {
        firstAvailableQuest = q;
        break;
      }
    }

    if (!firstAvailableQuest) {
      return false;
    }

    // Si c'est la première quête disponible, elle est current
    if (quest.numero === firstAvailableQuest.numero) {
      return true;
    }

    // Si la quête peut être faite en parallèle avec la première quête disponible,
    // elle est aussi current
    const questIndex = category.quests.findIndex(q => q.numero === quest.numero);
    const firstAvailableIndex = category.quests.findIndex(q => q.numero === firstAvailableQuest!.numero);

    if (questIndex > firstAvailableIndex && quest.parallelWithPrevious) {
      // Vérifier si toutes les quêtes entre la première disponible et celle-ci
      // sont aussi en parallèle
      for (let i = firstAvailableIndex + 1; i <= questIndex; i++) {
        if (!category.quests[i].parallelWithPrevious) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  onQuestToggle(quest: Quest, category: Category, currentlyCompleted: boolean): void {
    this.progressService.toggleQuest(quest.numero);

    const newlyCompleted = !currentlyCompleted;

    // Compter les toasts actifs
    const currentOffset = this.activeToasts;
    this.activeToasts++;

    // Afficher le toast modal de manière asynchrone (sans bloquer)
    this.modalController.create({
      component: QuestToastComponent,
      componentProps: {
        points: quest.points,
        isSuccess: newlyCompleted,
        offsetIndex: currentOffset
      },
      cssClass: 'quest-toast-modal',
      backdropDismiss: false,
      showBackdrop: false,
      animated: false
    }).then(modal => {
      modal.present();

      // Décrémenter le compteur quand le modal se ferme
      modal.onDidDismiss().then(() => {
        this.activeToasts--;
      });
    });

    if (newlyCompleted) {
      // Check if category is now 100% complete
      setTimeout(() => {
        const stats = this.progressService.getCategoryProgress(category);
        if (stats.percentage === 100) {
          this.animationService.triggerConfetti();
        }
      }, 100);
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}