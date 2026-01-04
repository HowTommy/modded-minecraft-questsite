import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

interface Particle {
  id: number;
  left: number;
  color: string;
  delay: number;
}

@Component({
  selector: 'app-confetti',
  templateUrl: './confetti.component.html',
  styleUrls: ['./confetti.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfettiComponent implements OnInit, OnDestroy {
  @Input() trigger$!: Observable<void>;

  particles: Particle[] = [];
  private subscription?: Subscription;
  private particleId = 0;

  ngOnInit(): void {
    if (this.trigger$) {
      this.subscription = this.trigger$.subscribe(() => {
        this.generateConfetti();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private generateConfetti(): void {
    const colors = [
      'var(--minecraft-gold)',
      'var(--minecraft-green)',
      'var(--minecraft-brown)',
      'var(--minecraft-light-gray)'
    ];

    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: this.particleId++,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      });
    }

    this.particles = newParticles;

    // Clear particles after animation completes
    setTimeout(() => {
      this.particles = [];
    }, 3500);
  }

  trackById(index: number, particle: Particle): number {
    return particle.id;
  }
}