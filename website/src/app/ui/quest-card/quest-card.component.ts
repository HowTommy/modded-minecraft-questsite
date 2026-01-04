import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Quest } from '../../core/models/quest.model';

@Component({
  selector: 'app-quest-card',
  templateUrl: './quest-card.component.html',
  styleUrls: ['./quest-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestCardComponent {
  @Input() quest!: Quest;
  @Input() completed: boolean = false;
  @Input() locked: boolean = false;
  @Input() isCurrentQuest: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  expanded: boolean = false;

  getDiamonds(): number[] {
    return Array(this.quest.difficulty).fill(0);
  }

  toggleExpand(event: Event): void {
    event.stopPropagation();
    this.expanded = !this.expanded;
  }
}