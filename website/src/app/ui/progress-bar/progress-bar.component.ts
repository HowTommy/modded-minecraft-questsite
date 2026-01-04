import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent {
  @Input() currentPoints: number = 0;
  @Input() totalPoints: number = 1;

  getProgressColor(): string {
    const percentage = (this.currentPoints / this.totalPoints) * 100;

    // Rouge à 0%, vert à 100%
    // HSL: Rouge = 0°, Vert = 120°
    const hue = (percentage / 100) * 120;

    return `hsl(${hue}, 70%, 50%)`;
  }
}