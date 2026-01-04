import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questDataService: QuestDataService,
    private progressService: ProgressService,
    public animationService: AnimationService,
    private toastController: ToastController
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
    if (quest.parallelWithPrevious) {
      return false;
    }

    const questIndex = category.quests.findIndex(q => q.numero === quest.numero);
    if (questIndex === 0) {
      return false;
    }

    const previousQuest = category.quests[questIndex - 1];
    return !progress[previousQuest.numero];
  }

  isCurrentQuest(quest: Quest, category: Category, progress: QuestProgress): boolean {
    // La quête ne doit pas être complétée ni lockée
    if (progress[quest.numero] || this.isQuestLocked(quest, category, progress)) {
      return false;
    }

    // C'est la première quête non complétée
    for (const q of category.quests) {
      if (!progress[q.numero] && !this.isQuestLocked(q, category, progress)) {
        return q.numero === quest.numero;
      }
    }

    return false;
  }

  async onQuestToggle(quest: Quest, category: Category, currentlyCompleted: boolean): Promise<void> {
    this.progressService.toggleQuest(quest.numero);

    const newlyCompleted = !currentlyCompleted;

    if (newlyCompleted) {
      const toast = await this.toastController.create({
        message: `+${quest.points} points!`,
        duration: 2000,
        position: 'top',
        color: 'success',
        cssClass: 'minecraft-toast'
      });
      await toast.present();

      // Check if category is now 100% complete
      setTimeout(() => {
        const stats = this.progressService.getCategoryProgress(category);
        if (stats.percentage === 100) {
          this.animationService.triggerConfetti();
        }
      }, 100);
    } else {
      const toast = await this.toastController.create({
        message: 'Quête non complétée',
        duration: 2000,
        position: 'top',
        color: 'medium'
      });
      await toast.present();
    }
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}